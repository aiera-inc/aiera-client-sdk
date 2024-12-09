import React from 'react';
import { BaseBlock, BlockType } from '..';
import { SearchableText } from '../../SearchableText';

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
        <div className="pl-3.5 relative my-2">
            <div className="absolute left-0.5 top-0.5 bottom-0 rounded w-1 bg-indigo-600" />
            <p className="text-base italic relative">
                <span className="z-10 relative">
                    <SearchableText text={content} />
                </span>
                <span className="h-10 w-12 text-slate-200/60 absolute right-2 bottom-0 overflow-hidden">
                    <span className="font-serif text-[120px] -bottom-[6.25rem] right-2 absolute">&rdquo;</span>
                </span>
            </p>
            <div className="mt-2 flex flex-col text-sm antialiased">
                <p className="font-bold leading-4">
                    <SearchableText text={author} />, <SearchableText text={source} />
                </p>
                <p className="text-gray-600 leading-4">
                    {new Date(date).toLocaleDateString('en-US', { dateStyle: 'full' })}
                </p>
            </div>
        </div>
    );
}
