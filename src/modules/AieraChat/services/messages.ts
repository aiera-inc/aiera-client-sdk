import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { RequestPolicy, useClient, useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChartBlock,
    ChartBlockMeta,
    ChartData,
    ChartType as ChartTypeEnum,
    ChatMessagePrompt as RawChatMessagePrompt,
    ChatMessageResponse as RawChatMessageResponse,
    ChatMessageSourceConfirmation as RawChatMessageSourceConfirmation,
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSessionWithMessagesQuery,
    ChatSessionWithMessagesQueryVariables,
    ChatSource,
    CitableContent as RawCitableContent,
    ContentBlock as RawContentBlock,
    CreateChatMessagePromptMutation,
    CreateChatMessagePromptMutationVariables,
    ImageBlock,
    ListBlock,
    QuoteBlock,
    TableBlock,
    TableCellMeta,
    TextBlock,
} from '@aiera/client-sdk/types/generated';
import {
    BlockType,
    CitableContent,
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
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLING_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REFETCH_COUNT = Math.floor(MAX_POLLING_DURATION / POLLING_INTERVAL); // Maximum number of refetches

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

interface UseChatSessionOptions {
    enablePolling?: boolean;
    requestPolicy?: RequestPolicy;
    sessionId?: string;
}

interface UseChatSessionReturn {
    createChatMessagePrompt: ({
        content,
        sessionId,
    }: {
        content: string;
        sessionId: string;
    }) => Promise<ChatMessagePrompt | null>;
    error: string | null;
    isLoading: boolean;
    messages: ChatMessage[];
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

export function normalizeTextContent(rawContent: RawCitableContent[]): CitableContent {
    return rawContent.map((c: RawCitableContent) => {
        if (!c) return '';

        if (c.citation) {
            return {
                author: c.citation.author || '',
                date: (c.citation.date as string) || '',
                id: c.citation.contentId,
                source: c.citation.source?.name || '',
                text: c.citation.quote || '',
                url: c.citation.url || '',
            };
        } else {
            return c.value || '';
        }
    });
}

/**
 * Normalize citable content with better error handling
 */
export function normalizeCitableContent(rawContent: RawCitableContent[][]): CitableContent[] {
    // Handle no content case
    if (!rawContent || !Array.isArray(rawContent) || rawContent.length === 0) {
        return [];
    }

    try {
        return rawContent.map(normalizeTextContent);
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
                const meta = block.chartMeta;
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
                const meta = block.imageMeta;
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
                const meta = block.listMeta;
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
                const meta = block.quoteMeta;
                return {
                    content: block.quoteContent || '',
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
                const meta = block.tableMeta;
                return {
                    headers: block.headers,
                    id: blockId,
                    meta: {
                        columnAlignment: meta.columnAlignment,
                        columnMeta: normalizeTableMeta(meta.columnMeta),
                    },
                    rows: block.rows.map(normalizeCitableContent),
                    type: BlockType.TABLE,
                };
            }

            case 'TextBlock': {
                const block = rawBlock as TextBlock;
                const meta = block.textMeta;
                return {
                    content: normalizeTextContent(block.textContent),
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
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useChatSession = ({
    enablePolling = false,
    requestPolicy = 'cache-and-network',
    sessionId,
}: UseChatSessionOptions): UseChatSessionReturn => {
    const { chatId, chatStatus, chatTitle, onSetStatus, onSetTitle } = useChatStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get urql client for manual cache updates
    const client = useClient();

    // Add state for tracking refetch count and whether to stop polling
    const [_refetchCount, setRefetchCount] = useState<number>(0);
    const [shouldStopPolling, setShouldStopPolling] = useState<boolean>(false);

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

    // Either use the passed sessionId (for initial render) or chatId from store (for updates)
    const effectiveSessionId = sessionId || chatId || '';

    // Use the query with separate message fields
    // The empty string default for sessionId is just to appease TS, the query won't actually fire
    const messagesQuery = useQuery<ChatSessionWithMessagesQuery, ChatSessionWithMessagesQueryVariables>({
        query: CHAT_SESSION_QUERY,
        pause: !effectiveSessionId || effectiveSessionId === 'new',
        requestPolicy,
        variables: {
            filter: { includeMessages: true, sessionId: effectiveSessionId },
        },
    });

    /**
     * Helper function to refresh chat sessions in the GraphQL cache
     * We mainly need this to update the titles in the Menu panel list
     */
    const refreshChatSessions = useCallback(() => {
        try {
            // Refetch the ChatSessions query to update the titles in the list
            const chatSessionsQuery = client
                .query<ChatSessionsQuery, ChatSessionsQueryVariables>(
                    gql`
                        query ChatSessions {
                            chatSessions {
                                id
                                createdAt
                                sources {
                                    confirmed
                                    name
                                    sourceId
                                    type
                                }
                                status
                                title
                                titleStatus
                                updatedAt
                                userId
                            }
                        }
                    `
                )
                .toPromise();
            chatSessionsQuery
                .then((result) => result.data)
                .catch((err: Error) => console.log(`Error refetching ChatSessions query: ${err.message}`));
        } catch (err) {
            console.error('Error updating session title in cache:', err);
        }
        return null;
    }, [client]);

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

                // Update chat status in store if it changes
                if (chatStatus !== chatSession.status) {
                    onSetStatus(chatSession.status);
                }

                // Update chat title in store if the session got a generated title
                if (!chatSession.titleStatus && chatSession.title && chatSession.title !== chatTitle) {
                    onSetTitle(chatSession.title);
                    refreshChatSessions();
                }

                const normalizedMessages: ChatMessage[] = [];
                let lastPromptValue = ''; // Track the last prompt value

                // Process prompt messages
                if (chatSession.promptMessages) {
                    (chatSession.promptMessages as RawChatMessagePrompt[]).forEach((msg) => {
                        if (!msg) return;

                        const promptValue = msg.content || '';
                        lastPromptValue = promptValue; // Update the last prompt value

                        normalizedMessages.push({
                            id: msg.id,
                            ordinalId: msg.ordinalId,
                            timestamp: msg.createdAt,
                            status: ChatMessageStatus.COMPLETED,
                            type: ChatMessageType.PROMPT,
                            prompt: promptValue,
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
                            prompt: lastPromptValue, // Use the last prompt value
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
                            prompt: lastPromptValue, // Use the last prompt value
                            confirmed: false,
                            sources: normalizeSources(msg.sources),
                        });
                    });
                }

                // Sort all messages by timestamp
                normalizedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                // Additional pass to ensure prompt values are historically accurate
                // This handles the case where messages might not be in chronological order in the API response
                let currentPromptValue = '';
                const finalNormalizedMessages = normalizedMessages.map((message) => {
                    if (message.type === ChatMessageType.PROMPT) {
                        currentPromptValue = message.prompt;
                        return message;
                    } else {
                        return {
                            ...message,
                            prompt: currentPromptValue,
                        };
                    }
                });

                console.log(`Successfully normalized ${finalNormalizedMessages.length} messages`);
                setMessages(finalNormalizedMessages);

                // Clear error state
                if (error) setError(null);
            } catch (err) {
                console.error('Error processing messages data:', err);
                setError('Error processing messages data');
                // If polling is enabled, stop it when an error occurs
                if (enablePolling) {
                    console.log('Stopping polling due to data normalization error');
                    setShouldStopPolling(true);
                }
            }
        }
        // Handle error state
        else if (messagesQuery.status === 'error') {
            console.error('Query error:', messagesQuery.error);
            setError(messagesQuery.error.message);
            // If polling is enabled, stop it when an error occurs
            if (enablePolling) {
                console.log('Stopping polling due to query error');
                setShouldStopPolling(true);
            }
        }
    }, [
        chatStatus,
        chatTitle,
        enablePolling,
        error,
        isLoading,
        messagesQuery,
        onSetStatus,
        onSetTitle,
        setError,
        setMessages,
    ]);

    // Reset messages and polling when the sessionId changes
    useEffect(() => {
        if (sessionId && sessionId !== 'new') {
            setMessages([]);
            setRefetchCount(0);
            setShouldStopPolling(false);
        }
    }, [sessionId]);

    // Setup polling with max refetch limit
    useEffect(() => {
        if (!enablePolling) {
            // Reset refetch count and polling
            setRefetchCount(0);
            setShouldStopPolling(false);
            return;
        }

        console.log(`Setting up polling interval (${POLLING_INTERVAL}ms) with max refetch count: ${MAX_REFETCH_COUNT}`);
        const intervalId = setInterval(() => {
            if (sessionId && sessionId !== 'new' && !shouldStopPolling) {
                messagesQuery.refetch();
                // Increment refetch count
                setRefetchCount((prevCount) => {
                    const newCount = prevCount + 1;
                    console.log(`Refetch count: ${newCount}/${MAX_REFETCH_COUNT}`);
                    // Check if we've reached the limit
                    if (newCount >= MAX_REFETCH_COUNT) {
                        console.log(`Reached max refetch count (${MAX_REFETCH_COUNT}). Stopping polling.`);
                        setShouldStopPolling(true);
                    }

                    return newCount;
                });
            }
        }, POLLING_INTERVAL);

        return () => {
            console.log('Clearing polling interval');
            clearInterval(intervalId);
        };
    }, [enablePolling, messagesQuery, sessionId, shouldStopPolling]);

    const refresh = useCallback(() => {
        console.log('Refreshing chat messages and resetting polling limits...');
        // Reset refetch count and polling state when manually refreshing
        setRefetchCount(0);
        setShouldStopPolling(false);
        messagesQuery.refetch();
        console.log(
            `Polling reset. Will continue for up to ${MAX_REFETCH_COUNT} more refetches (${
                MAX_POLLING_DURATION / 1000 / 60 / 60
            } hours).`
        );
    }, [messagesQuery, MAX_REFETCH_COUNT, MAX_POLLING_DURATION]);

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        refresh,
    };
};
