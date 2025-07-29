import React from 'react';
import { match } from 'ts-pattern';
import { ChatMessage, ChatMessageType } from '../../../services/messages';
import { Source } from '../../../store';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';
import { SourcesResponse } from './SourcesResponse';

/* eslint-disable react/prop-types */
export const MessageFactory = ({
    message,
    nextMessage,
    onConfirm,
    generatingResponse,
    onReRun,
}: {
    generatingResponse: boolean;
    message: ChatMessage;
    nextMessage?: ChatMessage;
    onConfirm: (messageId: string, sources: Source[]) => void;
    onReRun: (k: string) => void;
}) => {
    return (
        <div className="flex flex-col max-w-[50rem] w-full m-auto">
            {match(message)
                .with({ type: ChatMessageType.PROMPT }, (data) => <MessagePrompt data={data} />)
                .with({ type: ChatMessageType.SOURCES }, (data) => <SourcesResponse data={data} onConfirm={onConfirm} />)
                .with({ type: ChatMessageType.RESPONSE }, (data) => (
                    <MessageResponse
                        generatingResponse={generatingResponse && !nextMessage}
                        data={data}
                        onReRun={onReRun}
                        isLastItem={!nextMessage}
                    />
                ))
                .exhaustive()}
        </div>
    );
};
/* eslint-enable react/prop-types */
