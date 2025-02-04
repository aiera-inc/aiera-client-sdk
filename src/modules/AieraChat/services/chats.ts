import gql from 'graphql-tag';
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSourceInput,
    ChatSourceType,
    CreateChatSessionMutation,
    CreateChatSessionMutationVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
    UpdateChatSessionMutation,
    UpdateChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';

export interface ChatSession {
    id: string;
    title?: string | null;
}

interface UseChatSessionsReturn {
    createSession: (input: { prompt?: string; sources?: Array<Source>; title?: string }) => Promise<ChatSession | null>;
    deleteSession: (sessionId: string) => Promise<void>;
    error: string | null;
    isLoading: boolean;
    refresh: () => void;
    sessions: ChatSession[];
    updateSession: (sessionId: string, title: string) => Promise<void>;
}

function mapSourcesToInput(sources?: Array<Source>): Array<ChatSourceInput> {
    return (sources || []).map((source: Source) => ({
        confirmed: source.confirmed,
        sourceId: source.targetId,
        sourceName: source.title,
        sourceType: source.targetType as ChatSourceType,
    }));
}

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [_, createChatMutation] = useMutation<CreateChatSessionMutation, CreateChatSessionMutationVariables>(gql`
        mutation CreateChatSession($input: CreateChatSessionInput!) {
            createChatSession(input: $input) {
                chatSession {
                    id
                    title
                }
            }
        }
    `);
    const createSession = useCallback(
        ({ prompt, sources, title }: { prompt?: string; sources?: Array<Source>; title?: string }) => {
            return createChatMutation({ input: { prompt, sources: mapSourcesToInput(sources), title } })
                .then((resp) => {
                    const newSession = resp.data?.createChatSession?.chatSession as ChatSession;
                    if (newSession) {
                        setSessions((prevSessions) => [...prevSessions, newSession]);
                        return newSession;
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

    const [__, deleteChatMutation] = useMutation<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>(gql`
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

    const [___, updateChatMutation] = useMutation<UpdateChatSessionMutation, UpdateChatSessionMutationVariables>(gql`
        mutation UpdateChatSession($input: UpdateChatSessionInput!) {
            updateChatSession(input: $input) {
                chatSession {
                    id
                    title
                }
            }
        }
    `);
    const updateSession = useCallback(
        (sessionId: string, title: string) => {
            return updateChatMutation({ input: { sessionId, title } })
                .then((resp) => {
                    const updatedSession = resp.data?.updateChatSession as ChatSession;
                    if (updatedSession) {
                        setSessions((prevSessions) =>
                            prevSessions.filter((session) => {
                                if (session.id === sessionId) {
                                    return { id: session.id, title: session.title };
                                } else {
                                    return session;
                                }
                            })
                        );
                    } else {
                        setError('Error deleting chat session');
                    }
                })
                .catch(() => {
                    setError('Error deleting chat session');
                });
        },
        [deleteChatMutation, sessions, setError, setSessions]
    );

    const query = useQuery<ChatSessionsQuery, ChatSessionsQueryVariables>({
        query: gql`
            query ChatSessions {
                chatSessions {
                    id
                    title
                }
            }
        `,
        requestPolicy: 'cache-and-network',
    });

    // Update state based on query status
    useEffect(() => {
        if (query.status === 'success') {
            setSessions(query.data.chatSessions);
        } else if (query.status === 'error') {
            setError(query.error.message);
        }
        if (!isLoading && query.status === 'loading') {
            setIsLoading(true);
        } else if (isLoading && query.status !== 'loading') {
            setIsLoading(false);
        }
    }, [query, isLoading]);

    // Use useCallback to memoize the fetch function
    const fetchSessions = useCallback(() => {
        try {
            setIsLoading(true);
            setError(null);
            query.refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [query, setError, setIsLoading, setSessions]);

    const refresh = () => {
        fetchSessions();
    };

    return {
        createSession,
        deleteSession,
        error,
        isLoading,
        refresh,
        sessions,
        updateSession,
    };
};
