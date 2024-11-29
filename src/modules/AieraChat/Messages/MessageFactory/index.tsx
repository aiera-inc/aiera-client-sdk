import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import React from 'react';
import { match } from 'ts-pattern';
import { MessageListContext } from '..';
import { ChatMessage } from '../../services/messages';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';
import { SourcesResponse } from './SourcesResponse';

export const MessageFactory: VirtuosoMessageListProps<ChatMessage, MessageListContext>['ItemContent'] = ({
    data,
    context,
}) => {
    return match(data.type)
        .with('prompt', () => <MessagePrompt data={data} />)
        .with('sources', () => <SourcesResponse data={data} onConfirm={context.onConfirm} />)
        .otherwise(() => <MessageResponse data={data} onReRun={context.onReRun} />);
};
