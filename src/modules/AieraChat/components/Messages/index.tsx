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
import { useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import { BlockType } from './MessageFactory/Block';
import { Prompt } from './Prompt';
import './styles.css';

let idCounter = 0;

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
    const { chatId, chatStatus, onSetStatus, sources } = useChatStore();
    const { createChatMessagePrompt, messages, setMessages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { citations, partials, reset, subscribeToChannel, unsubscribeFromChannel, thinkingState } = useAbly();
    const subscribedChannel = useRef<RealtimeChannel | null>(null);
    const [animationStep, setAnimationStep] = useState(chatId === 'new' && messages.length === 0 ? 0 : 1);

    const handleSubmit = (prompt: string) => {
        setSubmitting(true);
        if (animationStep === 0) {
            setAnimationStep(1);
        }
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
                    // Don't clear citations since we're continuing in the same chat
                    if (partials && partials.length > 0) {
                        reset({ clearCitations: false }).catch((err: Error) =>
                            log(`Error resetting useAbly state: ${err.message}`, 'error')
                        );
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

    // Process partials directly without complex useEffect logic
    // This rebuilds the entire streaming message content from all partials
    useEffect(() => {
        if (!partials || partials.length === 0) return;

        setMessages((currentMessages) => {
            const existingItems = currentMessages || [];
            const latestMessage = existingItems.at(-1);
            const lastPartial = partials[partials.length - 1];

            // Check if we should skip because a complete message already exists
            if (lastPartial?.prompt_message_id) {
                const existingCompleteMessage = existingItems.find(
                    (msg) =>
                        msg.type === ChatMessageType.RESPONSE &&
                        msg.promptMessageId === String(lastPartial.prompt_message_id) &&
                        msg.status === ChatMessageStatus.COMPLETED
                );
                if (existingCompleteMessage) {
                    log(
                        `Skipping partials - complete message already exists with id ${existingCompleteMessage.id} for prompt ${lastPartial.prompt_message_id}`
                    );
                    return currentMessages;
                }
            }

            // Build the complete content from ALL partials (this prevents repetition)
            const completeContent = partials.map((p) => p?.blocks?.[0]?.content || '').join('');
            const isFinal = lastPartial?.is_final || false;
            const messageStatus = isFinal ? ChatMessageStatus.COMPLETED : ChatMessageStatus.STREAMING;

            // If we have a streaming message, update it with the complete content
            if (
                latestMessage &&
                latestMessage.type === ChatMessageType.RESPONSE &&
                latestMessage.status === ChatMessageStatus.STREAMING
            ) {
                return currentMessages.map((message) => {
                    if (message.id === latestMessage.id) {
                        return {
                            ...latestMessage,
                            blocks: latestMessage.blocks.map((b) => {
                                if (b.type === BlockType.TEXT) {
                                    return {
                                        ...b,
                                        content: completeContent, // Replace with complete content, not append
                                        ...(citations && citations.length > 0 && { citations }),
                                    };
                                }
                                return b;
                            }),
                            status: messageStatus,
                        };
                    }
                    return message;
                });
            } else {
                // Create new streaming message with complete content
                const latestPrompt = currentMessages.reduceRight<ChatMessagePrompt | undefined>(
                    (found, message) => found ?? (message.type === ChatMessageType.PROMPT ? message : undefined),
                    undefined
                );

                const initialMessageResponse: ChatMessageResponse = {
                    id: `chat-${chatId}-temp-response-${latestPrompt?.id || currentMessages.length + 1}-${idCounter++}`,
                    ordinalId: `chat-${chatId}-temp-ordinal-${idCounter++}`,
                    prompt: latestPrompt?.prompt || '',
                    promptMessageId: latestPrompt?.id ? String(latestPrompt.id) : undefined,
                    status: messageStatus,
                    timestamp: new Date().toISOString(),
                    type: ChatMessageType.RESPONSE,
                    blocks: [
                        {
                            ...(citations && citations.length > 0 && { citations }),
                            content: completeContent,
                            id: 'initial-block',
                            type: BlockType.TEXT,
                        },
                    ],
                    sources: [],
                };
                return [...currentMessages, initialMessageResponse];
            }
        });
    }, [partials, citations, chatId]);

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
        // Reset Ably state when switching chats - clear citations since it's a new chat
        reset({ clearCitations: true }).catch((err: Error) =>
            log(`Error resetting Ably state on chat change: ${err.message}`, 'error')
        );
        setMessages([]);

        // We're only resetting the animation
        // if we're starting a new chat
        if (chatId === 'new') {
            setAnimationStep(0);
        }
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
            <div
                className={classNames('relative flex flex-col transition-all', {
                    'flex-1': animationStep === 1,
                })}
            >
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden messagesScrollBars">
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
                                        />
                                    ))}
                                    {isLastGroup &&
                                        [
                                            ChatSessionStatus.FindingSources,
                                            ChatSessionStatus.GeneratingResponse,
                                        ].includes(chatStatus) &&
                                        lastMessage &&
                                        [ChatMessageType.PROMPT, ChatMessageType.SOURCES].includes(
                                            lastMessage?.type
                                        ) && (
                                            <div className="max-w-[50rem] w-full m-auto">
                                                <div
                                                    className={classNames(
                                                        'py-2.5 items-center pl-3 pr-4 flex border border-slate-300/80 message-thinking rounded-lg mx-4 mb-2'
                                                    )}
                                                >
                                                    <MicroSparkles className="w-4 animate-bounce text-slate-600" />
                                                    <p className="text-base flex-1 text-left ml-2">
                                                        {thinkingState[thinkingState.length - 1]}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div
                className={classNames('flex flex-col relative justify-center transition-all', {
                    'flex-1': animationStep === 0,
                })}
            >
                <p
                    className={classNames('text-3xl transition-all font-serif mx-7 mb-2 text-slate-600', {
                        'opacity-0': animationStep === 1,
                    })}
                >
                    Welcome, ask anything...
                </p>
                <Prompt
                    className={classNames('transition-all', {
                        'min-h-20 mb-10': animationStep === 0,
                    })}
                    onSubmit={handleSubmit}
                    onOpenSources={onOpenSources}
                    submitting={submitting}
                />
            </div>
        </div>
    );
}
