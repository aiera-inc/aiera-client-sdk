import React, { ReactElement, Ref, useCallback, useRef, useState } from 'react';
import { DatePicker } from '@aiera/client-sdk/components/DatePicker';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { Input } from '@aiera/client-sdk/components/Input';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks/useOutsideClickHandler';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface FormFieldDateInputSharedProps {
    className?: string;
    description?: string;
    label?: string;
    name: string;
    onChange?: ChangeHandler<Date>;
    placeholder?: string;
    value?: Date;
}

/** @notExported */
export interface FormFieldDateInputUIProps extends FormFieldDateInputSharedProps {
    calendarRef: Ref<HTMLDivElement>;
    isCalendarVisible: boolean;
    showCalendar: () => void;
}

export function FormFieldDateInputUI(props: FormFieldDateInputUIProps) {
    const {
        calendarRef,
        className,
        description,
        isCalendarVisible,
        label,
        name,
        onChange,
        placeholder,
        showCalendar,
        value,
    } = props;
    return (
        <FormField className={className}>
            {!!label && <p className="font-semibold text-base text-black form-field__label">{label}</p>}
            {!!description && (
                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm  form-field__description">
                    {description}
                </p>
            )}
            <div className="mt-3 w-full">
                <Input
                    name={name}
                    onFocus={showCalendar}
                    placeholder={placeholder}
                    value={value ? value.toLocaleDateString() : ''}
                />
            </div>
            {isCalendarVisible && <DatePicker calendarRef={calendarRef} name={name} onChange={onChange} />}
        </FormField>
    );
}

/** @notExported */
export interface FormFieldDateInputProps extends FormFieldDateInputSharedProps {}

/**
 * Renders FormField
 */
export function FormFieldDateInput(props: FormFieldDateInputProps): ReactElement {
    const [isCalendarVisible, setCalendarVisibility] = useState(false);
    const { className, description, label, name, onChange, placeholder, value } = props;

    // Collapse Expanded Header on Outside Click
    const calendarRef = useRef<HTMLDivElement>(null);
    useOutsideClickHandler(
        [calendarRef],
        useCallback(() => {
            if (isCalendarVisible) {
                setCalendarVisibility(false);
            }
        }, [isCalendarVisible])
    );

    return (
        <FormFieldDateInputUI
            calendarRef={calendarRef}
            className={className}
            description={description}
            isCalendarVisible={isCalendarVisible}
            label={label}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            showCalendar={useCallback(() => setCalendarVisibility(true), [setCalendarVisibility])}
            value={value}
        />
    );
}
