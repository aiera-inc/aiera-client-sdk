import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    BaseBlock,
    ChartBlock,
    ChartBlockMeta,
    ChartData,
    ChartType as ChartTypeEnum,
    ChatMessagePrompt as ChatMessagePromptType,
    ChatMessageResponse as ChatMessageResponseType,
    ChatMessageSourceConfirmation as ChatMessageSourceConfirmationType,
    ChatMessageType as ChatMessageTypeEnum,
    ChatSessionWithMessagesQuery,
    ChatSessionWithMessagesQueryVariables,
    ChatSource,
    Citation as RawCitation,
    ContentBlockType,
    CreateChatMessagePromptMutation,
    CreateChatMessagePromptMutationVariables,
    ImageBlock,
    ListBlock,
    QuoteBlock,
    TableBlock,
    TableCellMeta,
    TextBlock,
    TextContent,
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
    createChatMessagePrompt: ({ content, sessionId }: { content: string; sessionId: string }) => void;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

const sampleMessages = [
    // First conversation - Comprehensive AI Report
    {
        id: 'msg1',
        ordinalId: '001',
        timestamp: '2024-12-06T10:00:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.PROMPT,
    },
    {
        id: 'msg2',
        ordinalId: '002',
        timestamp: '2024-12-06T10:00:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.SOURCES,
        confirmed: true,
        sources: [
            {
                targetType: 'report',
                targetId: 'ai-market-2024',
                targetTitle: '2024 AI Industry Analysis',
            },
        ],
    },
    {
        id: 'msg3',
        ordinalId: '003',
        timestamp: '2024-12-06T10:00:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Give me a comprehensive overview of the AI industry in 2024.',
        type: ChatMessageType.RESPONSE,
        blocks: [
            {
                id: 'report-title',
                type: 'text',
                content: ['2024 Artificial Intelligence Industry Analysis'],
                meta: { style: 'h1' },
            },
            {
                id: 'report-subtitle',
                type: 'text',
                content: ['Market Overview and Key Trends'],
                meta: { style: 'h2' },
            },
            {
                id: 'executive-summary',
                type: 'text',
                content: [
                    'The AI industry has experienced unprecedented growth in 2024, with global revenues reaching new heights and adoption accelerating across all sectors.',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'key-findings',
                type: 'list',
                items: [
                    {
                        primary: ['Market Growth'],
                        secondary: [
                            'Global AI revenue reached $500 billion, representing a 45% year-over-year increase',
                        ],
                    },
                    {
                        primary: ['Technology Adoption'],
                        secondary: ['Enterprise AI implementation grew by 65% across Fortune 500 companies'],
                    },
                ],
                meta: { style: 'ordered' },
            },
            {
                id: 'market-share',
                type: 'chart',
                data: [
                    { name: 'North America', value: 450, color: '#8884d8' },
                    { name: 'Europe', value: 380, color: '#82ca9d' },
                    { name: 'Asia Pacific', value: 350, color: '#ffc658' },
                    { name: 'Rest of World', value: 150, color: '#ff8042' },
                ],
                meta: {
                    chartType: 'treemap',
                    title: 'Regional Market Distribution (Billion USD)',
                    valueKey: 'value',
                    nameKey: 'name',
                },
            },
            {
                id: 'system-architecture',
                type: 'image',
                url: '/api/placeholder/800/400',
                meta: {
                    title: 'Modern AI System Architecture',
                    altText: 'Diagram showing the components and relationships in modern AI systems',
                    caption: 'Typical enterprise AI system architecture in 2024',
                },
            },
        ],
        sources: [
            {
                targetType: 'report',
                targetId: 'ai-market-2024',
                targetTitle: '2024 AI Industry Analysis',
            },
        ],
    },

    // Second conversation - Model Performance
    {
        id: 'msg4',
        ordinalId: '004',
        timestamp: '2024-12-06T10:01:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.PROMPT,
    },
    {
        id: 'msg5',
        ordinalId: '005',
        timestamp: '2024-12-06T10:01:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.SOURCES,
        confirmed: true,
        sources: [
            {
                targetType: 'benchmark',
                targetId: 'model-performance',
                targetTitle: 'AI Model Performance Benchmark 2024',
            },
        ],
    },
    {
        id: 'msg6',
        ordinalId: '006',
        timestamp: '2024-12-06T10:01:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'Compare the performance of top AI models across different metrics.',
        type: ChatMessageType.RESPONSE,
        blocks: [
            {
                id: 'perf-intro',
                type: 'text',
                content: [
                    'Analysis of leading AI models reveals significant variations in performance across key metrics:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'model-comparison',
                type: 'table',
                headers: ['Model', 'Accuracy', 'Latency', 'Cost/1M Tokens'],
                rows: [
                    [['GPT-4'], ['98.5%'], ['120ms'], ['$0.60']],
                    [['Claude-3'], ['97.8%'], ['115ms'], ['$0.55']],
                    [['PaLM'], ['96.5%'], ['125ms'], ['$0.45']],
                ],
                meta: {
                    columnAlignment: ['left', 'center', 'center', 'right'],
                    columnMeta: [
                        {},
                        { format: 'percentage', decimals: 1 },
                        { unit: 'ms', format: 'number' },
                        { currency: 'USD', format: 'number' },
                    ],
                },
            },
            {
                id: 'key-features',
                type: 'list',
                items: [
                    {
                        primary: ['Specialized Capabilities'],
                        secondary: ['Each model exhibits unique strengths in specific domains'],
                    },
                    {
                        primary: ['Trade-offs'],
                        secondary: ['Higher accuracy generally correlates with increased cost'],
                    },
                ],
                meta: { style: 'unordered' },
            },
        ],
        sources: [
            {
                targetType: 'benchmark',
                targetId: 'model-performance',
                targetTitle: 'AI Model Performance Benchmark 2024',
            },
        ],
    },

    // Third conversation - Expert Commentary
    {
        id: 'msg7',
        ordinalId: '007',
        timestamp: '2024-12-06T10:02:00Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.PROMPT,
    },
    {
        id: 'msg8',
        ordinalId: '008',
        timestamp: '2024-12-06T10:02:01Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.SOURCES,
        confirmed: true,
        sources: [
            {
                targetType: 'conference',
                targetId: 'future-ai-summit',
                targetTitle: 'Future of AI Summit 2024',
            },
        ],
    },
    {
        id: 'msg9',
        ordinalId: '009',
        timestamp: '2024-12-06T10:02:02Z',
        status: ChatMessageStatus.COMPLETED,
        prompt: 'What are experts saying about the future of AI?',
        type: ChatMessageType.RESPONSE,
        blocks: [
            {
                id: 'future-heading',
                type: 'text',
                content: ['Expert Perspectives on AI Evolution'],
                meta: { style: 'h3' },
            },
            {
                id: 'future-context',
                type: 'text',
                content: [
                    'Leading experts at the Future of AI Summit 2024 shared insights on emerging trends and future developments:',
                ],
                meta: { style: 'paragraph' },
            },
            {
                id: 'expert-quote',
                type: 'quote',
                content:
                    'We are witnessing the emergence of truly general-purpose AI systems that can seamlessly adapt to diverse tasks while maintaining high performance and reliability.',
                meta: {
                    author: 'Dr. Sarah Chen',
                    source: 'Future of AI Summit 2024',
                    date: '2024-03-15',
                },
            },
            {
                id: 'future-metrics',
                type: 'chart',
                data: [
                    { year: '2024', capability: 65, adoption: 45 },
                    { year: '2025', capability: 80, adoption: 60 },
                    { year: '2026', capability: 90, adoption: 75 },
                ],
                meta: {
                    chartType: 'line',
                    title: 'Projected AI Evolution',
                    xAxis: 'Year',
                    yAxis: 'Score',
                    series: [
                        { key: 'capability', label: 'Capability Score', color: '#8884d8' },
                        { key: 'adoption', label: 'Adoption Rate', color: '#82ca9d' },
                    ],
                },
            },
        ],
        sources: [
            {
                targetType: 'conference',
                targetId: 'future-ai-summit',
                targetTitle: 'Future of AI Summit 2024',
            },
        ],
    },
];

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

// Redeclare types to avoid name conflicts, but retain all the type definitions
type RawCitableContent = RawCitation | TextContent;
type RawTableCellMeta = TableCellMeta;

function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

function normalizeCitableContent(rawContent: RawCitableContent[]): CitableContent {
    return rawContent.map((content): string | Citation => {
        if (content.__typename === 'TextContent') {
            return content.value;
        }
        if (content.__typename === 'Citation') {
            return {
                author: content.author as string,
                date: content.date as string,
                id: content.id,
                source: content.source,
                text: content.quote,
                url: content.url as string,
            };
        }
        throw new Error('Unknown citable content type');
    });
}

function normalizeSources(sources: ChatSource[] | undefined): ChatMessageSource[] {
    if (!sources || !Array.isArray(sources)) {
        return [];
    }

    return sources
        .filter((s: ChatSource) => s)
        .map(
            (source): ChatMessageSource => ({
                targetId: source.sourceId,
                targetTitle: source.sourceName,
                targetType: source.sourceType,
            })
        );
}

function normalizeTableCellMeta(rawMeta: RawTableCellMeta): CellMeta | undefined {
    if (!rawMeta) {
        return undefined;
    }

    return {
        ...(rawMeta.currency ? { currency: rawMeta.currency } : {}),
        ...(rawMeta.unit ? { unit: rawMeta.unit } : {}),
        ...(rawMeta.format ? { format: rawMeta.format.toLowerCase() as CellMeta['format'] } : {}),
        ...(rawMeta.decimals ? { decimals: rawMeta.decimals } : {}),
    };
}

function normalizeTableMeta(rawColumnMeta: RawTableCellMeta | undefined): CellMeta[] | undefined {
    // Early return if the input is null/undefined
    if (!rawColumnMeta || !Array.isArray(rawColumnMeta)) {
        return undefined;
    }

    // Filter out nulls and undefined values with type assertion
    const validRawMeta = rawColumnMeta.filter(isNonNullable).filter((meta: RawTableCellMeta) => {
        return meta.__typename === 'TableCellMeta';
    });

    // If we have no valid metadata, return undefined
    if (validRawMeta.length === 0) {
        return undefined;
    }

    // Process each valid metadata item
    const normalizedMeta = validRawMeta
        .map((meta) => normalizeTableCellMeta(meta as RawTableCellMeta))
        .filter(isNonNullable);

    // Return undefined if we end up with an empty array
    return normalizedMeta.length > 0 ? normalizedMeta : undefined;
}

function normalizeContentBlock(rawBlock: BaseBlock): ContentBlock {
    switch (rawBlock.type) {
        case ContentBlockType.Chart: {
            const block = rawBlock as ChartBlock;
            return {
                data: (block.data ?? []).map((d: ChartData) => ({
                    name: d.name,
                    value: d.value,
                    ...(d.properties as object),
                })),
                id: block.id,
                meta: normalizeChartMeta(block.meta),
                type: BlockType.CHART,
            };
        }

        case ContentBlockType.Image: {
            const block = rawBlock as ImageBlock;
            return {
                id: block.id,
                meta: {
                    altText: block.meta.altText ?? '',
                    date: (block.meta.date as string) ?? '',
                    source: block.meta.source ?? '',
                    title: block.meta.title,
                },
                type: BlockType.IMAGE,
                url: block.url,
            };
        }

        case ContentBlockType.List: {
            const block = rawBlock as ListBlock;
            return {
                id: block.id,
                items: block.items.map(normalizeContentBlock), // TODO add support for ListItemText
                meta: {
                    style: block.meta.style,
                },
                type: BlockType.LIST,
            };
        }

        case ContentBlockType.Quote: {
            const block = rawBlock as QuoteBlock;
            return {
                content: block.content,
                id: block.id,
                meta: {
                    author: block.meta.author,
                    source: block.meta.source,
                    date: block.meta.date as string,
                    url: block.meta.url ?? '',
                },
                type: BlockType.QUOTE,
            };
        }

        case ContentBlockType.Table: {
            const block = rawBlock as TableBlock;
            return {
                headers: block.headers,
                id: block.id,
                rows: [block.rows.map(normalizeCitableContent)],
                meta: {
                    columnAlignment: block.meta.columnAlignment,
                    columnMeta: normalizeTableMeta(block.meta.columnMeta as RawTableCellMeta),
                },
                type: BlockType.TABLE,
            };
        }

        case ContentBlockType.Text: {
            const block = rawBlock as TextBlock;
            return {
                content: normalizeCitableContent([block.content]),
                id: block.id,
                meta: {
                    style: block.meta.style,
                },
                type: BlockType.TEXT,
            };
        }

        default: {
            throw new Error('Unhandled content block type');
        }
    }
}

function normalizeChatMessage(
    rawMessage: ChatMessagePromptType | ChatMessageResponseType | ChatMessageSourceConfirmationType
): ChatMessage {
    const baseMessage = {
        id: rawMessage.id,
        ordinalId: rawMessage.ordinalId,
        timestamp: rawMessage.createdAt,
        status: ChatMessageStatus.COMPLETED,
    };

    switch (rawMessage.messageType) {
        case ChatMessageTypeEnum.Prompt: {
            const promptMessage = rawMessage as ChatMessagePromptType;
            return {
                ...baseMessage,
                type: ChatMessageType.PROMPT,
                prompt: promptMessage.content,
            };
        }

        case ChatMessageTypeEnum.Response: {
            const responseMessage = rawMessage as ChatMessageResponseType;
            return {
                ...baseMessage,
                type: ChatMessageType.RESPONSE,
                prompt: '', // Response messages don't have a prompt
                blocks: (responseMessage.blocks ?? []).map(normalizeContentBlock),
                sources: normalizeSources(responseMessage.sources as ChatSource[]),
            };
        }

        case ChatMessageTypeEnum.SourceConfirmation: {
            const sourceMessage = rawMessage as ChatMessageSourceConfirmationType;
            return {
                ...baseMessage,
                type: ChatMessageType.SOURCES,
                prompt: '',
                confirmed: false,
                sources: normalizeSources(sourceMessage.sources as ChatSource[]),
            };
        }

        default: {
            throw new Error('Unknown message type');
        }
    }
}

const fetchChatMessages = async (_: string): Promise<ChatMessage[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return sampleMessages as ChatMessage[];
};

export const useChatMessages = (sessionId: string): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [_, createChatMessagePromptMutation] = useMutation<
        CreateChatMessagePromptMutation,
        CreateChatMessagePromptMutationVariables
    >(gql`
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
    `);
    const createChatMessagePrompt = useCallback(
        ({ content, sessionId }: { content: string; sessionId: string }) => {
            return createChatMessagePromptMutation({ input: { content, sessionId } })
                .then((resp) => {
                    const newMessage = resp.data?.createChatMessagePrompt?.chatMessage;
                    if (newMessage) {
                        // Normalize the message before updating state
                        const normalizedMessage = normalizeChatMessage(newMessage);
                        setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
                        return normalizedMessage;
                    } else {
                        setError('Error creating chat message prompt');
                    }
                    return null;
                })
                .catch(() => {
                    setError('Error creating chat message prompt');
                    return null;
                });
        },
        [createChatMessagePromptMutation, setError, setMessages]
    );

    const messagesQuery = useQuery<ChatSessionWithMessagesQuery, ChatSessionWithMessagesQueryVariables>({
        query: gql`
            query ChatSessionWithMessages($filter: ChatSessionFilter!) {
                chatSession(filter: $filter) {
                    id
                    messages {
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
                                ... on TextBlock {
                                    id
                                    type
                                    textContent: content {
                                        ... on Citation {
                                            id
                                            author
                                            contentId
                                            contentType
                                            date
                                            quote
                                            source
                                            url
                                        }
                                        ... on TextContent {
                                            value
                                        }
                                    }
                                    textMeta: meta {
                                        style
                                    }
                                }
                                ... on ListBlock {
                                    id
                                    type
                                    items {
                                        ... on TextBlock {
                                            id
                                            type
                                            content {
                                                ... on Citation {
                                                    id
                                                    author
                                                    contentId
                                                    contentType
                                                    date
                                                    quote
                                                    source
                                                    url
                                                }
                                                ... on TextContent {
                                                    value
                                                }
                                            }
                                        }
                                    }
                                    listMeta: meta {
                                        style
                                    }
                                }
                                ... on QuoteBlock {
                                    id
                                    type
                                    quoteContent: content
                                    quoteMeta: meta {
                                        author
                                        date
                                        source
                                        url
                                    }
                                }
                            }
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
                            sources {
                                id
                                confirmed
                                sourceId
                                sourceName
                                sourceType
                            }
                        }
                    }
                }
            }
        `,
        pause: !sessionId,
        requestPolicy: 'cache-and-network',
        variables: {
            filter: { includeMessages: true, sessionId },
        },
    });

    // Update state based on query status
    useEffect(() => {
        if (messagesQuery.status === 'success' && messagesQuery.data.chatSession?.messages) {
            // Normalize the message before updating state
            const rawMessages = messagesQuery.data.chatSession.messages as Array<
                ChatMessagePromptType | ChatMessageResponseType | ChatMessageSourceConfirmationType
            >;
            setMessages(rawMessages.map(normalizeChatMessage));
        } else if (messagesQuery.status === 'error') {
            setError(messagesQuery.error.message);
        }
        if (!isLoading && messagesQuery.status === 'loading') {
            setIsLoading(true);
        } else if (isLoading && messagesQuery.status !== 'loading') {
            setIsLoading(false);
        }
    }, [isLoading, sessionId, setIsLoading, setMessages]);

    const fetchMessages = useCallback(async () => {
        try {
            if (sessionId !== 'new') {
                setIsLoading(true);
            }
            setError(null);
            if (sessionId && sessionId !== 'new') {
                const data = await fetchChatMessages(sessionId);
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    const refresh = async () => {
        await fetchMessages();
    };

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        refresh,
    };
};
