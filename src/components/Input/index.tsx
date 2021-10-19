import React, { FormEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import './styles.css';

interface InputSharedProps {
    children?: ReactNode;
    placeholder?: string;
    onChange?: (event: FormEvent<HTMLInputElement>) => void;
    value?: string;
    defaultValue?: string;
    extendClassName?: string;
    name: string;
}

/** @notExported */
interface InputUIProps extends InputSharedProps {}

export function InputUI(props: InputUIProps): ReactElement {
    const { children, placeholder, onChange, value, name, extendClassName = '', defaultValue } = props;
    return (
        <div className={`group h-8 items-center w-full relative ${extendClassName} input__${name}`}>
            <input
                className={classNames(
                    'w-full inset-0 absolute text-sm border border-gray-200 rounded-lg focus:shadow-input focus:border-1 focus:outline-none focus:border-blue-600',
                    { 'pl-7': !!children, 'pl-3': !children }
                )}
                onChange={onChange}
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
export interface InputProps extends InputSharedProps {}

/**
 * Renders Input
 */
export function Input(props: InputProps): ReactElement {
    const { children, placeholder, onChange, value, name, extendClassName, defaultValue } = props;
    return (
        <InputUI
            placeholder={placeholder}
            onChange={onChange}
            defaultValue={defaultValue}
            value={value}
            extendClassName={extendClassName}
            name={name}
        >
            {children}
        </InputUI>
    );
}
