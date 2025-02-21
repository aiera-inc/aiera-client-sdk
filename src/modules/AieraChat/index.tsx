import { useConfig } from '@aiera/client-sdk/lib/config';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { Transcript } from '../Transcript';
import { ConfirmDialog } from './modals/ConfirmDialog';
import { Header } from './components/Header';
import { Menu } from './panels/Menu';
import { Messages } from './components/Messages';
import { Sources } from './panels/Sources';
import { useChatStore } from './store';
import { useChatSessions } from './services/chats';
import { ChatMessage } from './services/messages';

export function AieraChat(): ReactElement {
    const [showMenu, setShowMenu] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { chatId, chatTitle, hasChanges, onSelectChat, onSelectSource, selectedSource, setHasChanges, sources } =
        useChatStore();

    const config = useConfig();
    const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

    const { clearSources, createSession, deleteSession, isLoading, sessions, updateSession } = useChatSessions();
    const [deletedSessionId, setDeletedSessionId] = useState<string | null>(null);

    const handleClearSources = useCallback(() => {
        if (chatId !== 'new') {
            clearSources(chatId).catch((error: Error) =>
                console.log(`Error clearing sources for session: ${error.message}`)
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
                    })
                    .catch(() => setShowConfirm(false));
            }
        },
        [deletedSessionId, setDeletedSessionId]
    );

    const handleMessageSubmit = useCallback(
        (prompt: string) => {
            if (chatId === 'new') {
                return createSession({ prompt, sources, title: chatTitle || 'Untitled Chat' })
                    .then((newSession) => {
                        if (newSession && newSession.id) {
                            onSelectChat(newSession.id, newSession.title || chatTitle, newSession.sources);
                            return newSession;
                        }
                        return null;
                    })
                    .catch((error: Error) => {
                        console.log(`Error creating chat session: ${error.message}`);
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
                    console.log(`Error updating session title: ${error.message}`)
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
                    console.log(`Error updating session sources: ${error.message}`);
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

    return (
        <>
            {selectedSource && (
                <div
                    className={classNames('fixed inset-0 slideInFromRight z-[100]', {
                        slideOutToRight: animateTranscriptExit,
                    })}
                    onAnimationEnd={onTranscriptAnimationEnd}
                >
                    <Transcript
                        onBackHeader="Back"
                        eventId={selectedSource.targetId}
                        onBack={onAnimateTranscriptExit}
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
        </>
    );
}
