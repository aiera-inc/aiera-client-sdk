import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ChangeHandler } from 'types';
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
    const { onChange, options = [], value = [] } = props;
    return (
        <div className="flex items-center border border-gray-300 px-2 rounded-md eventlist__filterby">
            <div className="font-semibold">Filter By</div>
            <div className="flex flex-1 justify-end">
                {options.map((option) => (
                    <div
                        key={`filterby-option-${option.value}`}
                        className={classNames('py-1', 'px-2', 'cursor-pointer', 'rounded-md', {
                            'bg-gray-300': value?.includes(option.value),
                            'font-semibold': value?.includes(option.value),
                            eventlist__filterby__option: true,
                            'eventlist__filterby__option--selected': value.includes(option.value),
                        })}
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
                    </div>
                ))}
            </div>
        </div>
    );
};
