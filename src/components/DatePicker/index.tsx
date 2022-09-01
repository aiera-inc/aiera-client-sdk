import React, { ChangeEvent, ReactElement, Ref, useCallback, useState } from 'react';
import { Calendar, Detail, OnChangeDateCallback, OnChangeDateRangeCallback } from 'react-calendar';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface DatePickerSharedProps {
    calendarRef?: Ref<HTMLDivElement>;
    className?: string;
    maxDetail?: Detail;
    minDate?: Date;
    minDetail?: Detail;
    name: string;
    range?: boolean;
    value?: Date;
}

/** @notExported */
interface DatePickerUIProps extends DatePickerSharedProps {
    onChange?: OnChangeDateCallback | OnChangeDateRangeCallback;
    visible: boolean;
}

export function DatePickerUI(props: DatePickerUIProps): ReactElement {
    const {
        calendarRef,
        className = '',
        maxDetail,
        minDate,
        minDetail,
        name,
        onChange,
        range = false,
        value,
        visible,
    } = props;
    return (
        <div className={`relative transition-all duration-200 ${className}`} data-tname={name} ref={calendarRef}>
            {visible && (
                <Calendar
                    maxDetail={maxDetail}
                    minDate={minDate}
                    minDetail={minDetail}
                    onChange={onChange}
                    selectRange={range}
                    value={value}
                />
            )}
        </div>
    );
}

/** @notExported */
export interface DatePickerProps extends DatePickerSharedProps {
    onChange?: ChangeHandler<Date>;
}

/**
 * Renders DatePicker
 */
export function DatePicker(props: DatePickerProps): ReactElement {
    const [visible, setVisibility] = useState(true);
    const { calendarRef, className, maxDetail, minDate, minDetail, name, onChange, range, value } = props;
    return (
        <DatePickerUI
            calendarRef={calendarRef}
            className={className}
            maxDetail={maxDetail}
            minDate={minDate}
            minDetail={minDetail}
            name={name}
            onChange={useCallback(
                (value: Date, event: ChangeEvent<HTMLInputElement>) => {
                    onChange?.(event, { name, value });
                    setVisibility(false);
                },
                [onChange]
            )}
            range={range}
            value={value}
            visible={visible}
        />
    );
}
