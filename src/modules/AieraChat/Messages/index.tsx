import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
    useCurrentlyRenderedData,
    useVirtuosoMethods,
} from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { Fragment, useCallback, useEffect, useRef } from 'react';
import { Prompt } from '../Prompt';
import { MessageFactory, MessagePrompt } from './MessageFactory';
import './styles.css';
import { useChatMessages } from '../services/messages';
import { useChatStore } from '../store';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';

type MessageType = 'prompt' | 'sources' | 'response';
type MessageStatus = 'finished' | 'thinking' | 'updating';

export interface Message {
    type: MessageType;
    key: string;
    text: string;
    status: MessageStatus;
    prompt?: string;
    user: 'me' | 'other';
}

let idCounter = 0;

function randomMessage(user: Message['user'], prompt: Message['prompt']): Message {
    return { user, key: `${idCounter++}`, type: 'response', text: 'some other message', prompt, status: 'thinking' };
}

const EmptyPlaceholder: VirtuosoMessageListProps<Message, null>['EmptyPlaceholder'] = () => {
    return (
        <div className="flex-1 flex flex-col justify-end h-full pb-4">
            <p className="text-sm text-center">Suggested questions (based on watchlist)</p>
        </div>
    );
};

const StickyHeader: VirtuosoMessageListProps<Message, null>['StickyHeader'] = () => {
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

export function Messages({ onOpenSources }: { onOpenSources: () => void }) {
    const { chatId } = useChatStore();
    const { messages, isLoading } = useChatMessages(chatId);
    const virtuoso = useRef<VirtuosoMessageListMethods<Message>>(null);

    // Reset when starting new chat
    useEffect(() => {
        if (chatId === null && virtuoso.current?.data) {
            virtuoso.current.data.replace([]);
        }
    }, [chatId]);

    const onSubmit = useCallback((prompt: string) => {
        const myMessage: Message = {
            user: 'me',
            key: `${idCounter++}`,
            text: prompt,
            prompt,
            status: 'finished',
            type: 'prompt',
        };
        virtuoso.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
            return {
                index: 'LAST',
                align: 'end',
                behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
            };
        });

        const botMessage = randomMessage('other', prompt);
        virtuoso.current?.data.append([botMessage]);
        setTimeout(() => {
            let counter = 0;
            const interval = setInterval(() => {
                let status: MessageStatus = 'updating';
                if (counter++ > 80) {
                    clearInterval(interval);
                    status = 'finished';
                }
                virtuoso.current?.data.map(
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
    }, []);

    return (
        <div className="relative flex-1">
            <div className="absolute bottom-0 left-0 right-0 top-4 flex flex-col flex-1">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pb-3">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <VirtuosoMessageListLicense licenseKey="">
                        <VirtuosoMessageList<Message, null>
                            key={chatId}
                            ref={virtuoso}
                            style={{ flex: 1 }}
                            computeItemKey={({ data }: { data: Message }) => data.key}
                            className="px-4 messagesScrollBars"
                            initialLocation={{ index: 'LAST', align: 'end' }}
                            initialData={messages}
                            shortSizeAlign="bottom-smooth"
                            ItemContent={MessageFactory}
                            EmptyPlaceholder={EmptyPlaceholder}
                            StickyHeader={StickyHeader}
                        />
                    </VirtuosoMessageListLicense>
                )}
                <Prompt onSubmit={onSubmit} onOpenSources={onOpenSources} />
            </div>
        </div>
    );
}
