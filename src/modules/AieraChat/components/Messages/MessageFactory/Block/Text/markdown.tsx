import React, { useMemo } from 'react';
import { compiler, MarkdownToJSX } from 'markdown-to-jsx';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Citation';
import { SearchableText } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/SearchableText';
import './markdown.css';

interface MarkdownRendererProps {
    citations?: CitationType[];
    content: string;
}

// Function to handle unclosed markdown elements in partial content
const preparePartialMarkdown = (content: string, citations?: CitationType[]): string => {
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

    // Convert inline citations to CustomCitation component using markers
    // Important: process citations before links because they both use square-bracket notation
    if (citations && citations.length > 0) {
        citations.forEach((c) => {
            // Convert to markdown-to-jsx compatible format
            const attrString = Object.entries(c)
                .map(([key, value]) => (typeof value === 'object' ? null : `${key}="${value}"`))
                .filter((c) => c) // filter out nulls
                .join(' ');
            const citation = `<citation ${attrString} />`;
            text = text.replace(new RegExp(c.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), citation);
        });
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

// Helper component that applies SearchableText to string children while preserving other React nodes
const SearchableWrapper = ({ children }: { children: React.ReactNode }) => {
    const processChildren = (node: React.ReactNode): React.ReactNode => {
        if (typeof node === 'string') {
            return <SearchableText text={node} />;
        }
        if (React.isValidElement(node)) {
            return node;
        }
        if (Array.isArray(node)) {
            return node.map((child, index) => (
                <React.Fragment key={index}>{processChildren(child as React.ReactNode)}</React.Fragment>
            ));
        }
        return node;
    };

    return <>{processChildren(children)}</>;
};

// Custom Citation component that parses citation tags
const CustomCitation = ({ author, contentId, date, marker, source, sourceId, text, url }: CitationType) => {
    const citation: CitationType = {
        author,
        contentId,
        date,
        marker,
        source,
        sourceId,
        text,
        url,
    };
    return <Citation citation={citation} />;
};

// Custom component overrides for markdown-to-jsx
const CustomCode = ({ children }: CustomComponentProps) => {
    return (
        <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-sm">
            <SearchableWrapper>{children}</SearchableWrapper>
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
            <SearchableWrapper>{children}</SearchableWrapper>
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

const CustomTableCell = ({ children }: CustomComponentProps) => (
    <td className="px-3 py-2 text-sm">
        <SearchableWrapper>{children}</SearchableWrapper>
    </td>
);

const CustomTableHeaderCell = ({ children }: CustomComponentProps) => (
    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <SearchableWrapper>{children}</SearchableWrapper>
    </th>
);

// Custom components for text content
const CustomParagraph = ({ children, ...props }: CustomComponentProps) => (
    <p {...props}>
        <SearchableWrapper>{children}</SearchableWrapper>
    </p>
);

const CustomHeading = ({ level, children, ...props }: CustomComponentProps & { level: 1 | 2 | 3 | 4 }) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return React.createElement(HeadingTag, props, <SearchableWrapper>{children}</SearchableWrapper>);
};

const CustomListItem = ({ children, ...props }: CustomComponentProps) => (
    <li {...props}>
        <SearchableWrapper>{children}</SearchableWrapper>
    </li>
);

const CustomBlockquote = ({ children, ...props }: CustomComponentProps) => (
    <blockquote {...props}>
        <SearchableWrapper>{children}</SearchableWrapper>
    </blockquote>
);

export function MarkdownRenderer({ citations, content }: MarkdownRendererProps) {
    const preparedMarkdown = useMemo(() => preparePartialMarkdown(content, citations), [citations, content]);

    // Define overrides for markdown-to-jsx with proper types
    const overrides: MarkdownToJSX.Options['overrides'] = {
        citation: CustomCitation,
        code: CustomCode,
        pre: CustomPre,
        a: CustomLink,
        table: CustomTable,
        thead: CustomTableHead,
        tbody: CustomTableBody,
        td: CustomTableCell,
        th: CustomTableHeaderCell,
        h1: {
            component: CustomHeading,
            props: {
                level: 1,
                className: 'text-2xl font-bold pt-4 pb-4 border-b border-gray-200 dark:border-gray-700',
            },
        },
        h2: {
            component: CustomHeading,
            props: {
                level: 2,
                className: 'text-xl font-bold pt-4 pb-3 border-b border-gray-200 dark:border-gray-700',
            },
        },
        h3: {
            component: CustomHeading,
            props: {
                level: 3,
                className: 'text-lg font-bold pt-3 pb-2',
            },
        },
        h4: {
            component: CustomHeading,
            props: {
                level: 4,
                className: 'text-base font-bold pt-3 pb-2',
            },
        },
        p: {
            component: CustomParagraph,
            props: {
                className: 'leading-relaxed pb-2.5',
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
            component: CustomListItem,
            props: {
                className: 'mb-1',
            },
        },
        blockquote: {
            component: CustomBlockquote,
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
