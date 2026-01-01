import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroSparkles } from '@aiera/client-sdk/components/Svg/MicroSparkles';
import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { ChatMessageResponse } from '../../../../services/messages';
import { Block, Citation } from '../Block';
import { Footer } from './Footer';
import { Sources } from './Sources';

export const MessageResponse = ({
    data,
    isLastItem,
    generatingResponse,
}: {
    data: ChatMessageResponse;
    isLastItem: boolean;
    generatingResponse: boolean;
}) => {
    const { chatStatus } = useChatStore();
    const [statusesExpanded, setStatusesExpanded] = useState(generatingResponse);

    // Close statuses when blocks start flowing in (only during generation)
    useEffect(() => {
        if (
            generatingResponse &&
            statusesExpanded &&
            data.blocks &&
            data.blocks.some((block) => block.content.trim() !== '')
        ) {
            setStatusesExpanded(false);
        }
    }, [data.blocks, statusesExpanded, generatingResponse]);

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

    // Collect all citations from all blocks
    const allCitations =
        data.blocks?.reduce<Citation[]>((acc, block) => {
            if ('citations' in block && block.citations && Array.isArray(block.citations)) {
                return [...acc, ...block.citations];
            }
            return acc;
        }, []) ?? [];

    return (
        <div className="flex flex-col pb-6 mx-4">
            {data.statuses && data.statuses.length > 0 && (
                <div
                    className={classNames(
                        'flex flex-col overflow-hidden border border-slate-300/80 rounded-lg ml-1 mb-3',
                        {
                            'pb-1': statusesExpanded,
                        }
                    )}
                >
                    <button
                        onClick={() => setStatusesExpanded((pv) => !pv)}
                        className={classNames(
                            'py-2.5 hover:bg-slate-100 antialiased flex pl-3 pr-4 items-center justify-between',
                            {
                                'border-b': statusesExpanded,
                            }
                        )}
                    >
                        <MicroSparkles className="w-4 text-slate-600" />
                        <p className="text-base text-left ml-1.5 font-bold">Thinking Steps</p>
                        <p className="text-base flex-1 text-left ml-2 text-slate-600">
                            {data.statuses.length} step{data.statuses.length > 1 ? 's' : ''}
                        </p>
                        <Chevron
                            className={classNames('w-2 transition-all text-slate-600', {
                                'rotate-180': statusesExpanded,
                            })}
                        />
                    </button>
                    {statusesExpanded && (
                        <div className="px-3 py-2">
                            {data.statuses.map((status) => (
                                <div key={status.id} className="text-base px-2 py-1.5 text-slate-700">
                                    {status.content}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {data.blocks && data.blocks.some((block) => block.content.trim() !== '') && (
                <>
                    <div className="flex flex-col px-2">
                        {data.blocks.map((block, index) => (
                            <Block {...block} key={index} />
                        ))}
                    </div>
                    <Sources sources={data.sources} citations={allCitations} />
                    {(chatStatus === ChatSessionStatus.Active || !isLastItem) && (
                        <Footer data={data} onCopy={handleCopy} />
                    )}
                </>
            )}
        </div>
    );
};
