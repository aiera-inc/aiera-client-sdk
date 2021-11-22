import React, { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import { match } from 'ts-pattern';
import './styles.css';

type ButtonKind = 'default' | 'primary' | 'secondary';
interface ButtonSharedProps {
    children?: ReactNode;
    className?: string;
    kind?: ButtonKind;
    onClick?: (event: MouseEvent<Element>) => void;
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

/** @notExported */
interface ButtonUIProps extends ButtonSharedProps {}

export function ButtonUI(props: ButtonUIProps): ReactElement {
    const { children, onClick, className = '', kind = 'default', type } = props;
    const buttonStyle = match(kind)
        .with('primary', () => 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white active:text-white')
        .with(
            'secondary',
            () => 'border-[1px] border-gray-300 hover:border-gray-400 active:bg-gray-400 active:text-white'
        )
        .with('default', () => 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 active:text-white')
        .exhaustive();

    return (
        <button
            tabIndex={0}
            className={`group flex h-8 items-center px-2.5 font-semibold  rounded-lg leading-3 text-base ${buttonStyle} ${className}`}
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
    const { children, onClick, className, kind, type } = props;
    return (
        <ButtonUI onClick={onClick} kind={kind} className={className} type={type}>
            {children}
        </ButtonUI>
    );
}
