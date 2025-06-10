import React from 'react';
import { BaseBlock, BlockType, Citation as CitationType } from '..';
// import { Citation } from '../../Citation';
// import { SearchableText } from '../../SearchableText';
import { MarkdownRenderer } from './markdown';

// Text block types
export interface TextBlock extends BaseBlock {
    citations?: CitationType[];
    content: string;
    type: BlockType.TEXT;
}

export function Text({ content }: TextBlock) {
    return (
        <div className="text-base pt-2">
            <MarkdownRenderer content={content} />
        </div>
    );
}
