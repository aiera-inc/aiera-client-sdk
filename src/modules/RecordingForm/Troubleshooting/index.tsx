import React, { ReactElement } from 'react';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { TROUBLESHOOTING_TYPE_OPTIONS, OnFailure } from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface TroubleshootingSharedProps {
    onChangeOnFailure: ChangeHandler<OnFailure>;
    onFailure?: OnFailure;
    onFailureInstructions?: string;
    onFailurePhoneNumber?: string;
}

/** @notExported */
interface TroubleshootingUIProps extends TroubleshootingSharedProps {}

export function TroubleshootingUI(props: TroubleshootingUIProps): ReactElement {
    const { onChangeOnFailure, onFailure } = props;
    return (
        <div className="py-3 troubleshooting">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Troubleshooting</p>
            <FormFieldSelect
                className="mt-2.5"
                name="scheduleType"
                onChange={onChangeOnFailure}
                options={TROUBLESHOOTING_TYPE_OPTIONS}
                value={onFailure}
            />
        </div>
    );
}

/** @notExported */
export interface TroubleshootingProps extends TroubleshootingSharedProps {}

/**
 * Renders Troubleshooting
 */
export function Troubleshooting(props: TroubleshootingProps): ReactElement {
    const { onChangeOnFailure, onFailure, onFailureInstructions, onFailurePhoneNumber } = props;
    return (
        <TroubleshootingUI
            onChangeOnFailure={onChangeOnFailure}
            onFailure={onFailure}
            onFailureInstructions={onFailureInstructions}
            onFailurePhoneNumber={onFailurePhoneNumber}
        />
    );
}
