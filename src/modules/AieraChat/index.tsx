import { useConfig } from '@aiera/client-sdk/lib/config';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { ChangeEvent, ReactElement, useCallback, useRef, useState } from 'react';
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
    const { chatId, chatTitle, onSelectChat, onSelectSource, selectedSource } = useChatStore();
    const config = useConfig();
    const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

    const { createSession, deleteSession, sessions, isLoading } = useChatSessions();
    const [deletedSessionId, setDeletedSessionId] = useState<string | null>(null);

    const handleDeleteConfirm = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (deletedSessionId) {
                deleteSession(Number(deletedSessionId))
                    .then(() => {
                        setDeletedSessionId(null);
                        setShowConfirm(false);
                    })
                    .catch(() => setShowConfirm(false));
            }
        },
        [deletedSessionId, setDeletedSessionId]
    );

    const handleTitleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const title = e.target.value;
            if (title && chatId === 'new') {
                createSession(title)
                    .then((newSession) => {
                        if (newSession && newSession.id && newSession.title) {
                            onSelectChat(newSession.id, newSession.title);
                        }
                    })
                    .catch(() => setShowConfirm(false));
            } else if (title && chatId) {
                // implement updateChatSession mutation here
                // updateChatSession(sessionId)
                //     .then(() => onSelectChat(newSession.id, newSession.title))
                //     .catch(() => setError('Error updating chat session');
            }
        },
        [chatId, chatTitle, createSession, onSelectChat]
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
        setShowSources(false);
    }, []);

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
                <Header onOpenMenu={onOpenMenu} onTitleChange={handleTitleChange} virtuosoRef={virtuosoRef} />
                <Messages onOpenSources={onOpenSources} virtuosoRef={virtuosoRef} />
                {showSources && <Sources onClose={onCloseSources} />}
                {showMenu && (
                    <Menu isLoading={isLoading} onClickIcon={onOpenConfirm} onClose={onCloseMenu} sessions={sessions} />
                )}
                {showConfirm && <ConfirmDialog onDelete={handleDeleteConfirm} onClose={onCloseConfirm} />}
            </div>
        </>
    );
}
