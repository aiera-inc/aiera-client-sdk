import React, { MouseEvent, ReactElement, ReactNode } from 'react';
import { match } from 'ts-pattern';
import './styles.css';

type ButtonKind = 'default' | 'primary' | 'secondary';
interface ButtonSharedProps {
    children?: ReactNode;
    className?: string;
    kind?: ButtonKind;
    onClick?: (event: MouseEvent<Element>) => void;
}

/** @notExported */
interface ButtonUIProps extends ButtonSharedProps {}

export function ButtonUI(props: ButtonUIProps): ReactElement {
    const { children, onClick, className = '', kind = 'default' } = props;
    const buttonStyle = match(kind)
        .with('primary', () => 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:text-white')
        .with('secondary', () => 'active:text-black')
        .with('default', () => 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 active:text-white')
        .exhaustive();

    return (
        <button
            className={`group flex h-8 items-center px-3 font-semibold  rounded-lg leading-3 text-base ${buttonStyle} ${className}`}
            onClick={onClick}
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
    const { children, onClick, className, kind } = props;
    return (
        <ButtonUI onClick={onClick} kind={kind} className={className}>
            {children}
        </ButtonUI>
    );
}
