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
    CitableContent as RawCitableContent,
    ContentBlockType,
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
type RawTableCellMeta = TableCellMeta;

function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

function normalizeCitableContent(rawContent: RawCitableContent[]): CitableContent {
    return rawContent.map((content): string | Citation => {
        if (content.citation) {
            return {
                author: content.citation.author as string,
                date: content.citation.date as string,
                id: content.citation.id,
                source: content.citation.source.name,
                text: content.citation.quote,
                url: content.citation.url as string,
            };
        } else {
            return content.value;
        }
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
                targetId: source.id,
                targetTitle: source.name,
                targetType: source.type,
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
                prompt: '', // TODO add prompt to base chat message class in server
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
                        return normalizedMessage as ChatMessagePrompt;
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
                                ... on ChartBlock {
                                    ...ChartBlockFields
                                }
                                ... on ImageBlock {
                                    ...ImageBlockFields
                                }
                                ... on ListBlock {
                                    ...ListBlockFields
                                }
                                ... on QuoteBlock {
                                    ...QuoteBlockFields
                                }
                                ... on TableBlock {
                                    ...TableBlockFields
                                }
                                ... on TextBlock {
                                    ...TextBlockFields
                                }
                            }
                            responseSources: sources {
                                id
                                name
                                type
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
                            confirmationSources: sources {
                                id
                                confirmed
                                name
                                type
                            }
                        }
                    }
                }
            }

            fragment ChartBlockFields on ChartBlock {
                __typename
                id
                type
                data {
                    name
                    properties
                    value
                }
                meta {
                    chartType
                    properties
                }
            }

            fragment ImageBlockFields on ImageBlock {
                __typename
                id
                type
                url
                meta {
                    altText
                    imageDate: date
                    imageSource: source
                    title
                }
            }

            fragment QuoteBlockFields on QuoteBlock {
                __typename
                id
                type
                quoteContent: content
                meta {
                    author
                    quoteDate: date
                    quoteSource: source
                    url
                }
            }

            fragment TableBlockFields on TableBlock {
                __typename
                id
                type
                headers
                meta {
                    columnAlignment
                    columnMeta {
                        currency
                        decimals
                        format
                        unit
                    }
                }
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
                        }
                        url
                    }
                    value
                }
            }

            fragment TextBlockFields on TextBlock {
                __typename
                id
                type
                content {
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
                        }
                        url
                    }
                    value
                }
                meta {
                    textStyle: style
                }
            }

            fragment ListBlockFields on ListBlock {
                __typename
                id
                type
                items {
                    ... on ChartBlock {
                        ...ChartBlockFields
                    }
                    ... on ImageBlock {
                        ...ImageBlockFields
                    }
                    ... on ListBlock {
                        id
                        type
                        meta {
                            listStyle: style
                        }
                        items {
                            ... on ChartBlock {
                                ...ChartBlockFields
                            }
                            ... on ImageBlock {
                                ...ImageBlockFields
                            }
                            ... on QuoteBlock {
                                ...QuoteBlockFields
                            }
                            ... on TableBlock {
                                ...TableBlockFields
                            }
                            ... on TextBlock {
                                ...TextBlockFields
                            }
                        }
                    }
                    ... on QuoteBlock {
                        ...QuoteBlockFields
                    }
                    ... on TableBlock {
                        ...TableBlockFields
                    }
                    ... on TextBlock {
                        ...TextBlockFields
                    }
                }
                meta {
                    listStyle: style
                }
            }
        `,
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
        if (messagesQuery.status === 'success' && messagesQuery.data?.chatSession?.messages) {
            const rawMessages = messagesQuery.data.chatSession.messages as Array<
                ChatMessagePromptType | ChatMessageResponseType | ChatMessageSourceConfirmationType
            >;
            setMessages(rawMessages.map(normalizeChatMessage));
            // Only clear error if we have one
            if (error) setError(null);
        } else if (messagesQuery.status === 'error') {
            setError(messagesQuery.error.message);
        }
    }, [error, isLoading, messagesQuery, setError, setIsLoading, setMessages]);

    const refresh = () => messagesQuery.refetch();

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        refresh,
    };
};
