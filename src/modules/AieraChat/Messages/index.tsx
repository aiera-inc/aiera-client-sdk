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
import React, { Fragment, RefObject, useCallback, useEffect } from 'react';
import { Prompt } from '../Prompt';
import { Message, MessageStatus, useChatMessages } from '../services/messages';
import { useChatStore } from '../store';
import { MessageFactory, MessagePrompt } from './MessageFactory';
import './styles.css';
import { SuggestedPrompts } from './SuggestedPrompts';

let idCounter = 0;

function randomMessage(user: Message['user'], prompt: Message['prompt']): Message {
    return { user, key: `${idCounter++}`, type: 'response', text: 'some other message', prompt, status: 'thinking' };
}

export interface MessageListContext {
    onSubmit: (p: string) => void;
    onReRun: (k: string) => void;
}

const StickyHeader: VirtuosoMessageListProps<Message, MessageListContext>['StickyHeader'] = () => {
    const data: Message[] = useCurrentlyRenderedData();
    const { getScrollLocation } = useVirtuosoMethods();
    const { listOffset } = getScrollLocation();
    const firstPrompt = data[0];
    if (!firstPrompt) return null;
    return (
        <Fragment key={firstPrompt.key}>
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
                data={firstPrompt}
            />
        </Fragment>
    );
};

export function Messages({
    onOpenSources,
    virtuosoRef,
}: {
    virtuosoRef: RefObject<VirtuosoMessageListMethods<Message>>;
    onOpenSources: () => void;
}) {
    const { chatId, onSelectChat } = useChatStore();
    const { messages, isLoading } = useChatMessages(chatId);

    // Reset when starting new chat
    useEffect(() => {
        if (chatId === null && virtuosoRef.current?.data) {
            virtuosoRef.current.data.replace([]);
        }
    }, [chatId]);

    const onReRun = useCallback((key: string) => {
        const originalIndex = virtuosoRef.current?.data.findIndex((m) => m.key === key);

        if (originalIndex) {
            setTimeout(() => {
                let counter = 0;
                let newMessage = '';
                const interval = setInterval(() => {
                    let status: MessageStatus = 'thinking';
                    if (counter++ > 80) {
                        clearInterval(interval);
                        status = 'finished';
                    } else if (counter > 10) {
                        status = 'updating';
                    }
                    virtuosoRef.current?.data.map(
                        (message) => {
                            if (message.key === key) {
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

    const onSubmit = useCallback(
        (prompt: string) => {
            onSelectChat('new');
            const myMessage: Message = {
                user: 'me',
                key: `${idCounter++}`,
                text: prompt,
                prompt,
                status: 'finished',
                type: 'prompt',
            };
            virtuosoRef.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
                return {
                    index: 'LAST',
                    align: 'end',
                    behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
                };
            });

            const botMessage = randomMessage('other', prompt);
            virtuosoRef.current?.data.append([botMessage]);
            setTimeout(() => {
                let counter = 0;
                const interval = setInterval(() => {
                    let status: MessageStatus = 'updating';
                    if (counter++ > 80) {
                        clearInterval(interval);
                        status = 'finished';
                    }
                    virtuosoRef.current?.data.map(
                        (message) => {
                            return message.key === botMessage.key
                                ? {
                                      ...message,
                                      text: message.text + ' ' + 'some message',
                                      status,
                                  }
                                : message;
                        },
                        {
                            location() {
                                return { index: 'LAST', align: 'end', behavior: 'smooth' };
                            },
                        }
                    );
                }, 150);
            }, 2000);
        },
        [chatId, onSelectChat]
    );

    return (
        <div className="relative flex-1">
            <div className="absolute bottom-0 left-0 right-0 top-4 flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <VirtuosoMessageListLicense licenseKey="">
                        <VirtuosoMessageList<Message, MessageListContext>
                            key={chatId || 'new'}
                            ref={virtuosoRef}
                            style={{ flex: 1 }}
                            computeItemKey={({ data }: { data: Message }) => data.key}
                            className="px-4 messagesScrollBars"
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            initialData={messages}
                            shortSizeAlign="bottom-smooth"
                            ItemContent={MessageFactory}
                            context={{ onSubmit, onReRun }}
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
