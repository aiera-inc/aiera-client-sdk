import React, { ReactElement, ReactNode, useState, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';

import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface TabOption<T> {
    value: T;
    label: string;
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
    setFocus?: Dispatch<SetStateAction<number>>;
}

export const TabsUI = <T extends string | number>(props: TabsProps<T>): ReactElement => {
    const { onChange, options = [], value, kind = 'button', className = '', setFocus } = props;
    const getClasses = (val: string | number) =>
        match(kind)
            .with('button', () =>
                classNames('py-2', 'px-3', 'text-sm', 'cursor-pointer', 'rounded-lg', {
                    'bg-gray-100': val === value,
                    'font-semibold': val === value,
                    tab__option: true,
                    'tab__option--selected': val === value,
                })
            )
            .with('line', () =>
                classNames('relative', 'text-sm', 'h-6', 'flex', 'mr-3', 'pb-0.5', 'overflow-hidden', {
                    'cursor-pointer': val !== value,
                    'text-gray-400 dark:text-bluegray-4 dark:opacity-60': val !== value,
                    'text-black dark:text-white': val === value,
                    'font-semibold': val === value,
                    'hover:text-gray-500 dark:hover:text-bluegray-4 dark:hover:opacity-80': val !== value,
                    'active:text-gray-800 dark:active:text-bluegray-4 dark:active:opacity-100': val !== value,
                    tab__option: true,
                    'tab__option--selected': val === value,
                })
            )
            .exhaustive();

    return (
        <div className={`flex tab relative ${className}`}>
            {options.map(({ value: opVal, label }, index) => (
                <div
                    tabIndex={0}
                    key={`tab-option-${opVal}`}
                    className={getClasses(opVal)}
                    onClick={(event) => onChange && onChange(event, { value: opVal })}
                    onFocus={() => setFocus?.(index)}
                    onBlur={() => setFocus?.(-1)}
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

export const Tabs = <T extends string | number>(props: TabsProps<T>): ReactElement => {
    const { onChange, options = [], value, kind, className } = props;
    const [focusIndex, setFocus] = useState(-1);
    if (onChange && options.length) {
        useWindowListener('keydown', (event: KeyboardEvent) => {
            const selectedOption = options[focusIndex];
            // Focus is -1 on mount and on blur, so when >= 0, we actually want
            // to handle the keyboard event
            if (event.key === 'Enter' && focusIndex >= 0 && selectedOption && selectedOption?.value) {
                onChange(event, { value: options[focusIndex]?.value });
            }
        });
    }

    return (
        <TabsUI
            className={className}
            setFocus={setFocus}
            onChange={onChange}
            options={options}
            value={value}
            kind={kind}
        />
    );
};
