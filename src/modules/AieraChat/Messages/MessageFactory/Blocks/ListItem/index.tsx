import React from 'react';

export interface ListItemBlockProps {
    content: string;
    subitems?: ListItemBlockProps[];
    metadata?: {
        icon?: string;
        style?: 'bullet' | 'number' | 'checkbox';
        checked?: boolean;
    };
}

export function ListItemBlock() {
    return <div>List item</div>;
}
