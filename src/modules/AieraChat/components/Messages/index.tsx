import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
    useCurrentlyRenderedData,
    useVirtuosoMethods,
} from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { Fragment, RefObject, useCallback, useEffect, useMemo } from 'react';
import { Prompt } from './Prompt';
import {
    ChatMessage,
    ChatMessagePrompt,
    ChatMessageResponse,
    // ChatMessageSources,
    ChatMessageStatus,
    ChatMessageType,
    useChatSession,
} from '../../services/messages';
import { useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import './styles.css';
// import { SuggestedPrompts } from './SuggestedPrompts';
import { MessagePrompt } from './MessageFactory/MessagePrompt';
import { BlockType } from './MessageFactory/Block';
// import { TextBlock } from './MessageFactory/Block/Text';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { AnimatedLoadingStatus } from '@aiera/client-sdk/modules/AieraChat/components/AnimatedLoadingStatus';
import { ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { useAbly } from '@aiera/client-sdk/modules/AieraChat/services/ably';

let idCounter = 0;

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
    onConfirm: (k: string) => void;
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

// Helper function to update virtuoso with a message
export function updateVirtuoso(
    prompt: string,
    message: ChatMessagePrompt | null,
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>,
    isGenerating = false
) {
    // Add the user's message
    const myMessage: ChatMessagePrompt = {
        id: message ? message.id : `${idCounter++}`,
        ordinalId: message ? message.ordinalId : `${idCounter++}`,
        prompt: message?.prompt || prompt,
        type: ChatMessageType.PROMPT,
        status: ChatMessageStatus.COMPLETED,
        timestamp: new Date().toISOString(),
    };

    virtuosoRef.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
        return {
            index: 'LAST',
            align: 'end',
            behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
        };
    });

    // If in generating state, add an initial response message that will be updated
    if (isGenerating) {
        const initialResponseMessage: ChatMessageResponse = {
            id: `temp-response-${idCounter++}`,
            ordinalId: `temp-ordinal-${idCounter++}`,
            prompt: prompt,
            timestamp: new Date().toISOString(),
            type: ChatMessageType.RESPONSE,
            status: ChatMessageStatus.STREAMING,
            blocks: [
                {
                    id: 'initial-block',
                    type: BlockType.TEXT,
                    content: [''],
                    meta: { style: 'paragraph' },
                },
            ],
            sources: [],
        };

        virtuosoRef.current?.data.append([initialResponseMessage], ({ scrollInProgress, atBottom }) => {
            return {
                index: 'LAST',
                align: 'end',
                behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
            };
        });
    }
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
    const { chatId, chatStatus, sources } = useChatStore();
    const { createChatMessagePrompt, messages, isLoading } = useChatSession({
        enablePolling: config.options?.aieraChatEnablePolling || false,
    });
    console.log({ MessagesComponent: true, messages });
    const { createAblyToken, partials } = useAbly();
    console.log({ MessagesComponent: true, partials });

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

    const onConfirm = useCallback((ordinalId: string) => {
        const originalMessage = virtuosoRef.current?.data.find((m) => m.ordinalId === ordinalId);
        if (originalMessage) {
            virtuosoRef.current?.data.map((message) => {
                if (message.ordinalId === ordinalId) {
                    return {
                        ...message,
                        confirmed: true,
                    };
                }

                return message;
            });
        }
    }, []);

    const handleSubmit = useCallback(
        (prompt: string) => {
            if (chatId === 'new') {
                onSubmit(prompt)
                    .then((session) => {
                        console.log({ Messages: true, handleSubmit: true, session });
                        if (session && session.promptMessage) {
                            console.log('Updating virtuoso with new prompt message:', session.promptMessage);
                            // Only prompt messages can be created when creating a chat session
                            updateVirtuoso(prompt, session.promptMessage as ChatMessagePrompt, virtuosoRef);
                            createAblyToken(session.id)
                                .then((tokenData) => {
                                    console.log(
                                        `Successfully created ably token for session ${session.id}:`,
                                        tokenData
                                    );
                                })
                                .catch((ablyError: Error) => {
                                    console.log(`Error creating Ably token: ${ablyError.message}`);
                                });
                        }
                    })
                    .catch((error: Error) => console.log(`Error creating session with prompt: ${error.message}`));
            } else {
                createChatMessagePrompt({ content: prompt, sessionId: chatId }).catch((error: Error) =>
                    console.log(`Error creating session with prompt: ${error.message}`)
                );
            }
        },
        [chatId, sources]
    );

    // Append new messages to virtuoso as they're created
    useEffect(() => {
        if (messages && messages.length > 0) {
            // Find new messages
            const newMessages = messages.filter(
                (message) => !(virtuosoRef.current?.data || []).find((m) => m.id === message.id)
            );
            console.log({ messages, newMessages });

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
                {!isLoading && chatStatus === ChatSessionStatus.GeneratingResponse && (
                    <AnimatedLoadingStatus sources={sources} />
                )}
                <Prompt onSubmit={handleSubmit} onOpenSources={onOpenSources} />
            </div>
        </div>
    );
}
