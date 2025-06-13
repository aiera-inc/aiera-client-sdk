import React, { useCallback } from 'react';
import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { ChatMessageResponse, ChatMessageStatus } from '../../../../services/messages';
import { Block } from '../Block';
import { Loading } from '../Loading';
import { Footer } from './Footer';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessageResponse }) => {
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

    return data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-8 flex flex-col">
            <div className="flex flex-col px-4 pb-2">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {data.status !== ChatMessageStatus.STREAMING && (
                <Footer data={data} onCopy={handleCopy} onReRun={onReRun} />
            )}
        </div>
    );
};
