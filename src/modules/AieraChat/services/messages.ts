import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatMessagePrompt as RawChatMessagePrompt,
    ChatMessageResponse as RawChatMessageResponse,
    ChatMessageSourceConfirmation as RawChatMessageSourceConfirmation,
    ChatSessionWithMessagesQuery,
    ChatSessionWithMessagesQueryVariables,
    CreateChatMessagePromptMutation,
    CreateChatMessagePromptMutationVariables,
    ChartBlock,
    ChartBlockMeta,
    ChartData,
    ChartType as ChartTypeEnum,
    ChatSource,
    CitableContent as RawCitableContent,
    ContentBlock as RawContentBlock,
    ImageBlock,
    ImageBlockMeta,
    ListBlock,
    ListBlockMeta,
    QuoteBlock,
    QuoteBlockMeta,
    TableBlock,
    TableBlockMeta,
    TableCellMeta,
    TextBlock,
    TextBlockMeta,
} from '@aiera/client-sdk/types/generated';
import {
    BlockType,
    CitableContent,
    Citation,
    ContentBlock,
} from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import {
    ChartMeta,
    ChartMetaBase,
    ChartType,
} from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart';
import { CellMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Table';
import { CHAT_SESSION_QUERY, CREATE_CHAT_MESSAGE_MUTATION } from '@aiera/client-sdk/modules/AieraChat/services/graphql';
import { AreaChartMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Area';
import { BarChartMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Bar';
import { LineChartMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Line';
import { PieChartMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Pie';
import { ScatterChartMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Scatter';
import { TreeMapMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart/Tree';

const POLLING_INTERVAL = 3000; // 3 seconds

export enum ChatMessageType {
    PROMPT = 'prompt',
    SOURCES = 'sources',
    RESPONSE = 'response',
}

interface ChatMessageSource {
    targetId: string;
    targetTitle: string;
    targetType: string;
}

export enum ChatMessageStatus {
    // Initial states
    QUEUED = 'queued', // Message is queued for processing
    PENDING = 'pending', // Message is being processed

    // Streaming states
    STREAMING = 'streaming', // Message is currently streaming its response

    // Completion states
    COMPLETED = 'completed', // Message completed successfully
    STOPPED = 'stopped', // Message was manually stopped by user

    // Error states
    FAILED = 'failed', // Message processing failed
    RATE_LIMITED = 'rateLimited', // Message was blocked due to rate limiting
}

export interface ChatMessageBase {
    id: string;
    ordinalId?: string | null;
    timestamp: string;
    status: ChatMessageStatus;
    prompt: string;
    type: ChatMessageType;
}

export interface ChatMessageResponse extends ChatMessageBase {
    type: ChatMessageType.RESPONSE;
    blocks: ContentBlock[];
    sources: ChatMessageSource[];
}

export interface ChatMessagePrompt extends ChatMessageBase {
    type: ChatMessageType.PROMPT;
}

export interface ChatMessageSources extends ChatMessageBase {
    type: ChatMessageType.SOURCES;
    confirmed: boolean;
    sources: ChatMessageSource[];
}

export type ChatMessage = ChatMessageResponse | ChatMessagePrompt | ChatMessageSources;

interface UseChatMessagesReturn {
    createChatMessagePrompt: ({
        content,
        sessionId,
    }: {
        content: string;
        sessionId: string;
    }) => Promise<ChatMessagePrompt | null>;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Utility function to check if a value is not null or undefined
 */
function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

/**
 * Generate a unique ID for blocks and citations that don't have one
 */
function generateId(prefix = 'gen'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Normalize ChartBlock metadata with robust error handling
 */
export function normalizeChartMeta(meta: ChartBlockMeta | null | undefined): ChartMeta {
    const defaultMeta = { chartType: ChartType.LINE } as LineChartMeta; // default to line chart
    if (!meta) {
        // Return default chart meta for missing data
        return defaultMeta;
    }

    try {
        const properties = (meta.properties || {}) as ChartMetaBase;
        const baseMeta = {
            title: typeof properties?.title === 'string' ? properties.title : undefined,
            xAxis: typeof properties?.xAxis === 'string' ? properties.xAxis : undefined,
            yAxis: typeof properties?.yAxis === 'string' ? properties.yAxis : undefined,
        };

        switch (meta.chartType) {
            case ChartTypeEnum.Area:
                return {
                    ...baseMeta,
                    chartType: ChartType.AREA,
                    series: ((properties as AreaChartMeta).series ?? []).map((s) => ({
                        key: s.key || '',
                        label: s.label || '',
                        color: s.color,
                    })),
                    stackedSeries: (properties as AreaChartMeta).stackedSeries,
                };

            case ChartTypeEnum.Bar:
                return {
                    ...baseMeta,
                    chartType: ChartType.BAR,
                    series: ((properties as BarChartMeta).series ?? []).map((s) => ({
                        key: s.key || '',
                        label: s.label || '',
                        color: s.color,
                    })),
                    stackedBars: (properties as BarChartMeta).stackedBars,
                };

            case ChartTypeEnum.Line:
                return {
                    ...baseMeta,
                    chartType: ChartType.LINE,
                    series: ((properties as LineChartMeta).series ?? []).map((s) => ({
                        key: s.key || '',
                        label: s.label || '',
                        color: s.color,
                    })),
                };

            case ChartTypeEnum.Pie:
                return {
                    ...baseMeta,
                    chartType: ChartType.PIE,
                    colors: (properties as PieChartMeta).colors,
                    nameKey: (properties as PieChartMeta).nameKey || '',
                    valueKey: (properties as PieChartMeta).valueKey || '',
                };

            case ChartTypeEnum.Scatter:
                return {
                    ...baseMeta,
                    chartType: ChartType.SCATTER,
                    colors: (properties as ScatterChartMeta).colors,
                    nameKey: (properties as ScatterChartMeta).nameKey || '',
                    sizeKey: (properties as ScatterChartMeta).sizeKey || '',
                    xKey: (properties as ScatterChartMeta).xKey || '',
                    yKey: (properties as ScatterChartMeta).yKey || '',
                };

            case ChartTypeEnum.Treemap:
                return {
                    ...baseMeta,
                    chartType: ChartType.TREEMAP,
                    colors: (properties as TreeMapMeta).colors,
                    nameKey: (properties as TreeMapMeta).nameKey || '',
                    valueKey: (properties as TreeMapMeta).valueKey || '',
                };

            default:
                return defaultMeta;
        }
    } catch (error) {
        console.error('Error normalizing chart meta:', error);
        return defaultMeta;
    }
}

/**
 * Normalize citable content with better error handling
 */
export function normalizeCitableContent(rawContent: RawCitableContent[]): CitableContent {
    // Handle no content case
    if (!rawContent || !Array.isArray(rawContent) || rawContent.length === 0) {
        return [];
    }

    try {
        return rawContent.map((content): string | Citation => {
            if (!content) return '';

            if (content.citation) {
                return {
                    author: content.citation.author || '',
                    date: (content.citation.date as string) || '',
                    id: generateId('citation'), // Generate an ID since it's not provided by the server
                    source: content.citation.source?.name || '',
                    text: content.citation.quote || '',
                    url: content.citation.url || '',
                };
            } else {
                return content.value || '';
            }
        }) as CitableContent;
    } catch (error) {
        console.error('Error normalizing citable content:', error);
        return [];
    }
}

/**
 * Normalize table cell metadata with better error handling
 */
export function normalizeTableCellMeta(rawMeta: TableCellMeta | null | undefined): CellMeta | undefined {
    if (!rawMeta) {
        return undefined;
    }

    try {
        return {
            ...(rawMeta.currency ? { currency: rawMeta.currency } : {}),
            ...(rawMeta.unit ? { unit: rawMeta.unit } : {}),
            ...(rawMeta.format ? { format: rawMeta.format.toLowerCase() as CellMeta['format'] } : {}),
            ...(rawMeta.decimals !== null && rawMeta.decimals !== undefined ? { decimals: rawMeta.decimals } : {}),
        };
    } catch (error) {
        console.error('Error normalizing table cell meta:', error);
        return undefined;
    }
}

/**
 * Normalize table metadata with better error handling
 */
export function normalizeTableMeta(rawColumnMeta: TableCellMeta[] | undefined | null): CellMeta[] | undefined {
    if (!rawColumnMeta || !Array.isArray(rawColumnMeta) || rawColumnMeta.length === 0) {
        return undefined;
    }

    try {
        // Filter out nulls and undefined values with type assertion
        const validRawMeta = rawColumnMeta.filter(isNonNullable);

        // If we have no valid metadata, return undefined
        if (validRawMeta.length === 0) {
            return undefined;
        }

        // Process each valid metadata item
        const normalizedMeta = validRawMeta.map((meta) => normalizeTableCellMeta(meta)).filter(isNonNullable);

        // Return undefined if we end up with an empty array
        return normalizedMeta.length > 0 ? normalizedMeta : undefined;
    } catch (error) {
        console.error('Error normalizing table meta:', error);
        return undefined;
    }
}

/**
 * Normalize chat message sources with error handling
 * Uses sourceId instead of id
 */
export function normalizeSources(
    sources: ChatSource[] | null | undefined
): { targetId: string; targetTitle: string; targetType: string }[] {
    if (!sources || !Array.isArray(sources)) {
        return [];
    }

    try {
        return sources.filter(isNonNullable).map((source) => ({
            targetId: source.sourceId || '', // Use sourceId instead of id
            targetTitle: source.name || '',
            targetType: source.type || '',
        }));
    } catch (error) {
        console.error('Error normalizing sources:', error);
        return [];
    }
}

/**
 * Comprehensive normalizer for content blocks with better error handling
 * Handles renamed fields and generates IDs when missing
 */
export function normalizeContentBlock(rawBlock: RawContentBlock): ContentBlock | null {
    if (!rawBlock) {
        return null;
    }

    try {
        const blockType = rawBlock.__typename || 'unknown';
        // Generate a block ID since server no longer provides one
        const blockId = generateId(`block-${blockType}`);

        switch (blockType) {
            case 'ChartBlock': {
                const block = rawBlock as ChartBlock;
                const meta = block.chartMeta as ChartBlockMeta;
                const rawData = block.data || [];
                return {
                    data: rawData.map((d: ChartData) => ({
                        name: d.name || '',
                        value: d.value || 0,
                        ...((d.properties as object) || {}),
                    })),
                    id: blockId,
                    meta: normalizeChartMeta(meta),
                    type: BlockType.CHART,
                };
            }

            case 'ImageBlock': {
                const block = rawBlock as ImageBlock;
                const meta = block.imageMeta as ImageBlockMeta;
                return {
                    id: blockId,
                    meta: {
                        altText: meta.altText || '',
                        date: (meta.date as string) || '',
                        source: meta.source || '',
                        title: meta.title || '',
                    },
                    type: BlockType.IMAGE,
                    url: block.url || '',
                };
            }

            case 'ListBlock': {
                const block = rawBlock as ListBlock;
                const meta = block.listMeta as ListBlockMeta;
                return {
                    id: blockId,
                    items: block.items.map((item) => normalizeContentBlock(item)).filter(isNonNullable),
                    meta: {
                        style: meta.style || 'unordered',
                    },
                    type: BlockType.LIST,
                };
            }

            case 'QuoteBlock': {
                const block = rawBlock as QuoteBlock;
                const meta = block.quoteMeta as QuoteBlockMeta;
                return {
                    content: (block.quoteContent as string) || '',
                    id: blockId,
                    meta: {
                        author: meta.author || '',
                        date: (meta.date as string) || '',
                        source: meta.source || '',
                        url: meta.url || '',
                    },
                    type: BlockType.QUOTE,
                };
            }

            case 'TableBlock': {
                const block = rawBlock as TableBlock;
                const meta = block.tableMeta as TableBlockMeta;
                return {
                    headers: block.headers || [],
                    id: blockId,
                    meta: {
                        columnAlignment: meta.columnAlignment || [],
                        columnMeta: normalizeTableMeta(meta.columnMeta || []),
                    },
                    rows: block.rows.map(normalizeCitableContent),
                    type: BlockType.TABLE,
                };
            }

            case 'TextBlock': {
                const block = rawBlock as TextBlock;
                const meta = block.textMeta as TextBlockMeta;
                return {
                    content: normalizeCitableContent(block.textContent),
                    id: blockId,
                    meta: {
                        style: meta.style || 'paragraph',
                    },
                    type: BlockType.TEXT,
                };
            }

            default: {
                console.warn('Unhandled content block type:', blockType);
                // Return a basic text block as fallback
                return {
                    content: ['Unsupported content type: ' + blockType],
                    id: blockId,
                    meta: { style: 'paragraph' },
                    type: BlockType.TEXT,
                };
            }
        }
    } catch (error) {
        console.error('Error normalizing content block:', error, rawBlock);
        return null;
    }
}

/**
 * Enhanced hook for chat messages with better error handling and normalized data
 */
export const useChatMessages = (sessionId: string, enablePolling = false): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use the create message mutation with the optimized query
    const [_, createChatMessagePromptMutation] = useMutation<
        CreateChatMessagePromptMutation,
        CreateChatMessagePromptMutationVariables
    >(CREATE_CHAT_MESSAGE_MUTATION);

    // Enhanced create message function
    const createChatMessagePrompt = useCallback(
        ({ content, sessionId }: { content: string; sessionId: string }) => {
            // Don't send empty messages
            if (!content.trim()) {
                console.warn('Attempted to send empty message');
                return Promise.resolve(null);
            }

            console.log('Creating chat message prompt:', { content, sessionId });

            return createChatMessagePromptMutation({
                input: { content, sessionId },
            })
                .then((resp) => {
                    if (resp.error) {
                        throw new Error(resp.error.message || 'Error creating chat message');
                    }

                    const newMessage = resp.data?.createChatMessagePrompt?.chatMessage;
                    if (!newMessage) {
                        throw new Error('No chat message returned from mutation');
                    }

                    try {
                        // Create a normalized message structure
                        const normalizedMessage: ChatMessagePrompt = {
                            id: newMessage.id,
                            ordinalId: newMessage.ordinalId,
                            timestamp: newMessage.createdAt,
                            status: ChatMessageStatus.COMPLETED,
                            type: ChatMessageType.PROMPT,
                            prompt: newMessage.content || '',
                        };

                        console.log('Created new message:', normalizedMessage);

                        // Update local state immediately for better UX
                        setMessages((prevMessages) => [...prevMessages, normalizedMessage]);

                        return normalizedMessage;
                    } catch (normalizationError) {
                        console.error('Error normalizing new message:', normalizationError);
                        throw new Error('Error processing new message data');
                    }
                })
                .catch((error: Error) => {
                    const errorMessage = error.message || 'Error creating chat message prompt';
                    console.error(errorMessage, error);
                    setError(errorMessage);
                    return null;
                });
        },
        [createChatMessagePromptMutation]
    );

    // Use the query with separate message fields
    const messagesQuery = useQuery<ChatSessionWithMessagesQuery, ChatSessionWithMessagesQueryVariables>({
        query: CHAT_SESSION_QUERY,
        pause: !sessionId || sessionId === 'new',
        requestPolicy: 'cache-and-network',
        variables: {
            filter: { includeMessages: true, sessionId },
        },
    });

    // Process messages from the separate fields
    useEffect(() => {
        // Update loading state based on query status
        const queryLoading = messagesQuery.status === 'loading';
        if (queryLoading !== isLoading) {
            setIsLoading(queryLoading);
        }

        // Handle successful data fetches
        if (messagesQuery.status === 'success' && messagesQuery.data?.chatSession) {
            try {
                const chatSession = messagesQuery.data.chatSession;
                console.log('Processing chat session:', chatSession.id);

                const normalizedMessages: ChatMessage[] = [];

                // Process prompt messages
                if (chatSession.promptMessages) {
                    (chatSession.promptMessages as RawChatMessagePrompt[]).forEach((msg) => {
                        if (!msg) return;

                        normalizedMessages.push({
                            id: msg.id,
                            ordinalId: msg.ordinalId,
                            timestamp: msg.createdAt,
                            status: ChatMessageStatus.COMPLETED,
                            type: ChatMessageType.PROMPT,
                            prompt: msg.content || '',
                        });
                    });
                }

                // Process response messages
                if (chatSession.responseMessages) {
                    (chatSession.responseMessages as RawChatMessageResponse[]).forEach((msg) => {
                        if (!msg) return;

                        const blocks = Array.isArray(msg.blocks)
                            ? msg.blocks.map((block) => normalizeContentBlock(block)).filter(isNonNullable)
                            : [];

                        normalizedMessages.push({
                            id: msg.id,
                            ordinalId: msg.ordinalId,
                            timestamp: msg.createdAt,
                            status: ChatMessageStatus.COMPLETED,
                            type: ChatMessageType.RESPONSE,
                            prompt: '',
                            blocks,
                            sources: normalizeSources(msg.sources),
                        });
                    });
                }

                // Process source confirmation messages
                if (chatSession.sourceConfirmationMessages) {
                    (chatSession.sourceConfirmationMessages as RawChatMessageSourceConfirmation[]).forEach((msg) => {
                        if (!msg) return;

                        normalizedMessages.push({
                            id: msg.id,
                            ordinalId: msg.ordinalId,
                            timestamp: msg.createdAt,
                            status: ChatMessageStatus.COMPLETED,
                            type: ChatMessageType.SOURCES,
                            prompt: '',
                            confirmed: false,
                            sources: normalizeSources(msg.sources),
                        });
                    });
                }

                // Sort all messages by timestamp
                normalizedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                console.log(`Successfully normalized ${normalizedMessages.length} messages`);
                setMessages(normalizedMessages);

                // Clear error state
                if (error) setError(null);
            } catch (err) {
                console.error('Error processing messages data:', err);
                setError('Error processing messages data');
            }
        }
        // Handle error state
        else if (messagesQuery.status === 'error') {
            console.error('Query error:', messagesQuery.error);
            setError(messagesQuery.error.message);
        }
    }, [error, isLoading, messagesQuery]);

    // Setup polling
    useEffect(() => {
        if (!enablePolling) return;

        console.log(`Setting up polling interval (${POLLING_INTERVAL}ms)`);
        const intervalId = setInterval(() => {
            messagesQuery.refetch();
        }, POLLING_INTERVAL);

        return () => {
            console.log('Clearing polling interval');
            clearInterval(intervalId);
        };
    }, [enablePolling, messagesQuery]);

    const refresh = useCallback(() => {
        console.log('Refreshing chat messages...');
        messagesQuery.refetch();
    }, [messagesQuery]);

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        refresh,
    };
};
