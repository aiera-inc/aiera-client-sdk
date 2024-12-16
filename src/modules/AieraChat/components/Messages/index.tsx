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
    ChatMessageSources,
    ChatMessageStatus,
    ChatMessageType,
    useChatMessages,
} from '../../services/messages';
import { useChatStore } from '../../store';
import { MessageFactory } from './MessageFactory';
import './styles.css';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessagePrompt } from './MessageFactory/MessagePrompt';
import { BlockType } from './MessageFactory/Block';
import { TextBlock } from './MessageFactory/Block/Text';
import { useConfig } from '@aiera/client-sdk/lib/config';

let idCounter = 0;

function randomMessage(prompt: ChatMessage['prompt']): ChatMessageResponse {
    return {
        id: `${idCounter++}`,
        ordinalId: `${idCounter++}`,
        timestamp: '',
        sources: [],
        type: ChatMessageType.RESPONSE,
        blocks: [{ type: BlockType.TEXT, content: ['some other message'], id: '0', meta: { style: 'paragraph' } }],
        prompt,
        status: ChatMessageStatus.PENDING,
    };
}

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

export function Messages({
    onOpenSources,
    virtuosoRef,
}: {
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
    onOpenSources: () => void;
}) {
    const { chatId, sources } = useChatStore();
    const { messages, isLoading } = useChatMessages(chatId);

    // Reset when starting new chat
    useEffect(() => {
        if (chatId === 'new' && virtuosoRef.current?.data) {
            virtuosoRef.current.data.replace([]);
        }
    }, [chatId]);

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

    const isMatchingResponse = (
        message: ChatMessage,
        botMessage: ChatMessageResponse
    ): message is ChatMessageResponse => {
        return message.ordinalId === botMessage.ordinalId;
    };

    const onConfirm = useCallback((ordinalId: string) => {
        const originalMessage = virtuosoRef.current?.data.find((m) => m.ordinalId === ordinalId);
        if (originalMessage) {
            const botMessage: ChatMessageResponse = randomMessage(originalMessage?.prompt);
            virtuosoRef.current?.data.append([botMessage]);

            virtuosoRef.current?.data.map((message) => {
                if (message.ordinalId === ordinalId) {
                    return {
                        ...message,
                        confirmed: true,
                    };
                }

                return message;
            });
            setTimeout(() => {
                let counter = 0;
                const interval = setInterval(() => {
                    let status = ChatMessageStatus.STREAMING;
                    if (counter++ > 45) {
                        clearInterval(interval);
                        status = ChatMessageStatus.COMPLETED;
                    }
                    virtuosoRef.current?.data.map(
                        (message) => {
                            if (isMatchingResponse(message, botMessage)) {
                                const firstBlock =
                                    (message.blocks[0] as TextBlock) ||
                                    ({
                                        id: `${message.blocks.length}`,
                                        type: BlockType.TEXT,
                                        content: ['some text...'],
                                        meta: { style: 'paragraph' },
                                    } as TextBlock);
                                return {
                                    ...message,
                                    blocks: [
                                        {
                                            ...firstBlock,
                                            content: [
                                                ...firstBlock.content,
                                                firstBlock.content.length % 8 === 0
                                                    ? {
                                                          id: '1',
                                                          text: 'citation',
                                                          source: 'source',
                                                      }
                                                    : 'some more text...',
                                            ],
                                        },
                                    ],
                                    status,
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
                }, 150);
            }, 2000);
        }
    }, []);

    const onSubmit = useCallback(
        (prompt: string) => {
            const myMessage: ChatMessagePrompt = {
                id: `${idCounter++}`,
                ordinalId: `${idCounter++}`,
                prompt,
                type: ChatMessageType.PROMPT,
                status: ChatMessageStatus.COMPLETED,
                timestamp: '',
            };
            virtuosoRef.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
                return {
                    index: 'LAST',
                    align: 'end',
                    behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                };
            });

            if (sources.length === 0) {
                const newKey = `${idCounter++}`;
                const sourceMessage: ChatMessageSources = {
                    id: newKey,
                    ordinalId: newKey,
                    confirmed: false,
                    sources: [],
                    timestamp: '',
                    prompt,
                    status: ChatMessageStatus.PENDING,
                    type: ChatMessageType.SOURCES,
                };
                virtuosoRef.current?.data.append([sourceMessage], ({ scrollInProgress, atBottom }) => {
                    return {
                        index: 'LAST',
                        align: 'end',
                        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                    };
                });
                setTimeout(() => {
                    virtuosoRef.current?.data.map((message) => {
                        if (message.ordinalId === newKey) {
                            return {
                                ...message,
                                status: ChatMessageStatus.COMPLETED,
                            };
                        }

                        return message;
                    });
                }, 2000);
            } else {
                const botMessage = randomMessage(prompt);
                virtuosoRef.current?.data.append([botMessage]);
                setTimeout(() => {
                    let counter = 0;
                    const interval = setInterval(() => {
                        let status = ChatMessageStatus.STREAMING;
                        if (counter++ > 45) {
                            clearInterval(interval);
                            status = ChatMessageStatus.COMPLETED;
                        }
                        virtuosoRef.current?.data.map(
                            (message) => {
                                if (isMatchingResponse(message, botMessage)) {
                                    const firstBlock =
                                        (message.blocks[0] as TextBlock) ||
                                        ({
                                            id: `${message.blocks.length}`,
                                            type: BlockType.TEXT,
                                            content: ['some text...'],
                                            meta: { style: 'paragraph' },
                                        } as TextBlock);
                                    return {
                                        ...message,
                                        blocks: [
                                            {
                                                ...firstBlock,
                                                content: [
                                                    ...firstBlock.content,
                                                    firstBlock.content.length % 7 === 0
                                                        ? {
                                                              id: '1',
                                                              text: 'citation',
                                                              source: 'source',
                                                          }
                                                        : 'some more text...',
                                                ],
                                            },
                                        ],
                                        status,
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
                    }, 150);
                }, 2000);
            }
        },
        [chatId, sources]
    );

    // Create a memoized context object that updates when any of its values change
    const context = useMemo(
        () => ({
            onSubmit,
            onReRun,
            onConfirm,
        }),
        [onSubmit, onReRun, onConfirm]
    );

    const config = useConfig();

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
                            computeItemKey={({ data }: { data: ChatMessage }) => data.ordinalId}
                            className="px-4 messagesScrollBars"
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            initialData={messages}
                            shortSizeAlign="bottom-smooth"
                            ItemContent={MessageFactory}
                            context={context}
                            EmptyPlaceholder={SuggestedPrompts}
                            StickyHeader={StickyHeader}
                        />
                    </VirtuosoMessageListLicense>
                )}
                <Prompt onSubmit={onSubmit} onOpenSources={onOpenSources} />
            </div>
        </div>
    );
}
