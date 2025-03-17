import React from 'react';
import { match } from 'ts-pattern';
import { ChartBlock, Chart } from './Chart';
import { ImageBlock, Image } from './Image';
import { ListBlock, List } from './List';
import { QuoteBlock, Quote } from './Quote';
import { TableBlock, Table } from './Table';
import { TextBlock, Text } from './Text';

// Citation type for referencing sources
export type Citation = {
    author?: string;
    contentId?: string;
    date?: string;
    source: string;
    sourceId: string;
    text: string;
    url?: string;
};

// Type for content that can include citations
export type CitableContent = (string | Citation)[];

export enum BlockType {
    TEXT = 'text',
    TABLE = 'table',
    LIST = 'list',
    IMAGE = 'image',
    QUOTE = 'quote',
    CHART = 'chart',
}

// Base type for all content blocks
export interface BaseBlock {
    id: string;
    type: BlockType;
}

// Union type for all content blocks
export type ContentBlock = TextBlock | TableBlock | ListBlock | ImageBlock | QuoteBlock | ChartBlock;

type BlockProps = ContentBlock & {
    isNested?: boolean;
};

export function Block(props: BlockProps) {
    return match(props)
        .with({ type: BlockType.TEXT }, (p) => (
            <Text type={BlockType.TEXT} content={p.content} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.TABLE }, (p) => (
            <Table type={BlockType.TABLE} headers={p.headers} rows={p.rows} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.LIST }, (p) => (
            <List isNested={props.isNested} type={BlockType.LIST} items={p.items} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.QUOTE }, (p) => (
            <Quote type={BlockType.QUOTE} content={p.content} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.IMAGE }, (p) => <Image type={BlockType.IMAGE} url={p.url} meta={p.meta} id={p.id} />)
        .with({ type: BlockType.CHART }, (p) => <Chart type={BlockType.CHART} data={p.data} meta={p.meta} id={p.id} />)
        .exhaustive();
}
