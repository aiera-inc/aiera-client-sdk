import {
    VirtuosoMessageList,
    VirtuosoMessageListLicense,
    VirtuosoMessageListMethods,
    VirtuosoMessageListProps,
    useCurrentlyRenderedData,
} from '@virtuoso.dev/message-list';
import React, { useCallback, useRef } from 'react';
import { Prompt } from '../Prompt';
import './styles.css';

interface Message {
    key: string;
    text: string;
    user: 'me' | 'other';
}

let idCounter = 0;

function randomMessage(user: Message['user']): Message {
    return { user, key: `${idCounter++}`, text: 'some other message' };
}

const StickyHeader: VirtuosoMessageListProps<Message, null>['StickyHeader'] = () => {
    const firstItem = useCurrentlyRenderedData<{ text: string }>()[0] as { text: string } | undefined;
    return (
        <div style={{ width: '100%', position: 'absolute', top: 0 }}>
            <div style={{ textAlign: 'center', fontWeight: 300 }}>
                <span style={{ backgroundColor: '#F0F0F3', padding: '0.1rem 2rem', borderRadius: '0.5rem' }}>
                    {firstItem?.text}
                </span>
            </div>
        </div>
    );
};

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
            <div className="absolute bottom-0 left-0 right-0 top-4 flex flex-col flex-1">
                <VirtuosoMessageListLicense licenseKey="">
                    <VirtuosoMessageList<Message, null>
                        ref={virtuoso}
                        style={{ flex: 1 }}
                        computeItemKey={({ data }: { data: Message }) => data.key}
                        className="px-4 messagesScrollBars"
                        initialLocation={{ index: 'LAST', align: 'end' }}
                        shortSizeAlign="bottom-smooth"
                        ItemContent={ItemContent}
                        StickyHeader={StickyHeader}
                    />
                </VirtuosoMessageListLicense>
                <Prompt onSubmit={onSubmit} />
            </div>
        </div>
    );
}
