import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroSparkles } from '@aiera/client-sdk/components/Svg/MicroSparkles';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { CHANNEL_PREFIX, useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { RealtimeChannel } from 'ably';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import {
    ChatMessage,
    ChatMessagePrompt,
    ChatMessageResponse,
    ChatMessageStatus,
    ChatMessageType,
    useChatSession,
} from '../../services/messages';
import { Source, useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import { BlockType } from './MessageFactory/Block';
import { Prompt } from './Prompt';
import './styles.css';
import { useUserPreferencesStore } from '../../userPreferencesStore';

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
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { chatId, chatStatus, onAddSource, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, setMessages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { citations, confirmation, partials, reset, subscribeToChannel, unsubscribeFromChannel, thinkingState } =
        useAbly();
    const { sourceConfirmations } = useUserPreferencesStore();
    const subscribedChannel = useRef<RealtimeChannel | null>(null);

    const onConfirm = (promptMessageId: string, sources: Source[]) => {
        confirmSourceConfirmation(promptMessageId, sources)
            .then((confirmationMessage) => {
                // Update sources in the global store
                onAddSource(sources);
                if (confirmationMessage?.id) {
                    // Find the matching confirmation message in the list by type and prompt id
                    // We can't match by id because the confirmation message has a temp id
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
    };

    const handleSubmit = (prompt: string) => {
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
                        reset().catch((err: Error) => log(`Error resetting useAbly state: ${err.message}`, 'error'));
                    }
                })
                .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                .finally(() => setSubmitting(false));
        }
    };

    const setMessageRef = (node: HTMLDivElement | null, id: string) => {
        if (node) {
            messageRefs.current.set(id, node);
        } else {
            messageRefs.current.delete(id);
        }
    };

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
            // Get the latest partial message object
            const latestPartial = partials[partials.length - 1];
            if (!latestPartial) return;

            // Move ALL logic inside setMessages to always have fresh state
            setMessages((currentMessages) => {
                const existingItems = currentMessages || [];
                const latestMessage = existingItems.at(-1);

                // Check if we should skip this partial because a complete message already exists
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
                        // Return unchanged messages
                        return currentMessages;
                    }
                }

                // If the latest message is the one currently streaming partials, then update its content
                if (
                    latestMessage &&
                    latestMessage.type === ChatMessageType.RESPONSE &&
                    latestMessage.status === ChatMessageStatus.STREAMING
                ) {
                    // Dynamically set the status to account for when streaming stops
                    const latestMessageStatus = latestPartial.is_final
                        ? ChatMessageStatus.COMPLETED
                        : latestMessage.status;

                    // Extract content from the latest partial
                    const latestPartialContent = latestPartial.blocks?.[0]?.content || '';

                    return currentMessages.map((message) => {
                        // When the latest partial is found in the existing list,
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
                    });
                } else {
                    // Get the latest prompt to ensure the sticky header works
                    const latestPrompt = currentMessages.reduceRight<ChatMessagePrompt | undefined>(
                        (found, message) => found ?? (message.type === ChatMessageType.PROMPT ? message : undefined),
                        undefined
                    );

                    // Combine all partial contents
                    const combinedContent = partials.map((p) => p?.blocks?.[0]?.content || '').join('');

                    // If there's no streaming message yet, append one using existing partials
                    const initialMessageResponse: ChatMessageResponse = {
                        id: `chat-${chatId}-temp-response-${
                            latestPrompt?.id || currentMessages.length + 1
                        }-${idCounter++}`,
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
                    return [...currentMessages, initialMessageResponse];
                }
            });
        }
    }, [chatId, citations, partials, setMessages]);

    // Update messages with any source confirmation messages coming from Ably
    useEffect(() => {
        if (confirmation) {
            setMessages((pv) => {
                const existing = pv.find((m) => m.id === confirmation.id);

                if (!existing) {
                    // Find the associated prompt message to ensure sticky header works
                    const promptMessage = messages.find((m) => m.id === confirmation.promptMessageId);
                    const updatedConfirmation = {
                        ...confirmation,
                        confirmed: !confirmation.confirmed ? sourceConfirmations === 'auto' : false,
                        prompt: promptMessage?.prompt ?? '',
                    };
                    log('updated confirmation', 'debug', updatedConfirmation);

                    // Auto confirm
                    if (sourceConfirmations === 'auto' && promptMessage?.id) {
                        onConfirm(promptMessage.id, confirmation.sources);
                    }

                    return [...pv, updatedConfirmation];
                }
                return pv;
            });
        }
    }, [confirmation, sourceConfirmations, setMessages, onConfirm]);

    // scroll question to top
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.type === ChatMessageType.PROMPT) {
                requestAnimationFrame(() => {
                    messageRefs.current.get(lastMessage.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        }
    }, [messages]);

    // Reset messages when the selected chat changes
    useEffect(() => {
        // Reset Ably state when switching chats
        reset().catch((err: Error) => log(`Error resetting Ably state on chat change: ${err.message}`, 'error'));
        setMessages([]);
    }, [chatId, reset]);

    // Group messages by question
    const groupedMessages = messages.reduce<ChatMessage[][]>((acc, message) => {
        if (message.type === ChatMessageType.PROMPT) {
            acc.push([message]);
        } else {
            const lastGroup = acc[acc.length - 1];
            if (lastGroup) {
                lastGroup.push(message);
            } else {
                // Handle edge case - maybe create a new group or skip
                acc.push([message]);
            }
        }
        return acc;
    }, []);

    return (
        <div className="relative flex-1 flex flex-col" key={`chat-${chatId}`}>
            <div className="relative flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto messagesScrollBars">
                        {groupedMessages.map((group, gidx) => {
                            const isLastGroup = gidx === groupedMessages.length - 1;
                            const lastMessage = group[group.length - 1];
                            const key = group?.[0]?.id ? `group-${group?.[0]?.id}` : `gidx-${gidx}`;
                            return (
                                <div
                                    key={key}
                                    className={classNames({
                                        'min-h-full': gidx === groupedMessages.length - 1,
                                    })}
                                >
                                    {group.map((message, index) => (
                                        <MessageFactory
                                            setRef={setMessageRef}
                                            key={message.id}
                                            message={message}
                                            generatingResponse={chatStatus === ChatSessionStatus.GeneratingResponse}
                                            nextMessage={group[index + 1]}
                                            onConfirm={onConfirm}
                                        />
                                    ))}
                                    {isLastGroup && (
                                        <>
                                            {chatStatus === ChatSessionStatus.FindingSources &&
                                                lastMessage?.type === ChatMessageType.PROMPT && (
                                                    <div className="max-w-[50rem] w-full m-auto">
                                                        <div
                                                            className={classNames(
                                                                'py-2.5 items-center pl-3 pr-4 flex border border-slate-300/80 rounded-lg mx-4 mb-2'
                                                            )}
                                                        >
                                                            <MicroSparkles className="w-4 animate-bounce text-slate-600" />
                                                            <p className="text-base flex-1 text-left ml-2">
                                                                Finding sources...
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            {chatStatus === ChatSessionStatus.GeneratingResponse &&
                                                lastMessage &&
                                                [ChatMessageType.PROMPT, ChatMessageType.SOURCES].includes(
                                                    lastMessage?.type
                                                ) && (
                                                    <div className="max-w-[50rem] w-full m-auto">
                                                        <div
                                                            className={classNames(
                                                                'py-2.5 items-center pl-3 pr-4 flex border border-slate-300/80 rounded-lg mx-4 mb-2'
                                                            )}
                                                        >
                                                            <MicroSparkles className="w-4 animate-bounce text-slate-600" />
                                                            <p className="text-base flex-1 text-left ml-2">
                                                                {thinkingState[thinkingState.length - 1]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} submitting={submitting} />
        </div>
    );
}
