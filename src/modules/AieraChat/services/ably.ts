import { Realtime, RealtimeChannel } from 'ably';
import gql from 'graphql-tag';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'urql';
import {
    ChatMessageSources,
    ChatMessageStatus,
    ChatMessageType,
} from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { CreateAblyTokenMutation, CreateAblyTokenMutationVariables, AblyData } from '@aiera/client-sdk/types';
import { Citation, ContentBlockType } from '@aiera/client-sdk/types/generated';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';
import { log } from '@aiera/client-sdk/lib/utils';

export const CHANNEL_PREFIX = 'user-chat';

interface UseAblyReturn {
    confirmation?: ChatMessageSources;
    createAblyRealtimeClient: (sessionUserId?: string) => Promise<Realtime | null>;
    error?: string;
    isStreaming: boolean;
    partials: string[];
    reset: () => Promise<void>;
    subscribeToChannel: (channelName: string) => RealtimeChannel | undefined;
}

type PartialTextBlock = {
    citations?: Citation[];
    content: string;
    type: ContentBlockType.Text;
};

interface AblyConfirmationSource {
    confirmed: boolean;
    id: number;
    name: string;
    type: string;
}

interface AblyMessageData {
    __typename: string;
    blocks?: PartialTextBlock[];
    created_at: string;
    id: string | null;
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
};

// Global state for Ably
const globalAblyState: GlobalAblyState = {
    client: undefined,
    userId: undefined,
    tokenCache: undefined,
    hookInstances: 0,
};

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
    const [confirmation, setConfirmation] = useState<ChatMessageSources | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [partials, setPartials] = useState<string[]>([]);

    // Add both a state and a ref for isStreaming
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    // Ref to avoid closure issues in the callback
    const isStreamingRef = useRef<boolean>(false);

    // Keep the ref and state in sync
    useEffect(() => {
        isStreamingRef.current = isStreaming;
    }, [isStreaming]);

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
        const channel = globalAblyState.client?.channels.get(channelName);
        // Ensure channel is attached
        if (channel) {
            channel
                .attach()
                .then(() =>
                    channel
                        .subscribe((message) => {
                            try {
                                log('Received message from Ably:', 'debug');
                                const data = message.data as AblyEncodedData;

                                // Decode the base64 string
                                let decodedData;
                                try {
                                    decodedData = atob(data.content);
                                } catch (decodingError) {
                                    log(`Error handling message: ${String(decodingError)}`, 'error');
                                    return; // ignore message if there's no encoded content
                                }

                                // Parse the JSON
                                const jsonObject = JSON.parse(decodedData) as AblyMessageData;
                                log('Decoded Ably message:', 'debug');

                                // Process the response message and update partials
                                if (jsonObject.blocks) {
                                    const parsedMessage = jsonObject.blocks?.[0]?.content;
                                    if (parsedMessage) {
                                        log('Updating partials with new parsed message:', 'debug');
                                        // Update partials state with the new message
                                        setPartials((prev) => [...prev, parsedMessage]);
                                    }
                                }

                                // If this is a source confirmation message, parse and store it in state
                                if (jsonObject.message_type === 'source_confirmation') {
                                    if (jsonObject.sources && jsonObject.sources.length > 0) {
                                        const sources: Source[] = jsonObject.sources.map((source) => ({
                                            confirmed: source.confirmed,
                                            targetId: String(source.id),
                                            targetType: source.type,
                                            title: source.name,
                                        }));
                                        const confirmation: ChatMessageSources = {
                                            confirmed: false, // user action will confirm it
                                            id: `temp-confirmation-${jsonObject.session_id}-${
                                                jsonObject.prompt_message_id ?? ''
                                            }`,
                                            ordinalId: jsonObject.ordinal_id,
                                            prompt: '', // placeholder, get text from virtuoso using the prompt id
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
                                if (data.is_final) {
                                    log('Received final partial:', 'debug');
                                    log('Stopping partials stream.');
                                    setIsStreaming(false);
                                }
                            } catch (err) {
                                log(`Error handling message: ${String(err)}`, 'error');
                                setError(`Error handling message: ${(err as Error).message}`);
                            }
                        })
                        .then(() => {
                            log(`Subscribed to Ably channel ${channelName}`);
                            if (!isStreamingRef.current) {
                                log('Starting to stream partials...');
                                // Update the streaming status if it's the first partial
                                setIsStreaming(true);
                            }
                        })
                        .catch((err) =>
                            log(`Error subscribing to Ably channel ${channelName}: ${String(err)}`, 'error')
                        )
                )
                .catch((e) => log(`Error attaching Ably channel ${channelName}: ${String(e)}`, 'error'));
        } else {
            log(`Unable to subscribe to Ably channel ${channelName} because it was not found.`, 'warn');
        }
        return channel;
    }, []);

    // Reset function
    const reset = useCallback((): Promise<void> => {
        return new Promise<void>((resolve) => {
            log('Resetting Ably state');
            requestAnimationFrame(() => {
                setConfirmation(undefined);
                setError(undefined);
                setIsStreaming(false);
                setPartials([]);
                setTimeout(resolve, 0);
            });
        });
    }, []);

    return {
        confirmation,
        createAblyRealtimeClient,
        error,
        isStreaming,
        partials,
        reset,
        subscribeToChannel,
    };
};
