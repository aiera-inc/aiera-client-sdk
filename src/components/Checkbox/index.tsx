import React, { MouseEvent, MouseEventHandler, ReactElement, useCallback } from 'react';

import { Check } from '@aiera/client-sdk/components/Svg/Check';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface CheckboxSharedProps {
    checked: boolean;
    className?: string;
    name?: string;
}

/** @notExported */
interface CheckboxUIProps extends CheckboxSharedProps {
    onChange?: MouseEventHandler<HTMLDivElement>;
}

export function CheckboxUI(props: CheckboxUIProps): ReactElement {
    const { checked, className = '', onChange } = props;
    const checkBoxStyles = checked ? 'bg-blue-500 shadow text-white' : 'border border-gray-300';
    return (
        <div
            className={`cursor-pointer flex h-4 items-center justify-center rounded-xl w-4 ${checkBoxStyles} ${className}`}
            onClick={onChange}
        >
            {checked && <Check className="w-2" />}
        </div>
    );
}

/** @notExported */
export interface CheckboxProps extends CheckboxSharedProps {
    onChange?: ChangeHandler<boolean>;
}

/**
 * Renders Checkbox
 */
export function Checkbox(props: CheckboxProps): ReactElement {
    const { checked, className, name, onChange } = props;
    return (
        <CheckboxUI
            checked={checked}
            className={className}
            onChange={useCallback(
                (event: MouseEvent<HTMLDivElement>) => onChange?.(event, { name, value: !checked }),
                [onChange]
            )}
        />
    );
}
