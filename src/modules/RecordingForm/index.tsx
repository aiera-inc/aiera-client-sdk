import React, { MouseEventHandler, ReactElement } from 'react';
import { Button } from '@aiera/client-sdk/components/Button';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import './styles.css';

interface RecordingFormSharedProps {
    onBack?: MouseEventHandler;
}

/** @notExported */
interface RecordingFormUIProps extends RecordingFormSharedProps {}

export function RecordingFormUI(props: RecordingFormUIProps): ReactElement {
    const { onBack } = props;
    return (
        <div className="h-full flex flex-col recording-form">
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 recording-form__header">
                <div className="flex items-center mb-3">
                    <Button className="mr-2" onClick={onBack}>
                        <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                        Recordings
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface RecordingFormProps extends RecordingFormSharedProps {}

/**
 * Renders RecordingForm
 */
export function RecordingForm(props: RecordingFormProps): ReactElement {
    const { onBack } = props;
    return <RecordingFormUI onBack={onBack} />;
}
