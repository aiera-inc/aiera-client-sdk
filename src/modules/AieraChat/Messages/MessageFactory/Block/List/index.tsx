import React, { Fragment } from 'react';
import { BaseBlock, BlockType, CitableContent, ContentBlock } from '../types';
import { Block } from '..';
import { Citation } from '../../Citation';

// List item with primary/secondary text
interface ListItemText {
    primary: CitableContent;
    secondary?: CitableContent;
}

// List content can be text, another block, or nested list
type ListItemContent = ListItemText | ContentBlock;

// List block types
export interface ListBlock extends BaseBlock {
    type: BlockType.list;
    items: ListItemContent[];
    meta: {
        style: 'ordered' | 'unordered';
    };
}

function isContentBlock(item: ListItemContent): item is ContentBlock {
    return 'type' in item;
}

function ListItem({ item }: { item: ListItemContent }) {
    if (isContentBlock(item)) {
        return (
            <li>
                <Block {...item} />
            </li>
        );
    }

    return (
        <li>
            <p>
                {item.primary.map((c, idx) =>
                    typeof c === 'string' ? <Fragment key={idx}>{c}</Fragment> : <Citation key={idx} />
                )}
            </p>
            {item.secondary && item.secondary.length > 0 && (
                <p>
                    {item.secondary.map((c, idx) =>
                        typeof c === 'string' ? <Fragment key={idx}>{c}</Fragment> : <Citation key={idx} />
                    )}
                </p>
            )}
        </li>
    );
}

export function List({ items, meta }: ListBlock) {
    const ListType = meta.style === 'ordered' ? 'ol' : 'ul';

    return (
        <ListType>
            {items.map((item, idx) => (
                <ListItem item={item} key={idx} />
            ))}
        </ListType>
    );
}
