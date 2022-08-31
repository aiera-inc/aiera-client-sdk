import React, { ReactElement } from 'react';

import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { SCHEDULE_TYPE_OPTIONS, ScheduleType } from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface SchedulingSharedProps {
    onChangeScheduleType: ChangeHandler<ScheduleType>;
    scheduleType?: ScheduleType;
}

/** @notExported */
interface SchedulingUIProps extends SchedulingSharedProps {}

export function SchedulingUI(props: SchedulingUIProps): ReactElement {
    const { onChangeScheduleType, scheduleType } = props;
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
        </div>
    );
}

/** @notExported */
export interface SchedulingProps extends SchedulingSharedProps {}

/**
 * Renders Scheduling
 */
export function Scheduling(props: SchedulingProps): ReactElement {
    const { onChangeScheduleType, scheduleType } = props;
    return <SchedulingUI onChangeScheduleType={onChangeScheduleType} scheduleType={scheduleType} />;
}
