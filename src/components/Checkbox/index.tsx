import React, { MouseEvent, MouseEventHandler, ReactElement, useCallback } from 'react';
import classNames from 'classnames';

import { Check } from '@aiera/client-sdk/components/Svg/Check';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

type CheckboxKind = 'checkbox' | 'radio';

interface CheckboxSharedProps {
    checked: boolean;
    className?: string;
    kind?: CheckboxKind;
    label?: string;
    name?: string;
    required?: boolean;
}

/** @notExported */
interface CheckboxUIProps extends CheckboxSharedProps {
    onChange?: MouseEventHandler<HTMLDivElement>;
}

export function CheckboxUI(props: CheckboxUIProps): ReactElement {
    const { checked, className = '', kind = 'checkbox', label, name, onChange, required = false } = props;
    const error = !checked && required;
    const checkBoxStyles = checked
        ? 'bg-blue-500 shadow text-white group-hover:bg-blue-600'
        : `border ${
              error ? 'border-red-600 group-hover:border-red-700' : 'border-gray-300 group-hover:border-gray-400'
          }`;
    let radius = 'rounded-sm';
    if (kind === 'radio') {
        radius = 'rounded-xl';
    }
    return (
        <div
            className={`group cursor-pointer flex items-center ${className} checkbox`}
            data-tname={name}
            onClick={onChange}
        >
            <div className={`flex flex-shrink-0 h-4 items-center justify-center ${radius} w-4 ${checkBoxStyles}`}>
                {checked && <Check className="w-2" />}
            </div>
            {label && (
                <div className={classNames('ml-2 text-sm', { 'text-red-600 group-hover:text-red-700': error })}>
                    {label}
                </div>
            )}
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
    const { checked, className, kind, label, name, onChange, required } = props;
    return (
        <CheckboxUI
            checked={checked}
            className={className}
            kind={kind}
            label={label}
            name={name}
            onChange={useCallback(
                (event: MouseEvent<HTMLDivElement>) => onChange?.(event, { name, value: !checked }),
                [onChange]
            )}
            required={required}
        />
    );
}
