import gql from 'graphql-tag';
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    CreateChatSessionMutation,
    CreateChatSessionMutationVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';

export interface ChatSession {
    id: string;
    title: string;
}

interface UseChatSessionsReturn {
    createSession: (title: string) => Promise<ChatSession | null>;
    deleteSession: (sessionId: number) => Promise<void>;
    error: string | null;
    isLoading: boolean;
    refresh: () => void;
    sessions: ChatSession[];
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
        (title: string) => {
            return createChatMutation({ input: { title } })
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
        [createChatMutation, setError, setIsLoading, setSessions]
    );

    const [__, deleteChatMutation] = useMutation<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>(gql`
        mutation DeleteChatSession($sessionId: Int!) {
            deleteChatSession(sessionId: $sessionId) {
                success
            }
        }
    `);
    const deleteSession = useCallback(
        (sessionId: number) => {
            return deleteChatMutation({ sessionId })
                .then((resp) => {
                    if (resp.data?.deleteChatSession?.success) {
                        setSessions((prevSessions) =>
                            prevSessions.filter((session) => session.id.toString() !== sessionId.toString())
                        );
                    } else {
                        setError('Error deleting chat session');
                    }
                })
                .catch(() => {
                    setError('Error deleting chat session');
                });
        },
        [deleteChatMutation, setError, setIsLoading, setSessions]
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
    }, [query]);

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
    };
};
