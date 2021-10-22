import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';

import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface TabOption<T> {
    value: T;
    label: string;
    className?: string;
}

type TabKind = 'button' | 'line';

/**
 * @notExported
 */
interface TabsProps<T> {
    children?: ReactNode;
    className?: string;
    onChange?: ChangeHandler<T>;
    options?: TabOption<T>[];
    value?: TabOption<T>['value'];
    kind?: TabKind;
}

export const Tabs = <T extends string | number>(props: TabsProps<T>): ReactElement => {
    const { onChange, options = [], value, kind = 'button', className = '' } = props;
    const getClasses = (val: string | number, opStyles: string) =>
        match(kind)
            .with('button', () =>
                classNames(
                    'py-2',
                    'px-3',
                    'text-sm',
                    'cursor-pointer',
                    'rounded-lg',
                    {
                        'bg-gray-100': val === value,
                        'font-semibold': val === value,
                        tab__option: true,
                        'tab__option--selected': val === value,
                    },
                    opStyles
                )
            )
            .with('line', () =>
                classNames(
                    'relative',
                    'text-sm',
                    'h-6',
                    'flex',
                    'mr-3',
                    'pb-0.5',
                    'overflow-hidden',
                    {
                        'cursor-pointer': val !== value,
                        'text-gray-400': val !== value,
                        'text-black': val === value,
                        'font-semibold': val === value,
                        'hover:text-gray-500': val !== value,
                        'active:text-gray-800': val !== value,
                        tab__option: true,
                        'tab__option--selected': val === value,
                    },
                    opStyles
                )
            )
            .exhaustive();

    return (
        <div className={`flex tab relative ${className}`}>
            {options.map(({ value: opVal, label, className: opStyles = '' }) => (
                <div
                    key={`tab-option-${opVal}`}
                    className={getClasses(opVal, opStyles)}
                    onClick={(event) => onChange && onChange(event, { value: opVal })}
                >
                    {label}
                    {kind === 'line' && (
                        <div
                            className={classNames(
                                'h-0.5',
                                'bg-blue-600',
                                'absolute',
                                'left-0',
                                'right-0',
                                'duration-200',
                                'ease-in-out',
                                'rounded-t-sm',
                                {
                                    'bottom-0': opVal === value,
                                    '-bottom-0.5': opVal !== value,
                                }
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
