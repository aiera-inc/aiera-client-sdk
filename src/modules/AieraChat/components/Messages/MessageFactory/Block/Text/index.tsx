import classNames from 'classnames';
import React, { Fragment } from 'react';
import { match } from 'ts-pattern';
import { BaseBlock, BlockType, CitableContent } from '..';
import { Citation } from '../../Citation';
import { SearchableText } from '../../SearchableText';
import { MarkdownRenderer } from './markdown';

// Text block types
export interface TextBlock extends BaseBlock {
    type: BlockType.TEXT;
    content: CitableContent;
    meta: {
        style: 'markdown' | 'paragraph' | 'h1' | 'h2' | 'h3';
    };
}

export function Text({ content, meta }: TextBlock) {
    const Container = meta.style === 'paragraph' ? 'p' : meta.style === 'markdown' ? 'div' : meta.style ?? 'p';
    return (
        <Container
            className={classNames({
                'prose max-w-none': meta.style === 'markdown',
                'text-balance': ['h1', 'h2', 'h3'].includes(meta.style),
                'text-base pt-2': meta.style === 'paragraph',
                'text-lg font-bold leading-4': meta.style === 'h3',
                'text-xl leading-5 tracking-tight font-black pt-4 antialiased': meta.style === 'h2',
                'text-2xl leading-5 tracking-tight font-black pt-4 antialiased': meta.style === 'h1',
            })}
        >
            {match(meta.style)
                .with('markdown', () => (
                    <MarkdownRenderer
                        content={content.filter((c) => typeof c === 'string') as string[]}
                        className="streaming-markdown"
                    />
                ))
                .otherwise(() =>
                    content.map((c, idx) => {
                        if (typeof c === 'string') {
                            return (
                                <Fragment key={idx}>
                                    {c.split('\n').map((line, i) => (
                                        <Fragment key={i}>
                                            <SearchableText text={line} />
                                            {i < c.split('\n').length - 1 && <br />}
                                        </Fragment>
                                    ))}
                                </Fragment>
                            );
                        } else {
                            return <Citation citation={c} key={idx} />;
                        }
                    })
                )}
        </Container>
    );
}
