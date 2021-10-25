import React, { useCallback, ChangeEvent, ChangeEventHandler, FocusEventHandler, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface InputSharedProps {
    children?: ReactNode;
    placeholder?: string;
    onFocus?: FocusEventHandler;
    value?: string;
    defaultValue?: string;
    className?: string;
    name: string;
}

/** @notExported */
interface InputUIProps extends InputSharedProps {
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function InputUI(props: InputUIProps): ReactElement {
    const { children, placeholder, onChange, onFocus, value, name, className = '', defaultValue } = props;
    return (
        <div className={`group h-8 items-center w-full relative ${className} input__${name}`}>
            <input
                className={classNames(
                    'w-full inset-0 absolute text-sm border border-gray-200 rounded-lg focus:shadow-input focus:border-1 focus:outline-none focus:border-blue-600 hover:border-blue-400',
                    { 'pl-7': !!children, 'pl-3': !children }
                )}
                onChange={onChange}
                onFocus={onFocus}
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
            />
            {React.isValidElement(children) && (
                <div className="pointer-events-none h-8 w-8 justify-center items-center flex">
                    {React.cloneElement(children, {
                        className:
                            'group-focus-within:stroke-current group-focus-within:text-blue-600 z-1 relative w-4',
                    })}
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface InputProps extends InputSharedProps {
    onChange?: ChangeHandler<string>;
}

/**
 * Renders Input
 */
export function Input(props: InputProps): ReactElement {
    const { children, placeholder, onChange, onFocus, value, name, className, defaultValue } = props;
    return (
        <InputUI
            placeholder={placeholder}
            onChange={useCallback(
                (event: ChangeEvent<HTMLInputElement>) =>
                    onChange?.(event, { name, value: event?.currentTarget?.value }),
                [onChange]
            )}
            onFocus={onFocus}
            defaultValue={defaultValue}
            value={value}
            className={className}
            name={name}
        >
            {children}
        </InputUI>
    );
}
