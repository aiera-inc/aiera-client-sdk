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
    inputRef?: Ref<HTMLInputElement>;
    autoFocus?: boolean;
    icon?: ReactNode;
    id?: string;
    placeholder?: string;
    onFocus?: FocusEventHandler;
    value?: string;
    className?: string;
    clearable?: boolean;
    name: string;
    type?: string;
}

/** @notExported */
interface InputUIProps extends InputSharedProps {
    clear: MouseEventHandler<HTMLDivElement>;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export function InputUI(props: InputUIProps): ReactElement {
    const {
        inputRef,
        autoFocus,
        icon,
        id,
        clearable,
        clear,
        placeholder,
        onChange,
        onFocus,
        value,
        name,
        className = '',
        type,
    } = props;
    return (
        <div className={`group h-8 items-center w-full relative ${className} input__${name}`}>
            {React.isValidElement(icon) && (
                <div className="absolute pointer-events-none h-8 w-8 justify-center items-center flex">
                    {React.cloneElement(icon, {
                        className:
                            'group-focus-within:stroke-current group-focus-within:text-blue-600 z-1 relative w-4',
                    })}
                </div>
            )}
            <input
                id={id}
                ref={inputRef}
                autoFocus={autoFocus}
                className={classNames(
                    'w-full h-full text-sm border border-gray-200 rounded-lg focus:shadow-input focus:border-1 focus:outline-none focus:border-blue-600 hover:border-blue-400',
                    { 'pl-7': !!icon, 'pl-3': !icon }
                )}
                onChange={onChange}
                onFocus={onFocus}
                placeholder={placeholder}
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
        inputRef,
        autoFocus = false,
        icon,
        id,
        clearable = true,
        placeholder,
        onChange,
        onFocus,
        value,
        name,
        className,
        type = 'text',
    } = props;
    return (
        <InputUI
            autoFocus={autoFocus}
            clearable={clearable}
            clear={useCallback(
                (event: MouseEvent<HTMLDivElement>) => onChange?.(event, { name, value: '' }),
                [onChange]
            )}
            icon={icon}
            id={id}
            placeholder={placeholder}
            onChange={useCallback(
                (event: ChangeEvent<HTMLInputElement>) =>
                    onChange?.(event, { name, value: event?.currentTarget?.value }),
                [onChange]
            )}
            inputRef={inputRef}
            onFocus={onFocus}
            value={value}
            className={className}
            name={name}
            type={type}
        />
    );
}
