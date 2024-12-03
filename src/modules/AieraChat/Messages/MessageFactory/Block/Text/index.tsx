import React from 'react';
import { Citation } from '../../Citation';
import { match } from 'ts-pattern';
import { BaseBlock, BlockType, CitableContent } from '..';

// Text block types
export interface TextBlock extends BaseBlock {
    type: BlockType.text;
    content: CitableContent;
    meta: {
        style: 'paragraph' | 'h1' | 'h2' | 'h3';
    };
}

export function Text({ content, meta }: TextBlock) {
    return (
        <>
            {content.map((c, idx) => {
                if (typeof c === 'string') {
                    return match(meta.style)
                        .with('paragraph', () => <p key={idx}>{c}</p>)
                        .with('h1', () => <h1 key={idx}>{c}</h1>)
                        .with('h2', () => <h2 key={idx}>{c}</h2>)
                        .with('h3', () => <h3 key={idx}>{c}</h3>)
                        .exhaustive();
                } else {
                    return <Citation key={idx} />;
                }
            })}
        </>
    );
}
