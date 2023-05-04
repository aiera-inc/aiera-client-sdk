import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import './styles.css';

interface ToggleSharedProps {
    on?: boolean;
    onChange: ChangeHandler<boolean>;
    darkMode?: boolean;
}

/** @notExported */
interface ToggleUIProps extends ToggleSharedProps {}

export function ToggleUI(props: ToggleUIProps): ReactElement {
    const { on, onChange, darkMode = false } = props;

    return (
        <Tooltip
            content={
                <div className="bg-black bg-opacity-80 text-white leading-none uppercase tracking-widest px-1.5 rounded-md text-xxs font-semibold h-5 flex justify-center items-center">
                    {on ? 'On' : 'Off'}
                </div>
            }
            grow="down-left"
            openOn="hover"
            position="top-left"
            className="h-5"
            yOffset={0}
            xOffset={6}
        >
            <input
                type="checkbox"
                checked={on}
                onChange={(e) => onChange(e, { value: !on })}
                className={classNames({ toggle: !darkMode, toggle_dark: darkMode })}
            />
        </Tooltip>
    );
}

/** @notExported */
export interface ToggleProps extends ToggleSharedProps {}

/**
 * Renders Toggle
 */
export function Toggle(props: ToggleProps): ReactElement {
    const { on = false, onChange, darkMode = false } = props;
    const [darkModeState, setDarkModeState] = useState(darkMode);
    useEffect(() => {
        if (darkMode !== undefined) {
            setDarkModeState(darkMode);
        }
    }, [darkMode]);
    return <ToggleUI on={on} onChange={onChange} darkMode={darkModeState} />;
}
