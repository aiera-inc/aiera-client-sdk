import React, {
    ChangeEvent,
    FocusEventHandler,
    ReactElement,
    Ref,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import MaskedInput from 'react-text-mask';
import { DatePicker } from '@aiera/client-sdk/components/DatePicker';
import { Dropdown } from '@aiera/client-sdk/components/Dropdown';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { Input, InputProps } from '@aiera/client-sdk/components/Input';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks/useOutsideClickHandler';
import {
    CONNECT_OFFSET_SECONDS_OPTIONS,
    SCHEDULE_MERIDIEM_OPTIONS,
    SCHEDULE_TYPE_OPTIONS,
    InputErrorState,
    RecordingFormStateChangeHandler,
    ScheduleMeridiem,
    ScheduleType,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import './styles.css';

interface SchedulingSharedProps {
    connectOffsetSeconds: number;
    errors: InputErrorState;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
}

/** @notExported */
interface SchedulingUIProps extends SchedulingSharedProps {
    calendarRef: Ref<HTMLDivElement>;
    isCalendarVisible: boolean;
    showCalendar: () => void;
    timeInputMask: Array<RegExp | string>;
}

export function SchedulingUI(props: SchedulingUIProps): ReactElement {
    const {
        calendarRef,
        connectOffsetSeconds,
        isCalendarVisible,
        errors,
        onBlur,
        onChange,
        scheduleDate,
        scheduleMeridiem,
        scheduleTime,
        scheduleType,
        showCalendar,
        timeInputMask,
    } = props;
    return (
        <div className="py-3 scheduling">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Scheduling</p>
            <FormFieldSelect
                className="mt-2.5"
                name="scheduleType"
                onChange={onChange}
                options={SCHEDULE_TYPE_OPTIONS}
                value={scheduleType}
            />
            {scheduleType === ScheduleType.Future && (
                <>
                    <FormField className="mt-5 px-4 py-3">
                        <p className="font-semibold text-base text-black form-field__label">Date & Time</p>
                        <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                            Aiera will automatically connect at this time
                        </p>
                        <div className="flex items-center mt-5 space-between w-full">
                            <Input
                                className="shrink-[1]"
                                clearable={false}
                                name="scheduleDate"
                                onFocus={showCalendar}
                                value={scheduleDate ? scheduleDate.toLocaleDateString() : ''}
                            />
                            <MaskedInput
                                className="ml-2 shrink-[1]"
                                guide={false}
                                mask={timeInputMask}
                                name="scheduledTime"
                                onBlur={onBlur}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    onChange?.(event, { name: 'scheduleTime', value: event?.currentTarget?.value })
                                }
                                placeholder="09:30"
                                render={(ref: (inputElement: HTMLElement) => void, props) => (
                                    <Input
                                        {...(props as unknown as InputProps)}
                                        error={errors.scheduleTime}
                                        inputRef={ref as unknown as Ref<HTMLInputElement>}
                                    />
                                )}
                                value={scheduleTime}
                            />
                            <Dropdown
                                className="ml-2 shrink-[2]"
                                name="scheduleMeridiem"
                                onChange={onChange}
                                options={SCHEDULE_MERIDIEM_OPTIONS}
                                value={scheduleMeridiem}
                            />
                        </div>
                        {isCalendarVisible && (
                            <DatePicker calendarRef={calendarRef} name="scheduleDate" onChange={onChange} />
                        )}
                    </FormField>
                    <FormField className="mt-5 px-4 py-3">
                        <p className="font-semibold text-base text-black form-field__label">When should we connect?</p>
                        <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                            How soon before the call starts should we connect?
                        </p>
                        <Dropdown
                            className="mt-3"
                            name="connectOffsetSeconds"
                            onChange={onChange}
                            options={CONNECT_OFFSET_SECONDS_OPTIONS}
                            tooltipGrow="up-left"
                            value={connectOffsetSeconds}
                        />
                    </FormField>
                </>
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

    // Collapse calendar on outside click
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
        connectOffsetSeconds,
        errors,
        onBlur,
        onChange,
        scheduleDate,
        scheduleMeridiem,
        scheduleTime,
        scheduleType,
    } = props;

    const timeInputMask = useMemo(() => {
        const startsWithTwo = scheduleTime ? scheduleTime[0] === '2' : false;
        return [/[0-2]/, startsWithTwo ? /[0-3]/ : /[0-9]/, ':', /[0-5]/, /[0-9]/];
    }, [scheduleTime]);

    return (
        <SchedulingUI
            calendarRef={calendarRef}
            connectOffsetSeconds={connectOffsetSeconds}
            errors={errors}
            isCalendarVisible={isCalendarVisible}
            onBlur={onBlur}
            onChange={onChange}
            scheduleDate={scheduleDate}
            scheduleMeridiem={scheduleMeridiem}
            scheduleTime={scheduleTime}
            scheduleType={scheduleType}
            showCalendar={useCallback(() => setCalendarVisibility(true), [setCalendarVisibility])}
            timeInputMask={timeInputMask}
        />
    );
}
