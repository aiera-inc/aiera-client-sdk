import React from 'react';

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
    label?: string;
    onChange?: ChangeHandler<string>;
    placeholder?: string;
    value: string;
}

export function FormFieldInput(props: FormFieldInputProps) {
    const { autoFocus, className, clearable, description, label, name, onChange, placeholder, value } = props;
    return (
        <FormField className={className}>
            {!!label && <p className="font-semibold text-base text-black form-field__label">{label}</p>}
            {!!description && (
                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm  form-field__description">
                    {description}
                </p>
            )}
            <div className="mt-3 w-full">
                <Input
                    autoFocus={autoFocus}
                    clearable={clearable}
                    name={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    value={value}
                />
            </div>
        </FormField>
    );
}
