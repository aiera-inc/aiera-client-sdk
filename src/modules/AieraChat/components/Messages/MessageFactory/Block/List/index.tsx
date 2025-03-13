import React from 'react';
import { BaseBlock, Block, BlockType, CitableContent, ContentBlock } from '..';
import { Citation } from '../../Citation';
import { SearchableText } from '../../SearchableText';
import classNames from 'classnames';

// List item with primary/secondary text
interface ListItemText {
    primary: CitableContent;
    secondary?: CitableContent;
}

// List content can be text, another block, or nested list
export type ListItemContent = ListItemText | ContentBlock;

// List block types
export interface ListBlock extends BaseBlock {
    isNested?: boolean;
    type: BlockType.LIST;
    items: ListItemContent[];
    meta: {
        style: 'ordered' | 'unordered';
    };
}

function isContentBlock(item: ListItemContent): item is ContentBlock {
    return 'type' in item;
}

function renderItems(content: CitableContent) {
    let numCitations = 0;
    return content.map((c, idx) => {
        if (typeof c === 'string') {
            return <SearchableText key={idx} text={c} />;
        } else {
            numCitations++;
            return <Citation citation={{ ...c }} key={idx} number={numCitations} />;
        }
    });
}

function ListItem({ item, itemIndex }: { item: ListItemContent; itemIndex: number }) {
    if (isContentBlock(item)) {
        return (
            <li>
                <Block {...item} blockIndex={itemIndex} isNested />
            </li>
        );
    }

    return (
        <li className="relative">
            <p className="text-base font-bold">{renderItems(item.primary)}</p>
            {item.secondary && item.secondary.length > 0 && <p className="text-base">{renderItems(item.secondary)}</p>}
        </li>
    );
}

export function List({ isNested, items, meta }: ListBlock) {
    const ListType = meta.style === 'ordered' ? 'ol' : 'ul';

    return (
        <ListType
            className={classNames('text-base space-y-2', {
                'list-disc': meta.style === 'unordered',
                'list-decimal': meta.style === 'ordered',
                'pt-4 ml-6': !isNested,
                'ml-4': isNested,
            })}
        >
            {items.map((item, idx) => (
                <ListItem item={item} itemIndex={idx} key={idx} />
            ))}
        </ListType>
    );
}
