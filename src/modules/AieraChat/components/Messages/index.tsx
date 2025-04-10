import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import {
    useCurrentlyRenderedData,
    useVirtuosoMethods,
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
} from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { Fragment, RefObject, useCallback, useEffect, useMemo } from 'react';
import { Prompt } from './Prompt';
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
import './styles.css';
// import { SuggestedPrompts } from './SuggestedPrompts';
import { MessagePrompt } from './MessageFactory/MessagePrompt';
import { BlockType } from './MessageFactory/Block';
// import { TextBlock } from './MessageFactory/Block/Text';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';

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
                className={classNames({
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
    const { chatId, chatStatus, onSetStatus, sources } = useChatStore();
    const { confirmSourceConfirmation, createChatMessagePrompt, messages, isLoading, refresh } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    const { createAblyToken, isStreaming, partials, reset } = useAbly();

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
        (messageId: string, sources: Source[]) => {
            confirmSourceConfirmation(messageId, sources)
                .then(() => {
                    const originalMessage = virtuosoRef.current?.data.find((m) => m.id === messageId);
                    if (originalMessage) {
                        virtuosoRef.current?.data.map((message) => {
                            if (message.id === messageId) {
                                return {
                                    ...message,
                                    confirmed: true,
                                };
                            }

                            return message;
                        });
                    }
                })
                .catch((err: Error) =>
                    console.log('Error confirming sources for chat message source confirmation:', err)
                );
        },
        [confirmSourceConfirmation]
    );

    const handleSubmit = useCallback(
        (prompt: string) => {
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
                            createAblyToken(session.id)
                                .then(() => {
                                    console.log(`Successfully created ably token for session ${session.id}:`);
                                })
                                .catch((ablyError: Error) => {
                                    console.log(`Error creating Ably token: ${ablyError.message}`);
                                });
                        }
                    })
                    .catch((error: Error) => console.log(`Error creating session with prompt: ${error.message}`));
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
                        createAblyToken(chatId)
                            .then(() => {
                                console.log(`Successfully created ably token for session ${chatId}:`);
                            })
                            .catch((ablyError: Error) => {
                                console.log(`Error creating Ably token: ${ablyError.message}`);
                            });
                    })
                    .catch((error: Error) => console.log(`Error creating session with prompt: ${error.message}`));
            }
        },
        [chatId, createAblyToken, onSetStatus, sources]
    );

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
        }
    }, [messages]);

    // Process partial messages from Ably for streaming
    useEffect(() => {
        if (partials && partials.length > 0 && STREAMING_STATUSES.includes(chatStatus)) {
            // Get the latest message in virtuoso
            const latestMessage = virtuosoRef.current?.data.get()?.at(-1);
            // Set the streaming message if one already exists in virtuoso
            if (
                latestMessage &&
                latestMessage.type === ChatMessageType.RESPONSE &&
                latestMessage.status === ChatMessageStatus.STREAMING
            ) {
                // Get the latest partial
                const latestPartial = partials[partials.length - 1] as string;
                virtuosoRef.current?.data.map(
                    (message) => {
                        if (latestMessage.id === message.id) {
                            return {
                                ...latestMessage,
                                blocks: latestMessage.blocks.map((b) => {
                                    if (b.type === BlockType.TEXT) {
                                        return {
                                            ...b,
                                            content: [...b.content, latestPartial],
                                        };
                                    } else {
                                        return b;
                                    }
                                }),
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
                // If there's no streaming message yet, append one to virtuoso using existing partials
                const initialMessageResponse: ChatMessageResponse = {
                    id: `chat-${chatId}-temp-response-${idCounter++}`,
                    ordinalId: `chat-${chatId}-temp-ordinal-${idCounter++}`,
                    prompt: latestMessage?.prompt || '', // TODO all messages need to know the prompt
                    status: ChatMessageStatus.STREAMING,
                    timestamp: new Date().toISOString(),
                    type: ChatMessageType.RESPONSE,
                    blocks: [
                        {
                            id: 'initial-block',
                            type: BlockType.TEXT,
                            content: partials,
                            meta: { style: 'paragraph' },
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
    }, [chatStatus, partials]);

    useEffect(() => {
        if (!isStreaming && partials && partials.length > 0 && STREAMING_STATUSES.includes(chatStatus)) {
            // If streaming has stopped, refetch the ChatSessionWithMessagesQuery query
            // to get the final response and updated chat title
            reset()
                .then(() => {
                    setTimeout(() => {
                        refresh();
                    }, 500);
                })
                .catch((err: Error) => console.log(`Error resetting useAbly state: ${err.message}`));
        }
    }, [chatStatus, isStreaming, partials, refresh, reset]);

    // Reset messages when the selected chat changes
    useEffect(() => {
        if (virtuosoRef.current?.data) {
            virtuosoRef.current.data.replace([]);
        }
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
                            className="mb-4 px-4 messagesScrollBars"
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
                <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} />
            </div>
        </div>
    );
}
