import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { CHANNEL_PREFIX, useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
} from '@virtuoso.dev/message-list';
import { RealtimeChannel } from 'ably';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
// import { SuggestedPrompts } from './SuggestedPrompts';
import { Loading } from './MessageFactory/Loading';
import './styles.css';

let idCounter = 0;

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
    onConfirm: (messageId: string, sources: Source[]) => void;
    thinkingState: string[];
}

export function Messages({
    onOpenSources,
    onSubmit,
    virtuosoRef,
}: {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => Promise<ChatSessionWithPromptMessage | null>;
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}) {
    const config = useConfig();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { chatId, chatStatus, onAddSource, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { citations, confirmation, partials, reset, subscribeToChannel, unsubscribeFromChannel, thinkingState } =
        useAbly();
    const subscribedChannel = useRef<RealtimeChannel | null>(null);

    const onReRun = useCallback((ordinalId: string) => {
        const originalIndex = virtuosoRef.current?.data.findIndex((m) => m.ordinalId === ordinalId);
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
                    virtuosoRef.current?.data.map(
                        (message) => {
                            if (message.ordinalId === ordinalId) {
                                newMessage = newMessage + ' ' + 'some message';
                                return {
                                    ...message,
                                    text: newMessage,
                                    status,
                                };
                            }

                            return message;
                        },
                        {
                            location() {
                                return { index: originalIndex, align: 'end', behavior: 'smooth' };
                            },
                        }
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
                        const originalMessage = virtuosoRef.current?.data.find(
                            (m) =>
                                m.type === ChatMessageType.SOURCES &&
                                m.promptMessageId === confirmationMessage.promptMessageId
                        );
                        if (originalMessage) {
                            virtuosoRef.current?.data.map((message) => {
                                if (message.id === originalMessage.id) {
                                    return {
                                        ...message,
                                        confirmed: true,
                                    };
                                }

                                return message;
                            });
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
        [confirmSourceConfirmation, onAddSource, partials, reset, virtuosoRef]
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
                            // Append new message to virtuoso
                            virtuosoRef.current?.data.append([promptMessage], ({ scrollInProgress, atBottom }) => {
                                return {
                                    index: 'LAST',
                                    align: 'end',
                                    behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                                };
                            });
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

    const maybeClearVirtuoso = useCallback(
        (message: string) => {
            const existingItems = virtuosoRef.current?.data.get();
            if (existingItems && existingItems.length > 0) {
                // Log the provided message depending on invocation
                log(`Message: ${JSON.stringify(message)}`, 'debug');
                virtuosoRef.current?.data.replace([]);
            }
        },
        [virtuosoRef]
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

    // Append new messages to virtuoso as they're created
    useEffect(() => {
        if (messages && messages.length > 0) {
            // Find new messages
            const newMessages = messages.filter(
                (message) => !(virtuosoRef.current?.data || []).find((m) => m.id === message.id)
            );

            // Append any new messages
            if (newMessages.length > 0) {
                virtuosoRef.current?.data.append(newMessages, ({ scrollInProgress, atBottom }) => {
                    return {
                        index: 'LAST',
                        align: 'end',
                        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                    };
                });
            }
        } else {
            // Wipe all items from virtuoso if messages are cleared out
            maybeClearVirtuoso('Removing stale items from virtuoso list...');
        }
    }, [maybeClearVirtuoso, messages, virtuosoRef]);

    // Process partial messages from Ably for streaming
    useEffect(() => {
        if (partials && partials.length > 0) {
            // Get the latest message in virtuoso
            const existingItems = virtuosoRef.current?.data.get() || [];
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
                virtuosoRef.current?.data.map(
                    (message) => {
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
                    },
                    {
                        location() {
                            return { index: 'LAST', align: 'end', behavior: 'smooth' };
                        },
                    }
                );
            } else {
                // Get the latest prompt to ensure the sticky header works
                const items = virtuosoRef.current?.data.get() || [];
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
                virtuosoRef.current?.data.append([initialMessageResponse], ({ scrollInProgress, atBottom }) => {
                    return {
                        index: 'LAST',
                        align: 'end',
                        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                    };
                });
            }
        }
    }, [chatId, citations, partials, virtuosoRef]);

    // Update virtuoso with any source confirmation messages coming from Ably
    useEffect(() => {
        if (confirmation) {
            const existing = virtuosoRef.current?.data.find((m) => m.id === confirmation.id);
            if (!existing) {
                // Find the associated prompt message to ensure sticky header works
                const promptMessage = virtuosoRef.current?.data.find((m) => m.id === confirmation.promptMessageId);
                const updatedConfirmation = {
                    ...confirmation,
                    prompt: promptMessage?.prompt ?? '',
                };
                virtuosoRef.current?.data.append([updatedConfirmation], ({ scrollInProgress, atBottom }) => {
                    return {
                        index: 'LAST',
                        align: 'end',
                        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                    };
                });
            }
        }
    }, [confirmation, virtuosoRef]);

    // Reset messages when the selected chat changes
    useEffect(() => {
        maybeClearVirtuoso('New chat detected. Clearing virtuoso items...');
        // Reset Ably state when switching chats
        reset().catch((err: Error) => log(`Error resetting Ably state on chat change: ${err.message}`, 'error'));
    }, [chatId, maybeClearVirtuoso, reset]);

    // Create a memoized context object that updates when any of its values change
    const context = useMemo(
        () => ({
            onSubmit: handleSubmit,
            onReRun,
            onConfirm,
            thinkingState,
        }),
        [handleSubmit, onReRun, onConfirm, thinkingState]
    );

    return (
        <div className="relative flex-1">
            <div className="absolute bottom-0 left-0 right-0 top-4 flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <VirtuosoMessageListLicense licenseKey={config.virtualListKey || ''}>
                        <VirtuosoMessageList<ChatMessage, MessageListContext>
                            className="px-4 messagesScrollBars"
                            computeItemKey={({ data }: { data: ChatMessage }) => data.id}
                            initialData={messages}
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            key={chatId || 'new'}
                            ref={virtuosoRef}
                            shortSizeAlign="bottom-smooth"
                            style={{ flex: 1 }}
                            context={context}
                            // EmptyPlaceholder={SuggestedPrompts}
                            ItemContent={MessageFactory}
                        />
                    </VirtuosoMessageListLicense>
                )}
                {((chatStatus === ChatSessionStatus.FindingSources && !confirmation) ||
                    chatStatus === ChatSessionStatus.GeneratingResponse) && (
                    <Loading>{thinkingState[thinkingState.length - 1] || 'Thinking...'}</Loading>
                )}
                <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} submitting={submitting} />
            </div>
        </div>
    );
}
