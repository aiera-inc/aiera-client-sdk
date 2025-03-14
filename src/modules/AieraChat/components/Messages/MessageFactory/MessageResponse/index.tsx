import React, { useCallback } from 'react';
import { ListItemContent } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/List';
import { copyToClipboard } from '@aiera/client-sdk/lib/utils';
import { ChatMessageResponse, ChatMessageStatus } from '../../../../services/messages';
import { Block, BlockType, CitableContent, Citation, ContentBlock } from '../Block';
import { Loading } from '../Loading';
import { Footer } from './Footer';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessageResponse }) => {
    const handleCopy = useCallback(() => {
        if (!data.blocks || data.blocks.length === 0) return;

        // Define a type that encompasses all possible content formats
        type TextExtractable = string | Citation | CitableContent | ListItemContent | ContentBlock | unknown;

        // Function to extract text from any content type that might contain text
        const extractTextContent = (content: TextExtractable): string => {
            if (typeof content === 'string') {
                return content;
            } else if (content && typeof content === 'object') {
                if (Array.isArray(content)) {
                    // Handle arrays by mapping and joining results
                    return content.map((item: TextExtractable) => extractTextContent(item)).join('');
                } else {
                    // Type guards to check for specific structures
                    const contentObj = content as Record<string, any>;

                    if ('text' in contentObj) {
                        return contentObj.text as string;
                    } else if ('primary' in contentObj) {
                        const primary = extractTextContent(contentObj.primary);
                        const secondary = contentObj.secondary ? ' - ' + extractTextContent(contentObj.secondary) : '';
                        return primary + secondary;
                    } else if ('content' in contentObj && contentObj.type === BlockType.TEXT) {
                        return extractTextContent(contentObj.content);
                    } else if ('content' in contentObj && typeof contentObj.content === 'string') {
                        return contentObj.content;
                    }
                }
            }
            return '';
        };

        // Function to process a list item, whether it's a string, object, or nested structure
        const processListItem = (item: TextExtractable, prefix = ''): string => {
            if (!item) return prefix + '';

            // If it's a string, just return it with prefix
            if (typeof item === 'string') {
                return prefix + item;
            }

            // For objects with a type property (ContentBlocks)
            if (typeof item === 'object') {
                const itemObj = item as ListItemContent;

                if ('type' in itemObj) {
                    switch (itemObj.type) {
                        case BlockType.TEXT:
                            return prefix + extractTextContent(itemObj.content);
                        case BlockType.LIST:
                            // For nested lists
                            return prefix + processBlock(itemObj).trim();
                        default:
                            return prefix + `[${itemObj.type} content]`;
                    }
                }
                // If it's a list item with primary/secondary structure
                else if ('primary' in itemObj) {
                    return prefix + extractTextContent(itemObj);
                }

                // Fallback for unknown structures - try to stringify or return placeholder
                try {
                    return prefix + JSON.stringify(itemObj);
                } catch (e) {
                    return prefix + '[Complex content]';
                }
            }

            // Final fallback
            return prefix + String(item);
        };

        // Process an entire block based on its type
        const processBlock = (block: ContentBlock): string => {
            if (!block || !block.type) return '';

            switch (block.type) {
                case BlockType.TEXT: {
                    return extractTextContent(block.content);
                }

                case BlockType.QUOTE: {
                    return `"${block.content}" - ${block.meta.author}, ${block.meta.source}, ${block.meta.date}`;
                }

                case BlockType.LIST: {
                    if (!block.items || !Array.isArray(block.items)) return '[Empty list]';

                    return block.items
                        .map((item, index) => {
                            const prefix = block.meta.style === 'ordered' ? `${index + 1}. ` : '• ';
                            return processListItem(item, prefix);
                        })
                        .join('\n');
                }

                case BlockType.TABLE: {
                    if (!block.headers || !block.rows) return '[Empty table]';

                    const headerRow = block.headers.join('\t');
                    const tableRows = block.rows.map((row) => row.map((cell) => extractTextContent(cell)).join('\t'));
                    return [headerRow, ...tableRows].join('\n');
                }

                case BlockType.IMAGE: {
                    return `[Image: ${block.meta.title || 'Untitled'}${
                        block.meta.source ? ` - Source: ${block.meta.source}` : ''
                    }]`;
                }

                case BlockType.CHART: {
                    const chartType = block.meta.chartType || 'chart';
                    const chartTitle = block.meta.title || 'Untitled Chart';
                    return `[${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${chartTitle}]`;
                }

                default:
                    return '[Unknown block type]';
            }
        };

        // Process all blocks
        const contentParts = data.blocks.map((block) => processBlock(block)).filter((part) => part.trim() !== '');
        const fullContent = contentParts.join('\n\n');

        if (fullContent) {
            copyToClipboard(fullContent)
                .then(() => {
                    console.log('Full message content copied successfully');
                })
                .catch((error: Error) => {
                    console.error('Failed to copy content:', error.message);
                });
        }
    }, [data]);

    return data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="flex flex-col px-4 pb-2">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {data.status !== ChatMessageStatus.STREAMING && (
                <Footer data={data} onCopy={handleCopy} onReRun={onReRun} />
            )}
        </div>
    );
};
