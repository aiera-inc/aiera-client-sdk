import { Message, Realtime, RealtimeChannel } from 'ably';
import gql from 'graphql-tag';
import { useCallback, useRef, useState } from 'react';
import { useMutation } from 'urql';
import {
    ChatMessageSources,
    ChatMessageStatus,
    ChatMessageType,
} from '@aiera/client-sdk/modules/AieraChat/services/messages';
import {
    AblyData,
    ChatSessionStatus,
    ChatSourceType,
    ContentBlockType,
    CreateAblyTokenMutation,
    CreateAblyTokenMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { Source, useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { log } from '@aiera/client-sdk/lib/utils';

export const CHANNEL_PREFIX = 'user-chat';

interface PartialChatSource {
    confirmed?: boolean;
    id: string;
    name: string;
    parent?: {
        confirmed?: boolean;
        id: string;
        name: string;
        type: ChatSourceType;
    };
    type: ChatSourceType;
}

interface PartialCitation {
    author?: string;
    date?: string;
    marker: string;
    meta?: object;
    quote: string;
    source: PartialChatSource;
    url?: string;
}

interface UseAblyReturn {
    citations?: Citation[];
    confirmation?: ChatMessageSources;
    createAblyRealtimeClient: (sessionUserId?: string) => Promise<Realtime | null>;
    error?: string;
    partials: AblyMessageData[];
    reset: () => Promise<void>;
    thinkingState: string[];
    subscribeToChannel: (channelName: string) => RealtimeChannel | undefined;
    unsubscribeFromChannel: (channelName: string) => Promise<void>;
}

type PartialTextBlock = {
    citations?: PartialCitation[];
    content: string;
    type: ContentBlockType.Text;
};

interface AblyConfirmationSource {
    confirmed: boolean;
    id: number;
    name: string;
    type: string;
}

export interface AblyMessageData {
    __typename: string;
    blocks?: PartialTextBlock[];
    content?: string;
    created_at: string;
    id: string | null;
    is_final?: boolean;
    message_type: string; // 'response', 'prompt', etc.
    ordinal_id: string | null;
    prompt_message_id: string | null;
    runner_version: string;
    session_id: number;
    sources?: AblyConfirmationSource[];
    updated_at: string;
    user_id: number;
}

type AblyEncodedData = {
    content: string;
    is_final: boolean;
    prompt_message_id?: number;
};

interface AblyTokenCache {
    clientId: string;
    expiresAt?: number;
    tokenDetails: AblyData;
}

type GlobalAblyState = {
    client?: Realtime;
    userId?: string;
    tokenCache?: AblyTokenCache;
    hookInstances: number;
    subscribedChannels: Set<string>;
};

// Global state for Ably
const globalAblyState: GlobalAblyState = {
    client: undefined,
    userId: undefined,
    tokenCache: undefined,
    hookInstances: 0,
    subscribedChannels: new Set<string>(),
};

/**
 * Map raw citations coming from Kafka
 */
export function normalizeCitation(rawCitation: PartialCitation): Citation {
    const source = rawCitation.source;
    const sourceParent = source.parent;
    return {
        author: rawCitation.author || '',
        contentId: source.id,
        date: rawCitation.date as string,
        marker: rawCitation.marker,
        meta: rawCitation.meta as object,
        source: source.name,
        text: rawCitation.quote,
        url: rawCitation.url || undefined,
        sourceId: source.id,
        sourceParentId: sourceParent?.id,
        sourceParentType: sourceParent?.type,
        sourceType: rawCitation.source.type,
    };
}

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
    const { addCitationMarkers, clearCitationMarkers, onSetStatus } = useChatStore();
    const [confirmation, setConfirmation] = useState<ChatMessageSources | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [citations, setCitations] = useState<Citation[] | undefined>(undefined);
    const [thinkingState, setThinkingState] = useState<string[]>([]);
    const [partials, setPartials] = useState<AblyMessageData[]>([]);
    const partialKeys = useRef<string[]>([]);
    const shouldSkipPartial = (messageType: ChatMessageType, skipTypes?: ChatMessageType[]) =>
        (skipTypes || []).includes(messageType);

    const [, createAblyTokenMutation] = useMutation<CreateAblyTokenMutation, CreateAblyTokenMutationVariables>(gql`
        mutation CreateAblyToken($input: CreateAblyTokenInput!) {
            createAblyToken(input: $input) {
                data {
                    capability
                    clientId
                    keyName
                    mac
                    nonce
                    timestamp
                    ttl
                }
            }
        }
    `);

    // Function to get a token (from cache or fresh)
    const getAblyToken = useCallback(
        async (sessionUserId?: string) => {
            const now = Date.now();

            if (sessionUserId) {
                log(`Requesting new token for user: ${sessionUserId}`);
                try {
                    const response = await createAblyTokenMutation({
                        input: { sessionUserId },
                    });

                    const tokenData = response.data?.createAblyToken?.data;
                    if (!tokenData) {
                        throw new Error('Invalid token response');
                    }

                    // Create token details
                    const tokenDetails = {
                        mac: tokenData.mac,
                        capability: tokenData.capability,
                        clientId: tokenData.clientId,
                        keyName: tokenData.keyName,
                        nonce: tokenData.nonce,
                        timestamp: Number(tokenData.timestamp),
                        ttl: tokenData.ttl,
                    };

                    // Calculate proper expiration timestamp
                    const expiresAt = now + Number(tokenData.ttl) * 1000 - 60000; // 1 minute buffer

                    // Update global cache
                    globalAblyState.tokenCache = {
                        clientId: tokenData.clientId,
                        expiresAt,
                        tokenDetails,
                    };
                    globalAblyState.userId = sessionUserId;

                    log(`Token cached, expires in ${Math.floor((expiresAt - now) / 1000)}s`);

                    return {
                        clientId: tokenData.clientId,
                        tokenDetails,
                    };
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Ably token';
                    log(`Token error: ${errorMessage}`, 'error');
                    setError(errorMessage);
                    throw new Error(errorMessage);
                }
            }
            return undefined;
        },
        [createAblyTokenMutation]
    );

    // Function to create/get the Ably realtime client
    const createAblyRealtimeClient = useCallback(
        async (sessionUserId?: string) => {
            // If client already exists for this user, return it
            if (sessionUserId && globalAblyState.client && globalAblyState.userId === sessionUserId) {
                log(`Reusing existing Ably client for user: ${sessionUserId}`);
                return globalAblyState.client;
            }

            try {
                // Close existing client if it's for a different user
                if (globalAblyState.client) {
                    log(`Closing existing client for different user`);
                    globalAblyState.client.close();
                    globalAblyState.client = undefined;
                    globalAblyState.subscribedChannels.clear();
                }

                // Get initial token
                const initialToken = await getAblyToken(sessionUserId);

                log(`Creating new Ably client`);

                // Create new client
                const client = new Realtime({
                    authCallback: (_, callback) => {
                        log('Ably token auth callback triggered');

                        // Check if we have a valid cached token
                        const now = Date.now();
                        if (
                            globalAblyState.tokenCache &&
                            globalAblyState.tokenCache.tokenDetails &&
                            globalAblyState.tokenCache.expiresAt &&
                            globalAblyState.tokenCache.expiresAt > now
                        ) {
                            log('Using cached token in auth callback');
                            callback(null, globalAblyState.tokenCache.tokenDetails);
                            return;
                        }

                        // Otherwise get a new token
                        log('Getting fresh token in auth callback');
                        getAblyToken(sessionUserId)
                            .then((token) => callback(null, token?.tokenDetails || null))
                            .catch((err) => callback(err instanceof Error ? err.message : String(err), null));
                    },
                    clientId: initialToken?.clientId,
                });

                // Set up connection listeners
                client.connection.on('connected', () => {
                    log('Ably connection established');
                });

                client.connection.on('disconnected', () => {
                    log('Ably connection disconnected');
                });

                client.connection.on('failed', (err) => {
                    log(`Ably connection failed: ${String(err)}`, 'error');
                    setError(`Connection failed: ${err.reason?.message || ''}`);

                    // Clean up global state on failure
                    if (globalAblyState.client === client) {
                        globalAblyState.client = undefined;
                        globalAblyState.subscribedChannels.clear();
                    }
                });

                // Store in global state
                globalAblyState.client = client;

                return client;
            } catch (err) {
                log(`Error initializing Ably: ${String(err)}`, 'error');
                setError(err instanceof Error ? `Error initializing Ably: ${err.message}` : 'Error initializing Ably');
                return null;
            }
        },
        [getAblyToken]
    );

    // Function to subscribe to realtime messages for a given Ably channel
    const subscribeToChannel = useCallback((channelName: string) => {
        if (!globalAblyState.client) {
            log(`Cannot subscribe to channel ${channelName}: Ably client not initialized`, 'warn');
            return undefined;
        }

        const channel = globalAblyState.client.channels.get(channelName);
        if (channel) {
            // Check if we're already subscribed to avoid duplicate subscriptions
            if (globalAblyState.subscribedChannels.has(channelName)) {
                log(`Channel ${channelName} already subscribed, returning existing channel`);
                return channel;
            }

            const messageHandler = (
                message: Message,
                insertPosition: 'after' | 'before' = 'after',
                skipTypes?: ChatMessageType[]
            ) => {
                try {
                    const data = message.data as AblyEncodedData;
                    log('Received message from Ably:', 'debug', data);

                    // Decode the base64 string
                    let decodedData;
                    try {
                        decodedData = atob(data.content);
                    } catch (decodingError) {
                        log(`Error handling message: ${String(decodingError)}`, 'debug');
                        return; // ignore message if there's no encoded content
                    }

                    // Parse the JSON
                    const jsonObject = JSON.parse(decodedData) as AblyMessageData;

                    // Add additional properties from the encoded data
                    jsonObject.is_final = data.is_final;
                    if (data.prompt_message_id) {
                        jsonObject.prompt_message_id = String(data.prompt_message_id);
                    }
                    log('Decoded Ably message:', 'log', jsonObject);

                    // Short-circuit if we already processed this message
                    if (partialKeys.current.includes(jsonObject.created_at)) {
                        log('Skipping existing partial message:', 'log', jsonObject);
                        return;
                    } else {
                        partialKeys.current = [...partialKeys.current, jsonObject.created_at];
                    }

                    if (jsonObject.message_type === 'status' && typeof jsonObject?.content === 'string') {
                        const thinkingStatus = jsonObject.content;
                        setThinkingState((pv) => [...pv, thinkingStatus]);
                    }

                    // Process the response message and update partials
                    if (jsonObject.message_type === 'response' && jsonObject.blocks && !data.is_final) {
                        if (shouldSkipPartial(ChatMessageType.RESPONSE, skipTypes)) {
                            log(`Skipping response message due to skip types parameter: ${String(skipTypes)}`);
                            return;
                        }
                        log('Updating partials with new message', 'log', jsonObject);
                        // Update partials state with the full message object and sort by created_at
                        setPartials((prev) => {
                            const newPartials =
                                insertPosition === 'after' ? [...prev, jsonObject] : [jsonObject, ...prev];
                            // Sort by created_at in ascending order
                            return newPartials.sort(
                                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                        });

                        // Parse any citations
                        const citations = jsonObject.blocks?.[0]?.citations;
                        if (citations) {
                            log('Parsing citations:', 'log', citations);
                            const parsedCitations = citations.map(normalizeCitation);
                            if (parsedCitations) {
                                let allCitations = [...parsedCitations];
                                setCitations((prev) => {
                                    const existing = prev || [];
                                    const existingIds = new Set(
                                        existing.map((c) => `${c.contentId}${c.sourceParentId || c.sourceId}`)
                                    );
                                    allCitations = [
                                        ...existing,
                                        ...parsedCitations.filter(
                                            (c) => !existingIds.has(`${c.contentId}${c.sourceParentId || c.sourceId}`)
                                        ),
                                    ];
                                    return allCitations;
                                });

                                // Add citations to global store for consistent numbering
                                addCitationMarkers(allCitations);
                                log(`Added ${parsedCitations.length} citations to global store from Ably stream`);
                            }
                        }
                    }

                    // If this is a source confirmation message, parse and store it in state
                    if (jsonObject.message_type === 'source_confirmation') {
                        if (shouldSkipPartial(ChatMessageType.SOURCES, skipTypes)) {
                            log(
                                `Skipping source confirmation message due to skip types parameter: ${String(skipTypes)}`
                            );
                            return;
                        }
                        if (jsonObject.sources && jsonObject.sources.length > 0) {
                            const sources: Source[] = jsonObject.sources.map((source) => ({
                                confirmed: source.confirmed,
                                targetId: String(source.id),
                                targetType: source.type,
                                title: source.name,
                            }));
                            const confirmation: ChatMessageSources = {
                                confirmed: false, // user action will confirm it
                                id: `temp-confirmation-${jsonObject.session_id}-${jsonObject.prompt_message_id ?? ''}`,
                                ordinalId: jsonObject.ordinal_id,
                                prompt: '', // placeholder, get text from using the prompt id
                                promptMessageId: jsonObject.prompt_message_id
                                    ? String(jsonObject.prompt_message_id)
                                    : undefined,
                                sources,
                                status: ChatMessageStatus.COMPLETED,
                                timestamp: jsonObject.created_at,
                                type: ChatMessageType.SOURCES,
                            };
                            setConfirmation(confirmation); // overwrite
                        } else {
                            setError('Received source confirmation message without sources');
                        }
                    }

                    // Stop streaming if this is the final partial
                    // "status" messages are always sent as final, but it doesn't mean we should stop streaming
                    if (data.is_final && jsonObject.message_type !== 'status') {
                        log('Received final partial:', 'log', data);
                        onSetStatus(ChatSessionStatus.Active);
                    }
                } catch (err) {
                    log(`Error handling message: ${String(err)}`, 'error');
                    setError(`Error handling message: ${(err as Error).message}`);
                }
            };

            void channel
                .attach()
                .then(() => {
                    channel
                        .history({ untilAttach: true })
                        .then((history) => {
                            if (history && history.items && history.items.length > 0) {
                                history.items.forEach((i) =>
                                    messageHandler(i, 'before', [ChatMessageType.PROMPT, ChatMessageType.SOURCES])
                                );
                            }
                        })
                        .catch((e) => log(`Error getting channel history ${channelName}: ${String(e)}`));
                })
                .then(() => {
                    void channel.subscribe(messageHandler);
                    globalAblyState.subscribedChannels.add(channelName);
                    log(`Subscribed to Ably channel ${channelName}`);
                })
                .catch((e) => log(`Error attaching Ably channel ${channelName}: ${String(e)}`, 'error'));
        } else {
            log(`Unable to subscribe to Ably channel ${channelName} because it was not found.`, 'warn');
        }
        return channel;
    }, []);

    // Function to unsubscribe from a channel
    const unsubscribeFromChannel = useCallback(async (channelName: string): Promise<void> => {
        if (!globalAblyState.client) {
            return;
        }

        const channel = globalAblyState.client.channels.get(channelName);
        if (channel && globalAblyState.subscribedChannels.has(channelName)) {
            try {
                await channel.detach();
                channel.unsubscribe();
                globalAblyState.subscribedChannels.delete(channelName);
                log(`Unsubscribed from Ably channel ${channelName}`);
            } catch (err) {
                log(`Error unsubscribing from Ably channel ${channelName}: ${String(err)}`, 'error');
            }
        }
    }, []);

    // Reset function
    const reset = useCallback((): Promise<void> => {
        return new Promise<void>((resolve) => {
            log('Resetting Ably state');
            partialKeys.current = [];
            requestAnimationFrame(() => {
                setConfirmation(undefined);
                setThinkingState([]);
                setError(undefined);
                setCitations(undefined);
                setPartials([]);
                clearCitationMarkers();
                setTimeout(resolve, 0);
            });
        });
    }, []);

    return {
        citations,
        confirmation,
        createAblyRealtimeClient,
        error,
        partials,
        reset,
        thinkingState,
        subscribeToChannel,
        unsubscribeFromChannel,
    };
};
