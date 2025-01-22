import gql from 'graphql-tag';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@aiera/client-sdk/api/client';
import { ChatSessionsQuery, ChatSessionsQueryVariables } from '@aiera/client-sdk/types/generated';

interface ChatSession {
    id: string;
    title: string;
}

interface UseChatSessionsReturn {
    sessions: ChatSession[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        sessions,
        isLoading,
        error,
        refresh,
    };
};
