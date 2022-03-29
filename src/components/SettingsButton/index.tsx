import React, { ReactElement } from 'react';
import { useSettings } from '@aiera/client-sdk/lib/data';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Toggle } from '@aiera/client-sdk/components/Toggle';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import { XMark } from '@aiera/client-sdk/components/Svg/XMark';
import { Button } from '@aiera/client-sdk/components/Button';
import { useAuthContext } from '@aiera/client-sdk/lib/auth';
import './styles.css';
import { useConfig } from '@aiera/client-sdk/lib/config';

interface SettingsButtonSharedProps {
    showTextSentiment?: boolean;
    showTonalSentiment?: boolean;
    showSyncWatchlist?: boolean;
}

/** @notExported */
interface SettingsButtonUIProps extends SettingsButtonSharedProps {
    hideTooltip?: () => void;
    logout?: () => void;
}

function TooltipContent(props: SettingsButtonUIProps): ReactElement {
    const { hideTooltip, logout, showSyncWatchlist, showTextSentiment = true, showTonalSentiment = true } = props;
    const { settings, handlers } = useSettings();
    return (
        <div className="shadow-md bg-white dark:bg-bluegray-6 rounded-lg w-44 overflow-hidden p-1">
            <div className="pt-2 pb-2 px-3 font-semibold text-base flex justify-between items-center dark:text-white">
                <span>Widget Settings</span>
                <div className="cursor-pointer hover:text-blue-500" onClick={() => hideTooltip?.()}>
                    <XMark className="w-2" />
                </div>
            </div>
            <div
                className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50 dark:hover:bg-bluegray-5"
                onClick={(e) => handlers.darkMode(e, { value: !settings.darkMode })}
            >
                <Toggle on={settings.darkMode} onChange={handlers.darkMode} />
                <span className="text-sm ml-2.5 text-gray-600 dark:text-bluegray-4 group-hover:text-gray-900 dark:group-hover:text-white">
                    Dark Mode
                </span>
            </div>
            {showTextSentiment && (
                <div
                    className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50 dark:hover:bg-bluegray-5"
                    onClick={(e) => handlers.textSentiment(e, { value: !settings.textSentiment })}
                >
                    <Toggle on={settings.textSentiment} onChange={handlers.textSentiment} />
                    <span className="text-sm ml-2.5 text-gray-600 dark:text-bluegray-4 group-hover:text-gray-900 dark:group-hover:text-white">
                        Text Sentiment
                    </span>
                </div>
            )}
            {showTonalSentiment && (
                <div
                    className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50 dark:hover:bg-bluegray-5"
                    onClick={(e) => handlers.tonalSentiment(e, { value: !settings.tonalSentiment })}
                >
                    <Toggle on={settings.tonalSentiment} onChange={handlers.tonalSentiment} />
                    <span className="text-sm ml-2.5 text-gray-600 dark:text-bluegray-4 group-hover:text-gray-900 dark:group-hover:text-white">
                        Tonal Sentiment
                    </span>
                </div>
            )}
            {showSyncWatchlist && (
                <div
                    className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50 dark:hover:bg-bluegray-5"
                    onClick={(e) => handlers.syncWatchlist(e, { value: !settings.syncWatchlist })}
                >
                    <Toggle on={settings.syncWatchlist} onChange={handlers.syncWatchlist} />
                    <span className="text-sm ml-2.5 text-gray-600 dark:text-bluegray-4 group-hover:text-gray-900 dark:group-hover:text-white">
                        Sync Watchlist
                    </span>
                </div>
            )}
            {logout && (
                <div className="m-2 flex justify-end">
                    <Button kind="primary" onClick={logout}>
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
}

export function SettingsButtonUI({
    logout,
    showSyncWatchlist,
    showTextSentiment,
    showTonalSentiment,
}: SettingsButtonUIProps): ReactElement {
    return (
        <Tooltip
            content={({ hideTooltip }) => (
                <TooltipContent
                    hideTooltip={hideTooltip}
                    logout={logout}
                    showSyncWatchlist={showSyncWatchlist}
                    showTextSentiment={showTextSentiment}
                    showTonalSentiment={showTonalSentiment}
                />
            )}
            grow="down-left"
            modal
            openOn="click"
            position="bottom-right"
            yOffset={5}
        >
            <Button iconButton className="items-center flex w-[34px] settings_button ml-2" kind="secondary">
                <Gear className="w-5" />
            </Button>
        </Tooltip>
    );
}

/** @notExported */
export interface SettingsButtonProps extends SettingsButtonSharedProps {}

/**
 * Renders SettingsButton
 */
export function SettingsButton(props: SettingsButtonProps): ReactElement | null {
    const { showSyncWatchlist, showTextSentiment, showTonalSentiment } = props;
    const { logout } = useAuthContext();
    const config = useConfig();

    if (config.hideSettings) {
        return null;
    }
    return (
        <SettingsButtonUI
            logout={logout}
            showSyncWatchlist={showSyncWatchlist}
            showTextSentiment={showTextSentiment}
            showTonalSentiment={showTonalSentiment}
        />
    );
}
