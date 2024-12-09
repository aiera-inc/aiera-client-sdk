import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import React from 'react';
import { match } from 'ts-pattern';
import { MessageListContext } from '..';
import { ChatMessage, ChatMessageType } from '../../../services/messages';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';
import { SourcesResponse } from './SourcesResponse';

export const MessageFactory: VirtuosoMessageListProps<ChatMessage, MessageListContext>['ItemContent'] = ({
    data,
    context,
}) => {
    return match(data)
        .with({ type: ChatMessageType.PROMPT }, (promptData) => <MessagePrompt data={promptData} />)
        .with({ type: ChatMessageType.SOURCES }, (sourcesData) => (
            <SourcesResponse data={sourcesData} onConfirm={context.onConfirm} />
        ))
        .with({ type: ChatMessageType.RESPONSE }, (responseData) => (
            <MessageResponse data={responseData} onReRun={context.onReRun} />
        ))
        .exhaustive();
};
