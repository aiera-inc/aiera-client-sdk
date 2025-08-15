import React from 'react';
import { match } from 'ts-pattern';
import { TextBlock, Text } from './Text';

// Citation type for referencing sources
export type Citation = {
    author?: string;
    contentId?: string;
    date?: string;
    marker: string;
    meta?: object;
    source: string;
    sourceId: string;
    sourceParentId?: string;
    sourceParentType?: string;
    sourceType?: string;
    text: string;
    url?: string;
};

export enum BlockType {
    TEXT = 'text',
}

// Base type for all content blocks
export interface BaseBlock {
    id: string;
    type: BlockType;
}

// Union type for all content blocks
export type ContentBlock = TextBlock;

type BlockProps = ContentBlock & {
    isNested?: boolean;
};

export function Block(props: BlockProps) {
    return match(props)
        .with({ type: BlockType.TEXT }, (p) => (
            <Text citations={p.citations} content={p.content} id={p.id} type={BlockType.TEXT} />
        ))
        .exhaustive();
}
