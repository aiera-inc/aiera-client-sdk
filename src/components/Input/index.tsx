import React, {
    useCallback,
    MouseEvent,
    MouseEventHandler,
    ChangeEvent,
    ChangeEventHandler,
    FocusEventHandler,
    ReactElement,
    ReactNode,
    Ref,
} from 'react';
import classNames from 'classnames';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import './styles.css';

interface InputSharedProps {
    autoFocus?: boolean;
    className?: string;
    clearable?: boolean;
    error?: string;
    icon?: ReactNode;
    id?: string;
    inputRef?: Ref<HTMLInputElement>;
    name: string;
    onBlur?: FocusEventHandler;
    onFocus?: FocusEventHandler;
    placeholder?: string;
    type?: string;
    value?: string;
}

/** @notExported */
interface InputUIProps extends InputSharedProps {
    clear: MouseEventHandler<HTMLDivElement>;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function InputUI(props: InputUIProps): ReactElement {
    const {
        autoFocus,
        className = '',
        clear,
        clearable,
        error,
        icon,
        id,
        inputRef,
        name,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        type,
        value,
    } = props;
    return (
        <div className={`flex flex-col relative ${className} input__${name}`}>
            {error && <div className="absolute bottom-8 right-0 text-red-600 text-sm z-10">{error}</div>}
            <div className="group h-8 items-center w-full relative dark:text-white">
                {React.isValidElement(icon) && (
                    <div className="absolute pointer-events-none h-8 w-8 justify-center items-center flex">
                        {React.cloneElement(icon, {
                            className: `group-focus-within:stroke-current group-focus-within:text-${
                                error ? 'red' : 'blue'
                            }-600 z-1 relative w-4`,
                        })}
                    </div>
                )}
                <input
                    autoFocus={autoFocus}
                    className={classNames(
                        'w-full h-full text-sm border border-gray-200 rounded-lg focus:border-1 focus:outline-none dark:bg-bluegray-6 dark:border-bluegray-5',
                        {
                            'pl-7': !!icon,
                            'pl-3': !icon,
                            'border-red-600': !!error,
                            'focus:border-blue-600': !error,
                            'focus:border-red-600': !!error,
                            'focus:shadow-input': !error,
                            'focus:shadow-inputError': !!error,
                            'hover:border-blue-400': !error,
                            'hover:border-red-600': !!error,
                        }
                    )}
                    id={id}
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    ref={inputRef}
                    value={value}
                    type={type}
                />
                {clearable && value && (
                    <div
                        className="h-full absolute flex-col items-center justify-center top-0 right-2 w-3 text-gray-300 cursor-pointer hidden group-hover:flex hover:text-gray-500 active:text-gray-700"
                        onClick={clear}
                    >
                        <Close />
                    </div>
                )}
            </div>
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
    const {
        autoFocus = false,
        className,
        clearable = true,
        error,
        icon,
        id,
        inputRef,
        name,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        type = 'text',
        value,
    } = props;
    return (
        <InputUI
            autoFocus={autoFocus}
            className={className}
            clear={useCallback(
                (event: MouseEvent<HTMLDivElement>) => onChange?.(event, { name, value: '' }),
                [onChange]
            )}
            clearable={clearable}
            error={error}
            icon={icon}
            id={id}
            inputRef={inputRef}
            name={name}
            onBlur={onBlur}
            onChange={useCallback(
                (event: ChangeEvent<HTMLInputElement>) =>
                    onChange?.(event, { name, value: event?.currentTarget?.value }),
                [onChange]
            )}
            onFocus={onFocus}
            placeholder={placeholder}
            type={type}
            value={value}
        />
    );
}
