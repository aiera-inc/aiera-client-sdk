import React, { ReactElement } from 'react';
import './styles.css';

interface RecordingDetailsSharedProps {}

/** @notExported */
interface RecordingDetailsUIProps extends RecordingDetailsSharedProps {}

export function RecordingDetailsUI(_props: RecordingDetailsUIProps): ReactElement {
    return (
        <div className="font-medium py-3 text-gray-400 text-xs tracking-wide uppercase recording-details">
            <p>Recording Details</p>
        </div>
    );
}

/** @notExported */
export interface RecordingDetailsProps extends RecordingDetailsSharedProps {}

/**
 * Renders RecordingDetails
 */
export function RecordingDetails(_props: RecordingDetailsProps): ReactElement {
    return <RecordingDetailsUI />;
}
