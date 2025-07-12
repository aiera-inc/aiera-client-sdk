import React, { ReactNode } from 'react';
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
    highlightText?: (text: string, messageIndex: number, blockIndex?: number) => ReactNode;
    messageIndex?: number;
    blockIndex?: number;
};

export function Block(props: BlockProps) {
    return match(props)
        .with({ type: BlockType.TEXT }, (p) => (
            <Text
                citations={p.citations}
                content={p.content}
                id={p.id}
                type={BlockType.TEXT}
                highlightText={props.highlightText}
                messageIndex={props.messageIndex}
                blockIndex={props.blockIndex}
            />
        ))
        .exhaustive();
}
