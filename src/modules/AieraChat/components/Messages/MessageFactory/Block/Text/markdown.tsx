import React, { useMemo } from 'react';
import { compiler, MarkdownToJSX } from 'markdown-to-jsx';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Citation';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import './markdown.css';

interface MarkdownRendererProps {
    citations?: CitationType[];
    content: string;
}

// Function to handle unclosed markdown elements in partial content
const preparePartialMarkdown = (content: string): string => {
    // First, convert literal \n escape sequences to actual newlines
    let text = content.replace(/\\n/g, '\n');

    // Ensure proper paragraph breaks before bold headers by converting single newlines
    // before ** markers to double newlines
    text = text.replace(/\n(\*\*)/g, '\n\n$1');

    // Replace citations FIRST to avoid underscore conflicts
    text = text.replace(/\[c(\d+)\]/g, '<citation marker="c$1" />');
    text = text.replace(/\[([a-zA-Z_]+)_([a-zA-Z0-9_-]+)\]/g, '<citation marker="$1_$2" />');

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
        // Only count underscores that look like emphasis formatting (surrounded by letters)
        if (text[i] === '_' && (i === 0 || text[i - 1] !== '\\')) {
            const prevChar = i > 0 ? text[i - 1] || '' : '';
            const nextChar = i < text.length - 1 ? text[i + 1] || '' : '';

            // Only count if both sides are letters (typical emphasis pattern like _word_)
            const prevIsLetter = /[a-zA-Z]/.test(prevChar);
            const nextIsLetter = /[a-zA-Z]/.test(nextChar);

            if (prevIsLetter && nextIsLetter) {
                underscoreCount++;
            }
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

// Custom Citation component that uses the global store for consistent markers
const CustomCitation = ({ marker, citations }: { marker: string; citations: CitationType[] }) => {
    // Short-circuit if there are no citations or marker set
    if (!citations || citations.length === 0 || !marker) return null;

    const { getCitationMarker } = useChatStore();

    // Find the citation with the matching marker - handle both old [c123] and new [sourceType_sourceId] formats
    let citation: CitationType | undefined;

    if (marker.startsWith('c') && !marker.includes('company')) {
        // Old format: marker="[c123]"
        const citIndex = citations?.findIndex((cit: CitationType) => cit.marker === `[${marker}]`);
        citation = citations[citIndex];
    } else {
        // New format: marker="[transcript_123]"
        const [sourceType, contentId] = marker.split('_');
        citation = citations?.find(
            (cit: CitationType) => cit.sourceType === sourceType && String(cit.contentId) === contentId
        );
    }

    if (!citation) return null;

    // Get the global marker for this citation from the store
    const globalMarker = getCitationMarker(citation);
    if (globalMarker) {
        return <Citation citation={{ ...citation, marker: globalMarker }} />;
    }

    return null;
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
        <div className="overflow-x-auto my-2">
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

const CustomTableCell = ({ children }: CustomComponentProps) => <td className="pr-5 py-2 text-base">{children}</td>;

const CustomTableHeaderCell = ({ children }: CustomComponentProps) => (
    <th className="pr-5 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
    </th>
);

export function MarkdownRenderer({ citations, content }: MarkdownRendererProps) {
    const preparedMarkdown = useMemo(() => preparePartialMarkdown(content), [content]);

    // Memoize overrides to prevent unnecessary markdown recompilation
    const overrides: MarkdownToJSX.Options['overrides'] = useMemo(
        () => ({
            citation: {
                component: CustomCitation,
                props: { citations },
            },
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
                    className: 'text-2xl font-bold pt-4 pb-2',
                },
            },
            h2: {
                component: 'h2',
                props: {
                    className: 'text-xl font-bold py-2',
                },
            },
            h3: {
                component: 'h3',
                props: {
                    className: 'text-lg font-bold py-1.5',
                },
            },
            h4: {
                component: 'h4',
                props: {
                    className: 'text-base font-bold py-1',
                },
            },
            p: {
                component: 'p',
                props: {
                    className: 'leading-relaxed pb-2.5',
                },
            },
            ul: {
                component: 'ul',
                props: {
                    className: 'list-disc pl-6 mb-4',
                },
            },
            ol: {
                component: 'ol',
                props: {
                    className: 'list-decimal pl-6 mb-4',
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
                    className:
                        'pl-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 my-4',
                },
            },
            hr: {
                component: 'hr',
                props: {
                    className: 'my-4 border-t border-gray-200 dark:border-gray-700',
                },
            },
        }),
        [citations]
    );

    const markdownOutput = useMemo(
        () =>
            compiler(preparedMarkdown, {
                overrides,
                forceBlock: true,
            }),
        [preparedMarkdown, overrides]
    );

    return <div className="aiera-chat-text max-w-none">{markdownOutput}</div>;
}
