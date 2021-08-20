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
        <div className="flex Tab">
            {options.map((option) => (
                <div
                    key={`tab-option-${option.value}`}
                    className={classNames('py-1', 'px-2', 'cursor-pointer', 'rounded-md', {
                        'bg-gray-300': option.value === value,
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
