import React from 'react';
import { BaseBlock, BlockType } from '..';
import { SearchableText } from '../../SearchableText';

// Image block types
export interface ImageBlock extends BaseBlock {
    type: BlockType.IMAGE;
    url: string;
    meta: {
        title: string;
        source?: string;
        date?: string;
        altText?: string;
    };
}

export function Image({ url, meta }: ImageBlock) {
    const content = <img src={url} alt={meta.altText} title={meta.title} />;

    if (meta.title) {
        return (
            <div className="border border-gray-300 rounded overflow-hidden text-sm my-2">
                {content}
                <div className="bg-gray-100 px-3 py-2 leading-4">
                    {meta.date ? (
                        <p className="font-bold">
                            <SearchableText text={meta.title} />, <SearchableText text={meta.date} />
                        </p>
                    ) : (
                        <p className="font-bold">
                            <SearchableText text={meta.title} />
                        </p>
                    )}
                    {meta.source && (
                        <p className="text-gray-600">
                            <SearchableText text={meta.source} />
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return content;
}
