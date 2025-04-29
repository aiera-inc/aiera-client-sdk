import React from 'react';
import { CitableContent } from '..';
import { Citation } from '../../Citation';
import { SearchableText } from '../../SearchableText';

interface MarkdownContentProps {
    content: CitableContent;
    className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
    // Render markdown-styled content using Tailwind classes
    const processedContent: React.ReactNode[] = [];
    let key = 0;

    content.forEach((c) => {
        if (typeof c === 'string') {
            // Split the content by lines to process each line
            const lines = c.split('\n');

            lines.forEach((line) => {
                // Process headings
                if (line.startsWith('# ')) {
                    processedContent.push(
                        <h1 key={key++} className="text-2xl font-bold mt-4 mb-2">
                            <SearchableText text={line.substring(2)} />
                        </h1>
                    );
                } else if (line.startsWith('## ')) {
                    processedContent.push(
                        <h2 key={key++} className="text-xl font-bold mt-3 mb-2">
                            <SearchableText text={line.substring(3)} />
                        </h2>
                    );
                } else if (line.startsWith('### ')) {
                    processedContent.push(
                        <h3 key={key++} className="text-lg font-bold mt-2 mb-1">
                            <SearchableText text={line.substring(4)} />
                        </h3>
                    );
                }
                // Handle bold text with regex
                else if (line.includes('**')) {
                    // Split by bold markers
                    const segments = line.split(/(\*\*.*?\*\*)/g);
                    processedContent.push(
                        <p key={key++} className="my-1">
                            {segments.map((segment, i) => {
                                if (segment.startsWith('**') && segment.endsWith('**')) {
                                    // Bold text
                                    return (
                                        <strong key={i} className="font-bold">
                                            <SearchableText text={segment.substring(2, segment.length - 2)} />
                                        </strong>
                                    );
                                } else {
                                    // Regular text
                                    return <SearchableText key={i} text={segment} />;
                                }
                            })}
                        </p>
                    );
                }
                // Handle italic text
                else if (line.includes('*')) {
                    // Split by italic markers
                    const segments = line.split(/(\*.*?\*)/g);
                    processedContent.push(
                        <p key={key++} className="my-1">
                            {segments.map((segment, i) => {
                                if (segment.startsWith('*') && segment.endsWith('*')) {
                                    // Italic text
                                    return (
                                        <em key={i} className="italic">
                                            <SearchableText text={segment.substring(1, segment.length - 1)} />
                                        </em>
                                    );
                                } else {
                                    // Regular text
                                    return <SearchableText key={i} text={segment} />;
                                }
                            })}
                        </p>
                    );
                }
                // Handle code blocks/inline code
                else if (line.includes('`')) {
                    // Split by code markers
                    const segments = line.split(/(`.*?`)/g);
                    processedContent.push(
                        <p key={key++} className="my-1">
                            {segments.map((segment, i) => {
                                if (segment.startsWith('`') && segment.endsWith('`')) {
                                    // Code text
                                    return (
                                        <code key={i} className="font-mono bg-gray-100 text-sm px-1 rounded">
                                            <SearchableText text={segment.substring(1, segment.length - 1)} />
                                        </code>
                                    );
                                } else {
                                    // Regular text
                                    return <SearchableText key={i} text={segment} />;
                                }
                            })}
                        </p>
                    );
                }
                // Handle links [text](url)
                else if (line.match(/\[.*?\]\(.*?\)/)) {
                    // Split by link markers
                    const segments = line.split(/(\[.*?\]\(.*?\))/g);
                    processedContent.push(
                        <p key={key++} className="my-1">
                            {segments.map((segment, i) => {
                                const linkMatch = segment.match(/\[(.*?)\]\((.*?)\)/);
                                if (linkMatch) {
                                    const [_, text, url] = linkMatch;
                                    return (
                                        <a key={i} href={url} className="text-blue-600 hover:underline">
                                            <SearchableText text={text ?? 'link'} />
                                        </a>
                                    );
                                } else {
                                    return <SearchableText key={i} text={segment} />;
                                }
                            })}
                        </p>
                    );
                } else if (line.trim()) {
                    // Default paragraph text
                    processedContent.push(
                        <p key={key++} className="my-1">
                            <SearchableText text={line} />
                        </p>
                    );
                } else {
                    // Empty line creates spacing
                    processedContent.push(<div key={key++} className="h-2" />);
                }
            });
        } else {
            // Handle citation objects
            processedContent.push(<Citation citation={c} key={key++} />);
        }
    });

    return <div className={className}>{processedContent}</div>;
}
