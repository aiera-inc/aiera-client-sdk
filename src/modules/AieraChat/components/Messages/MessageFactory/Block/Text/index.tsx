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
    console.log({ content, citations, highlightText, messageIndex });
    return (
        <div className="text-base pt-2">
            {highlightText && messageIndex !== undefined ? (
                <div className="leading-relaxed pb-2.5">{highlightText(content, messageIndex)}</div>
            ) : (
                <MarkdownRenderer citations={citations} content={content} />
            )}
        </div>
    );
}
