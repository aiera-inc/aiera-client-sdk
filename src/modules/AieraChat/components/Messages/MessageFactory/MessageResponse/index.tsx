import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import React, { useCallback } from 'react';
import { ChatMessageResponse } from '../../../../services/messages';
import { Block } from '../Block';
import { MessageWrapper } from '../MessageWrapper';
import { Footer } from './Footer';

export const MessageResponse = ({
    data,
    isLastItem,
}: {
    data: ChatMessageResponse;
    isLastItem: boolean;
    generatingResponse: boolean;
}) => {
    const { chatStatus } = useChatStore();
    const handleCopy = useCallback(() => {
        if (!data.blocks || data.blocks.length === 0) return;

        // Process all blocks
        const contentParts = data.blocks.map((block) => block.content).filter((part) => part.trim() !== '');
        const fullContent = contentParts.join('\n\n');

        if (fullContent) {
            copyToClipboard(fullContent)
                .then(() => {
                    log('Full message content copied successfully');
                })
                .catch((error: Error) => {
                    log(`Failed to copy content: ${error.message}`, 'error');
                });
        }
    }, [data]);

    return (
        <MessageWrapper>
            <div className="flex flex-col px-2">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {(chatStatus === ChatSessionStatus.Active || !isLastItem) && <Footer data={data} onCopy={handleCopy} />}
        </MessageWrapper>
    );
};
