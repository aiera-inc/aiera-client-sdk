import React, { ReactElement, ReactNode } from 'react';

import './styles.css';

interface FormFieldSharedProps {
    children?: ReactNode;
    className?: string;
}

/** @notExported */
interface FormFieldUIProps extends FormFieldSharedProps {}

export function FormFieldUI(props: FormFieldUIProps): ReactElement {
    const { className = 'form-field', children } = props;
    return <div className={`bg-white border border-gray-200 rounded shadow-xl ${className}`}>{children}</div>;
}

/** @notExported */
export interface FormFieldProps extends FormFieldSharedProps {}

/**
 * Renders FormField
 */
export function FormField(props: FormFieldProps): ReactElement {
    const { children } = props;
    return <FormFieldUI>{children}</FormFieldUI>;
}
