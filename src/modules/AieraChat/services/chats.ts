import { useState, useEffect, useCallback } from 'react';

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

// Simulated async fetch function
const fetchChatSessions = async (): Promise<ChatSession[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
        { id: '1', title: 'My New Chat' },
        { id: '2', title: '2024 Tech Trends' },
        { id: '3', title: 'Talking About Guidance and stuff...' },
        { id: '4', title: 'Supply Chain Disruptions and stuff' },
    ];
};

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use useCallback to memoize the fetch function
    const fetchSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchChatSessions();
            setSessions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array since it doesn't depend on any props or state

    useEffect(() => {
        void fetchSessions();
    }, [fetchSessions]);

    const refresh = async () => {
        await fetchSessions();
    };

    return {
        sessions,
        isLoading,
        error,
        refresh,
    };
};
