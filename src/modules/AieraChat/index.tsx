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
import { useAbly, CHANNEL_PREFIX } from './services/ably';
import { useChatSessions } from './services/chats';
import { ChatMessage } from './services/messages';
import { RealtimeChannel, Message } from 'ably';

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
        onSetTitle,
        onSetUserId,
        selectedSource,
        setHasChanges,
        sources,
    } = useChatStore();

    const config = useConfig();
    const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

    // Set up Ably realtime client
    const { createAblyRealtimeClient, subscribeToChannel, unsubscribeFromChannel } = useAbly();
    const [clientReady, setClientReady] = useState(false);
    const initializingRef = useRef(false);
    const clientRef = useRef<Ably.Realtime | null>(null);
    const subscribedTitleChannel = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (
            (!chatUserId && config.tracking?.userId) ||
            (chatUserId && config.tracking?.userId && chatUserId !== config.tracking?.userId)
        ) {
            log(`Updating chat user id in global state to: ${config.tracking.userId}`);
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
        log(`Initializing Ably client in component with userId: ${chatUserId}`);

        // Wait a tick before calling the mutation to let the state update finish (avoids race condition)
        setTimeout(
            () =>
                void createAblyRealtimeClient(chatUserId)
                    .then((client) => {
                        if (client) {
                            clientRef.current = client;

                            // Listen for connection events
                            const onConnected = () => {
                                log('Ably client connected in component');
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

    const {
        clearSources,
        createSession,
        deleteSession,
        isLoading,
        sessions,
        updateSession,
        updateSessionTitleLocally,
    } = useChatSessions();
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

    // Subscribe to title updates channel
    useEffect(() => {
        let currentChannel: RealtimeChannel | null;

        const handleTitleChannelSwitch = async () => {
            const titleChannelName = chatId !== 'new' ? `${CHANNEL_PREFIX}:${chatId}:title` : '';
            // If we're switching to a chat with a title channel
            if (
                titleChannelName &&
                (!subscribedTitleChannel.current || subscribedTitleChannel.current.name !== titleChannelName)
            ) {
                // Store reference to the old channel
                const oldChannel = subscribedTitleChannel.current;

                // Clear the subscribed channel state immediately
                subscribedTitleChannel.current = null;

                // Detach from old channel if it exists
                if (oldChannel) {
                    log(`Detaching from old title channel: ${oldChannel.name}`);
                    await unsubscribeFromChannel(oldChannel.name);
                }

                // Now subscribe to the new channel
                try {
                    log(`Subscribing to title channel: ${titleChannelName}`);
                    const channel = subscribeToChannel(titleChannelName);
                    if (channel) {
                        currentChannel = channel;

                        // Set up custom message handler for title updates
                        const titleMessageHandler = (message: Message) => {
                            try {
                                const data = message.data as { title: string };
                                if (data.title) {
                                    log(`Received title update: ${data.title}`);
                                    onSetTitle(data.title);

                                    // Update the sessions list locally to reflect the new title in the Menu panel
                                    updateSessionTitleLocally(chatId, data.title);
                                }
                            } catch (err) {
                                log(`Error handling title message: ${String(err)}`, 'error');
                            }
                        };

                        // Subscribe to title updates
                        void channel
                            .attach()
                            .then(() => {
                                void channel.subscribe(titleMessageHandler);
                                log(`Successfully subscribed to title channel ${titleChannelName}`);
                            })
                            .catch((e) =>
                                log(`Error attaching title channel ${titleChannelName}: ${String(e)}`, 'error')
                            );

                        subscribedTitleChannel.current = channel;
                    }
                } catch (e) {
                    log(`Failed to subscribe to title channel ${titleChannelName}: ${String(e)}`, 'error');
                }
            }

            // If switching to 'new' chat or no title channel, unsubscribe from any existing channel
            if (!titleChannelName && subscribedTitleChannel.current) {
                const channelToUnsubscribe = subscribedTitleChannel.current.name;
                subscribedTitleChannel.current = null;
                await unsubscribeFromChannel(channelToUnsubscribe);
            }
        };

        void handleTitleChannelSwitch();

        // Cleanup function
        return () => {
            // Clean up the current channel if it exists
            if (currentChannel) {
                const channelName = currentChannel.name;
                log(`Cleanup: detaching from title channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }

            // Also clean up any subscribed channel that might still be set
            if (subscribedTitleChannel.current && subscribedTitleChannel.current.name !== currentChannel?.name) {
                const channelName = subscribedTitleChannel.current.name;
                log(`Cleanup: detaching from subscribed title channel ${channelName}`);
                void unsubscribeFromChannel(channelName);
            }
        };
    }, [chatId, onSetTitle, subscribeToChannel, unsubscribeFromChannel, updateSessionTitleLocally]);

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
                <Header onChangeTitle={handleTitleChange} onOpenMenu={onOpenMenu} />
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
