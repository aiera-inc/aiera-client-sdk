import { ChartBlock } from './Chart';
import { ImageBlock } from './Image';
import { ListBlock } from './List';
import { QuoteBlock } from './Quote';
import { TableBlock } from './Table';
import { TextBlock } from './Text';

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
