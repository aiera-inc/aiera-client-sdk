import gql from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'urql';
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
    CreateChatSessionMutation,
    CreateChatSessionMutationVariables,
    DeleteChatSessionMutation,
    DeleteChatSessionMutationVariables,
    UpdateChatSessionInput,
    UpdateChatSessionMutation,
    UpdateChatSessionMutationVariables,
} from '@aiera/client-sdk/types/generated';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatMessageStatus, ChatMessageType } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { ChatSession, ChatSessionWithPromptMessage } from '@aiera/client-sdk/modules/AieraChat/services/types';

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

function mapSourcesToInput(sources?: Source[] | null): ChatSourceInput[] | null {
    return sources && sources.length > 0
        ? sources.map((source: Source) => ({
              confirmed: source.confirmed === undefined ? false : source.confirmed,
              sourceId: source.targetId,
              sourceName: source.title,
              sourceType: source.targetType as ChatSourceType,
          }))
        : null;
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

export const useChatSessions = (): UseChatSessionsReturn => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const config = useConfig();

    const [_, clearSourcesChatMutation] = useMutation<
        ClearChatSessionSourcesMutation,
        ClearChatSessionSourcesMutationVariables
    >(gql`
        mutation ClearChatSessionSources($input: ClearSourcesInput!) {
            clearChatSessionSources(input: $input) {
                success
            }
        }
    `);
    const clearSources = useCallback(
        (sessionId: string) => {
            return clearSourcesChatMutation({ input: { sessionId, sessionUserId: config.tracking?.userId } })
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
        [config.tracking?.userId, clearSourcesChatMutation, setError, setSessions]
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
            return createChatMutation({
                input: { prompt, sessionUserId: config.tracking?.userId, sources: mapSourcesToInput(sources), title },
            })
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
        [config.tracking?.userId, createChatMutation, setError, setSessions]
    );

    const [___, deleteChatMutation] = useMutation<DeleteChatSessionMutation, DeleteChatSessionMutationVariables>(gql`
        mutation DeleteChatSession($input: DeleteChatSessionInput!) {
            deleteChatSession(input: $input) {
                success
            }
        }
    `);
    const deleteSession = useCallback(
        (sessionId: string) => {
            return deleteChatMutation({ input: { sessionId, sessionUserId: config.tracking?.userId } })
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
        [config.tracking?.userId, deleteChatMutation, setError, setSessions]
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
            const input: UpdateChatSessionInput = { sessionId, sessionUserId: config.tracking?.userId };
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
        [config.tracking?.userId, setError, setSessions, updateChatMutation]
    );

    const chatSessionsQuery = useQuery<ChatSessionsQuery, ChatSessionsQueryVariables>({
        query: gql`
            query ChatSessions($filter: ChatSessionsFilter) {
                chatSessions(filter: $filter) {
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
        variables: {
            filter: { sessionUserId: config.tracking?.userId },
        },
    });

    // Debug logging for chat sessions query
    useEffect(() => {
        log(
            '[ChatSessions] Query state: ' +
                JSON.stringify({
                    userId: config.tracking?.userId,
                    status: chatSessionsQuery.status,
                    data:
                        chatSessionsQuery.status === 'success' ? chatSessionsQuery.data?.chatSessions?.length || 0 : 0,
                    error: chatSessionsQuery.status === 'error' ? chatSessionsQuery.error?.message || null : null,
                }),
            'info'
        );
    }, [config.tracking?.userId, chatSessionsQuery]);

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
