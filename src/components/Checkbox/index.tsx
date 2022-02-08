import React, { MouseEventHandler, ReactElement } from 'react';

import { Check } from '@aiera/client-sdk/components/Svg/Check';
import './styles.css';

interface CheckboxSharedProps {
    checked: boolean;
    className?: string;
    name?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
}

/** @notExported */
interface CheckboxUIProps extends CheckboxSharedProps {}

export function CheckboxUI(props: CheckboxUIProps): ReactElement {
    const { checked, className = '', onClick } = props;
    const checkBoxStyles = checked ? 'bg-blue-500 shadow text-white' : 'border border-gray-300';
    return (
        <div
            className={`cursor-pointer flex h-4 items-center justify-center rounded-xl w-4 ${checkBoxStyles} ${className}`}
            onClick={onClick}
        >
            {checked && <Check className="w-2" />}
        </div>
    );
}

/** @notExported */
export interface CheckboxProps extends CheckboxSharedProps {}

/**
 * Renders Checkbox
 */
export function Checkbox(props: CheckboxProps): ReactElement {
    const { checked, className, onClick } = props;
    return <CheckboxUI checked={checked} className={className} onClick={onClick} />;
}
