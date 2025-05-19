import gql from 'graphql-tag';
import { ErrorInfo, Realtime, TokenDetails, TokenParams, TokenRequest } from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'urql';
import { ChatMessageSources } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { CreateAblyTokenMutation, CreateAblyTokenMutationVariables } from '@aiera/client-sdk/types';
// import { Citation, ContentBlockType } from '@aiera/client-sdk/types/generated';

// export const CHANNEL_PREFIX = 'user-chat';

interface UseAblyReturn {
    confirmation?: ChatMessageSources;
    createAblyRealtimeClient: (sessionUserId?: string) => Promise<Realtime | null>;
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

// type PartialTextContent = {
//     citation?: Citation;
//     value: string;
// };
//
// type PartialTextBlock = {
//     content: PartialTextContent[];
//     meta: {
//         style: 'paragraph' | 'h1' | 'h2' | 'h3';
//     };
//     type: ContentBlockType.Text;
// };
//
// interface AblyConfirmationSource {
//     confirmed: boolean;
//     id: number;
//     name: string;
//     type: string;
// }

// interface AblyMessageData {
//     __typename: string;
//     blocks?: PartialTextBlock[];
//     created_at: string;
//     id: string | null;
//     message_type: string; // 'response', 'prompt', etc.
//     ordinal_id: string | null;
//     prompt_message_id: string | null;
//     runner_version: string;
//     session_id: number;
//     sources?: AblyConfirmationSource[];
//     updated_at: string;
//     user_id: number;
// }
//
// type AblyEncodedData = {
//     content: string;
//     is_final: boolean;
// };

/**
 * Hook for getting a chat session with messages, including data normalization and error handling
 */
export const useAbly = (): UseAblyReturn => {
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
    // the auth callback (to refresh the token) and the explicit call
    const createAblyToken = useCallback(
        async (sessionUserId?: string) => {
            try {
                const response = await createAblyTokenMutation({
                    input: {
                        sessionUserId,
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
        [createAblyTokenMutation]
    );

    // Auth callback that will be passed to Ably - uses the createAblyToken function
    const authCallback = useCallback(
        async (callback: Callback, sessionUserId?: string) => {
            try {
                const result = await createAblyToken(sessionUserId);
                callback(null, result.tokenDetails);
            } catch (err) {
                const error = err instanceof Error ? err.message : 'Failed to fetch Ably token';
                console.log(error);
                callback(error, null);
            }
        },
        [createAblyToken]
    );

    const createAblyRealtimeClient = useCallback(
        async (sessionUserId?: string) => {
            try {
                // First, get the token
                const tokenResult = await createAblyToken(sessionUserId);
                // Then, initialize Ably with the auth callback for future token refreshes and return the instance
                return Promise.resolve(
                    new Realtime({
                        authCallback: (_data: TokenParams, callback: Callback) => authCallback(callback, sessionUserId),
                        clientId: tokenResult.clientId,
                    })
                );
            } catch (err) {
                setError(err instanceof Error ? `Error initializing Ably: ${err.message}` : 'Error initializing Ably');
                return Promise.resolve(null);
            }
        },
        [authCallback, createAblyToken]
    );

    const reset = useCallback((): Promise<void> => {
        return new Promise<void>((resolve) => {
            // Batch multiple state updates in a requestAnimationFrame
            // to ensure they're processed in the same render cycle
            requestAnimationFrame(() => {
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

    return {
        confirmation,
        createAblyRealtimeClient,
        error,
        isConnected,
        isStreaming,
        partials,
        reset,
    };
};
