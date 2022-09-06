import React, { ReactElement } from 'react';
import { FormFieldDateInput } from '@aiera/client-sdk/components/FormField/FormFieldDateInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { SCHEDULE_TYPE_OPTIONS, ScheduleType } from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface SchedulingSharedProps {
    onChangeScheduleDate: ChangeHandler<Date>;
    onChangeScheduleType: ChangeHandler<ScheduleType>;
    scheduleDate?: Date;
    scheduleType?: ScheduleType;
}

/** @notExported */
interface SchedulingUIProps extends SchedulingSharedProps {}

export function SchedulingUI(props: SchedulingUIProps): ReactElement {
    const { onChangeScheduleDate, onChangeScheduleType, scheduleDate, scheduleType } = props;
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
                <FormFieldDateInput name="scheduleDate" onChange={onChangeScheduleDate} value={scheduleDate} />
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
    const { onChangeScheduleDate, onChangeScheduleType, scheduleDate, scheduleType } = props;
    return (
        <SchedulingUI
            onChangeScheduleDate={onChangeScheduleDate}
            onChangeScheduleType={onChangeScheduleType}
            scheduleDate={scheduleDate}
            scheduleType={scheduleType}
        />
    );
}
