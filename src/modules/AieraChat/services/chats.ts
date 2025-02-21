import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import {
    ChatMessagePrompt,
    ChatSession as RawChatSession,
    ChatSessionsQuery,
    ChatSessionsQueryVariables,
    ChatSessionStatus,
    ChatSource,
    ChatSourceInput,
    ChatSourceType,
    ClearChatSessionSourcesMutation,
    ClearChatSessionSourcesMutationVariables,
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

export interface ChatSession {
    createdAt: string;
    id: string;
    sources?: Source[];
    status: ChatSessionStatus;
    title: string | null;
    updatedAt: string;
    userId: string;
}

export interface ChatSessionWithPromptMessage extends ChatSession {
    promptMessage?: {
        id: string;
        ordinalId?: string | null;
        prompt: string;
        status: ChatMessageStatus;
        timestamp: string;
        type: ChatMessageType;
    };
}

export interface UseChatSessionsReturn {
    clearSources: (sessionId: string) => Promise<void>;
    createSession: (input: {
        prompt?: string;
        sources?: Source[];
        title?: string;
    }) => Promise<ChatSessionWithPromptMessage | null>;
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
        sources.forEach((source) => {
            normalized.push({
                confirmed: true,
                targetId: source.id,
                targetType: source.type as string,
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
    const rawMessage = session.messages?.[0] as ChatMessagePrompt;
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

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    messages {
                        ... on ChatMessagePrompt {
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
                    }
                    sources {
                        id
                        name
                        type
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
                        id
                        name
                        type
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
                        name
                        type
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
        clearSources,
        createSession,
        deleteSession,
        error,
        isLoading,
        refresh,
        sessions,
        updateSession,
    };
};
