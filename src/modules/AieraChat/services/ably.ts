import gql from 'graphql-tag';
import { ErrorInfo, Realtime, TokenDetails, TokenParams, TokenRequest } from 'ably';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { CreateAblyTokenMutation, CreateAblyTokenMutationVariables } from '@aiera/client-sdk/types';
import { ChatSource, Citation, ContentBlockType } from '@aiera/client-sdk/types/generated';

interface AblyToken {
    clientId: string;
}

interface UseAblyReturn {
    ably: Realtime | undefined;
    createAblyToken: (sessionId: string) => Promise<AblyToken | null>;
    error?: string;
    isConnected: boolean;
    partials: string[];
}

type Callback = (
    error: ErrorInfo | string | null,
    tokenRequestOrDetails: TokenDetails | TokenRequest | string | null
) => void;

type TokenParamsData = {
    sessionId: string;
};

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

// Interface for the base structure of the message data
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
    sources?: ChatSource[];
    updated_at: string;
    user_id: number;
}

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
    const { chatId } = useChatStore();
    const [localChatId, setLocalChatId] = useState<string | undefined>(chatId);
    const [partials, setPartials] = useState<string[]>([]);
    const [ably, setAbly] = useState<Realtime | undefined>(undefined);
    const [channelSubscribed, setChannelSubscribed] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

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

    const authCallback = useCallback(
        async (tokenParams: TokenParamsData, callback: Callback) => {
            try {
                const response = await createAblyTokenMutation({
                    input: {
                        sessionId: tokenParams.sessionId,
                        sessionUserId: config.tracking?.userId,
                    },
                });
                const tokenData = response.data?.createAblyToken?.data;
                if (tokenData) {
                    const tokenDetails = {
                        mac: tokenData.mac,
                        capability: tokenData.capability,
                        clientId: tokenData.clientId,
                        keyName: tokenData.keyName,
                        nonce: tokenData.nonce,
                        timestamp: Number(tokenData.timestamp),
                        ttl: tokenData.ttl,
                    };
                    callback(null, tokenDetails as TokenRequest);
                } else {
                    throw new Error('Invalid token response');
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch Ably token');
                setError(error.message);
                // callback(error);
            }
        },
        [config.tracking?.userId, createAblyTokenMutation]
    );

    const createAblyToken = useCallback(
        (sessionId: string) => {
            if (!sessionId || sessionId === 'new') {
                return Promise.resolve(null);
            }

            try {
                // Initialize Ably with the auth callback
                const ablyInstance = new Realtime({
                    authCallback: (data: TokenParams, callback: Callback) =>
                        authCallback({ ...data, sessionId }, callback),
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
                                try {
                                    console.log('Received message from Ably:', message);

                                    // The data is already a string, not a BufferSource
                                    const base64EncodedData = message.data as string;

                                    // Decode the base64 string
                                    const decodedData = atob(base64EncodedData);
                                    console.log({ decodedData });

                                    // Parse the JSON
                                    const jsonObject = JSON.parse(decodedData) as AblyMessageData;
                                    console.log('Decoded Ably message:', jsonObject);

                                    // Process the message and update partials
                                    if (jsonObject.blocks) {
                                        const parsedMessage = jsonObject.blocks?.[0]?.content?.[0]?.value;
                                        if (parsedMessage) {
                                            // Update partials state with the new message
                                            setPartials((prev) => [...prev, parsedMessage]);
                                        }
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

                return createAblyTokenMutation({
                    input: { sessionId, sessionUserId: config.tracking?.userId },
                })
                    .then((resp) => {
                        console.log(`Successfully created Ably token for chat ${sessionId}`);
                        const tokenData = resp.data?.createAblyToken?.data;
                        return tokenData ? { clientId: tokenData.clientId } : null;
                    })
                    .catch(() => {
                        setError('Error creating Ably token');
                        return null;
                    });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error initializing Ably');
                return Promise.resolve(null);
            }
        },
        [authCallback, config.tracking?.userId, createAblyTokenMutation, channelSubscribed]
    );

    useEffect(() => {
        console.log(`Setting useAbly local chatId to ${chatId}`);
        setLocalChatId(chatId);
    }, [chatId]);

    useEffect(() => {
        if (localChatId && localChatId !== chatId) {
            console.log('Chat ID changed:', chatId);
            // Immediately clear messages when changing sessions
            setPartials([]);
            setChannelSubscribed(false); // Reset subscription state when chat changes
        }
    }, [chatId, localChatId]);

    return { ably, createAblyToken, error, isConnected, partials };
};
