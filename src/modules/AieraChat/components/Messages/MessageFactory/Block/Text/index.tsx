import React from 'react';
import { BaseBlock, BlockType, Citation as CitationType } from '..';
import { MarkdownRenderer } from './markdown';

// Text block types
export interface TextBlock extends BaseBlock {
    citations?: CitationType[];
    content: string;
    type: BlockType.TEXT;
}

export function Text({ citations, content }: TextBlock) {
    return (
        <div className="text-base pt-2">
            <MarkdownRenderer citations={citations} content={content} />
        </div>
    );
}
