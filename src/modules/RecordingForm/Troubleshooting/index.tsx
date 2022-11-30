import React, { FocusEventHandler, ReactElement } from 'react';
import { match } from 'ts-pattern';
import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { PhoneNumberInput } from '@aiera/client-sdk/components/PhoneNumberInput';
import { Textarea } from '@aiera/client-sdk/components/Textarea';
import {
    OnFailure,
    RecordingFormStateChangeHandler,
    TROUBLESHOOTING_TYPE_INTERVENTION_OPTIONS,
    TROUBLESHOOTING_TYPE_OPTIONS,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import './styles.css';

interface TroubleshootingSharedProps {
    hasAieraInterventionPermission: boolean;
    isWebcast: boolean;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    onFailure?: OnFailure;
    onFailureDialNumber?: string;
    onFailureInstructions?: string;
    onFailureSmsNumber?: string;
}

/** @notExported */
interface TroubleshootingUIProps extends TroubleshootingSharedProps {}

export function TroubleshootingUI(props: TroubleshootingUIProps): ReactElement {
    const {
        hasAieraInterventionPermission,
        isWebcast,
        onBlur,
        onChange,
        onFailure,
        onFailureDialNumber,
        onFailureInstructions,
        onFailureSmsNumber,
    } = props;
    const interventionCheckboxMsg =
        'Confirm that Aiera agents have permission to attempt to resolve any connection issues for this event';
    const phoneNumberInput = (name: string, value?: string) => (
        <FormField className="mt-5 px-4 py-3">
            <p className="font-semibold text-base text-black form-field__label">Your phone number</p>
            <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                What is the best number to reach you?
            </p>
            <PhoneNumberInput
                className="mt-3"
                defaultCountry="US"
                name={name}
                onBlur={onBlur}
                onChange={(value?: string) => onChange(null, { name, value })}
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
                onChange={onChange}
                options={isWebcast ? TROUBLESHOOTING_TYPE_INTERVENTION_OPTIONS : TROUBLESHOOTING_TYPE_OPTIONS}
                value={onFailure}
            />
            {match(onFailure)
                .with(OnFailure.ManualInterventionCall, () =>
                    phoneNumberInput('onFailureDialNumber', onFailureDialNumber)
                )
                .with(OnFailure.ManualInterventionSms, () => phoneNumberInput('onFailureSmsNumber', onFailureSmsNumber))
                .with(OnFailure.AieraIntervention, () => (
                    <FormField className="mt-5 px-4 py-3">
                        <p className="font-semibold text-base text-black form-field__label">Instructions</p>
                        <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                            Any information our agents might need to help connect your webcast
                        </p>
                        <Textarea
                            className="mt-3"
                            name="onFailureInstructions"
                            onChange={onChange}
                            placeholder="Passwords or other useful information"
                            value={onFailureInstructions}
                        />
                        <Checkbox
                            checked={hasAieraInterventionPermission}
                            className="flex-shrink-0 ml-auto mt-3"
                            label={interventionCheckboxMsg}
                            name="hasAieraInterventionPermission"
                            onChange={onChange}
                        />
                    </FormField>
                ))
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
        hasAieraInterventionPermission,
        isWebcast,
        onBlur,
        onChange,
        onFailure,
        onFailureDialNumber,
        onFailureInstructions,
        onFailureSmsNumber,
    } = props;
    return (
        <TroubleshootingUI
            hasAieraInterventionPermission={hasAieraInterventionPermission}
            isWebcast={isWebcast}
            onBlur={onBlur}
            onChange={onChange}
            onFailure={onFailure}
            onFailureDialNumber={onFailureDialNumber}
            onFailureInstructions={onFailureInstructions}
            onFailureSmsNumber={onFailureSmsNumber}
        />
    );
}
