import React, { ReactElement, Ref, useCallback, useRef, useState } from 'react';
import { DatePicker } from '@aiera/client-sdk/components/DatePicker';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { Input } from '@aiera/client-sdk/components/Input';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks/useOutsideClickHandler';
import { SCHEDULE_TYPE_OPTIONS, ScheduleType } from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface SchedulingSharedProps {
    onChangeScheduleDate: ChangeHandler<Date>;
    onChangeScheduleTime: ChangeHandler<string>;
    onChangeScheduleType: ChangeHandler<ScheduleType>;
    scheduleDate?: Date;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
}

/** @notExported */
interface SchedulingUIProps extends SchedulingSharedProps {
    calendarRef: Ref<HTMLDivElement>;
    isCalendarVisible: boolean;
    showCalendar: () => void;
}

export function SchedulingUI(props: SchedulingUIProps): ReactElement {
    const {
        calendarRef,
        isCalendarVisible,
        onChangeScheduleDate,
        onChangeScheduleTime,
        onChangeScheduleType,
        scheduleDate,
        scheduleTime,
        scheduleType,
        showCalendar,
    } = props;
    return (
        <div className="py-3 scheduling">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Scheduling</p>
            <FormFieldSelect
                className="mt-2.5"
                name="scheduleType"
                onChange={onChangeScheduleType}
                options={SCHEDULE_TYPE_OPTIONS}
                value={scheduleType}
            />
            {scheduleType === ScheduleType.Future && (
                <FormField className="mt-5 px-4 py-3">
                    <p className="font-semibold text-base text-black form-field__label">Date & Time</p>
                    <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm  form-field__description">
                        Aiera will automatically connect at this time
                    </p>
                    <div className="flex items-center mt-3 w-full">
                        <Input
                            className="max-w-[90px]"
                            clearable={false}
                            name="scheduleDate"
                            onFocus={showCalendar}
                            value={scheduleDate ? scheduleDate.toLocaleDateString() : ''}
                        />
                        <Input
                            className="max-w-[90px]"
                            name="scheduleTime"
                            onChange={onChangeScheduleTime}
                            placeholder="10:00"
                            value={scheduleTime}
                        />
                    </div>
                    {isCalendarVisible && (
                        <DatePicker calendarRef={calendarRef} name="scheduleDate" onChange={onChangeScheduleDate} />
                    )}
                </FormField>
            )}
        </div>
    );
}

/** @notExported */
export interface SchedulingProps extends SchedulingSharedProps {}

/**
 * Renders Scheduling
 */
export function Scheduling(props: SchedulingProps): ReactElement {
    const [isCalendarVisible, setCalendarVisibility] = useState(false);

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

    const {
        onChangeScheduleDate,
        onChangeScheduleTime,
        onChangeScheduleType,
        scheduleDate,
        scheduleTime,
        scheduleType,
    } = props;
    return (
        <SchedulingUI
            calendarRef={calendarRef}
            isCalendarVisible={isCalendarVisible}
            onChangeScheduleDate={onChangeScheduleDate}
            onChangeScheduleTime={onChangeScheduleTime}
            onChangeScheduleType={onChangeScheduleType}
            scheduleDate={scheduleDate}
            scheduleTime={scheduleTime}
            scheduleType={scheduleType}
            showCalendar={useCallback(() => setCalendarVisibility(true), [setCalendarVisibility])}
        />
    );
}
