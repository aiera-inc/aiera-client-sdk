import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useState } from 'react';
import { Header } from './Header';
import { Menu } from './Menu';
import { Messages } from './Messages';
import { Sources } from './Sources';
import './styles.css';
import { ConfirmDialog } from './ConfirmDialog';

interface AieraChatSharedProps {}

/** @notExported */
interface AieraChatUIProps extends AieraChatSharedProps {
    showMenu: boolean;
    setShowMenu: (v: boolean) => void;
    showSources: boolean;
    setShowSources: (v: boolean) => void;
    showConfirm: boolean;
    setShowConfirm: (v: boolean) => void;
}

export function AieraChatUI({
    showMenu,
    setShowMenu,
    setShowConfirm,
    showConfirm,
    showSources,
    setShowSources,
}: AieraChatUIProps): ReactElement {
    const config = useConfig();

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

    let darkMode = false;

    if (config.options) {
        if (config.options.darkMode !== undefined) {
            darkMode = config.options.darkMode;
        }
    }

    return (
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
            <Header onOpenMenu={onOpenMenu} />
            <Messages onOpenSources={onOpenSources} />
            {showSources && <Sources onClose={onCloseSources} />}
            {showMenu && <Menu currentChatId="1" onClose={onCloseMenu} onOpenConfirm={onOpenConfirm} />}
            {showConfirm && <ConfirmDialog onClose={onCloseConfirm} />}
        </div>
    );
}

/** @notExported */
export interface AieraChatProps extends AieraChatSharedProps {}

/**
 * Renders AieraChat
 */
export function AieraChat(): ReactElement {
    const [showMenu, setShowMenu] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // const config = useConfig();
    // const scrollRef = useRef<HTMLDivElement>(null);
    // useAutoTrack('View', 'AieraChat', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);
    return (
        <AieraChatUI
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            showSources={showSources}
            setShowSources={setShowSources}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
        />
    );
}
