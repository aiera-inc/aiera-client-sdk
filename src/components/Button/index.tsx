import React, { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';
import './styles.css';

type ButtonKind = 'default' | 'primary' | 'secondary';
interface ButtonSharedProps {
    children?: ReactNode;
    className?: string;
    disabled?: boolean;
    iconButton?: boolean;
    kind?: ButtonKind;
    onClick?: (event: MouseEvent<Element>) => void;
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

/** @notExported */
interface ButtonUIProps extends ButtonSharedProps {}

export function ButtonUI(props: ButtonUIProps): ReactElement {
    const { children, disabled = false, onClick, className = '', kind = 'default', type, iconButton = false } = props;
    const buttonStyle = match(kind)
        .with(
            'primary',
            () =>
                'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white active:text-white disabled:bg-blue-600 ' +
                'dark:border-[1px] dark:bg-bluegray-6 dark:border-bluegray-5 dark:text-white ' +
                'dark:hover:border-bluegray-4 dark:hover:border-opacity-20 disabled:dark:border-bluegray-5 ' +
                'disabled:dark:border-opacity-100 dark:active:bg-bluegray-7'
        )
        .with(
            'secondary',
            () =>
                'border-[1px] border-gray-300 dark:border-bluegray-5 dark:text-white ' +
                'hover:border-gray-400 dark:hover:border-bluegray-4 dark:hover:border-opacity-20 ' +
                'disabled:border-gray-300 disabled:dark:border-bluegray-5 disabled:dark:border-opacity-100' +
                'active:bg-gray-400 dark:active:bg-bluegray-7 active:text-white'
        )
        .with(
            'default',
            () =>
                'bg-gray-200 dark:bg-bluegray-5 dark:hover:bg-bluegray-7 dark:active:bg-bluegray-7 dark:text-white ' +
                'hover:bg-gray-300 active:bg-gray-400 active:text-white disabled:bg-gray-200'
        )
        .exhaustive();

    return (
        <button
            disabled={disabled}
            tabIndex={0}
            className={classNames(
                `group flex h-8 items-center font-semibold  rounded-lg leading-3 text-base disabled:opacity-75 ${buttonStyle} ${className}`,
                { 'px-2.5': !iconButton, 'justify-center': iconButton }
            )}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
}

/** @notExported */
export interface ButtonProps extends ButtonSharedProps {}

/**
 * Renders Button
 */
export function Button(props: ButtonProps): ReactElement {
    const { children, disabled, onClick, className, iconButton, kind, type } = props;
    return (
        <ButtonUI
            onClick={onClick}
            disabled={disabled}
            kind={kind}
            iconButton={iconButton}
            className={className}
            type={type}
        >
            {children}
        </ButtonUI>
    );
}
