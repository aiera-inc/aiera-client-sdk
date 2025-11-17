import gql from 'graphql-tag';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { RequestPolicy, useClient, useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import {
    ChatMessagePrompt as RawChatMessagePrompt,
    ChatMessageResponse as RawChatMessageResponse,
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSessionTitleStatus,
    ChatSessionWithMessagesQuery,
    ChatSessionWithMessagesQueryVariables,
    ChatSource,
    Citation as RawCitation,
    CreateChatMessagePromptMutation,
    CreateChatMessagePromptMutationVariables,
    TextBlock,
} from '@aiera/client-sdk/types/generated';
import {
    BlockType,
    Citation,
    ContentBlock,
} from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { CHAT_SESSION_QUERY, CREATE_CHAT_MESSAGE_MUTATION } from '@aiera/client-sdk/modules/AieraChat/services/graphql';
import { Source, useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLING_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REFETCH_COUNT = Math.floor(MAX_POLLING_DURATION / POLLING_INTERVAL); // Maximum number of refetches

export enum ChatMessageType {
    PROMPT = 'prompt',
    SOURCES = 'sources',
    RESPONSE = 'response',
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
    promptMessageId?: string;
    type: ChatMessageType;
}

export interface ChatMessageResponse extends ChatMessageBase {
    type: ChatMessageType.RESPONSE;
    blocks: ContentBlock[];
    sources: Source[];
}

export interface ChatMessagePrompt extends ChatMessageBase {
    type: ChatMessageType.PROMPT;
}

export interface ChatMessageSources extends ChatMessageBase {
    type: ChatMessageType.SOURCES;
    sources: Source[];
}

export type ChatMessage = ChatMessageResponse | ChatMessagePrompt | ChatMessageSources;

interface UseChatSessionOptions {
    enablePolling?: boolean;
    requestPolicy?: RequestPolicy;
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
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    refresh: () => void;
}

/**
 * Utility function to check if a value is not null or undefined
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

/**
 * Generate a unique ID for blocks and citations that don't have one
 */
function generateId(prefix = 'gen'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Map raw citations from the server
 */
export function normalizeCitation(rawCitation: RawCitation): Citation {
    const source = rawCitation.source;
    const sourceParent = source.parent as ChatSource;
    return {
        author: rawCitation.author || '',
        contentId: source.id,
        date: rawCitation.date as string,
        marker: rawCitation.marker,
        source: source.name,
        sourceId: source?.id,
        sourceParentId: sourceParent?.id,
        sourceParentType: sourceParent?.type,
        sourceType: rawCitation.source.type,
        text: rawCitation.quote,
        url: rawCitation.url || undefined,
    };
}

/**
 * Normalize chat message sources with error handling
 * Uses sourceId instead of id
 */
export function normalizeSources(sources: ChatSource[] | null | undefined): Source[] {
    if (!sources || !Array.isArray(sources)) {
        return [];
    }

    try {
        return sources.filter(isNonNullable).map((source) => ({
            contentId: source.id,
            targetId: source.id,
            targetType: source.type,
            title: source.name,
            url: source.meta?.url,
        }));
    } catch (error) {
        log(`Error normalizing sources: ${String(error)}`, 'error');
        return [];
    }
}

/**
 * Comprehensive normalizer for content blocks with better error handling
 * Handles renamed fields and generates IDs when missing
 */
export function normalizeContentBlock(block: TextBlock): ContentBlock | null {
    if (!block) {
        return null;
    }

    try {
        const blockType = block.__typename || 'unknown';
        // Generate a block ID since server no longer provides one
        const blockId = generateId(`block-${blockType}`);

        switch (blockType) {
            case 'TextBlock': {
                return {
                    citations: block.citations ? block.citations.map(normalizeCitation) : undefined,
                    content: block.content,
                    id: blockId,
                    type: BlockType.TEXT,
                };
            }

            default: {
                log(`Unhandled content block type: ${blockType}`, 'warn');
                // Return a basic text block as fallback
                return {
                    content: `Unsupported content type: ${blockType}`,
                    id: blockId,
                    type: BlockType.TEXT,
                };
            }
        }
    } catch (error) {
        log(`Error normalizing content block: ${String(error)}`, 'error');
        return null;
    }
}

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useChatSession = ({
    enablePolling = false,
    requestPolicy = 'cache-and-network',
}: UseChatSessionOptions): UseChatSessionReturn => {
    const { addCitationMarkers, chatId, chatTitle, onSetTitle, webSearchEnabled } = useChatStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const config = useConfig();

    // Get urql client for manual cache updates
    const client = useClient();

    // Add state for tracking refetch count and whether to stop polling
    const [_refetchCount, setRefetchCount] = useState<number>(0);
    const [shouldStopPolling, setShouldStopPolling] = useState<boolean>(false);

    const [__, createChatMessagePromptMutation] = useMutation<
        CreateChatMessagePromptMutation,
        CreateChatMessagePromptMutationVariables
    >(CREATE_CHAT_MESSAGE_MUTATION);

    // Enhanced create message function
    const createChatMessagePrompt = useCallback(
        ({ content, sessionId }: { content: string; sessionId: string }) => {
            // Don't send empty messages
            if (!content.trim()) {
                log('Attempted to send empty message', 'warn');
                return Promise.resolve(null);
            }

            log(`Creating chat message prompt: content=${content}, sessionId=${sessionId}`);

            return createChatMessagePromptMutation({
                input: {
                    content,
                    sessionId,
                    sessionUserId: config.tracking?.userId,
                    toolSettings: { webSearchEnabled },
                },
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
                            prompt: newMessage.content,
                            status: ChatMessageStatus.COMPLETED,
                            timestamp: newMessage.createdAt,
                            type: ChatMessageType.PROMPT,
                        };

                        log('Created new message', 'debug');

                        // Update local state immediately for better UX
                        setMessages((prevMessages) => [...prevMessages, normalizedMessage]);

                        return normalizedMessage;
                    } catch (normalizationError) {
                        log(`Error normalizing new message: ${String(normalizationError)}`, 'error');
                        throw new Error('Error processing new message data');
                    }
                })
                .catch((error: Error) => {
                    const errorMessage = error.message || 'Error creating chat message prompt';
                    log(`${errorMessage}: ${String(error)}`, 'error');
                    setError(errorMessage);
                    return null;
                });
        },
        [config.tracking?.userId, createChatMessagePromptMutation, webSearchEnabled]
    );

    const messagesQuery = useQuery<ChatSessionWithMessagesQuery, ChatSessionWithMessagesQueryVariables>({
        query: CHAT_SESSION_QUERY,
        pause: !chatId || chatId === 'new',
        requestPolicy,
        variables: {
            filter: {
                includeMessages: true,
                includeStatuses: true,
                sessionId: chatId,
                sessionUserId: config.tracking?.userId,
            },
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
                        query ChatSessionsRefetch($filter: ChatSessionsFilter) {
                            chatSessions(filter: $filter) {
                                id
                                createdAt
                                sources {
                                    __typename
                                    id
                                    name
                                    parent {
                                        __typename
                                        id
                                        name
                                        type
                                    }
                                    type
                                }
                                status
                                title
                                titleStatus
                                updatedAt
                                userId
                            }
                        }
                    `,
                    {
                        filter: { sessionUserId: config.tracking?.userId },
                    }
                )
                .toPromise();
            chatSessionsQuery
                .then((result) => result.data)
                .catch((err: Error) => log(`Error refetching ChatSessions query: ${err.message}`, 'error'));
        } catch (err) {
            log(`Error updating session title in cache: ${String(err)}`, 'error');
        }
        return null;
    }, [client, config.tracking?.userId]);

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
                log(`Processing chat session: ${chatSession.id}`, 'debug');

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
                            ? msg.blocks.map(normalizeContentBlock).filter(isNonNullable)
                            : [];

                        normalizedMessages.push({
                            blocks,
                            id: msg.id,
                            ordinalId: msg.ordinalId,
                            prompt: lastPromptValue, // Use the last prompt value
                            promptMessageId: msg.promptMessageId ? String(msg.promptMessageId) : undefined,
                            sources: normalizeSources(msg.sources),
                            status: ChatMessageStatus.COMPLETED,
                            timestamp: msg.createdAt,
                            type: ChatMessageType.RESPONSE,
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

                if (finalNormalizedMessages.length > 0) {
                    log(`Successfully normalized ${finalNormalizedMessages.length} messages`);
                    setMessages((existing) => {
                        const allMessages: ChatMessage[] = existing || [];
                        const existingMessageIds = new Set(existing.map((m) => m.id));
                        finalNormalizedMessages.forEach((normalizedMessage) => {
                            if (!existingMessageIds.has(normalizedMessage.id)) {
                                allMessages.push(normalizedMessage);
                            }
                        });
                        return allMessages;
                    });

                    // Extract and process all citations from messages
                    const allCitations: Citation[] = [];
                    finalNormalizedMessages.forEach((message) => {
                        if (message.type === ChatMessageType.RESPONSE && 'blocks' in message) {
                            message.blocks.forEach((block) => {
                                if (block.citations && Array.isArray(block.citations)) {
                                    allCitations.push(...block.citations);
                                }
                            });
                        }
                    });

                    // Add citations to store for global tracking
                    if (allCitations.length > 0) {
                        addCitationMarkers(allCitations);
                        log(`Added ${allCitations.length} citations to global store`);
                    }
                }

                // Clear error state
                if (error) setError(null);
            } catch (err) {
                log(`Error processing messages data: ${String(err)}`, 'error');
                setError('Error processing messages data');
                // If polling is enabled, stop it when an error occurs
                if (enablePolling) {
                    log('Stopping polling due to data normalization error', 'warn');
                    setShouldStopPolling(true);
                }
            }
        }
        // Handle error state
        else if (messagesQuery.status === 'error') {
            log(`Query error: ${String(messagesQuery.error)}`, 'error');
            setError(messagesQuery.error.message);
            // If polling is enabled, stop it when an error occurs
            if (enablePolling) {
                log('Stopping polling due to query error', 'warn');
                setShouldStopPolling(true);
            }
        }
    }, [enablePolling, error, isLoading, messagesQuery, setError, setMessages]);

    // Handle title update
    useEffect(() => {
        // Handle successful data fetches
        if (messagesQuery.status === 'success' && messagesQuery.data?.chatSession) {
            const chatSession = messagesQuery.data.chatSession;
            log(`Processing chat session title update: ${chatSession.id}`, 'debug');

            // Update chat title in store if the session got a generated title
            if (
                chatSession.title &&
                ((!chatSession.titleStatus && chatSession.title !== chatTitle) ||
                    (chatSession.titleStatus === ChatSessionTitleStatus.Generated &&
                        (!chatTitle || chatTitle === 'Untitled Chat')))
            ) {
                onSetTitle(chatSession.title);
                refreshChatSessions();
            }
        }
    }, [chatTitle, messagesQuery, onSetTitle]);

    useEffect(() => {
        // Immediately clear messages when changing sessions
        setMessages([]);
    }, [chatId]);

    // Setup polling with max refetch limit
    useEffect(() => {
        if (!enablePolling) {
            // Reset refetch count and polling
            setRefetchCount(0);
            setShouldStopPolling(false);
            return;
        }

        log(`Setting up polling interval (${POLLING_INTERVAL}ms) with max refetch count: ${MAX_REFETCH_COUNT}`);
        const intervalId = setInterval(() => {
            if (chatId && chatId !== 'new' && !shouldStopPolling) {
                messagesQuery.refetch();
                // Increment refetch count
                setRefetchCount((prevCount) => {
                    const newCount = prevCount + 1;
                    log(`Refetch count: ${newCount}/${MAX_REFETCH_COUNT}`);
                    // Check if we've reached the limit
                    if (newCount >= MAX_REFETCH_COUNT) {
                        log(`Reached max refetch count (${MAX_REFETCH_COUNT}). Stopping polling.`);
                        setShouldStopPolling(true);
                    }

                    return newCount;
                });
            }
        }, POLLING_INTERVAL);

        return () => {
            log('Clearing polling interval');
            clearInterval(intervalId);
        };
    }, [chatId, enablePolling, messagesQuery, shouldStopPolling, setRefetchCount, setShouldStopPolling]);

    const refresh = useCallback(() => {
        if (enablePolling) {
            log('Refreshing chat messages and resetting polling limits...');
            // Reset refetch count and polling state when manually refreshing
            setMessages([]);
            setRefetchCount(0);
            setShouldStopPolling(false);
            messagesQuery.refetch();
            log(
                `Polling reset. Will continue for up to ${MAX_REFETCH_COUNT} more refetches (${
                    MAX_POLLING_DURATION / 1000 / 60 / 60
                } hours).`
            );
        } else {
            messagesQuery.refetch({ requestPolicy: 'network-only' });
        }
    }, [
        chatId,
        enablePolling,
        messagesQuery,
        MAX_REFETCH_COUNT,
        MAX_POLLING_DURATION,
        setMessages,
        setRefetchCount,
        setShouldStopPolling,
    ]);

    return {
        createChatMessagePrompt,
        error,
        isLoading,
        messages,
        setMessages,
        refresh,
    };
};
