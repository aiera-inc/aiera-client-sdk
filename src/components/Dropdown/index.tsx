import React, { ReactElement } from 'react';
import { ChangeHandler, SelectOption } from '@aiera/client-sdk/types';
import './styles.css';

interface DropdownSharedProps<T> {
    className?: string;
    onChange?: ChangeHandler<T>;
    options: SelectOption<T>[];
    value?: T;
}

/** @notExported */
interface DropdownUIProps<T> extends DropdownSharedProps<T> {}

export function DropdownUI<T>(props: DropdownUIProps<T>): ReactElement {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className, value } = props;
    return <div className={className}>{value}</div>;
}

/** @notExported */
export interface DropdownProps<T> extends DropdownSharedProps<T> {}

/**
 * Renders Dropdown
 */
export function Dropdown<T>(props: DropdownProps<T>): ReactElement {
    const { className, onChange, options, value } = props;
    return <DropdownUI className={className} onChange={onChange} options={options} value={value} />;
}
