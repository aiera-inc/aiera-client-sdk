import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChartBlock,
    ChartBlockMeta,
    ChartData,
    ChartType as ChartTypeEnum,
    ChatMessagePrompt as RawChatMessagePrompt,
    ChatMessageResponse as RawChatMessageResponse,
    ChatMessageType as ChatMessageTypeEnum,
    ChatSessionWithMessagesQuery,
    ChatSessionWithMessagesQueryVariables,
    ChatSource,
    CitableContent as RawCitableContent,
    ConfirmableChatSource,
    ContentBlock as BaseBlock,
    CreateChatMessagePromptMutation,
    CreateChatMessagePromptMutationVariables,
    ImageBlock,
    ImageBlockMeta,
    ListBlock,
    ListBlockMeta,
    QuoteBlock,
    QuoteBlockMeta,
    TableBlock,
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
    ChartSeries,
    ChartType,
} from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Chart';
import { CellMeta } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Table';

const POLLING_INTERVAL = 2000; // 2 seconds

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
type RawChatMessageSourceConfirmation = {
    __typename?: 'ChatMessageSourceConfirmation';
    createdAt: string;
    id: string;
    messageType: ChatMessageTypeEnum;
    ordinalId?: string;
    promptMessageId?: number;
    runnerVersion?: string;
    sessionId: string;
    confirmableSources: ConfirmableChatSource[]; // renamed to avoid conflict with sources field in query
    updatedAt: string;
    userId: number;
};

// Define interface for aliased blocks to match the GraphQL query structure
interface AliasedTextBlock extends Omit<TextBlock, 'content' | 'meta'> {
    textContent: TextBlock['content'];
    textMeta: {
        textStyle: TextBlockMeta['style'];
    };
}

interface AliasedListBlock extends Omit<ListBlock, 'meta' | 'items'> {
    listMeta: {
        listStyle: ListBlockMeta['style'];
    };
    items: Array<BaseBlock>;
}

interface AliasedImageBlock extends Omit<ImageBlock, 'meta'> {
    imageMeta: {
        altText: ImageBlockMeta['altText'];
        title: ImageBlockMeta['title'];
        imageSource: ImageBlockMeta['source'];
        imageDate: ImageBlockMeta['date'];
    };
}

interface AliasedQuoteBlock extends Omit<QuoteBlock, 'content' | 'meta'> {
    quoteContent: QuoteBlock['content'];
    quoteMeta: {
        author: QuoteBlockMeta['author'];
        quoteSource: QuoteBlockMeta['source'];
        quoteDate: QuoteBlockMeta['date'];
        url: QuoteBlockMeta['url'];
    };
}

interface AliasedTableBlock extends Omit<TableBlock, 'meta'> {
    tableMeta: {
        columnAlignment: TableBlock['meta']['columnAlignment'];
        columnMeta: TableBlock['meta']['columnMeta'];
    };
}

interface AliasedChartBlock extends Omit<ChartBlock, 'meta'> {
    chartMeta: ChartBlock['meta'];
}

// Interface to help with TypeScript typings for GraphQL responses
interface GraphQLResponse {
    __typename?: string;
}

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

// Type guard utility function
function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

function normalizeChartMeta(meta: ChartBlockMeta): ChartMeta {
    const properties = meta.properties as Record<string, unknown>;
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
                series: Array.isArray(properties?.series)
                    ? properties.series.map((s: ChartSeries) => ({
                          key: s.key,
                          label: s.label,
                          color: s.color,
                      }))
                    : [],
                stackedSeries: typeof properties?.stackedSeries === 'boolean' ? properties.stackedSeries : false,
            };

        case ChartTypeEnum.Bar:
            return {
                ...baseMeta,
                chartType: ChartType.BAR,
                series: Array.isArray(properties?.series)
                    ? properties.series.map((s: ChartSeries) => ({
                          key: s.key,
                          label: s.label,
                          color: s.color,
                      }))
                    : [],
                stackedBars: typeof properties?.stackedBars === 'boolean' ? properties.stackedBars : false,
            };

        case ChartTypeEnum.Line:
            return {
                ...baseMeta,
                chartType: ChartType.LINE,
                series: Array.isArray(properties?.series)
                    ? properties.series.map((s: ChartSeries) => ({
                          key: s.key,
                          label: s.label,
                          color: s.color,
                      }))
                    : [],
            };

        case ChartTypeEnum.Pie:
            return {
                ...baseMeta,
                chartType: ChartType.PIE,
                colors: Array.isArray(properties?.colors) ? properties.colors : [],
                nameKey: typeof properties?.nameKey === 'string' ? properties.nameKey : '',
                valueKey: typeof properties?.valueKey === 'string' ? properties.valueKey : '',
            };

        case ChartTypeEnum.Scatter:
            return {
                ...baseMeta,
                chartType: ChartType.SCATTER,
                colors: Array.isArray(properties?.colors) ? properties.colors : [],
                nameKey: typeof properties?.nameKey === 'string' ? properties.nameKey : '',
                sizeKey: typeof properties?.sizeKey === 'string' ? properties.sizeKey : undefined,
                xKey: typeof properties?.xKey === 'string' ? properties.xKey : '',
                yKey: typeof properties?.yKey === 'string' ? properties.yKey : '',
            };

        case ChartTypeEnum.Treemap:
            return {
                ...baseMeta,
                chartType: ChartType.TREEMAP,
                colors: Array.isArray(properties?.colors) ? properties.colors : [],
                nameKey: typeof properties?.nameKey === 'string' ? properties.nameKey : '',
                valueKey: typeof properties?.valueKey === 'string' ? properties.valueKey : '',
            };

        default:
            throw new Error('Unknown chart type');
    }
}

function normalizeCitableContent(rawContent: RawCitableContent[]): CitableContent {
    if (!rawContent || !Array.isArray(rawContent)) {
        return [];
    }

    return rawContent.map((content): string | Citation => {
        if (content.citation) {
            return {
                author: (content.citation.author as string) || '',
                date: (content.citation.date as string) || '',
                id: content.citation.id || '',
                source: content.citation.source?.name || '',
                text: content.citation.quote || '',
                url: (content.citation.url as string) || '',
            };
        } else {
            return content.value || '';
        }
    });
}

function normalizeTableCellMeta(rawMeta: TableCellMeta): CellMeta | undefined {
    if (!rawMeta) {
        return undefined;
    }

    return {
        ...(rawMeta.currency ? { currency: rawMeta.currency } : {}),
        ...(rawMeta.unit ? { unit: rawMeta.unit } : {}),
        ...(rawMeta.format ? { format: rawMeta.format.toLowerCase() as CellMeta['format'] } : {}),
        ...(rawMeta.decimals !== null && rawMeta.decimals !== undefined ? { decimals: rawMeta.decimals } : {}),
    };
}

function normalizeTableMeta(rawColumnMeta: TableCellMeta[] | undefined | null): CellMeta[] | undefined {
    // Early return if the input is null/undefined
    if (!rawColumnMeta || !Array.isArray(rawColumnMeta)) {
        return undefined;
    }

    // Filter out nulls and undefined values with type assertion
    const validRawMeta = rawColumnMeta.filter(isNonNullable).filter((meta: TableCellMeta) => {
        return meta.__typename === 'TableCellMeta';
    });

    // If we have no valid metadata, return undefined
    if (validRawMeta.length === 0) {
        return undefined;
    }

    // Process each valid metadata item
    const normalizedMeta = validRawMeta.map((meta) => normalizeTableCellMeta(meta)).filter(isNonNullable);

    // Return undefined if we end up with an empty array
    return normalizedMeta.length > 0 ? normalizedMeta : undefined;
}

// Generic function to normalize a content block with aliased fields
function normalizeContentBlock(rawBlock: BaseBlock | null | undefined): ContentBlock | null {
    if (!rawBlock) {
        console.warn('Received null or undefined block');
        return null;
    }

    try {
        console.log('Normalizing block:', { type: rawBlock.type, id: rawBlock.id });

        switch (rawBlock.__typename) {
            case 'TextBlock': {
                const block = rawBlock as unknown as AliasedTextBlock;
                return {
                    content: block.textContent ? normalizeCitableContent([block.textContent]) : [],
                    id: block.id,
                    meta: {
                        style: block.textMeta?.textStyle || 'paragraph',
                    },
                    type: BlockType.TEXT,
                };
            }

            case 'ListBlock': {
                const block = rawBlock as unknown as AliasedListBlock;
                const meta = block.listMeta || { listStyle: 'bullet' };
                const items = block.items || [];

                return {
                    id: block.id,
                    items: items.map((item) => normalizeContentBlock(item)).filter(isNonNullable),
                    meta: {
                        style: meta.listStyle || 'bullet',
                    },
                    type: BlockType.LIST,
                };
            }

            case 'ImageBlock': {
                const block = rawBlock as unknown as AliasedImageBlock;
                const meta = block.imageMeta || ({} as AliasedImageBlock['imageMeta']);
                return {
                    id: block.id,
                    meta: {
                        altText: meta.altText || '',
                        date: meta.imageDate as string,
                        source: meta.imageSource || '',
                        title: meta.title || '',
                    },
                    type: BlockType.IMAGE,
                    url: block.url || '',
                };
            }

            case 'QuoteBlock': {
                const block = rawBlock as unknown as AliasedQuoteBlock;
                const meta = block.quoteMeta || ({} as AliasedQuoteBlock['quoteMeta']);
                return {
                    content: block.quoteContent || '',
                    id: block.id,
                    meta: {
                        author: meta.author || '',
                        source: meta.quoteSource || '',
                        date: meta.quoteDate as string,
                        url: meta.url || '',
                    },
                    type: BlockType.QUOTE,
                };
            }

            case 'TableBlock': {
                const block = rawBlock as unknown as AliasedTableBlock;
                const meta = block.tableMeta || { columnAlignment: [], columnMeta: [] };
                return {
                    headers: block.headers || [],
                    id: block.id,
                    rows: block.rows ? [block.rows.map(normalizeCitableContent)] : [[]],
                    meta: {
                        columnAlignment: meta.columnAlignment || [],
                        columnMeta: normalizeTableMeta(meta.columnMeta as TableCellMeta[]),
                    },
                    type: BlockType.TABLE,
                };
            }

            case 'ChartBlock': {
                const block = rawBlock as unknown as AliasedChartBlock;
                return {
                    data: (block.data ?? []).map((d: ChartData) => ({
                        name: d.name || '',
                        value: d.value || 0,
                        ...((d.properties as object) || {}),
                    })),
                    id: block.id,
                    meta: normalizeChartMeta(block.chartMeta),
                    type: BlockType.CHART,
                };
            }

            default: {
                const blockTypename = (rawBlock as GraphQLResponse).__typename ?? '';
                console.error('Unhandled content block type:', blockTypename, 'for block:', rawBlock);
                throw new Error(`Unhandled content block type: ${blockTypename}`);
            }
        }
    } catch (error) {
        console.error('Error normalizing content block:', error, rawBlock);
        return null;
    }
}

// Type guard to check if an object is a ChatMessagePrompt
function isChatMessagePrompt(obj: unknown): obj is RawChatMessagePrompt {
    if (!obj || typeof obj !== 'object') return false;
    const msg = obj as RawChatMessagePrompt;
    return (
        msg.messageType === ChatMessageTypeEnum.Prompt || (obj as GraphQLResponse).__typename === 'ChatMessagePrompt'
    );
}

// Type guard to check if an object is a ChatMessageResponse
function isChatMessageResponse(obj: unknown): obj is RawChatMessageResponse {
    if (!obj || typeof obj !== 'object') return false;
    const msg = obj as RawChatMessageResponse;
    return (
        msg.messageType === ChatMessageTypeEnum.Response ||
        (obj as GraphQLResponse).__typename === 'ChatMessageResponse'
    );
}

// Type guard to check if an object is a ChatMessageSourceConfirmation
function isChatMessageSourceConfirmation(obj: unknown): obj is RawChatMessageSourceConfirmation {
    if (!obj || typeof obj !== 'object') return false;
    const msg = obj as RawChatMessageSourceConfirmation;
    return (
        msg.messageType === ChatMessageTypeEnum.SourceConfirmation ||
        (obj as GraphQLResponse).__typename === 'ChatMessageSourceConfirmation'
    );
}

// Convert GraphQL response messages to our internal ChatMessage format
function normalizeChatMessage(rawMessage: unknown): ChatMessage {
    if (!rawMessage) {
        console.warn('Received null or undefined message');
        // Return a minimal valid message to prevent UI crashes
        return {
            id: 'error-placeholder',
            timestamp: new Date().toISOString(),
            status: ChatMessageStatus.FAILED,
            prompt: 'Error processing message',
            type: ChatMessageType.PROMPT,
        };
    }

    // Debug the message structure
    console.log('Normalizing message:', {
        __typename: (rawMessage as GraphQLResponse).__typename,
        id: (rawMessage as { id: string }).id,
        messageType: (rawMessage as { messageType: string }).messageType,
    });

    const baseMessage = {
        id: (rawMessage as { id: string }).id,
        ordinalId: (rawMessage as { ordinalId?: string | null }).ordinalId,
        timestamp: (rawMessage as { createdAt: string }).createdAt,
        status: ChatMessageStatus.COMPLETED,
    };

    if (isChatMessagePrompt(rawMessage)) {
        return {
            ...baseMessage,
            type: ChatMessageType.PROMPT,
            prompt: rawMessage.content || '',
        };
    } else if (isChatMessageResponse(rawMessage)) {
        // Make extra sure blocks is always an array
        const blocks = Array.isArray(rawMessage.blocks) ? rawMessage.blocks : [];

        return {
            ...baseMessage,
            type: ChatMessageType.RESPONSE,
            prompt: '',
            blocks: blocks.map((block: BaseBlock) => normalizeContentBlock(block)).filter(isNonNullable),
            sources: normalizeSources(rawMessage.sources),
        };
    } else if (isChatMessageSourceConfirmation(rawMessage)) {
        return {
            ...baseMessage,
            type: ChatMessageType.SOURCES,
            prompt: '',
            confirmed: false,
            sources: normalizeSources(rawMessage.confirmableSources as ChatSource[]),
        };
    } else {
        console.error('Unknown message type:', rawMessage);
        // Default to a prompt message as fallback
        return {
            ...baseMessage,
            type: ChatMessageType.PROMPT,
            prompt: 'Unknown message type',
        };
    }
}

function normalizeSources(sources: ChatSource[] | undefined | null): ChatMessageSource[] {
    if (!sources || !Array.isArray(sources)) {
        return [];
    }

    return sources
        .filter((s: ChatSource) => s)
        .map(
            (source): ChatMessageSource => ({
                targetId: source.id || '',
                targetTitle: source.name || '',
                targetType: source.type || '',
            })
        );
}

// // Define fragments separately for better re-usability and clarity
const TEXT_BLOCK_FRAGMENT = gql`
    fragment TextBlockFragment on TextBlock {
        id
        type
        textContent: content {
            citation {
                id
                author
                contentId
                contentType
                date
                quote
                source {
                    id
                    name
                    type
                    __typename
                }
                url
                __typename
            }
            value
            __typename
        }
        textMeta: meta {
            textStyle: style
            __typename
        }
        __typename
    }
`;

const IMAGE_BLOCK_FRAGMENT = gql`
    fragment ImageBlockFragment on ImageBlock {
        id
        type
        url
        imageMeta: meta {
            altText
            title
            imageSource: source
            imageDate: date
            __typename
        }
        __typename
    }
`;

const QUOTE_BLOCK_FRAGMENT = gql`
    fragment QuoteBlockFragment on QuoteBlock {
        id
        type
        quoteContent: content
        quoteMeta: meta {
            author
            quoteSource: source
            quoteDate: date
            url
            __typename
        }
        __typename
    }
`;

const LIST_ITEM_FRAGMENT = gql`
    fragment ListItemFragment on ContentBlock {
        __typename
        ... on TextBlock {
            ...TextBlockFragment
        }
        ... on ImageBlock {
            ...ImageBlockFragment
        }
        ... on QuoteBlock {
            ...QuoteBlockFragment
        }
        ... on TableBlock {
            id
            type
            __typename
        }
        ... on ChartBlock {
            id
            type
            __typename
        }
        ... on ListBlock {
            id
            type
            __typename
        }
    }
`;

const LIST_BLOCK_FRAGMENT = gql`
    fragment ListBlockFragment on ListBlock {
        id
        type
        listMeta: meta {
            listStyle: style
            __typename
        }
        items {
            ...ListItemFragment
            __typename
        }
        __typename
    }
`;

const TABLE_BLOCK_FRAGMENT = gql`
    fragment TableBlockFragment on TableBlock {
        id
        type
        headers
        rows {
            citation {
                id
                author
                contentId
                contentType
                date
                quote
                source {
                    id
                    name
                    type
                    __typename
                }
                url
                __typename
            }
            value
            __typename
        }
        tableMeta: meta {
            columnAlignment
            columnMeta {
                currency
                unit
                format
                decimals
                __typename
            }
            __typename
        }
        __typename
    }
`;

const CHART_BLOCK_FRAGMENT = gql`
    fragment ChartBlockFragment on ChartBlock {
        id
        type
        data {
            name
            value
            properties
            __typename
        }
        chartMeta: meta {
            chartType
            properties
            __typename
        }
        __typename
    }
`;

const CONTENT_BLOCK_FRAGMENT = gql`
    fragment ContentBlockFragment on ContentBlock {
        __typename
        ... on TextBlock {
            ...TextBlockFragment
        }
        ... on ListBlock {
            ...ListBlockFragment
        }
        ... on ImageBlock {
            ...ImageBlockFragment
        }
        ... on QuoteBlock {
            ...QuoteBlockFragment
        }
        ... on TableBlock {
            ...TableBlockFragment
        }
        ... on ChartBlock {
            ...ChartBlockFragment
        }
    }
`;

const CHAT_SESSION_QUERY = gql`
    ${TEXT_BLOCK_FRAGMENT}
    ${IMAGE_BLOCK_FRAGMENT}
    ${QUOTE_BLOCK_FRAGMENT}
    ${LIST_ITEM_FRAGMENT}
    ${LIST_BLOCK_FRAGMENT}
    ${TABLE_BLOCK_FRAGMENT}
    ${CHART_BLOCK_FRAGMENT}
    ${CONTENT_BLOCK_FRAGMENT}

    query ChatSessionWithMessages($filter: ChatSessionFilter!) {
        chatSession(filter: $filter) {
            id
            messages {
                __typename
                ... on ChatMessagePrompt {
                    id
                    createdAt
                    messageType
                    ordinalId
                    runnerVersion
                    sessionId
                    updatedAt
                    userId
                    content
                    __typename
                }
                ... on ChatMessageResponse {
                    id
                    createdAt
                    messageType
                    ordinalId
                    runnerVersion
                    sessionId
                    updatedAt
                    userId
                    blocks {
                        ...ContentBlockFragment
                    }
                    sources {
                        id
                        name
                        type
                        __typename
                    }
                    __typename
                }
                ... on ChatMessageSourceConfirmation {
                    id
                    createdAt
                    messageType
                    ordinalId
                    runnerVersion
                    sessionId
                    updatedAt
                    userId
                    confirmableSources: sources {
                        id
                        confirmed
                        name
                        type
                        __typename
                    }
                    __typename
                }
            }
            __typename
        }
    }
`;

const CREATE_CHAT_MESSAGE_MUTATION = gql`
    mutation CreateChatMessagePrompt($input: CreateChatMessagePromptInput!) {
        createChatMessagePrompt(input: $input) {
            chatMessage {
                id
                content
                createdAt
                messageType
                ordinalId
                runnerVersion
                sessionId
                updatedAt
                userId
            }
        }
    }
`;

export const useChatMessages = (sessionId: string, enablePolling = false): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [_, createChatMessagePromptMutation] = useMutation<
        CreateChatMessagePromptMutation,
        CreateChatMessagePromptMutationVariables
    >(CREATE_CHAT_MESSAGE_MUTATION);

    const createChatMessagePrompt = useCallback(
        ({ content, sessionId }: { content: string; sessionId: string }) => {
            console.log('Creating chat message prompt:', { content, sessionId });
            return createChatMessagePromptMutation({ input: { content, sessionId } })
                .then((resp) => {
                    console.log('Mutation response:', resp);
                    const newMessage = resp.data?.createChatMessagePrompt?.chatMessage;
                    if (newMessage) {
                        try {
                            // Normalize the message before updating state
                            const normalizedMessage = normalizeChatMessage(newMessage);
                            console.log('Normalized message:', normalizedMessage);
                            setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
                            return normalizedMessage as ChatMessagePrompt;
                        } catch (normalizationError) {
                            console.error('Error normalizing new message:', normalizationError);
                            setError('Error processing new message data');
                            return null;
                        }
                    } else {
                        console.error('No chat message returned from mutation', resp);
                        setError('Error creating chat message prompt');
                    }
                    return null;
                })
                .catch((error: Error) => {
                    console.error(`Error creating chat message prompt:`, error);
                    setError('Error creating chat message prompt');
                    return null;
                });
        },
        [createChatMessagePromptMutation, setError, setMessages]
    );

    const messagesQuery = useQuery<ChatSessionWithMessagesQuery, ChatSessionWithMessagesQueryVariables>({
        query: CHAT_SESSION_QUERY,
        pause: !sessionId || sessionId === 'new',
        requestPolicy: 'cache-and-network',
        variables: {
            filter: { includeMessages: true, sessionId },
        },
    });

    // Update state based on query status
    useEffect(() => {
        // Only update loading state when it actually changes
        const queryLoading = messagesQuery.status === 'loading';
        if (queryLoading !== isLoading) {
            setIsLoading(queryLoading);
        }

        // Handle data updates
        if (!queryLoading && messagesQuery.status === 'success' && messagesQuery.data?.chatSession?.messages) {
            try {
                const chatSession = messagesQuery.data.chatSession;
                console.log('Processing chat session:', chatSession.id);

                const rawMessages = chatSession.messages || [];
                console.log(`Processing ${rawMessages.length} messages`);

                // Try to process each message individually to avoid one bad message breaking everything
                const normalizedMessages: ChatMessage[] = [];

                for (let i = 0; i < rawMessages.length; i++) {
                    try {
                        const msg = rawMessages[i];
                        const normalized = normalizeChatMessage(msg);
                        normalizedMessages.push(normalized);
                    } catch (msgError) {
                        console.error(`Error processing message at index ${i}:`, msgError);
                        // Continue processing other messages
                    }
                }

                console.log(`Successfully normalized ${normalizedMessages.length} messages`);
                setMessages(normalizedMessages);

                // Only clear error if we have one
                if (error) setError(null);
            } catch (err) {
                console.error('Error processing messages:', err);
                setError('Error processing messages data');
            }
        } else if (messagesQuery.status === 'error') {
            console.error('Query error:', messagesQuery.error);
            setError(messagesQuery.error.message);
        }
    }, [error, isLoading, messagesQuery]);

    const refresh = useCallback(() => {
        console.log('Refreshing chat messages...');
        messagesQuery.refetch();
    }, [messagesQuery]);

    // Setup polling if enabled
    useEffect(() => {
        if (!enablePolling) return;

        console.log(`Setting up polling interval (${POLLING_INTERVAL}ms)`);
        const intervalId = setInterval(() => {
            refresh();
        }, POLLING_INTERVAL);

        return () => {
            console.log('Clearing polling interval');
            clearInterval(intervalId);
        };
    }, [enablePolling, refresh]);

    // Debug output to help diagnose issues
    useEffect(() => {
        console.log('Current chat state:', {
            sessionId,
            messageCount: messages.length,
            isLoading,
            hasError: error !== null,
            lastRawResponseExists: messagesQuery.status === 'success' && messagesQuery.data !== undefined,
        });
    }, [sessionId, messages.length, isLoading, error, messagesQuery]);

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        refresh,
    };
};
