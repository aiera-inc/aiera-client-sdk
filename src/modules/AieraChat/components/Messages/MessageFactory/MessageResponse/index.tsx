import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import React, { useCallback, useId } from 'react';
import { ChatMessageResponse } from '../../../../services/messages';
import { Block } from '../Block';
import { MessageWrapper } from '../MessageWrapper';
import { Footer } from './Footer';

export const MessageResponse = ({
    data,
    onReRun,
    isLastItem,
    thinkingState,
    generatingResponse,
}: {
    onReRun: (k: string) => void;
    data: ChatMessageResponse;
    isLastItem: boolean;
    thinkingState: string[];
    generatingResponse: boolean;
}) => {
    const thinkingKey = useId();
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
        <MessageWrapper isLoading={generatingResponse}>
            {thinkingState.length > 0 && (
                <div className="border self-start py-2.5 px-4 ml-3 rounded-lg mb-4">
                    <p className="text-base mb-1 font-semibold">Reasoning Logs...</p>
                    {thinkingState.map((s, index) => {
                        return (
                            <div key={`${thinkingKey}-${index}`} className="flex items-center">
                                <div className="h-1 w-1 rounded-full bg-black mr-2" />
                                <p className="text-base line-clamp-1">{s}</p>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="flex flex-col pl-3.5 pr-4">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {(chatStatus === ChatSessionStatus.Active || !isLastItem) && (
                <Footer data={data} onCopy={handleCopy} onReRun={onReRun} />
            )}
        </MessageWrapper>
    );
};
