import React, { ReactNode } from 'react';
import { BaseBlock, BlockType, Citation as CitationType } from '..';
import { MarkdownRenderer } from './markdown';

// Text block types
export interface TextBlock extends BaseBlock {
    citations?: CitationType[];
    content: string;
    type: BlockType.TEXT;
}

export function Text({
    blockIndex,
    citations,
    content,
    highlightText,
    messageIndex,
}: TextBlock & {
    blockIndex?: number;
    highlightText?: (text: string, messageIndex: number, blockIndex?: number) => ReactNode;
    messageIndex?: number;
}) {
    return (
        <div className="text-base pt-2">
            <MarkdownRenderer
                blockIndex={blockIndex}
                citations={citations}
                content={content}
                highlightText={highlightText}
                messageIndex={messageIndex}
            />
        </div>
    );
}
