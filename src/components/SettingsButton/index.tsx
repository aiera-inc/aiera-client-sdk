import React, { ReactElement } from 'react';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Toggle } from '@aiera/client-sdk/components/Toggle';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import { XMark } from '@aiera/client-sdk/components/Svg/XMark';
import { Button } from '@aiera/client-sdk/components/Button';
import './styles.css';

interface SettingsButtonSharedProps {}

/** @notExported */
interface SettingsButtonUIProps extends SettingsButtonSharedProps {
    darkMode: boolean;
    textSentiment: boolean;
    tonalSentiment: boolean;
    handleDarkMode: ChangeHandler<boolean>;
    handleTextSentiment: ChangeHandler<boolean>;
    handleTonalSentiment: ChangeHandler<boolean>;
    hideTooltip?: () => void;
}

function TooltipContent(props: SettingsButtonUIProps): ReactElement {
    const {
        hideTooltip,
        darkMode,
        textSentiment,
        tonalSentiment,
        handleDarkMode,
        handleTextSentiment,
        handleTonalSentiment,
    } = props;
    return (
        <div className="shadow-md bg-white rounded-lg w-44 overflow-hidden p-1">
            <div className="pt-2 pb-2 px-3 font-semibold text-base flex justify-between items-center">
                <span>Widget Settings</span>
                <div className="cursor-pointer hover:text-blue-500" onClick={() => hideTooltip?.()}>
                    <XMark className="w-2" />
                </div>
            </div>
            <div
                className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50"
                onClick={(e) => handleDarkMode(e, { value: !darkMode })}
            >
                <Toggle on={darkMode} onChange={handleDarkMode} />
                <span className="text-sm ml-2.5 text-gray-600 group-hover:text-gray-900">Dark Mode</span>
            </div>
            <div
                className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50"
                onClick={(e) => handleTextSentiment(e, { value: !textSentiment })}
            >
                <Toggle on={textSentiment} onChange={handleTextSentiment} />
                <span className="text-sm ml-2.5 text-gray-600 group-hover:text-gray-900">Text Sentiment</span>
            </div>
            <div
                className="rounded-lg cursor-pointer group py-2.5 px-3 flex items-center hover:bg-gray-50"
                onClick={(e) => handleTonalSentiment(e, { value: !tonalSentiment })}
            >
                <Toggle on={tonalSentiment} onChange={handleTonalSentiment} />
                <span className="text-sm ml-2.5 text-gray-600 group-hover:text-gray-900">Tonal Sentiment</span>
            </div>
        </div>
    );
}

export function SettingsButtonUI(props: SettingsButtonUIProps): ReactElement {
    const { darkMode, textSentiment, tonalSentiment, handleDarkMode, handleTextSentiment, handleTonalSentiment } =
        props;
    return (
        <Tooltip
            content={({ hideTooltip }) => (
                <TooltipContent
                    hideTooltip={hideTooltip}
                    darkMode={darkMode}
                    textSentiment={textSentiment}
                    tonalSentiment={tonalSentiment}
                    handleDarkMode={handleDarkMode}
                    handleTextSentiment={handleTextSentiment}
                    handleTonalSentiment={handleTonalSentiment}
                />
            )}
            grow="down-left"
            modal
            openOn="click"
            position="bottom-right"
            yOffset={5}
        >
            <Button className="items-center flex px-1.5 settings_button" kind="secondary">
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
export function SettingsButton(): ReactElement {
    const { state, handlers } = useChangeHandlers({
        darkMode: false,
        textSentiment: false,
        tonalSentiment: false,
    });
    return (
        <SettingsButtonUI
            darkMode={state.darkMode}
            textSentiment={state.textSentiment}
            tonalSentiment={state.tonalSentiment}
            handleDarkMode={handlers.darkMode}
            handleTextSentiment={handlers.textSentiment}
            handleTonalSentiment={handlers.tonalSentiment}
        />
    );
}
