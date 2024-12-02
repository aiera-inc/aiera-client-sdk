import { ImageBlock } from './MessageFactory/Blocks/Image';
import { QuoteBlock } from './MessageFactory/Blocks/Quote';
import { TableBlock } from './MessageFactory/Blocks/Table';
import { TextBlock } from './MessageFactory/Blocks/Text';

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

// Common chart data type
type ChartData = {
    name: string;
    value: number;
    [key: string]: string | number; // Additional properties for different chart types
};

// Base type for all content blocks
export interface BaseBlock {
    id: string;
    type: string;
}

// List item with primary/secondary text
interface ListItemText {
    primary: CitableContent;
    secondary?: CitableContent;
}

// List content can be text, another block, or nested list
type ListItemContent = ListItemText | ContentBlock | ListBlock;

// List block types
interface ListBlock extends BaseBlock {
    type: 'list';
    items: ListItemContent[];
    meta: {
        style: 'ordered' | 'unordered';
    };
}

// Chart block types
interface ChartBlock extends BaseBlock {
    type: 'chart';
    data: ChartData[];
    meta: {
        chartType: 'area' | 'line' | 'bar' | 'pie' | 'scatter' | 'treemap';
        xAxis?: string;
        yAxis?: string;
        title?: string;
    };
}

// Union type for all content blocks
type ContentBlock = TextBlock | TableBlock | ListBlock | ImageBlock | QuoteBlock | ChartBlock;

// Main message type
// interface LLMMessage {
//     id: string;
//     timestamp: string;
//     blocks: ContentBlock[];
// }
