import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { ErrorInfo, Realtime, TokenDetails, TokenParams, TokenRequest } from 'ably';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatMessagePrompt,
    ChatSession as RawChatSession,
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSource,
    ChatSourceInput,
    ChatSourceType,
    ClearChatSessionSourcesMutation,
    ClearChatSessionSourcesMutationVariables,
    CreateAblyTokenMutation,
    CreateChatSessionMutation,
    CreateChatSessionMutationVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
    UpdateChatSessionInput,
    UpdateChatSessionMutation,
    UpdateChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatMessageStatus, ChatMessageType } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { ChatSession, ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';

export interface AblyToken {
    client_id: string;
}

export interface UseChatSessionsReturn {
    ably: Realtime | null;
    channelSubscribed: boolean;
    clearSources: (sessionId: string) => Promise<void>;
    createAblyToken: (session_id?: string) => Promise<AblyToken | null>;
    createSession: (input: {
        prompt?: string;
        sources?: Source[];
        title?: string;
    }) => Promise<ChatSessionWithPromptMessage | null>;
    deleteSession: (sessionId: string) => Promise<void>;
    error: string | null;
    isConnected: boolean;
    isLoading: boolean;
    refresh: () => void;
    sessions: ChatSession[];
    updateSession: (input: { sessionId: string; sources?: Source[]; title?: string }) => Promise<void>;
}

function mapSourcesToInput(sources?: Source[] | null): ChatSourceInput[] {
    return (sources || []).map((source: Source) => ({
        confirmed: source.confirmed,
        sourceId: source.targetId,
        sourceName: source.title,
        sourceType: source.targetType as ChatSourceType,
    }));
}

function normalizeSources(sources?: ChatSource[]): Source[] {
    const normalized: Source[] = [];
    if (sources && sources.length > 0) {
        sources.forEach((source) => {
            normalized.push({
                confirmed: true,
                targetId: source.sourceId,
                targetType: source.type,
                title: source.name,
            });
        });
    }
    return normalized;
}

function normalizeSession(session: RawChatSession): ChatSession {
    return {
        createdAt: session.createdAt,
        id: session.id,
        sources: normalizeSources(session.sources || []),
        status: session.status,
        title: session.title || 'Untitled Chat',
        updatedAt: session.updatedAt,
        userId: session.userId,
    } as ChatSession;
}

function normalizeSessionWithPromptMessage(session: RawChatSession): ChatSessionWithPromptMessage | undefined {
    const rawMessage = session.promptMessages?.[0] as ChatMessagePrompt;
    let promptMessage;
    if (rawMessage) {
        promptMessage = {
            id: rawMessage.id,
            ordinalId: rawMessage.ordinalId,
            prompt: rawMessage.content,
            status: ChatMessageStatus.COMPLETED,
            timestamp: rawMessage.createdAt,
            type: ChatMessageType.PROMPT,
        };
    }
    return {
        ...normalizeSession(session),
        promptMessage,
    };
}

type TokenParamsData = {
    sessionId: string;
};

type Callback = (
    error: string | ErrorInfo | null,
    tokenRequestOrDetails: string | TokenDetails | TokenRequest | null
) => void;

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ably, setAbly] = useState<Realtime | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [channelSubscribed, setChannelSubscribed] = useState(false);

    const [, createAblyTokenMutationFn] = useMutation<CreateAblyTokenMutation>(gql`
        mutation CreateAblyToken($sessionId: ID!) {
            createAblyToken(sessionId: $sessionId) {
                data {
                    keyName
                    clientId
                    ttl
                    nonce
                    capability
                    timestamp
                    mac
                }
            }
        }
    `);

    const authCallback = useCallback(
        async (tokenParams: TokenParamsData, callback: Callback) => {
            try {
                const response = await createAblyTokenMutationFn({
                    sessionId: tokenParams.sessionId,
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
        [createAblyTokenMutationFn]
    );

    const createAblyToken = useCallback(
        (session_id?: string) => {
            if (!session_id) {
                return Promise.resolve(null);
            }

            try {
                // Initialize Ably with the auth callback
                const ablyInstance = new Realtime({
                    authCallback: (data: TokenParams, callback: Callback) =>
                        authCallback({ ...data, sessionId: session_id }, callback),
                });

                // Set up ably connection listeners
                ablyInstance.connection.on('connected', () => {
                    console.log('Connected to Ably!');
                    setIsConnected(true);
                    setError(null);

                    if (!channelSubscribed) {
                        setChannelSubscribed(true);
                        const channelName = `user-chat:${session_id}`;
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
                    const channelName = `user-chat:${session_id}`;
                    const chatChannel = ablyInstance.channels.get(channelName);
                    chatChannel.unsubscribe();
                });

                setAbly(ablyInstance);

                return createAblyTokenMutationFn({ input: { sessionId: session_id } })
                    .then((resp) => {
                        const tokenData = resp.data?.createAblyToken?.data;
                        return tokenData ? { client_id: tokenData.clientId } : null;
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
        [authCallback, createAblyTokenMutationFn]
    );

    const [_, clearSourcesChatMutation] = useMutation<
        ClearChatSessionSourcesMutation,
        ClearChatSessionSourcesMutationVariables
    >(gql`
        mutation ClearChatSessionSources($sessionId: ID!) {
            clearChatSessionSources(sessionId: $sessionId) {
                success
            }
        }
    `);
    const clearSources = useCallback(
        (sessionId: string) => {
            return clearSourcesChatMutation({ sessionId })
                .then((resp) => {
                    if (resp.data?.clearChatSessionSources?.success) {
                        setSessions((prevSessions) => {
                            const indexToUpdate = prevSessions.findIndex((s) => s.id === sessionId);
                            if (indexToUpdate) {
                                const updatedSession = prevSessions[indexToUpdate];
                                if (updatedSession) {
                                    const normalizedSession = normalizeSession({
                                        ...updatedSession,
                                        sources: undefined,
                                    } as RawChatSession);
                                    return [
                                        ...prevSessions.slice(0, indexToUpdate),
                                        normalizedSession,
                                        ...prevSessions.slice(indexToUpdate + 1),
                                    ];
                                }
                            }
                            return prevSessions;
                        });
                    } else {
                        setError('Error clearing sources for chat session');
                    }
                })
                .catch(() => {
                    setError('Error clearing sources for chat session');
                });
        },
        [clearSourcesChatMutation, setError, setSessions]
    );

    const [__, createChatMutation] = useMutation<CreateChatSessionMutation, CreateChatSessionMutationVariables>(gql`
        mutation CreateChatSession($input: CreateChatSessionInput!) {
            createChatSession(input: $input) {
                chatSession {
                    id
                    createdAt
                    promptMessages {
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
                    sources {
                        confirmed
                        name
                        sourceId
                        type
                    }
                    status
                    title
                    titleStatus
                    updatedAt
                    userId
                }
            }
        }
    `);

    const createSession = useCallback(
        ({ prompt, sources, title }: { prompt?: string; sources?: Source[]; title?: string }) => {
            return createChatMutation({ input: { prompt, sources: mapSourcesToInput(sources), title } })
                .then((resp) => {
                    const newSession = resp.data?.createChatSession?.chatSession;
                    if (newSession) {
                        // Ensure we normalize the session before adding it to state and returning
                        const normalizedSession = normalizeSession(newSession as RawChatSession);
                        setSessions((prevSessions) => [...prevSessions, normalizedSession]);
                        return normalizeSessionWithPromptMessage(newSession as RawChatSession) || null;
                    } else {
                        setError('Error creating chat session');
                    }
                    return null;
                })
                .catch(() => {
                    setError('Error creating chat session');
                    return null;
                });
        },
        [createChatMutation, setError, setSessions]
    );

    const [___, deleteChatMutation] = useMutation<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>(gql`
        mutation DeleteChatSession($sessionId: ID!) {
            deleteChatSession(sessionId: $sessionId) {
                success
            }
        }
    `);
    const deleteSession = useCallback(
        (sessionId: string) => {
            return deleteChatMutation({ sessionId })
                .then((resp) => {
                    if (resp.data?.deleteChatSession?.success) {
                        setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
                    } else {
                        setError('Error deleting chat session');
                    }
                })
                .catch(() => {
                    setError('Error deleting chat session');
                });
        },
        [deleteChatMutation, setError, setSessions]
    );

    const [____, updateChatMutation] = useMutation<UpdateChatSessionMutation, UpdateChatSessionMutationVariables>(gql`
        mutation UpdateChatSession($input: UpdateChatSessionInput!) {
            updateChatSession(input: $input) {
                chatSession {
                    id
                    createdAt
                    sources {
                        confirmed
                        name
                        sourceId
                        type
                    }
                    status
                    title
                    titleStatus
                    updatedAt
                    userId
                }
            }
        }
    `);
    const updateSession = useCallback(
        ({ sessionId, sources, title }: { sessionId: string; sources?: Source[]; title?: string }) => {
            const input: UpdateChatSessionInput = { sessionId };
            // Allow nullifying the sources
            if (sources !== undefined) {
                input.sources = sources ? mapSourcesToInput(sources) : null;
            }
            if (title) {
                input.title = title;
            }
            return updateChatMutation({ input })
                .then((resp) => {
                    const updatedSession = resp.data?.updateChatSession.chatSession;
                    if (updatedSession) {
                        setSessions((prevSessions) =>
                            prevSessions.map((session) =>
                                session.id === sessionId ? normalizeSession(updatedSession) : session
                            )
                        );
                    } else {
                        setError('Error updating chat session');
                    }
                })
                .catch(() => {
                    setError('Error updating chat session');
                });
        },
        [updateChatMutation, setError, setSessions]
    );

    const chatSessionsQuery = useQuery<ChatSessionsQuery, ChatSessionsQueryVariables>({
        query: gql`
            query ChatSessions {
                chatSessions {
                    id
                    createdAt
                    sources {
                        confirmed
                        name
                        sourceId
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
        requestPolicy: 'cache-and-network',
    });

    // useEffect(() => {
    //     return () => {
    //         if (ably) {
    //             ably.close();
    //             setAbly(null);
    //             setIsConnected(false);
    //         }
    //     };
    // }, [ably]);

    // useEffect(() => {
    //     const fetchToken = async () => {
    //         try {
    //             const sessionId = '1234567'; // Test with a constant session
    //             await createAblyToken(sessionId);
    //         } catch (err) {
    //             setError(err instanceof Error ? err.message : 'An error occurred');
    //         }
    //     };
    //
    //     if (!isConnected && !ably) {
    //         // Ensure promise is awaited
    //         fetchToken().catch((err) => {
    //             console.error('Error in fetchToken:', err);
    //         });
    //     }
    // }, [ably, isConnected]);

    useEffect(() => {
        if (chatSessionsQuery.status === 'success') {
            let normalizedSessions: ChatSession[] = [];
            const rawSessions = chatSessionsQuery.data.chatSessions;
            if (rawSessions && rawSessions.length > 0) {
                normalizedSessions = rawSessions.map((s) => normalizeSession(s));
            }
            setSessions(normalizedSessions);
        } else if (chatSessionsQuery.status === 'error') {
            setError(chatSessionsQuery.error.message);
        }
        if (!isLoading && chatSessionsQuery.status === 'loading') {
            setIsLoading(true);
        } else if (isLoading && chatSessionsQuery.status !== 'loading') {
            setIsLoading(false);
        }
    }, [channelSubscribed, chatSessionsQuery, isConnected, isLoading]);

    // Use useCallback to memoize the fetch function
    const fetchSessions = useCallback(() => {
        try {
            setIsLoading(true);
            setError(null);
            chatSessionsQuery.refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [chatSessionsQuery, setError, setIsLoading, setSessions]);

    const refresh = () => {
        fetchSessions();
    };

    return {
        ably,
        channelSubscribed,
        clearSources,
        createAblyToken,
        createSession,
        deleteSession,
        error,
        isConnected,
        isLoading,
        refresh,
        sessions,
        updateSession,
    };
};
