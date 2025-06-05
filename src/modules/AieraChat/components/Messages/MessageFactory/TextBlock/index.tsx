import React from 'react';
import { CitationProps } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Citation';
import { MarkdownRenderer } from './markdown';

export interface TextBlock {
    citations?: CitationProps[];
    content: string;
    id: string;
}

export function Text({ content }: TextBlock) {
    return (
        <div className="text-base pt-2">
            <MarkdownRenderer content={content} />
        </div>
    );
}
