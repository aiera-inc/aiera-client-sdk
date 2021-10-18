import React, { MouseEvent, ReactElement, ReactNode } from 'react';
import './styles.css';

interface ButtonSharedProps {
    extendClassName?: string;
    children?: ReactNode;
    onClick?: (event: MouseEvent<Element>) => void;
}

/** @notExported */
interface ButtonUIProps extends ButtonSharedProps {}

export function ButtonUI(props: ButtonUIProps): ReactElement {
    const { children, onClick, extendClassName = '' } = props;
    return (
        <button
            className={`group flex h-8 items-center px-3 font-semibold bg-gray-200 rounded-lg leading-3 hover:bg-gray-300 active:bg-gray-400 active:text-white text-base ${extendClassName}`}
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
    const { children, onClick, extendClassName } = props;
    return (
        <ButtonUI onClick={onClick} extendClassName={extendClassName}>
            {children}
        </ButtonUI>
    );
}
