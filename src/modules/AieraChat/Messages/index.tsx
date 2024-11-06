import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
} from '@virtuoso.dev/message-list';
import React, { useCallback, useRef } from 'react';
import { Prompt } from '../Prompt';

interface Message {
    key: string;
    text: string;
    user: 'me' | 'other';
}

let idCounter = 0;

function randomMessage(user: Message['user']): Message {
    return { user, key: `${idCounter++}`, text: 'some other message' };
}

const ItemContent: VirtuosoMessageListProps<Message, null>['ItemContent'] = ({ data }: { data: Message }) => {
    const ownMessage = data.user === 'me';
    return (
        <div style={{ paddingBottom: '2rem', display: 'flex' }}>
            <div
                style={{
                    maxWidth: '80%',
                    marginLeft: data.user === 'me' ? 'auto' : undefined,

                    background: ownMessage ? '#0253B3' : '#F0F0F3',
                    color: ownMessage ? 'white' : 'black',
                    borderRadius: '1rem',
                    padding: '1rem',
                }}
            >
                {data.text}
            </div>
        </div>
    );
};

export function Messages() {
    const virtuoso = useRef<VirtuosoMessageListMethods<Message>>(null);

    const onSubmit = useCallback((prompt: string) => {
        const myMessage: Message = { user: 'me', key: `${idCounter++}`, text: prompt };
        virtuoso.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
            return {
                index: 'LAST',
                align: 'end',
                behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
            };
        });

        setTimeout(() => {
            const botMessage = randomMessage('other');
            virtuoso.current?.data.append([botMessage]);

            let counter = 0;
            const interval = setInterval(() => {
                if (counter++ > 20) {
                    clearInterval(interval);
                }
                virtuoso.current?.data.map((message) => {
                    return message.key === botMessage.key
                        ? { ...message, text: message.text + ' ' + 'some message' }
                        : message;
                }, 'smooth');
            }, 150);
        }, 1000);
    }, []);

    return (
        <div className="relative flex-1">
            <div className="absolute inset-0 flex flex-col flex-1">
                <VirtuosoMessageListLicense licenseKey="">
                    <VirtuosoMessageList<Message, null>
                        ref={virtuoso}
                        style={{ flex: 1 }}
                        computeItemKey={({ data }: { data: Message }) => data.key}
                        initialLocation={{ index: 'LAST', align: 'end' }}
                        shortSizeAlign="bottom-smooth"
                        ItemContent={ItemContent}
                    />
                </VirtuosoMessageListLicense>
                <Prompt onSubmit={onSubmit} />
            </div>
        </div>
    );
}
