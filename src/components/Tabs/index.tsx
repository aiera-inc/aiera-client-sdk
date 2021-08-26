import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ChangeHandler } from 'types';
import './styles.css';

interface TabOption<T> {
    value: T;
    label: string;
}

/**
 * @notExported
 */
interface TabsProps<T> {
    children?: ReactNode;
    onChange?: ChangeHandler<T>;
    options?: TabOption<T>[];
    value?: TabOption<T>['value'];
}

export const Tabs = <T extends string | number>(props: TabsProps<T>): ReactElement => {
    const { onChange, options = [], value } = props;
    return (
        <div className="flex tab">
            {options.map((option) => (
                <div
                    key={`tab-option-${option.value}`}
                    className={classNames('py-2', 'px-3', 'text-sm', 'cursor-pointer', 'rounded-lg', {
                        'bg-gray-100': option.value === value,
                        'font-semibold': option.value === value,
                        tab__option: true,
                        'tab__option--selected': option.value === value,
                    })}
                    onClick={(event) => onChange && onChange(event, { value: option.value })}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};
