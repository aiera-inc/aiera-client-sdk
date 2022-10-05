import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { match } from 'ts-pattern';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { PhoneNumberInput } from '@aiera/client-sdk/components/PhoneNumberInput';
import {
    OnFailure,
    TROUBLESHOOTING_TYPE_INTERVENTION_OPTIONS,
    TROUBLESHOOTING_TYPE_OPTIONS,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface TroubleshootingSharedProps {
    isWebcast: boolean;
    onChangeOnFailure: ChangeHandler<OnFailure>;
    onChangeOnFailureDialNumber: Dispatch<SetStateAction<string>>;
    onChangeOnFailureSmsNumber: Dispatch<SetStateAction<string>>;
    onFailure?: OnFailure;
    onFailureDialNumber?: string;
    onFailureInstructions?: string;
    onFailureSmsNumber?: string;
}

/** @notExported */
interface TroubleshootingUIProps extends TroubleshootingSharedProps {}

export function TroubleshootingUI(props: TroubleshootingUIProps): ReactElement {
    const {
        isWebcast,
        onChangeOnFailure,
        onChangeOnFailureDialNumber,
        onChangeOnFailureSmsNumber,
        onFailure,
        onFailureDialNumber,
        onFailureSmsNumber,
    } = props;
    const phoneNumberInput = (name: string, onChange: Dispatch<SetStateAction<string>>, value?: string) => (
        <FormField className="mt-5 px-4 py-3">
            <p className="font-semibold text-base text-black form-field__label">Your phone number</p>
            <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                What is the best number to reach you?
            </p>
            <PhoneNumberInput
                className="mt-3"
                defaultCountry="US"
                name={name}
                onChange={onChange}
                placeholder="(888)-123-4567"
                value={value}
            />
        </FormField>
    );
    return (
        <div className="py-3 troubleshooting">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Troubleshooting</p>
            <FormFieldSelect
                className="mt-2.5"
                name="onFailure"
                onChange={onChangeOnFailure}
                options={isWebcast ? TROUBLESHOOTING_TYPE_INTERVENTION_OPTIONS : TROUBLESHOOTING_TYPE_OPTIONS}
                value={onFailure}
            />
            {match(onFailure)
                .with(OnFailure.ManualInterventionCall, () =>
                    phoneNumberInput('onFailureDialNumber', onChangeOnFailureDialNumber, onFailureDialNumber)
                )
                .with(OnFailure.ManualInterventionSms, () =>
                    phoneNumberInput('onFailureSmsNumber', onChangeOnFailureSmsNumber, onFailureSmsNumber)
                )
                .otherwise(() => null)}
        </div>
    );
}

/** @notExported */
export interface TroubleshootingProps extends TroubleshootingSharedProps {}

/**
 * Renders Troubleshooting
 */
export function Troubleshooting(props: TroubleshootingProps): ReactElement {
    const {
        isWebcast,
        onChangeOnFailure,
        onChangeOnFailureDialNumber,
        onChangeOnFailureSmsNumber,
        onFailure,
        onFailureDialNumber,
        onFailureInstructions,
        onFailureSmsNumber,
    } = props;
    return (
        <TroubleshootingUI
            isWebcast={isWebcast}
            onChangeOnFailure={onChangeOnFailure}
            onChangeOnFailureDialNumber={onChangeOnFailureDialNumber}
            onChangeOnFailureSmsNumber={onChangeOnFailureSmsNumber}
            onFailure={onFailure}
            onFailureDialNumber={onFailureDialNumber}
            onFailureInstructions={onFailureInstructions}
            onFailureSmsNumber={onFailureSmsNumber}
        />
    );
}
