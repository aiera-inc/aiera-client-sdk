import React, { useCallback } from 'react';
import { ChatMessageResponse, ChatMessageStatus } from '../../../../services/messages';
import { Block, BlockType } from '../Block';
import { Loading } from '../Loading';
import { Footer } from './Footer';
import { copyToClipboard } from '@aiera/client-sdk/lib/utils';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessageResponse }) => {
    const handleCopy = useCallback(() => {
        if (data.blocks && data.blocks.length > 0) {
            const lastBlock = data.blocks[data.blocks.length - 1];
            let contentToCopy: string | undefined;

            if (lastBlock?.type === BlockType.TEXT) {
                contentToCopy = lastBlock.content.map((item) => (typeof item === 'string' ? item : item.text)).join('');
            } else if (lastBlock?.type === BlockType.QUOTE) {
                contentToCopy = lastBlock.content;
            }

            if (contentToCopy) {
                copyToClipboard(contentToCopy)
                    .then(() => {
                        console.log('Content copied successfully');
                    })
                    .catch((error: Error) => {
                        console.error('Failed to copy content:', error.message);
                    });
            }
        }
    }, [data]);

    return data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
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
