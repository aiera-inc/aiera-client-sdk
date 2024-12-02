import React from 'react';
import { BaseBlock } from '../../../types';

// Quote block
export interface QuoteBlock extends BaseBlock {
    type: 'quote';
    content: string; // The quote itself
    meta: {
        author: string;
        source: string;
        date: string;
        url?: string;
    };
}

export function QuoteBlock({ content, meta }: QuoteBlock) {
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
