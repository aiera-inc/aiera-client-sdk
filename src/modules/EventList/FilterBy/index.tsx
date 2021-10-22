import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { Check } from '@aiera/client-sdk/components/Svg/Check';
import './styles.css';

interface FilterOption<T> {
    value: T;
    label: string;
}
type FilterValue<T> = FilterOption<T>['value'];

/**
 * @notExported
 */
export interface FilterByProps<T> {
    children?: ReactNode;
    onChange?: ChangeHandler<T[]>;
    options?: FilterOption<T>[];
    value?: FilterValue<T>[];
}

/**
 * Renders FilterBy
 */
export const FilterBy = <T extends string | number>(props: FilterByProps<T>): ReactElement => {
    const { children, onChange, options = [], value = [] } = props;
    return (
        <div className="flex items-center pl-3 pr-1.5 h-9 bg-white rounded-lg shadow eventlist__filterby">
            {children || <div className="text-sm font-semibold">Filter By</div>}
            <div className="flex justify-end flex-1">
                {options.map((option) => (
                    <div
                        key={`filterby-option-${option.value}`}
                        className={classNames(
                            'flex',
                            'mx-1',
                            'last:mx-0',
                            'py-0.5',
                            'px-2',
                            'rounded-full',
                            'text-sm',
                            'cursor-pointer',
                            'rounded-md',
                            'border',
                            {
                                'bg-blue-100': value?.includes(option.value),
                                'border-blue-300': value?.includes(option.value),
                                'border-gray-100': !value?.includes(option.value),
                                'text-blue-600': value?.includes(option.value),
                                'text-gray-500': !value?.includes(option.value),
                                'hover:border-gray-300': !value?.includes(option.value),
                                'hover:text-gray-700': !value?.includes(option.value),
                                'hover:bg-blue-200': value?.includes(option.value),
                                'hover:border-blue-500': value?.includes(option.value),
                                'active:bg-white': value?.includes(option.value),
                                'active:border-blue-500': value?.includes(option.value),
                                'active:bg-gray-200': !value?.includes(option.value),
                                'active:border-gray-400': !value?.includes(option.value),
                                'active:text-gray-900': !value?.includes(option.value),
                                eventlist__filterby__option: true,
                                'eventlist__filterby__option--selected': value.includes(option.value),
                            }
                        )}
                        onClick={(event) =>
                            onChange &&
                            onChange(event, {
                                value: value.includes(option.value)
                                    ? value.filter((o) => o !== option.value)
                                    : [...value, option.value],
                            })
                        }
                    >
                        {option.label}
                        {value?.includes(option.value) && <Check className="w-2 ml-1.5" />}
                    </div>
                ))}
            </div>
        </div>
    );
};
