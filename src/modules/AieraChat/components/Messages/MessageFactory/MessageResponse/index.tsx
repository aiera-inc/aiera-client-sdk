import React, { useCallback } from 'react';
import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { Text } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/TextBlock';
import { ChatMessageResponse, ChatMessageStatus } from '../../../../services/messages';
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
    console.log({ MessageResponse: true, status: data.status, blocks: data.blocks });

    return data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="flex flex-col px-4 pb-2">
                {data.blocks?.map((b, index) => (
                    <Text
                        citations={b.citations}
                        content={b.content}
                        id={data.id}
                        key={`message-${data.id}-block-${index}`}
                    />
                ))}
            </div>
            {data.status !== ChatMessageStatus.STREAMING && (
                <Footer data={data} onCopy={handleCopy} onReRun={onReRun} />
            )}
        </div>
    );
};
