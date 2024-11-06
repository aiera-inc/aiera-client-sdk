import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useState } from 'react';
import { Header } from './Header';
import { Menu } from './Menu';
import { Messages } from './Messages';
import { Sources } from './Sources';
import './styles.css';
import { Settings } from './Settings';

interface AieraChatSharedProps {}

/** @notExported */
// interface AieraChatUIProps extends AieraChatSharedProps {}

export function AieraChatUI(): ReactElement {
    const config = useConfig();
    const [showMenu, setShowMenu] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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

    const onOpenSettings = useCallback(() => {
        setShowSettings(true);
    }, []);

    const onCloseSettings = useCallback(() => {
        setShowSettings(false);
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
            <Header onOpenMenu={onOpenMenu} onOpenSources={onOpenSources} onOpenSettings={onOpenSettings} />
            <Messages />
            {showSources && <Sources onClose={onCloseSources} />}
            {showMenu && <Menu onClose={onCloseMenu} />}
            {showSettings && <Settings onClose={onCloseSettings} />}
        </div>
    );
}

/** @notExported */
export interface AieraChatProps extends AieraChatSharedProps {}

/**
 * Renders AieraChat
 */
export function AieraChat(): ReactElement {
    // const config = useConfig();
    // const scrollRef = useRef<HTMLDivElement>(null);
    // useAutoTrack('View', 'AieraChat', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);
    return <AieraChatUI />;
}
