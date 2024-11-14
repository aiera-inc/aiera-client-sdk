import React from 'react';

export interface CodeBlockProps {
    language: string;
    code: string;
    caption?: string;
}

export function CodeBlock() {
    return <div>Code Block</div>;
}
