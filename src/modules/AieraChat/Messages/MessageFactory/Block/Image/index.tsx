import React from 'react';
import { BaseBlock, BlockType } from '..';
import { SearchableText } from '../../SearchableText';

// Image block types
export interface ImageBlock extends BaseBlock {
    type: BlockType.image;
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
            <div>
                {content}
                {meta.date ? (
                    <p>
                        <SearchableText text={meta.title} />, <SearchableText text={meta.date} />
                    </p>
                ) : (
                    <p>
                        <SearchableText text={meta.title} />
                    </p>
                )}
                {meta.source && (
                    <p>
                        <SearchableText text={meta.source} />
                    </p>
                )}
            </div>
        );
    }

    return content;
}
