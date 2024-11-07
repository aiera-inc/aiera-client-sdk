import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
    useCurrentlyRenderedData,
} from '@virtuoso.dev/message-list';
import React, { Fragment, useCallback, useRef } from 'react';
import './styles.css';
import { MessageFactory, MessagePrompt } from './MessageFactory';
import { Prompt } from '../Prompt';

type MessageType = 'prompt' | 'sources' | 'response';

export interface Message {
    type: MessageType;
    key: string;
    text: string;
    prompt?: string;
    user: 'me' | 'other';
}

let idCounter = 0;

function randomMessage(user: Message['user'], prompt: Message['prompt']): Message {
    return { user, key: `${idCounter++}`, type: 'response', text: 'some other message', prompt };
}

const StickyHeader: VirtuosoMessageListProps<Message, null>['StickyHeader'] = () => {
    const data: Message[] = useCurrentlyRenderedData();
    const firstPrompt = data[0];
    if (!firstPrompt) return null;
    return (
        <Fragment key={firstPrompt.key}>
            <div className="absolute top-0 left-0 right-0 bg-gray-50 h-2" />
            <MessagePrompt data={firstPrompt} />
        </Fragment>
    );
};

export function Messages() {
    const virtuoso = useRef<VirtuosoMessageListMethods<Message>>(null);

    const onSubmit = useCallback((prompt: string) => {
        const myMessage: Message = { user: 'me', key: `${idCounter++}`, text: prompt, prompt, type: 'prompt' };
        virtuoso.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
            return {
                index: 'LAST',
                align: 'end',
                behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
            };
        });

        setTimeout(() => {
            const botMessage = randomMessage('other', prompt);
            virtuoso.current?.data.append([botMessage]);

            let counter = 0;
            const interval = setInterval(() => {
                if (counter++ > 80) {
                    clearInterval(interval);
                }
                virtuoso.current?.data.map(
                    (message) => {
                        return message.key === botMessage.key
                            ? { ...message, text: message.text + ' ' + 'some message' }
                            : message;
                    },
                    {
                        location() {
                            return { index: 'LAST', align: 'end', behavior: 'smooth' };
                        },
                    }
                );
            }, 150);
        }, 1000);
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
