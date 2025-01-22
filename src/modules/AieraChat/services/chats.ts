import gql from 'graphql-tag';
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';

export interface ChatSession {
    id: string;
    title: string;
}

interface UseChatSessionsReturn {
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

    const [_, deleteChatMutation] = useMutation<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>(gql`
        mutation DeleteChatSession($sessionId: Int!) {
            deleteChatSession(sessionId: $sessionId) {
                success
            }
        }
    `);
    const deleteSession = useCallback(
        (sessionId: number) => {
            setIsLoading(true);
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
                    setIsLoading(false);
                })
                .finally(() => setIsLoading(false));
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
        deleteSession,
        error,
        isLoading,
        refresh,
        sessions,
    };
};
