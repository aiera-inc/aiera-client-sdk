import gql from 'graphql-tag';
import { ErrorInfo, Realtime, TokenDetails, TokenParams, TokenRequest } from 'ably';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatMessage } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { CreateAblyTokenMutation, CreateAblyTokenMutationVariables } from '@aiera/client-sdk/types';

interface AblyToken {
    clientId: string;
}

interface UseAblyReturn {
    ably: Realtime | undefined;
    createAblyToken: (session_id?: string) => Promise<AblyToken | null>;
    error?: string;
    isConnected: boolean;
    partialMessages: ChatMessage[];
}

type Callback = (
    error: ErrorInfo | string | null,
    tokenRequestOrDetails: TokenDetails | TokenRequest | string | null
) => void;

type TokenParamsData = {
    sessionId: string;
};

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
    const { chatId } = useChatStore();
    const [partials, setPartials] = useState<ChatMessage[]>([]);
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
        [createAblyTokenMutation]
    );

    const createAblyToken = useCallback(
        (sessionId?: string) => {
            if (!sessionId) {
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

                        // Subscribe to ably channel
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        chatChannel.subscribe((message) => {
                            try {
                                const decoder = new TextDecoder('utf-8'); // Assuming the message is UTF-8 encoded
                                const decodedMessage = decoder.decode(message.data as BufferSource);
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                const jsonObject = JSON.parse(decodedMessage);
                                console.log('Message from Ably: ', jsonObject);
                            } catch (err) {
                                setError(`Error handling message`);
                            }
                        });
                    }
                });

                ablyInstance.connection.on('failed', (err) => {
                    setError(err instanceof Error ? err.message : 'Connection to Ably failed');
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
        [authCallback, createAblyTokenMutation]
    );

    useEffect(() => {
        // Immediately clear messages when changing sessions
        setPartials([]);
    }, [chatId]);

    return { ably, createAblyToken, error, isConnected, partialMessages: partials };
};
