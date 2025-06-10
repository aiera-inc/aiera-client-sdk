import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { log } from '@aiera/client-sdk/lib/utils';
import { Transcript } from '../Transcript';
import { ConfirmDialog } from './modals/ConfirmDialog';
import { Header } from './components/Header';
import { Menu } from './panels/Menu';
import { Messages } from './components/Messages';
import { Sources } from './panels/Sources';
import { useChatStore } from './store';
import { useAbly } from './services/ably';
import { useChatSessions } from './services/chats';
import { ChatMessage } from './services/messages';

export function AieraChat(): ReactElement {
    const [showMenu, setShowMenu] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const {
        chatId,
        chatTitle,
        chatUserId,
        hasChanges,
        onNewChat,
        onSelectChat,
        onSelectSource,
        onSetUserId,
        selectedSource,
        setHasChanges,
        sources,
    } = useChatStore();

    const config = useConfig();
    const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

    // Debug logging on mount
    useEffect(() => {
        log('[AieraChat] Component mounted with initial state:', 'info');
        log(`[AieraChat] - chatId: ${chatId}`, 'info');
        log(`[AieraChat] - chatUserId: ${chatUserId || 'undefined'}`, 'info');
        log(`[AieraChat] - config.tracking?.userId: ${config.tracking?.userId || 'undefined'}`, 'info');
        log(`[AieraChat] - virtualListKey: ${config.virtualListKey ? 'present' : 'missing'}`, 'info');
    }, []);

    // Set up Ably realtime client
    const { createAblyRealtimeClient } = useAbly();
    const [clientReady, setClientReady] = useState(false);
    const initializingRef = useRef(false);
    const clientRef = useRef<Ably.Realtime | null>(null);

    useEffect(() => {
        log(
            `[AieraChat] Config tracking userId: ${config.tracking?.userId || 'undefined'}, Current chatUserId: ${
                chatUserId || 'undefined'
            }`,
            'info'
        );
        if (
            (!chatUserId && config.tracking?.userId) ||
            (chatUserId && config.tracking?.userId && chatUserId !== config.tracking?.userId)
        ) {
            log(`[AieraChat] Updating chat user id in global state to: ${config.tracking.userId}`, 'info');
            onSetUserId(config.tracking.userId);
        }
    }, [chatUserId, config.tracking?.userId, onSetUserId]);

    // Initialize Ably client only once when the tracking user id is loaded in the config
    useEffect(() => {
        // Avoid duplicate initializations
        if (initializingRef.current || clientRef.current || !chatUserId) {
            return;
        }

        // Set initializing flag
        initializingRef.current = true;
        log(`[AieraChat] Initializing Ably client in component with userId: ${chatUserId}`, 'info');

        // Wait a tick before calling the mutation to let the state update finish (avoids race condition)
        setTimeout(
            () =>
                void createAblyRealtimeClient(chatUserId)
                    .then((client) => {
                        if (client) {
                            clientRef.current = client;

                            // Listen for connection events
                            const onConnected = () => {
                                log('[AieraChat] Ably client connected in component', 'info');
                                setClientReady(true);
                            };

                            // Check if already connected
                            if (client.connection.state === 'connected') {
                                onConnected();
                            } else {
                                client.connection.once('connected', onConnected);
                            }
                        } else {
                            log('Failed to initialize Ably client', 'error');
                        }

                        initializingRef.current = false;
                    })
                    .catch((error) => {
                        log(`Error initializing Ably client: ${String(error)}`, 'error');
                        initializingRef.current = false;
                    }),
            100
        );

        // Clean up on unmount
        return () => {
            clientRef.current = null;
            setClientReady(false);
            initializingRef.current = false;
        };
    }, [chatUserId, setClientReady]);

    const { clearSources, createSession, deleteSession, isLoading, sessions, updateSession } = useChatSessions();
    const [deletedSessionId, setDeletedSessionId] = useState<string | null>(null);

    const handleClearSources = useCallback(() => {
        if (chatId !== 'new') {
            clearSources(chatId).catch((error: Error) =>
                log(`Error clearing sources for session: ${error.message}`, 'error')
            );
        }
    }, [chatId, clearSources]);

    const handleDeleteConfirm = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (deletedSessionId) {
                deleteSession(deletedSessionId)
                    .then(() => {
                        setDeletedSessionId(null);
                        setShowConfirm(false);
                        // Start new chat if deleting the currently-selected one
                        if (chatId === deletedSessionId) {
                            onNewChat();
                        }
                    })
                    .catch(() => setShowConfirm(false));
            }
        },
        [deleteSession, deletedSessionId, onNewChat, setDeletedSessionId, setShowConfirm]
    );

    const handleMessageSubmit = useCallback(
        (prompt: string) => {
            if (chatId === 'new') {
                return createSession({ prompt, sources, title: chatTitle })
                    .then((newSession) => {
                        if (newSession && newSession.id) {
                            onSelectChat(
                                newSession.id,
                                newSession.status,
                                newSession.title || chatTitle,
                                newSession.sources
                            );
                            return newSession;
                        }
                        return null;
                    })
                    .catch((error: Error) => {
                        log(`Error creating chat session: ${error.message}`, 'error');
                        return null;
                    });
            }
            return Promise.resolve(null);
        },
        [chatId, chatTitle, createSession, onSelectChat, sources]
    );

    const handleTitleChange = useCallback(
        (title: string) => {
            if (chatId !== 'new' && title) {
                updateSession({ sessionId: chatId, title }).catch((error: Error) =>
                    log(`Error updating session title: ${error.message}`, 'error')
                );
            }
        },
        [chatId, updateSession]
    );

    const [animateTranscriptExit, setAnimateTranscriptExit] = useState(false);

    const onOpenMenu = useCallback(() => {
        setShowMenu(true);
    }, []);

    const onCloseMenu = useCallback(() => {
        setShowMenu(false);
    }, []);

    const onOpenSources = useCallback(() => {
        setShowSources(true);
    }, []);

    const onCloseSources = useCallback(() => {
        if (hasChanges && chatId !== 'new' && sources) {
            updateSession({ sessionId: chatId, sources })
                .then(() => {
                    setHasChanges(false);
                    setShowSources(false);
                })
                .catch((error: Error) => {
                    log(`Error updating session sources: ${error.message}`, 'error');
                    setHasChanges(false);
                    setShowSources(false);
                });
        } else {
            if (hasChanges) {
                setHasChanges(false);
            }
            setShowSources(false);
        }
    }, [hasChanges, setHasChanges, sources, updateSession]);

    const onOpenConfirm = useCallback((sessionId: string) => {
        setDeletedSessionId(sessionId);
        setShowConfirm(true);
    }, []);

    const onCloseConfirm = useCallback(() => {
        setDeletedSessionId(null);
        setShowConfirm(false);
    }, []);

    const onTranscriptAnimationEnd = useCallback(() => {
        if (animateTranscriptExit) {
            onSelectSource(undefined);
            setTimeout(() => {
                setAnimateTranscriptExit(false);
            });
        }
    }, [animateTranscriptExit, onSelectSource]);

    const onAnimateTranscriptExit = useCallback(() => {
        setAnimateTranscriptExit(true);
    }, []);

    let darkMode = false;

    if (config.options) {
        if (config.options.darkMode !== undefined) {
            darkMode = config.options.darkMode;
        }
    }

    return clientReady && clientRef.current ? (
        <AblyProvider client={clientRef.current}>
            {selectedSource && (
                <div
                    className={classNames('fixed inset-0 slideInFromRight z-[100]', {
                        slideOutToRight: animateTranscriptExit,
                    })}
                    onAnimationEnd={onTranscriptAnimationEnd}
                >
                    <Transcript
                        useConfigOptions
                        eventId={selectedSource.targetId}
                        initialItemId={selectedSource.contentId}
                        onBack={onAnimateTranscriptExit}
                        onBackHeader="Back"
                    />
                </div>
            )}
            <div
                className={classNames(
                    'flex flex-col relative h-full overflow-hidden',
                    {
                        dark: darkMode,
                        'bg-gray-50': !darkMode,
                    },
                    'aiera-chat'
                )}
            >
                <Header onChangeTitle={handleTitleChange} onOpenMenu={onOpenMenu} virtuosoRef={virtuosoRef} />
                <Messages onOpenSources={onOpenSources} onSubmit={handleMessageSubmit} virtuosoRef={virtuosoRef} />
                {showSources && <Sources onClearSources={handleClearSources} onClose={onCloseSources} />}
                {showMenu && (
                    <Menu isLoading={isLoading} onClickIcon={onOpenConfirm} onClose={onCloseMenu} sessions={sessions} />
                )}
                {showConfirm && <ConfirmDialog onDelete={handleDeleteConfirm} onClose={onCloseConfirm} />}
            </div>
        </AblyProvider>
    ) : (
        <div className="flex-1 flex flex-col items-center justify-center pb-3">
            <LoadingSpinner />
        </div>
    );
}
