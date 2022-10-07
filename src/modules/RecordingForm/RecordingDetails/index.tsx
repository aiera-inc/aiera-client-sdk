import React, { ReactElement } from 'react';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface RecordingDetailsSharedProps {
    onChangeTitle: ChangeHandler<string>;
    title?: string;
}

/** @notExported */
interface RecordingDetailsUIProps extends RecordingDetailsSharedProps {}

export function RecordingDetailsUI(props: RecordingDetailsUIProps): ReactElement {
    const { onChangeTitle, title = '' } = props;
    return (
        <div className="py-3 recording-details">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Recording Details</p>
            <FormFieldInput
                autoFocus
                className="mt-5 px-4 py-3"
                clearable
                description="Enter the name of the recording"
                label="Title*"
                name="title"
                onChange={onChangeTitle}
                value={title}
            />
        </div>
    );
}

/** @notExported */
export interface RecordingDetailsProps extends RecordingDetailsSharedProps {}

/**
 * Renders RecordingDetails
 */
export function RecordingDetails(props: RecordingDetailsProps): ReactElement {
    const { onChangeTitle, title } = props;
    return <RecordingDetailsUI onChangeTitle={onChangeTitle} title={title} />;
}
