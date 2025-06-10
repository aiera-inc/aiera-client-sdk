import {
    useCurrentlyRenderedData,
    useVirtuosoMethods,
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
} from '@virtuoso.dev/message-list';
import { RealtimeChannel } from 'ably';
import classNames from 'classnames';
import { log } from '@aiera/client-sdk/lib/utils';
import React, { Fragment, RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatedLoadingStatus } from '@aiera/client-sdk/modules/AieraChat/components/AnimatedLoadingStatus';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { CHANNEL_PREFIX, useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
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
import { MessagePrompt } from './MessageFactory/MessagePrompt';
import { Prompt } from './Prompt';
// import { SuggestedPrompts } from './SuggestedPrompts';
import './styles.css';

const STREAMING_STATUSES = [ChatSessionStatus.FindingSources, ChatSessionStatus.GeneratingResponse];
let idCounter = 0;

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
    onConfirm: (messageId: string, sources: Source[]) => void;
}

const StickyHeader: VirtuosoMessageListProps<ChatMessage, MessageListContext>['StickyHeader'] = () => {
    const data: ChatMessage[] = useCurrentlyRenderedData();
    const { getScrollLocation } = useVirtuosoMethods();
    const { listOffset } = getScrollLocation();
    const firstPrompt = data[0];
    if (!firstPrompt) return null;
    return (
        <Fragment key={firstPrompt.ordinalId}>
            <div
                className={classNames('absolute top-0 left-0 right-0 bg-gray-50 h-2', {
                    'opacity-0': listOffset > -56,
                })}
            />
            <MessagePrompt
                isStickyHeader
                className={classNames('max-w-[50rem] m-auto', {
                    'opacity-0': listOffset > -56,
                })}
                data={firstPrompt as ChatMessagePrompt}
            />
        </Fragment>
    );
};

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
    const [subscribedChannel, setSubscribedChannel] = useState<RealtimeChannel | undefined>(undefined);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { chatId, chatStatus, onAddSource, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, isLoading, refresh } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { confirmation, isStreaming, partials, reset, subscribeToChannel } = useAbly();
    const channelName = useMemo(() => `${CHANNEL_PREFIX}:${chatId}`, [chatId]);

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
                .catch((err: Error) =>
                    log(`Error confirming sources for chat message source confirmation: ${err.message}`, 'error')
                );
        },
        [confirmSourceConfirmation, onAddSource, virtuosoRef.current?.data]
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
                    .catch((error: Error) => log(`Error creating session with prompt: ${error.message}`, 'error'))
                    .finally(() => setSubmitting(false));
            }
        },
        [chatId, onSetStatus, setSubmitting, sources, virtuosoRef.current?.data]
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
        [virtuosoRef.current?.data]
    );

    const unsubscribe = useCallback(
        (resetState = true) => {
            if (subscribedChannel) {
                subscribedChannel
                    .detach()
                    .then(() => subscribedChannel.unsubscribe())
                    .catch((err) =>
                        log(
                            `Failed to detach from subscribed Ably channel ${subscribedChannel.name}: ${String(err)}`,
                            'error'
                        )
                    )
                    .finally(() => {
                        if (resetState) {
                            setSubscribedChannel(undefined);
                        }
                    });
            }
        },
        [setSubscribedChannel, subscribedChannel]
    );

    // Subscribe/unsubscribe to partial messages
    useEffect(() => {
        // Skip if chatId is new
        if (chatId === 'new') {
            if (subscribedChannel) {
                unsubscribe();
            }
            return;
        }

        // Store current channel name in a variable to avoid closure issues
        const targetChannelName = channelName;

        // Clean up function that will be called on unmount or when dependencies change
        const cleanup = () => {
            if (subscribedChannel && subscribedChannel.name === targetChannelName) {
                log(`Cleaning up subscription for channel ${targetChannelName}`);
                unsubscribe();
            }
        };

        // If we need to subscribe to a new channel
        if (!subscribedChannel || subscribedChannel.name !== targetChannelName) {
            // First unsubscribe from any existing channel
            if (subscribedChannel) {
                log(`Unsubscribing from previous channel ${subscribedChannel.name}`);
                unsubscribe();
            }

            // Add a small delay to avoid race conditions
            const timeoutId = setTimeout(() => {
                try {
                    log(`Attempting to subscribe to Ably channel ${targetChannelName}`);
                    const channel = subscribeToChannel(targetChannelName);
                    if (channel) {
                        log(`Successfully subscribed to Ably channel ${targetChannelName}`);
                        setSubscribedChannel(channel);
                    }
                } catch (e) {
                    log(`Failed to subscribe to Ably channel ${targetChannelName}: ${String(e)}`, 'error');
                }
            }, 100);

            // Return cleanup that clears the timeout if component unmounts
            return () => {
                clearTimeout(timeoutId);
                cleanup();
            };
        }

        return cleanup;
    }, [channelName, chatId, subscribeToChannel, unsubscribe]);

    // Append new messages to virtuoso as they're created
    useEffect(() => {
        if (messages && messages.length > 0) {
            // Find new messages
            const newMessages = messages.filter(
                (message) => !(virtuosoRef.current?.data || []).find((m) => m.id === message.id)
            );
            log(`Virtuoso: Current messages count: ${messages.length}, New messages: ${newMessages.length}`, 'debug');

            // Append any new messages
            if (newMessages.length > 0) {
                log(
                    `Virtuoso: Adding new messages: ${JSON.stringify(
                        newMessages.map((m) => ({ id: m.id, type: m.type }))
                    )}`,
                    'debug'
                );
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
    }, [messages, virtuosoRef.current?.data]);

    // Process partial messages from Ably for streaming
    useEffect(() => {
        if (partials && partials.length > 0 && STREAMING_STATUSES.includes(chatStatus)) {
            // Get the latest message in virtuoso
            const latestMessage = virtuosoRef.current?.data.get()?.at(-1);
            // If the latest message is the one currently streaming partials, then update its content
            if (
                latestMessage &&
                latestMessage.type === ChatMessageType.RESPONSE &&
                latestMessage.status === ChatMessageStatus.STREAMING
            ) {
                // Get the latest partial
                const latestPartial = partials[partials.length - 1] as string;
                virtuosoRef.current?.data.map(
                    (message) => {
                        // When the latest partial is found in the existing virtuoso list,
                        // update its Text block's content with the latest partial message
                        if (latestMessage.id === message.id) {
                            return {
                                ...latestMessage,
                                blocks: latestMessage.blocks.map((b) => ({
                                    ...b,
                                    content: b.content + latestPartial,
                                })),
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
                            content: partials.join(''),
                            citations: undefined,
                            id: 'initial-block',
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
    }, [chatStatus, partials, virtuosoRef.current?.data]);

    // Manage the chat session status depending on streaming
    useEffect(() => {
        if (!isStreaming && STREAMING_STATUSES.includes(chatStatus)) {
            log('Streaming stopped. Setting chat status to active.');
            onSetStatus(ChatSessionStatus.Active);
        }
        if (isStreaming && !STREAMING_STATUSES.includes(chatStatus)) {
            const newChatStatus =
                sources && sources.length > 0 ? ChatSessionStatus.GeneratingResponse : ChatSessionStatus.FindingSources;
            log(`Streaming started. Setting chat status to ${newChatStatus}.`);
            onSetStatus(newChatStatus);
        }
    }, [chatStatus, isStreaming, onSetStatus, sources]);

    useEffect(() => {
        // If streaming has stopped
        if (!isStreaming && partials && partials.length > 0 && STREAMING_STATUSES.includes(chatStatus)) {
            log('Streaming stopped. Refreshing chat session with messages...');
            // Reset partials and refetch the ChatSessionWithMessagesQuery query to get the final response
            // and updated chat title
            reset()
                .then(() => {
                    setTimeout(() => {
                        refresh();
                    }, 500);
                })
                .catch((err: Error) => log(`Error resetting useAbly state: ${err.message}`, 'error'));
        }
    }, [chatStatus, isStreaming, partials, refresh, reset]);

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
    }, [confirmation, virtuosoRef.current?.data]);

    // Reset messages when the selected chat changes
    useEffect(() => {
        maybeClearVirtuoso('New chat detected. Clearing virtuoso items...');
    }, [chatId]);

    // Create a memoized context object that updates when any of its values change
    const context = useMemo(
        () => ({
            onSubmit: handleSubmit,
            onReRun,
            onConfirm,
        }),
        [handleSubmit, onReRun, onConfirm]
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
                            key={chatId || 'new'}
                            ref={virtuosoRef}
                            style={{ flex: 1 }}
                            computeItemKey={({ data }: { data: ChatMessage }) => data.id}
                            className="px-4 messagesScrollBars"
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            initialData={messages}
                            shortSizeAlign="bottom-smooth"
                            ItemContent={MessageFactory}
                            context={context}
                            // EmptyPlaceholder={SuggestedPrompts}
                            StickyHeader={StickyHeader}
                        />
                    </VirtuosoMessageListLicense>
                )}
                {chatStatus === ChatSessionStatus.FindingSources && !confirmation && <AnimatedLoadingStatus />}
                <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} submitting={submitting} />
            </div>
        </div>
    );
}
