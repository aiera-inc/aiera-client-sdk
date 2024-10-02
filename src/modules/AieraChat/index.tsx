import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';
import React, { ReactElement } from 'react';
import './styles.css';
import { Header } from './Header';

interface AieraChatSharedProps {}

/** @notExported */
// interface AieraChatUIProps extends AieraChatSharedProps {}

export function AieraChatUI(): ReactElement {
    const config = useConfig();
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
            <Header title="My New Chat" />
            <div className="flex-1">chat</div>
            <div>footer</div>
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
