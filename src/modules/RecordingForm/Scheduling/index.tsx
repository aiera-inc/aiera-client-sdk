import React, { ReactElement } from 'react';
import './styles.css';

interface SchedulingSharedProps {}

/** @notExported */
interface SchedulingUIProps extends SchedulingSharedProps {}

export function SchedulingUI(_props: SchedulingUIProps): ReactElement {
    return (
        <div className="font-medium py-3 text-gray-400 text-xs tracking-wide uppercase scheduling">
            <p>Scheduling</p>
        </div>
    );
}

/** @notExported */
export interface SchedulingProps extends SchedulingSharedProps {}

/**
 * Renders Scheduling
 */
export function Scheduling(_props: SchedulingProps): ReactElement {
    return <SchedulingUI />;
}
