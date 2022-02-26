import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { Input } from '@aiera/client-sdk/components/Input';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

type FormFieldSelectOption = {
    label: string;
    description?: string;
    value: string;
};

interface FormFieldSharedProps {
    autoFocus?: boolean;
    className?: string;
    description?: string;
    label?: string;
    name: string;
    onChange?: ChangeHandler<string>;
    options?: FormFieldSelectOption[];
    placeholder?: string;
    type?: 'input' | 'select';
    value: string;
}

/** @notExported */
interface FormFieldUIProps extends FormFieldSharedProps {}

function FormFieldInputUI(props: FormFieldUIProps) {
    const { autoFocus, description, label, name, onChange, placeholder, value } = props;
    return (
        <>
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
        </>
    );
}

/** @notExported */
interface FormFieldSelectProps extends FormFieldUIProps {
    options: FormFieldSelectOption[];
}

function FormFieldSelectUI(props: FormFieldSelectProps): ReactElement {
    const { name, onChange, options, value } = props;
    return (
        <>
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
        </>
    );
}

export function FormFieldUI(props: FormFieldUIProps): ReactElement {
    const {
        autoFocus,
        className = 'form-field',
        description,
        label,
        onChange,
        placeholder,
        name,
        options,
        type = 'input',
        value,
    } = props;
    return (
        <div className={`bg-white border border-gray-200 px-4 py-3 rounded shadow-xl ${className}`}>
            {match(type)
                .with('input', () => (
                    <FormFieldInputUI
                        autoFocus={autoFocus}
                        description={description}
                        label={label}
                        name={name}
                        onChange={onChange}
                        placeholder={placeholder}
                        value={value}
                    />
                ))
                .with('select', () =>
                    options ? (
                        <FormFieldSelectUI name={name} onChange={onChange} options={options} value={value} />
                    ) : null
                )
                .otherwise(() => null)}
        </div>
    );
}

/** @notExported */
export interface FormFieldProps extends FormFieldSharedProps {}

/**
 * Renders FormField
 */
export function FormField(props: FormFieldProps): ReactElement {
    const { autoFocus, className, description, label, name, onChange, options, placeholder, type, value } = props;
    return (
        <FormFieldUI
            autoFocus={autoFocus}
            className={className}
            description={description}
            label={label}
            name={name}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            type={type}
            value={value}
        />
    );
}
