import React from 'react';
import { BaseBlock, BlockType } from '../types';

// Quote block
export interface QuoteBlock extends BaseBlock {
    type: BlockType.quote;
    content: string; // The quote itself
    meta: {
        author: string;
        source: string;
        date: string;
        url?: string;
    };
}

export function Quote({ content, meta }: QuoteBlock) {
    const { author, source, date } = meta;
    return (
        <div>
            <div>{content}</div>
            <div className="flex">
                <p>{`${author}, ${source}`}</p>
                <p>{date}</p>
            </div>
        </div>
    );
}
