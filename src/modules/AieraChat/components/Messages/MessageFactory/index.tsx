import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import React from 'react';
import { MessageListContext } from '..';
import { MessageGroup } from '../../../services/messageGroups';
import { ChatMessageType } from '../../../services/messages';
import { MessagePrompt } from './MessagePrompt';
import { MessageResponse } from './MessageResponse';
import { SourcesResponse } from './SourcesResponse';

/* eslint-disable react/prop-types */
export const MessageFactory: VirtuosoMessageListProps<MessageGroup, MessageListContext>['ItemContent'] = ({
    data,
    context,
    nextData,
}) => (
    <div className="flex flex-col max-w-[50rem] w-full m-auto mb-6">
        {data.messages.map((message) => {
            if (message.type === ChatMessageType.PROMPT) {
                return <MessagePrompt key={message.id} data={message} />;
            } else if (message.type === ChatMessageType.SOURCES) {
                return <SourcesResponse key={message.id} data={message} onConfirm={context.onConfirm} />;
            } else if (message.type === ChatMessageType.RESPONSE) {
                return (
                    <MessageResponse key={message.id} data={message} onReRun={context.onReRun} isLastItem={!nextData} />
                );
            }
            return null;
        })}
    </div>
);
/* eslint-enable react/prop-types */
