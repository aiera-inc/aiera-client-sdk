import React, { MouseEvent, ReactElement, ReactNode } from 'react';
import './styles.css';

type ButtonKind = 'default' | 'primary' | 'secondary';
interface ButtonSharedProps {
    children?: ReactNode;
    extendClassName?: string;
    kind?: ButtonKind;
    onClick?: (event: MouseEvent<Element>) => void;
}

/** @notExported */
interface ButtonUIProps extends ButtonSharedProps {}

export function ButtonUI(props: ButtonUIProps): ReactElement {
    const { children, onClick, extendClassName = '', kind = 'default' } = props;
    const buttonStyleMap = {
        primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:text-white ',
        default: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 active:text-white ',
        secondary: 'active:text-black',
    };
    const buttonStyle = buttonStyleMap[kind] || buttonStyleMap.default;

    return (
        <button
            className={`group flex h-8 items-center px-3 font-semibold  rounded-lg leading-3 text-base ${buttonStyle} ${extendClassName}`}
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
    const { children, onClick, extendClassName, kind } = props;
    return (
        <ButtonUI onClick={onClick} kind={kind} extendClassName={extendClassName}>
            {children}
        </ButtonUI>
    );
}
