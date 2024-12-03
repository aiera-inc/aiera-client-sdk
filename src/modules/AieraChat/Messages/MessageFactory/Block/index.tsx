import React from 'react';
import { match } from 'ts-pattern';
import { List } from './List';
import { Quote } from './Quote';
import { Table } from './Table';
import { Text } from './Text';
import { BlockType, ContentBlock } from './types';
import { Image } from './Image';
import { Chart } from './Chart';

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
