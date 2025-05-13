import gql from 'graphql-tag';
import { ErrorInfo, Realtime, TokenDetails, TokenParams, TokenRequest } from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'urql';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { CreateAblyTokenMutation, CreateAblyTokenMutationVariables } from '@aiera/client-sdk/types';
import { Citation, ContentBlockType } from '@aiera/client-sdk/types/generated';
import {
    ChatMessageSources,
    ChatMessageStatus,
    ChatMessageType,
} from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';

interface AblyToken {
    clientId: string;
}

interface UseAblyReturn {
    ably?: Realtime;
    confirmation?: ChatMessageSources;
    createAblyToken: (sessionId: string) => Promise<AblyToken | null>;
    error?: string;
    isConnected: boolean;
    isStreaming: boolean;
    partials: string[];
    reset: () => Promise<void>;
}

type Callback = (
    error: ErrorInfo | string | null,
    tokenRequestOrDetails: TokenDetails | TokenRequest | string | null
) => void;

type PartialTextContent = {
    citation?: Citation;
    value: string;
};

type PartialTextBlock = {
    content: PartialTextContent[];
    meta: {
        style: 'paragraph' | 'h1' | 'h2' | 'h3';
    };
    type: ContentBlockType.Text;
};

type TokenParamsData = {
    sessionId: string;
};

// Interface for the base structure of the message data
interface AblyConfirmationSource {
    confirmed: boolean;
    id: number;
    name: string;
    type: string;
}

interface AblyMessageData {
    __typename: string;
    blocks?: PartialTextBlock[];
    id: string | null;
    created_at: string;
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

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
    const [ably, setAbly] = useState<Realtime | undefined>(undefined);
    const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<ChatMessageSources | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [partials, setPartials] = useState<string[]>([]);

    // Add both a state and a ref for isStreaming
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    // Ref to avoid closure issues in the callback
    const isStreamingRef = useRef<boolean>(false);

    // Keep the ref and state in sync
    useEffect(() => {
        isStreamingRef.current = isStreaming;
    }, [isStreaming]);

    const config = useConfig();

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

    // This function handles the actual token creation, will be used by both
    // the auth callback and the explicit call
    const getAblyToken = useCallback(
        async (sessionId: string) => {
            try {
                const response = await createAblyTokenMutation({
                    input: {
                        sessionId,
                        sessionUserId: config.tracking?.userId,
                    },
                });

                const tokenData = response.data?.createAblyToken?.data;
                if (tokenData) {
                    return {
                        tokenDetails: {
                            mac: tokenData.mac,
                            capability: tokenData.capability,
                            clientId: tokenData.clientId,
                            keyName: tokenData.keyName,
                            nonce: tokenData.nonce,
                            timestamp: Number(tokenData.timestamp),
                            ttl: tokenData.ttl,
                        },
                        clientId: tokenData.clientId,
                    };
                } else {
                    throw new Error('Invalid token response');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Ably token';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [config.tracking?.userId, createAblyTokenMutation]
    );

    // Auth callback that will be passed to Ably - uses the getAblyToken function
    const authCallback = useCallback(
        async (tokenParams: TokenParamsData, callback: Callback) => {
            try {
                // Use the sessionId from the closure, not from tokenParams
                // This ensures we're using the correct session
                if (!tokenParams.sessionId) {
                    throw new Error('No active session ID');
                }

                const result = await getAblyToken(tokenParams.sessionId);
                callback(null, result.tokenDetails);
            } catch (err) {
                const error = err instanceof Error ? err.message : 'Failed to fetch Ably token';
                console.log(error);
                callback(error, null);
            }
        },
        [getAblyToken]
    );

    const createAblyToken = useCallback(
        async (sessionId: string) => {
            if (!sessionId || sessionId === 'new') {
                return Promise.resolve(null);
            }

            // If we're already connected to this session, don't reconnect
            if (ably && isConnected) {
                console.log(`Already connected to session ${sessionId}`);
                return Promise.resolve({ clientId: ably.auth.clientId });
            }

            try {
                // First, get the token
                const tokenResult = await getAblyToken(sessionId);

                // Then, initialize Ably with the auth callback for future token refreshes
                const ablyInstance = new Realtime({
                    authCallback: (data: TokenParams, callback: Callback) =>
                        authCallback({ ...data, sessionId }, callback),
                    clientId: tokenResult.clientId,
                });

                // Set up ably connection listeners
                ablyInstance.connection.on('connected', () => {
                    console.log('Connected to Ably!');
                    setIsConnected(true);
                    setError(undefined);

                    if (!channelSubscribed) {
                        setChannelSubscribed(true);
                        const channelName = `user-chat:${sessionId}`;
                        const chatChannel = ablyInstance.channels.get(channelName);
                        console.log(`Subscribed to channel ${channelName}`);

                        // Subscribe to ably channel
                        chatChannel
                            .subscribe((message) => {
                                if (!isStreamingRef.current) {
                                    console.log('Starting to stream partials...');
                                    // Update the streaming status if it's the first partial
                                    setIsStreaming(true);
                                }
                                try {
                                    console.log('Received message from Ably:', message);
                                    const data = message.data as AblyEncodedData;

                                    // Decode the base64 string
                                    let decodedData;
                                    try {
                                        decodedData = atob(data.content);
                                    } catch (decodingError) {
                                        console.log('Error handling message:', decodingError);
                                        return; // ignore message if there's no encoded content
                                    }

                                    // Parse the JSON
                                    const jsonObject = JSON.parse(decodedData) as AblyMessageData;
                                    console.log('Decoded Ably message:', jsonObject);

                                    // Process the response message and update partials
                                    if (jsonObject.blocks) {
                                        const parsedMessage = jsonObject.blocks?.[0]?.content?.[0]?.value;
                                        if (parsedMessage) {
                                            console.log('Updating partials with new parsed message:', parsedMessage);
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
                                                id: `temp-confirmation-${sessionId}-${
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
                                        console.log('Received final partial:', data);
                                        console.log('Stopping partials stream.');
                                        setIsStreaming(false);
                                    }
                                } catch (err) {
                                    console.error('Error handling message:', err);
                                    setError(`Error handling message: ${(err as Error).message}`);
                                }
                            })
                            .catch((err: Error) => console.log('Error with Ably channel subscription', err.message));
                    }
                });

                ablyInstance.connection.on('failed', (err) => {
                    setError(err?.reason?.message || 'Connection to Ably failed');
                    setIsConnected(false);
                });

                ablyInstance.connection.on('disconnected', () => {
                    setIsConnected(false);
                    const channelName = `user-chat:${sessionId}`;
                    const chatChannel = ablyInstance.channels.get(channelName);
                    chatChannel.unsubscribe();
                });

                setAbly(ablyInstance);

                // Return client ID from our initial token request
                return { clientId: tokenResult.clientId };
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error initializing Ably');
                return Promise.resolve(null);
            }
        },
        [authCallback, getAblyToken, channelSubscribed, isStreamingRef, ably, isConnected]
    );

    const reset = useCallback((): Promise<void> => {
        return new Promise<void>((resolve) => {
            // Batch multiple state updates in a requestAnimationFrame
            // to ensure they're processed in the same render cycle
            requestAnimationFrame(() => {
                setAbly(undefined);
                setChannelSubscribed(false);
                setConfirmation(undefined);
                setError(undefined);
                setIsConnected(false);
                setIsStreaming(false);
                setPartials([]);

                // Use setTimeout with 0 delay to ensure the state updates
                // have been processed before resolving the promise
                setTimeout(() => {
                    resolve();
                }, 0);
            });
        });
    }, []);

    return { ably, confirmation, createAblyToken, error, isConnected, isStreaming, partials, reset };
};
