import React from 'react';
import { match } from 'ts-pattern';
import { ChatMessage, ChatMessageType } from '../../../services/messages';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';

/* eslint-disable react/prop-types */
export const MessageFactory = ({
    message,
    nextMessage,
    generatingResponse,
    setRef,
}: {
    generatingResponse: boolean;
    message: ChatMessage;
    nextMessage?: ChatMessage;
    setRef: (node: HTMLDivElement | null, id: string) => void;
}) => {
    return (
        <div ref={(node) => setRef(node, message.id)} className="flex flex-col max-w-[50rem] w-full m-auto">
            {match(message)
                .with({ type: ChatMessageType.PROMPT }, (data) => <MessagePrompt data={data} />)
                .with({ type: ChatMessageType.RESPONSE }, (data) => (
                    <MessageResponse
                        generatingResponse={generatingResponse && !nextMessage}
                        data={data}
                        isLastItem={!nextMessage}
                    />
                ))
                .otherwise(() => null)}
        </div>
    );
};
/* eslint-enable react/prop-types */
