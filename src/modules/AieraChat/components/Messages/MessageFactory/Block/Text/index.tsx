import classNames from 'classnames';
import React, { Fragment } from 'react';
import { BaseBlock, BlockType, CitableContent } from '..';
import { Citation } from '../../Citation';
import { SearchableText } from '../../SearchableText';

// Text block types
export interface TextBlock extends BaseBlock {
    type: BlockType.TEXT;
    content: CitableContent;
    meta: {
        style: 'paragraph' | 'h1' | 'h2' | 'h3';
    };
}

export function Text({ content, meta }: TextBlock) {
    const Container = meta.style === 'paragraph' ? 'p' : meta.style ?? 'p';
    return (
        <Container
            className={classNames({
                'text-balance': meta.style !== 'paragraph',
                'text-base pt-2': meta.style === 'paragraph',
                'text-lg font-bold leading-4': meta.style === 'h3',
                'text-xl leading-5 tracking-tight font-black pt-4 antialiased': meta.style === 'h2',
                'text-2xl leading-5 tracking-tight font-black pt-4 antialiased': meta.style === 'h1',
            })}
        >
            {content.map((c, idx) => {
                if (typeof c === 'string') {
                    return (
                        <Fragment key={idx}>
                            <SearchableText text={c} />
                        </Fragment>
                    );
                } else {
                    return <Citation citation={{ ...c }} key={idx} />;
                }
            })}
        </Container>
    );
}
