import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import React from 'react';
import { match } from 'ts-pattern';
import { MessageListContext } from '..';
import { ChatMessage, ChatMessageType } from '../../../services/messages';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';
import { SourcesResponse } from './SourcesResponse';

/* eslint-disable react/prop-types */
export const MessageFactory: VirtuosoMessageListProps<ChatMessage, MessageListContext>['ItemContent'] = ({
    data,
    context,
    nextData,
    index,
}) => (
    <div className="flex flex-col max-w-[50rem] w-full m-auto">
        {match(data)
            .with({ type: ChatMessageType.PROMPT }, (promptData) => (
                <MessagePrompt data={promptData} highlightText={context.highlightText} messageIndex={index} />
            ))
            .with({ type: ChatMessageType.SOURCES }, (sourcesData) => (
                <SourcesResponse data={sourcesData} onConfirm={context.onConfirm} />
            ))
            .with({ type: ChatMessageType.RESPONSE }, (responseData) => (
                <MessageResponse
                    data={responseData}
                    onReRun={context.onReRun}
                    isLastItem={!nextData}
                    highlightText={context.highlightText}
                    messageIndex={index}
                />
            ))
            .exhaustive()}
    </div>
);
/* eslint-enable react/prop-types */
