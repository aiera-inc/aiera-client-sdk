import React from 'react';
import { match } from 'ts-pattern';
import { ChartBlock, Chart } from './Chart';
import { ImageBlock, Image } from './Image';
import { ListBlock, List } from './List';
import { QuoteBlock, Quote } from './Quote';
import { TableBlock, Table } from './Table';
import { TextBlock, Text } from './Text';

// Citation type for referencing sources
type Citation = {
    id: string;
    text: string;
    source: string;
    url?: string;
    date?: string;
    author?: string;
};

// Type for content that can include citations
export type CitableContent = (string | Citation)[];

export enum BlockType {
    text = 'text',
    table = 'table',
    list = 'list',
    image = 'image',
    quote = 'quote',
    chart = 'chart',
}

// Base type for all content blocks
export interface BaseBlock {
    id: string;
    type: BlockType;
}

// Union type for all content blocks
export type ContentBlock = TextBlock | TableBlock | ListBlock | ImageBlock | QuoteBlock | ChartBlock;

export function Block(props: ContentBlock) {
    return match(props)
        .with({ type: BlockType.text }, (p) => (
            <Text type={BlockType.text} content={p.content} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.table }, (p) => (
            <Table type={BlockType.table} headers={p.headers} rows={p.rows} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.list }, (p) => <List type={BlockType.list} items={p.items} meta={p.meta} id={p.id} />)
        .with({ type: BlockType.quote }, (p) => (
            <Quote type={BlockType.quote} content={p.content} meta={p.meta} id={p.id} />
        ))
        .with({ type: BlockType.image }, (p) => <Image type={BlockType.image} url={p.url} meta={p.meta} id={p.id} />)
        .with({ type: BlockType.chart }, (p) => <Chart type={BlockType.chart} data={p.data} meta={p.meta} id={p.id} />)
        .exhaustive();
}
