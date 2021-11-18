import React, { ReactElement, ReactNode, useState, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';

import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
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
    setFocus?: Dispatch<SetStateAction<number>>;
}

/**
 * Renders FilterBy
 */
export const FilterByUI = <T extends string | number>(props: FilterByProps<T>): ReactElement => {
    const { children, onChange, options = [], value = [], setFocus } = props;
    return (
        <div className="flex items-center pl-3 pr-1.5 h-9 bg-white rounded-lg shadow dark:shadow-3xl-dark dark:bg-bluegray-6 eventlist__filterby">
            {children || <div className="text-sm font-semibold">Filter By</div>}
            <div className="flex justify-end flex-1">
                {options.map((option, index) => (
                    <div
                        tabIndex={0}
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
                            'border',
                            {
                                'bg-blue-100 dark:bg-blue-600': value?.includes(option.value),
                                'border-blue-300 dark:border-blue-600': value?.includes(option.value),
                                'border-gray-100 dark:border-bluegray-5': !value?.includes(option.value),
                                'text-blue-600 dark:text-white': value?.includes(option.value),
                                'text-gray-500 dark:text-bluegray-4': !value?.includes(option.value),
                                'hover:border-gray-300 dark:hover:border-bluegray-4 dark:hover:border-opacity-30':
                                    !value?.includes(option.value),
                                'hover:text-gray-700 dark:hover:text-bluegray-4': !value?.includes(option.value),
                                'dark:hover:bg-bluegray-5': !value?.includes(option.value),
                                'dark:hover:text-white': value?.includes(option.value),
                                'hover:bg-blue-200 dark:hover:bg-blue-500': value?.includes(option.value),
                                'hover:border-blue-500 dark:hover:border-blue-500': value?.includes(option.value),
                                'active:bg-white dark:active:text-white': value?.includes(option.value),
                                'active:border-blue-500 dark:active:border-blue-700 dark:active:bg-blue-700':
                                    value?.includes(option.value),
                                'active:bg-gray-200 dark:active:bg-bluegray-7': !value?.includes(option.value),
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
                        onFocus={() => setFocus?.(index)}
                        onBlur={() => setFocus?.(-1)}
                    >
                        {option.label}
                        {value?.includes(option.value) && <Check className="w-2 ml-1.5" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FilterBy = <T extends string | number>(props: FilterByProps<T>): ReactElement => {
    const { children, onChange, options = [], value = [] } = props;
    const [focusIndex, setFocus] = useState(-1);
    if (onChange && options.length) {
        useWindowListener('keydown', (event: KeyboardEvent) => {
            const selectedOption = options[focusIndex];
            // Focus is -1 on mount and on blur, so when >= 0, we actually want
            // to handle the keyboard event
            if (event.key === 'Enter' && focusIndex >= 0 && selectedOption && selectedOption?.value >= 0) {
                if (value.includes(selectedOption.value)) {
                    onChange(event, { value: value.filter((o) => o !== selectedOption.value) });
                } else {
                    onChange(event, { value: [...value, selectedOption.value] });
                }
            }
        });
    }
    return (
        <FilterByUI setFocus={setFocus} onChange={onChange} options={options} value={value}>
            {children}
        </FilterByUI>
    );
};
