import gql from 'graphql-tag';
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatSession as ChatSessionType,
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSessionStatus,
    ChatSource,
    ChatSourceInput,
    ChatSourceType,
    CreateChatSessionMutation,
    CreateChatSessionMutationVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
    UpdateChatSessionInput,
    UpdateChatSessionMutation,
    UpdateChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';

export interface ChatSession {
    createdAt: string;
    id: string;
    sources?: Source[];
    status: ChatSessionStatus;
    title: string | null;
    updatedAt: string;
    userId: string;
}

interface UseChatSessionsReturn {
    createSession: (input: { prompt?: string; sources?: Source[]; title?: string }) => Promise<ChatSession | null>;
    deleteSession: (sessionId: string) => Promise<void>;
    error: string | null;
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
        sources.forEach((source: ChatSourceInput) => {
            normalized.push({
                confirmed: source.confirmed || false,
                targetId: source.sourceId,
                targetType: source.sourceType,
                title: source.sourceName,
            });
        });
    }
    return normalized;
}

function normalizeSession(session: ChatSessionType): ChatSession {
    return {
        ...session,
        sources: normalizeSources(session.sources || []),
        title: session.title || null,
    };
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
                    createdAt
                    sources {
                        id
                        confirmed
                        sourceId
                        sourceName
                        sourceType
                    }
                    status
                    title
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
                        const normalizedSession = normalizeSession(newSession);
                        setSessions((prevSessions) => [...prevSessions, normalizedSession]);
                        return normalizedSession;
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
                    createdAt
                    sources {
                        id
                        confirmed
                        sourceId
                        sourceName
                        sourceType
                    }
                    status
                    title
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
                        id
                        confirmed
                        sourceId
                        sourceName
                        sourceType
                    }
                    status
                    title
                    updatedAt
                    userId
                }
            }
        `,
        requestPolicy: 'cache-and-network',
    });

    // Update state based on query status
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
    }, [chatSessionsQuery, isLoading]);

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
        createSession,
        deleteSession,
        error,
        isLoading,
        refresh,
        sessions,
        updateSession,
    };
};
