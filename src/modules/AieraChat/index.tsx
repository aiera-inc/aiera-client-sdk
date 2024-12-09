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
import { ChatMessage } from './services/messages';

export function AieraChat(): ReactElement {
    const [showMenu, setShowMenu] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { selectedSource, onSelectSource } = useChatStore();
    const config = useConfig();
    const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

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

    const onOpenConfirm = useCallback(() => {
        setShowConfirm(true);
    }, []);

    const onCloseConfirm = useCallback(() => {
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
                <Header onOpenMenu={onOpenMenu} virtuosoRef={virtuosoRef} />
                <Messages onOpenSources={onOpenSources} virtuosoRef={virtuosoRef} />
                {showSources && <Sources onClose={onCloseSources} />}
                {showMenu && <Menu onClose={onCloseMenu} onOpenConfirm={onOpenConfirm} />}
                {showConfirm && <ConfirmDialog onClose={onCloseConfirm} />}
            </div>
        </>
    );
}
