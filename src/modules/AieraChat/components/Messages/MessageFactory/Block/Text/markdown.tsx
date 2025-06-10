import React, { useMemo } from 'react';
import { compiler, MarkdownToJSX } from 'markdown-to-jsx';
import './markdown.css';

interface MarkdownRendererProps {
    content: string;
}

// Function to handle unclosed markdown elements in partial content
const preparePartialMarkdown = (content: string): string => {
    let text = content;

    // Handle unclosed code blocks
    const codeBlockMatches = text.match(/```[a-zA-Z0-9]*\n[\s\S]*?(?:```|$)/g);
    if (codeBlockMatches) {
        codeBlockMatches.forEach((match) => {
            if (!match.endsWith('```')) {
                // If code block is not closed, close it
                const fixedMatch = match + '\n```';
                text = text.replace(match, fixedMatch);
            }
        });
    }

    // Handle unclosed inline code
    let backtickCount = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '`' && (i === 0 || text[i - 1] !== '\\')) {
            backtickCount++;
        }
    }
    if (backtickCount % 2 !== 0) {
        text += '`';
    }

    // Handle unclosed bold/italic formatting
    let asteriskCount = 0;
    let underscoreCount = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '*' && (i === 0 || text[i - 1] !== '\\')) {
            asteriskCount++;
        }
        if (text[i] === '_' && (i === 0 || text[i - 1] !== '\\')) {
            underscoreCount++;
        }
    }
    if (asteriskCount % 2 !== 0) {
        text += '*';
    }
    if (underscoreCount % 2 !== 0) {
        text += '_';
    }

    // Handle unclosed links
    const linkMatches = text.match(/\[([^\]]+)(?:\]\([^)]*|\]$|\]\([^)]*$)/g);
    if (linkMatches) {
        linkMatches.forEach((match) => {
            if (match.includes('](') && !match.includes(')')) {
                text = text.replace(match, match + ')');
            } else if (match.endsWith(']')) {
                text = text.replace(match, match + '()');
            }
        });
    }

    return text;
};

// Define type for component props to fix TypeScript errors
type CustomComponentProps = {
    children: React.ReactNode;
    [key: string]: unknown;
};

// Custom component overrides for markdown-to-jsx
const CustomCode = ({ children }: CustomComponentProps) => {
    return (
        <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-sm">
            {children}
        </code>
    );
};

const CustomPre = ({ children }: CustomComponentProps) => {
    return (
        <pre className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto text-gray-800 dark:text-gray-200 my-4 font-mono text-sm">
            {children}
        </pre>
    );
};

const CustomLink = ({ href, children }: CustomComponentProps & { href?: string }) => {
    return (
        <a
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
};

const CustomTable = ({ children }: CustomComponentProps) => {
    return (
        <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
        </div>
    );
};

const CustomTableHead = ({ children }: CustomComponentProps) => (
    <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
);

const CustomTableBody = ({ children }: CustomComponentProps) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
);

const CustomTableCell = ({ children }: CustomComponentProps) => <td className="px-3 py-2 text-sm">{children}</td>;

const CustomTableHeaderCell = ({ children }: CustomComponentProps) => (
    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
    </th>
);

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const preparedMarkdown = useMemo(() => preparePartialMarkdown(content), [content]);

    // Define overrides for markdown-to-jsx with proper types
    const overrides: MarkdownToJSX.Options['overrides'] = {
        code: CustomCode,
        pre: CustomPre,
        a: CustomLink,
        table: CustomTable,
        thead: CustomTableHead,
        tbody: CustomTableBody,
        td: CustomTableCell,
        th: CustomTableHeaderCell,
        h1: {
            component: 'h1',
            props: {
                className: 'text-2xl font-bold pt-4 pb-4 border-b border-gray-200 dark:border-gray-700',
            },
        },
        h2: {
            component: 'h2',
            props: {
                className: 'text-xl font-bold pt-4 pb-3 border-b border-gray-200 dark:border-gray-700',
            },
        },
        h3: {
            component: 'h3',
            props: {
                className: 'text-lg font-bold pt-3 pb-2',
            },
        },
        h4: {
            component: 'h4',
            props: {
                className: 'text-base font-bold pt-3 pb-2',
            },
        },
        p: {
            component: 'p',
            props: {
                className: 'leading-relaxed',
            },
        },
        ul: {
            component: 'ul',
            props: {
                className: 'list-disc pl-6 my-4',
            },
        },
        ol: {
            component: 'ol',
            props: {
                className: 'list-decimal pl-6 my-4',
            },
        },
        li: {
            component: 'li',
            props: {
                className: 'mb-1',
            },
        },
        blockquote: {
            component: 'blockquote',
            props: {
                className: 'pl-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 my-4',
            },
        },
        hr: {
            component: 'hr',
            props: {
                className: 'my-6 border-t border-gray-200 dark:border-gray-700',
            },
        },
    };

    const markdownOutput = useMemo(
        () =>
            compiler(preparedMarkdown, {
                overrides,
                forceBlock: true,
            }),
        [preparedMarkdown, overrides]
    );

    return <div className="prose dark:prose-invert max-w-none">{markdownOutput}</div>;
}
