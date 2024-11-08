import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
    useCurrentlyRenderedData,
    useVirtuosoMethods,
} from '@virtuoso.dev/message-list';
import React, { Fragment, useCallback, useRef } from 'react';
import './styles.css';
import { MessageFactory, MessagePrompt } from './MessageFactory';
import { Prompt } from '../Prompt';
import classNames from 'classnames';

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

export function Messages() {
    const virtuoso = useRef<VirtuosoMessageListMethods<Message>>(null);

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
                <VirtuosoMessageListLicense licenseKey="">
                    <VirtuosoMessageList<Message, null>
                        ref={virtuoso}
                        style={{ flex: 1 }}
                        computeItemKey={({ data }: { data: Message }) => data.key}
                        className="px-4 messagesScrollBars"
                        initialLocation={{ index: 'LAST', align: 'end' }}
                        shortSizeAlign="bottom-smooth"
                        ItemContent={MessageFactory}
                        StickyHeader={StickyHeader}
                    />
                </VirtuosoMessageListLicense>
                <Prompt onSubmit={onSubmit} />
            </div>
        </div>
    );
}
