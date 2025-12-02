import { Message, Realtime, RealtimeChannel, TokenRequest } from 'ably';
import gql from 'graphql-tag';
import { useCallback, useRef, useState } from 'react';
import { useMutation } from 'urql';
import { ChatMessageType } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import {
    ChatSessionStatus,
    ChatSource,
    ChatSourceType,
    ContentBlockType,
    CreateAblyTokenMutation,
    CreateAblyTokenMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { log } from '@aiera/client-sdk/lib/utils';

export const CHANNEL_PREFIX = 'user-chat';

interface PartialChatSource {
    id: string;
    name: string;
    parent?: {
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
    quote: string;
    source: PartialChatSource;
    url?: string;
}

interface UseAblyReturn {
    citations?: Citation[];
    createAblyRealtimeClient: (sessionUserId?: string) => Promise<Realtime | null>;
    error?: string;
    partials: AblyMessageData[];
    reset: (options?: { clearCitations?: boolean }) => Promise<void>;
    sources?: ChatSource[];
    thinkingState: string[];
    subscribeToChannel: (channelName: string) => RealtimeChannel | undefined;
    unsubscribeFromChannel: (channelName: string) => Promise<void>;
}

type PartialTextBlock = {
    citations?: PartialCitation[];
    content: string;
    type: ContentBlockType.Text;
};

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
    sources?: ChatSource[];
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
}

type GlobalAblyState = {
    client?: Realtime;
    userId?: string;
    tokenCache?: AblyTokenCache;
    tokenPromise?: Promise<{ clientId: string; tokenDetails: TokenRequest } | undefined>;
    hookInstances: number;
    subscribedChannels: Set<string>;
};

// Global state for Ably
const globalAblyState: GlobalAblyState = {
    client: undefined,
    userId: undefined,
    tokenCache: undefined,
    tokenPromise: undefined,
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
    const [error, setError] = useState<string | undefined>(undefined);
    const [citations, setCitations] = useState<Citation[] | undefined>(undefined);
    const [sources, setSources] = useState<ChatSource[] | undefined>(undefined);
    const [thinkingState, setThinkingState] = useState<string[]>(['Thinking...']);
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

            // If there's already a token request in progress, return that promise
            if (globalAblyState.tokenPromise) {
                log('Reusing existing token request promise');
                return globalAblyState.tokenPromise;
            }

            // Check if we're switching users
            const currentUserId = sessionUserId || undefined;
            const previousUserId = globalAblyState.userId;
            if (previousUserId && previousUserId !== currentUserId) {
                log(`Switching users from ${previousUserId} to ${currentUserId || 'anonymous'}`);
                globalAblyState.tokenPromise = undefined;
                globalAblyState.tokenCache = undefined;
            }

            log(`Creating new token request${sessionUserId ? ` for user: ${sessionUserId}` : ' without userId'}`);

            // Create a new promise and store it immediately
            const requestId = Date.now();
            log(`Token request ID: ${requestId}`);

            globalAblyState.tokenPromise = (async () => {
                try {
                    const response = await createAblyTokenMutation(
                        {
                            input: sessionUserId ? { sessionUserId } : {},
                        },
                        {
                            requestPolicy: 'network-only', // Prevent caching to ensure fresh nonce values
                        }
                    );

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

                    // Update global cache (only store clientId and expiration, NOT the token details)
                    globalAblyState.tokenCache = {
                        clientId: tokenData.clientId,
                        expiresAt,
                    };
                    globalAblyState.userId = currentUserId;

                    log(
                        `Token request ${requestId} completed - metadata cached, expires in ${Math.floor(
                            (expiresAt - now) / 1000
                        )}s`
                    );

                    return {
                        clientId: tokenData.clientId,
                        tokenDetails,
                    };
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Ably token';
                    log(`Token error: ${errorMessage}`, 'error');
                    setError(errorMessage);
                    throw new Error(errorMessage);
                } finally {
                    // Clear the promise after completion (success or failure)
                    globalAblyState.tokenPromise = undefined;
                }
            })();

            return globalAblyState.tokenPromise;
        },
        [createAblyTokenMutation, setError]
    );

    // Function to create/get the Ably realtime client
    const createAblyRealtimeClient = useCallback(
        async (sessionUserId?: string) => {
            const currentUserId = sessionUserId || undefined;

            // If client already exists for this user (or no user), return it
            if (globalAblyState.client && globalAblyState.userId === currentUserId) {
                log(`Reusing existing Ably client${currentUserId ? ` for user: ${currentUserId}` : ' (no user ID)'}`);
                return globalAblyState.client;
            }

            // Check if there's already a token promise in flight, which means another instance is creating a client
            if (globalAblyState.tokenPromise && globalAblyState.userId === currentUserId) {
                log(`Another instance is already creating Ably client, waiting...`);
                try {
                    await globalAblyState.tokenPromise;
                    // After token promise resolves, check if client was created
                    if (globalAblyState.client) {
                        log(`Client was created by another instance, reusing it`);
                        return globalAblyState.client;
                    }
                } catch (err) {
                    log(`Error waiting for other instance: ${String(err)}`, 'error');
                }
            }

            try {
                // Close existing client if it's for a different user
                if (globalAblyState.client) {
                    const previousUser = globalAblyState.userId || 'anonymous';
                    const newUser = currentUserId || 'anonymous';
                    log(`Closing existing client (switching from ${previousUser} to ${newUser})`);
                    globalAblyState.client.close();
                    globalAblyState.client = undefined;
                    globalAblyState.tokenPromise = undefined; // Clear any pending token promises
                    globalAblyState.subscribedChannels.clear();
                }

                log(`Creating new Ably client${currentUserId ? ` for user: ${currentUserId}` : ' without user ID'}`);

                // Create new client - Ably will immediately call authCallback to get the first token
                const client = new Realtime({
                    authCallback: (_, callback) => {
                        log('Ably token auth callback triggered');

                        // Get a token (with deduplication via tokenPromise)
                        log('Getting token in auth callback');
                        getAblyToken(sessionUserId)
                            .then((token) => {
                                if (token?.tokenDetails) {
                                    log('Token obtained, returning to Ably');
                                    callback(null, token.tokenDetails);
                                } else {
                                    callback('No token details available', null);
                                }
                            })
                            .catch((err) => callback(err instanceof Error ? err.message : String(err), null));
                    },
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
                        globalAblyState.tokenPromise = undefined; // Clear any pending token promises
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
                        const binaryString = atob(data.content);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        decodedData = new TextDecoder('utf-8').decode(bytes);
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
                    if (jsonObject.message_type === 'response' && jsonObject.blocks) {
                        // Handle streaming partials
                        if (!data.is_final) {
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
                        }

                        // Parse any citations from both partials and final message
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

                        // Process sources from final message
                        if (data.is_final && jsonObject.sources) {
                            log('Processing sources from final message:', 'log', jsonObject.sources);
                            setSources(jsonObject.sources);
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
                        .history({ limit: 1000, untilAttach: true })
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

    // Reset function - accepts options to control what gets reset
    const reset = useCallback(
        (options?: { clearCitations?: boolean }): Promise<void> => {
            return new Promise<void>((resolve) => {
                log('Resetting Ably state');
                partialKeys.current = [];
                requestAnimationFrame(() => {
                    setThinkingState(['Thinking...']);
                    setError(undefined);
                    setCitations(undefined);
                    setSources(undefined);
                    setPartials([]);
                    // Only clear citation markers when explicitly requested (e.g., when switching chats)
                    if (options?.clearCitations) {
                        clearCitationMarkers();
                    }
                    setTimeout(resolve, 0);
                });
            });
        },
        [clearCitationMarkers]
    );

    return {
        citations,
        createAblyRealtimeClient,
        error,
        partials,
        reset,
        sources,
        thinkingState,
        subscribeToChannel,
        unsubscribeFromChannel,
    };
};
