import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { CHANNEL_PREFIX, useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { RealtimeChannel } from 'ably';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChatMessagePrompt,
    ChatMessageResponse,
    ChatMessageStatus,
    ChatMessageType,
    useChatSession,
} from '../../services/messages';
import { Source, useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import { BlockType } from './MessageFactory/Block';
import { Loading } from './MessageFactory/Loading';
import { Prompt } from './Prompt';
import './styles.css';

let idCounter = 0;

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
    onConfirm: (messageId: string, sources: Source[]) => void;
    generatingResponse: boolean;
    thinkingState: string[];
}

export function Messages({
    onOpenSources,
    onSubmit,
}: {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => Promise<ChatSessionWithPromptMessage | null>;
}) {
    const config = useConfig();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { chatId, chatStatus, onAddSource, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, setMessages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { citations, confirmation, partials, reset, subscribeToChannel, unsubscribeFromChannel, thinkingState } =
        useAbly();
    const subscribedChannel = useRef<RealtimeChannel | null>(null);

    const onReRun = useCallback((ordinalId: string) => {
        const originalIndex = messages.findIndex((m) => m.ordinalId === ordinalId);
        if (originalIndex) {
            setTimeout(() => {
                let counter = 0;
                let newMessage = '';
                const interval = setInterval(() => {
                    let status = ChatMessageStatus.QUEUED;
                    if (counter++ > 80) {
                        clearInterval(interval);
                        status = ChatMessageStatus.COMPLETED;
                    } else if (counter > 10) {
                        status = ChatMessageStatus.STREAMING;
                    }

                    setMessages((pv) =>
                        pv.map((message) => {
                            if (message.ordinalId === ordinalId) {
                                newMessage = newMessage + ' ' + 'some message';
                                return {
                                    ...message,
                                    text: newMessage,
                                    status,
                                };
                            }

                            return message;
                        })
                    );
                }, 150);
            });
        }
    }, []);

    const onConfirm = useCallback(
        (promptMessageId: string, sources: Source[]) => {
            confirmSourceConfirmation(promptMessageId, sources)
                .then((confirmationMessage) => {
                    // Update sources in the global store
                    onAddSource(sources);
                    if (confirmationMessage?.id) {
                        // Find the matching confirmation message in the virtuoso list by type and prompt id
                        // We can't match by id because the confirmation message in virtuoso has a temp id
                        const originalMessage = messages.find(
                            (m) =>
                                m.type === ChatMessageType.SOURCES &&
                                m.promptMessageId === confirmationMessage.promptMessageId
                        );
                        if (originalMessage) {
                            setMessages((pv) =>
                                pv.map((message) => {
                                    if (message.id === originalMessage.id) {
                                        return {
                                            ...message,
                                            confirmed: true,
                                        };
                                    }

                                    return message;
                                })
                            );
                        }
                    }
                })
                .then(() => {
                    // Reset existing partials before new ones start streaming
                    if (partials && partials.length > 0) {
                        reset().catch((err: Error) => log(`Error resetting useAbly state: ${err.message}`, 'error'));
                    }
                })
                .then(() => onSetStatus(ChatSessionStatus.GeneratingResponse))
                .catch((err: Error) =>
                    log(`Error confirming sources for chat message source confirmation: ${err.message}`, 'error')
                );
        },
        [confirmSourceConfirmation, onAddSource, partials, reset]
    );

    const handleSubmit = useCallback(
        (prompt: string) => {
            setSubmitting(true);
            if (chatId === 'new') {
                onSubmit(prompt)
                    .then((session) => {
                        if (session && session.promptMessage) {
                            // Only prompt messages can be created when creating a chat session
                            const promptMessage: ChatMessagePrompt = {
                                id: session.promptMessage.id,
                                ordinalId: session.promptMessage.ordinalId,
                                prompt: session.promptMessage.prompt,
                                status: ChatMessageStatus.COMPLETED,
                                timestamp: new Date().toISOString(),
                                type: ChatMessageType.PROMPT,
                            };
                            // Append new message
                            setMessages((pv) => [...pv, promptMessage]);
                        }
                    })
                    .then(() =>
                        onSetStatus(
                            sources && sources.length > 0
                                ? ChatSessionStatus.GeneratingResponse
                                : ChatSessionStatus.FindingSources
                        )
                    )
                    .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                    .finally(() => setSubmitting(false));
            } else {
                createChatMessagePrompt({ content: prompt, sessionId: chatId })
                    .then(() => {
                        // Update the session status to reflect what the server will persist
                        // This is needed to restart streaming partials for an existing session
                        onSetStatus(
                            sources && sources.length > 0
                                ? ChatSessionStatus.GeneratingResponse
                                : ChatSessionStatus.FindingSources
                        );
                    })
                    .then(() => {
                        // Reset existing partials before new ones start streaming
                        if (partials && partials.length > 0) {
                            reset().catch((err: Error) =>
                                log(`Error resetting useAbly state: ${err.message}`, 'error')
                            );
                        }
                    })
                    .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                    .finally(() => setSubmitting(false));
            }
        },
        [chatId, createChatMessagePrompt, onSetStatus, onSubmit, partials, reset, sources]
    );

    // Subscribe/unsubscribe to partial messages
    useEffect(() => {
        const channelName = `${CHANNEL_PREFIX}:${chatId}`;
        let currentChannel: RealtimeChannel | null;

        const handleChannelSwitch = async () => {
            // If we're switching to a new chat or don't have a channel yet
            if (chatId !== 'new' && (!subscribedChannel.current || subscribedChannel.current.name !== channelName)) {
                // Store reference to the old channel
                const oldChannel = subscribedChannel.current;

                // Clear the subscribed channel state immediately to prevent race conditions
                subscribedChannel.current = null;

                // Detach from old channel if it exists
                if (oldChannel) {
                    log(`Detaching from old channel: ${oldChannel.name}`);
                    await unsubscribeFromChannel(oldChannel.name);
                }

                // Now subscribe to the new channel
                try {
                    log(`Attempting to subscribe to channel: ${channelName}`);
                    const channel = subscribeToChannel(channelName);
                    if (channel) {
                        currentChannel = channel;
                        log(`Successfully subscribed to Ably channel ${channelName}`);
                        subscribedChannel.current = channel;
                    }
                } catch (e) {
                    log(`Failed to subscribe to Ably channel ${channelName}: ${String(e)}`, 'error');
                }
            }

            // If switching to 'new' chat, unsubscribe from any existing channel
            if (chatId === 'new' && subscribedChannel.current) {
                const channelToUnsubscribe = subscribedChannel.current.name;
                subscribedChannel.current = null;
                await unsubscribeFromChannel(channelToUnsubscribe);
            }
        };

        void handleChannelSwitch();

        // Cleanup function
        return () => {
            // Clean up the current channel if it exists
            if (currentChannel) {
                const channelName = currentChannel.name;
                log(`Cleanup: detaching from channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }

            // Also clean up any subscribed channel that might still be set
            if (subscribedChannel.current && subscribedChannel.current.name !== currentChannel?.name) {
                const channelName = subscribedChannel.current.name;
                log(`Cleanup: detaching from subscribed channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }
        };
    }, [chatId, subscribeToChannel, unsubscribeFromChannel]);

    // Process partial messages from Ably for streaming
    useEffect(() => {
        if (partials && partials.length > 0) {
            // Get the latest message in virtuoso
            const existingItems = messages || [];
            const latestMessage = existingItems.at(-1);
            // Get the latest partial message object
            const latestPartial = partials[partials.length - 1];
            if (!latestPartial) return; // avoid "TS2532: Object is possibly 'undefined'."

            // Check if we should skip this partial because a complete message already exists
            // This prevents duplicates from loading recent history when returning to a chat with completed messages
            if (latestPartial.prompt_message_id) {
                const existingCompleteMessage = existingItems.find(
                    (msg) =>
                        msg.type === ChatMessageType.RESPONSE &&
                        msg.promptMessageId === String(latestPartial.prompt_message_id) &&
                        msg.status === ChatMessageStatus.COMPLETED
                );
                if (existingCompleteMessage) {
                    log(
                        `Skipping partial created on ${latestPartial.created_at} - complete message already ` +
                            `exists with id ${existingCompleteMessage.id} for prompt ${latestPartial.prompt_message_id}`
                    );
                    return;
                }
            }

            // If the latest message is the one currently streaming partials, then update its content
            if (
                latestMessage &&
                latestMessage.type === ChatMessageType.RESPONSE &&
                latestMessage.status === ChatMessageStatus.STREAMING
            ) {
                // Dynamically set the status to account for when streaming stops
                const latestMessageStatus = latestPartial.is_final ? ChatMessageStatus.COMPLETED : latestMessage.status;

                // Extract content from the latest partial
                const latestPartialContent = latestPartial.blocks?.[0]?.content || '';
                setMessages((pv) =>
                    pv.map((message) => {
                        // When the latest partial is found in the existing virtuoso list,
                        // update its Text block's content with the latest partial message
                        if (latestMessage.id === message.id) {
                            return {
                                ...latestMessage,
                                blocks: latestMessage.blocks.map((b) => {
                                    if (b.type === BlockType.TEXT) {
                                        // Only update citations if new ones are available, otherwise preserve existing
                                        const updatedBlock = {
                                            ...b,
                                            content: b.content + latestPartialContent,
                                        };

                                        // Only update citations if we have new ones from Ably
                                        if (citations && citations.length > 0) {
                                            updatedBlock.citations = citations;
                                        }

                                        return updatedBlock;
                                    } else {
                                        return b;
                                    }
                                }),
                                status: latestMessageStatus,
                            };
                        }
                        return message;
                    })
                );
            } else {
                // Get the latest prompt to ensure the sticky header works
                const items = messages || [];
                const latestPrompt = items.reverse().find((message) => message.type === ChatMessageType.PROMPT);

                // Combine all partial contents
                const combinedContent = partials.map((p) => p?.blocks?.[0]?.content || '').join('');

                // If there's no streaming message yet, append one to virtuoso using existing partials
                const initialMessageResponse: ChatMessageResponse = {
                    id: `chat-${chatId}-temp-response-${latestPrompt?.id || items.length + 1}-${idCounter++}`,
                    ordinalId: `chat-${chatId}-temp-ordinal-${idCounter++}`,
                    prompt: latestPrompt?.prompt || '',
                    promptMessageId: latestPrompt?.id ? String(latestPrompt.id) : undefined,
                    status: ChatMessageStatus.STREAMING,
                    timestamp: new Date().toISOString(),
                    type: ChatMessageType.RESPONSE,
                    blocks: [
                        {
                            // Only include citations if they exist, don't set to undefined
                            ...(citations && citations.length > 0 && { citations }),
                            content: combinedContent,
                            id: 'initial-block',
                            type: BlockType.TEXT,
                        },
                    ],
                    sources: [], // partial messages won't have sources
                };
                setMessages((pv) => [...pv, initialMessageResponse]);
            }
        }
    }, [chatId, citations, partials]);

    // Update messages with any source confirmation messages coming from Ably
    useEffect(() => {
        if (confirmation) {
            const existing = messages.find((m) => m.id === confirmation.id);
            if (!existing) {
                // Find the associated prompt message to ensure sticky header works
                const promptMessage = messages.find((m) => m.id === confirmation.promptMessageId);
                const updatedConfirmation = {
                    ...confirmation,
                    prompt: promptMessage?.prompt ?? '',
                };
                setMessages((pv) => [...pv, updatedConfirmation]);
            }
        }
    }, [confirmation]);

    return (
        <div className="relative flex-1 flex flex-col" key={chatId}>
            <div className="relative flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto messagesScrollBars">
                        {messages.map((message, index) => (
                            <MessageFactory
                                key={message.id}
                                message={message}
                                generatingResponse={chatStatus === ChatSessionStatus.GeneratingResponse}
                                nextMessage={messages[index + 1]}
                                onConfirm={onConfirm}
                                onReRun={onReRun}
                            />
                        ))}
                    </div>
                )}
            </div>
            {chatStatus === ChatSessionStatus.FindingSources && !confirmation && <Loading>Thinking...</Loading>}
            <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} submitting={submitting} />
        </div>
    );
}
