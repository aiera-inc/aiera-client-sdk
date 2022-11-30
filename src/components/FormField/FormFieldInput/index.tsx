import React, { FocusEventHandler } from 'react';

import { FormField } from '@aiera/client-sdk/components/FormField';
import { Input } from '@aiera/client-sdk/components/Input';
import { ChangeHandler } from '@aiera/client-sdk/types';

interface SharedProps {
    className?: string;
    name: string;
}

/** @notExported */
export interface FormFieldInputProps extends SharedProps {
    autoFocus?: boolean;
    clearable?: boolean;
    description?: string;
    error?: string;
    label?: string;
    onBlur?: FocusEventHandler;
    onChange?: ChangeHandler<string>;
    onFocus?: FocusEventHandler;
    placeholder?: string;
    value: string;
}

export function FormFieldInput(props: FormFieldInputProps) {
    const {
        autoFocus,
        className,
        clearable,
        description,
        error,
        label,
        name,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        value,
    } = props;
    return (
        <FormField className={className}>
            {!!label && <p className="font-semibold text-base text-black form-field__label">{label}</p>}
            {!!description && (
                <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                    {description}
                </p>
            )}
            <div className="mt-3 w-full">
                <Input
                    autoFocus={autoFocus}
                    clearable={clearable}
                    error={error}
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    value={value}
                />
            </div>
        </FormField>
    );
}
