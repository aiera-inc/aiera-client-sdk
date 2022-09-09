import React, { ReactElement } from 'react';
import classNames from 'classnames';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { ChangeHandler } from '@aiera/client-sdk/types';

type FormFieldSelectOption<T> = {
    label: string;
    description?: string;
    value: T;
};

interface SharedProps {
    className?: string;
    name: string;
}

/** @notExported */
export interface FormFieldSelectProps<T> extends SharedProps {
    onChange?: ChangeHandler<T>;
    options: FormFieldSelectOption<T>[];
    value?: T;
}

export function FormFieldSelect<T>(props: FormFieldSelectProps<T>): ReactElement {
    const { className, name, onChange, options, value } = props;
    return (
        <FormField className={className}>
            {options.map((option) => (
                <div
                    className="border-b border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50 first:hover:rounded-t last:hover:rounded-b last:border-0"
                    key={option.value as unknown as string}
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
                            <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm">{option.description}</p>
                        )}
                    </div>
                    <Checkbox checked={value === option.value} className="ml-auto flex-shrink-0" />
                </div>
            ))}
        </FormField>
    );
}
