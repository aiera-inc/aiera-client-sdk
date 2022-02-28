import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { Input } from '@aiera/client-sdk/components/Input';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

type FormFieldSelectOption = {
    label: string;
    description?: string;
    value: string;
};

interface SharedProps {
    className?: string;
    name: string;
    onChange?: ChangeHandler<string>;
}

/** @notExported */
export interface FormFieldInputProps extends SharedProps {
    autoFocus?: boolean;
    description?: string;
    label?: string;
    placeholder?: string;
    value: string;
}

export function FormFieldInput(props: FormFieldInputProps) {
    const { autoFocus, className, description, label, name, onChange, placeholder, value } = props;
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
                    clearable
                    name={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    value={value}
                />
            </div>
        </FormField>
    );
}

/** @notExported */
export interface FormFieldSelectProps extends SharedProps {
    options: FormFieldSelectOption[];
    value?: string;
}

export function FormFieldSelect(props: FormFieldSelectProps): ReactElement {
    const { className, name, onChange, options, value } = props;
    return (
        <FormField className={className}>
            {options.map((option) => (
                <div
                    className="border-b border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50 first:hover:rounded-t last:hover:rounded-b last:border-0"
                    key={option.value}
                    onClick={(e) => (onChange ? onChange(e, { name, value: option.value }) : {})}
                >
                    <div>
                        <p
                            className={classNames([
                                'text-black text-base',
                                { 'font-semibold': value === option.value },
                            ])}
                        >
                            {option.label}
                        </p>
                        {!!option.description && (
                            <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">{option.description}</p>
                        )}
                    </div>
                    <Checkbox checked={value === option.value} className="ml-auto flex-shrink-0" />
                </div>
            ))}
        </FormField>
    );
}

interface FormFieldSharedProps {
    children?: ReactNode;
    className?: string;
}

/** @notExported */
interface FormFieldUIProps extends FormFieldSharedProps {}

export function FormFieldUI(props: FormFieldUIProps): ReactElement {
    const { className = 'form-field', children } = props;
    return <div className={`bg-white border border-gray-200 px-4 py-3 rounded shadow-xl ${className}`}>{children}</div>;
}

/** @notExported */
export interface FormFieldProps extends FormFieldSharedProps {}

/**
 * Renders FormField
 */
export function FormField(props: FormFieldProps): ReactElement {
    const { children } = props;
    return <FormFieldUI>{children}</FormFieldUI>;
}
