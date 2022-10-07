import React, {
    ChangeEvent,
    ChangeEventHandler,
    FocusEventHandler,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    useCallback,
} from 'react';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import './styles.css';
import { ChangeHandler } from '@aiera/client-sdk/types';

interface TextareaSharedProps {
    autoFocus?: boolean;
    className?: string;
    clearable?: boolean;
    id?: string;
    name: string;
    onFocus?: FocusEventHandler;
    placeholder?: string;
    value?: string;
}

/** @notExported */
interface TextareaUIProps extends TextareaSharedProps {
    clear: MouseEventHandler<HTMLDivElement>;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export function TextareaUI(props: TextareaUIProps): ReactElement {
    const { autoFocus, className = '', clearable, clear, id, name, onChange, onFocus, placeholder, value } = props;
    return (
        <div className={`group h-8 items-center w-full relative dark:text-white ${className} textarea__${name}`}>
            <textarea
                id={id}
                autoFocus={autoFocus}
                className="h-full border border-gray-200 min-h-[58px] pl-3 rounded-lg text-sm w-full focus:border-1 focus:border-blue-600 focus:outline-none focus:shadow-input hover:border-blue-400 dark:bg-bluegray-6 dark:border-bluegray-5"
                onChange={onChange}
                onFocus={onFocus}
                placeholder={placeholder}
                value={value}
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
export interface TextareaProps extends TextareaSharedProps {
    onChange?: ChangeHandler<string>;
}

/**
 * Renders Textarea
 */
export function Textarea(props: TextareaProps): ReactElement {
    const { autoFocus = false, id, clearable = true, placeholder, onChange, onFocus, value, name, className } = props;
    return (
        <TextareaUI
            autoFocus={autoFocus}
            clearable={clearable}
            clear={useCallback(
                (event: MouseEvent<HTMLDivElement>) => onChange?.(event, { name, value: '' }),
                [onChange]
            )}
            id={id}
            placeholder={placeholder}
            onChange={useCallback(
                (event: ChangeEvent<HTMLTextAreaElement>) =>
                    onChange?.(event, { name, value: event?.currentTarget?.value }),
                [onChange]
            )}
            onFocus={onFocus}
            value={value}
            className={className}
            name={name}
        />
    );
}
