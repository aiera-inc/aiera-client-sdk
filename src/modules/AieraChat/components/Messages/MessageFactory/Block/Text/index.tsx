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
    citations,
    content,
    highlightText,
    messageIndex,
}: TextBlock & {
    highlightText?: (text: string, messageIndex: number) => ReactNode;
    messageIndex?: number;
}) {
    return (
        <div className="text-base pt-2">
            <MarkdownRenderer
                citations={citations}
                content={content}
                highlightText={highlightText}
                messageIndex={messageIndex}
            />
        </div>
    );
}
