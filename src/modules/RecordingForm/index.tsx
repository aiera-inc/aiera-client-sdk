import React, { Dispatch, MouseEventHandler, ReactElement, SetStateAction, useMemo, useState } from 'react';
import { match } from 'ts-pattern';

import { Button } from '@aiera/client-sdk/components/Button';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { ConnectionType as ConnectionTypeComponent } from './ConnectionType';
import { ConnectionDetails } from './ConnectionDetails';
import { RecordingDetails } from './RecordingDetails';
import { Scheduling } from './Scheduling';
import { Troubleshooting } from './Troubleshooting';
import './styles.css';

const NUM_STEPS = 5;

/**
 * BEGIN TEMPORARY TYPES
 * TODO: remove these once the server generates them
 */
export enum ConnectionType {
    GoogleMeet = 'google_meet',
    PhoneNumber = 'phone',
    Webcast = 'webcast',
    Zoom = 'zoom',
}
/**
 * END TEMPORARY TYPES
 */

export const CONNECTION_TYPE_OPTIONS = {
    [ConnectionType.Zoom]: {
        label: 'Zoom',
        value: ConnectionType.Zoom,
        description: 'Connect to a Zoom dial-in number',
    },
    [ConnectionType.GoogleMeet]: {
        label: 'Google Meet',
        value: ConnectionType.GoogleMeet,
        description: 'Connect to a Google Meet dial-in number',
    },
    [ConnectionType.Webcast]: {
        label: 'Webcast URL',
        value: ConnectionType.Webcast,
        description: 'Connect to a webcast url',
    },
    [ConnectionType.PhoneNumber]: {
        label: 'Phone Number',
        value: ConnectionType.PhoneNumber,
        description: 'Connect to any phone number, with optional pin',
    },
};

export type ConnectionTypeOption = {
    [key in ConnectionType]: {
        description: string;
        label: string;
        value: ConnectionType;
    };
};

interface RecordingFormSharedProps {
    onBack: MouseEventHandler;
}

/** @notExported */
interface RecordingFormUIProps extends RecordingFormSharedProps {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    isNextButtonDisabled: boolean;
    meetingType: string;
    onChangeConnectionType: ChangeHandler<ConnectionType>;
    onConnectDialNumber: string;
    onNextStep: Dispatch<SetStateAction<number>>;
    onPrevStep: Dispatch<SetStateAction<number>>;
    onSubmit: MouseEventHandler;
    participationType: string;
    smsAlertBeforeCall: boolean;
    step: number;
}

export function RecordingFormUI(props: RecordingFormUIProps): ReactElement {
    const {
        connectionType,
        isNextButtonDisabled,
        onBack,
        onChangeConnectionType,
        onNextStep,
        onPrevStep,
        onSubmit,
        step,
    } = props;
    return (
        <div className="bg-[#F7F8FB] h-full flex flex-col justify-between recording-form">
            <div className="bg-white flex flex-col pt-3 px-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 recording-form__header">
                <div className="flex items-center mb-3">
                    <Button className="mr-2" onClick={onBack}>
                        <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                        Recordings
                    </Button>
                    <p className="ml-auto text-gray-400 text-sm">
                        Step {step} of {NUM_STEPS}
                    </p>
                </div>
            </div>
            <div className="h-full pb-3 px-3 shadow-3xl">
                {match(step)
                    .with(1, () => (
                        <ConnectionTypeComponent
                            connectionType={connectionType}
                            connectionTypeOptions={CONNECTION_TYPE_OPTIONS}
                            onChange={onChangeConnectionType}
                        />
                    ))
                    .with(2, () => <ConnectionDetails />)
                    .with(3, () => <Scheduling />)
                    .with(4, () => <Troubleshooting />)
                    .with(5, () => <RecordingDetails />)
                    .otherwise(() => null)}
            </div>
            <div className="bg-white border-gray-200 border-opacity-80 border-t flex flex-col pt-3 px-3 shadow-inner recording-form__footer">
                <div className="flex items-center mb-3">
                    {step > 1 && (
                        <div
                            className="cursor-pointer flex group items-center mr-2 prev-step"
                            onClick={() => onPrevStep(step - 1)}
                        >
                            <ArrowLeft className="fill-current mr-2 relative text-black w-3.5 z-1 group-active:fill-current group-active:text-white" />
                            <span className="text-sm group-hover:underline">
                                {match(step)
                                    .with(2, () => 'Change Connection')
                                    .with(3, () => 'Change Configuration')
                                    .with(4, () => 'Scheduling')
                                    .with(5, () => 'Troubleshooting')
                                    .otherwise(() => null)}
                            </span>
                        </div>
                    )}
                    <Button
                        className="bg-blue-500 cursor-pointer flex items-center ml-auto rounded-0.375 active:bg-blue-700 hover:bg-blue-600 next-step"
                        disabled={isNextButtonDisabled}
                        onClick={(event) => (step === NUM_STEPS ? onSubmit(event) : onNextStep(step + 1))}
                    >
                        <span className="font-light text-sm text-white">
                            {match(step)
                                .with(
                                    1,
                                    () =>
                                        `Configure ${
                                            connectionType ? CONNECTION_TYPE_OPTIONS[connectionType].label : ''
                                        }`
                                )
                                .with(2, () => 'Scheduling')
                                .with(3, () => 'Troubleshooting')
                                .with(4, () => 'Recording Details')
                                .with(5, () => 'Create Recording')
                                .otherwise(() => null)}
                        </span>
                        <ArrowLeft className="fill-current ml-2 relative rotate-180 text-white w-3.5 z-1 group-active:fill-current group-active:text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface RecordingFormProps extends RecordingFormSharedProps {}

interface RecordingFormState {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    meetingType: string;
    onConnectDialNumber: string;
    participationType: string;
    smsAlertBeforeCall: boolean;
}

/**
 * Renders RecordingForm
 */
export function RecordingForm(props: RecordingFormProps): ReactElement {
    const { onBack } = props;
    const { handlers, state } = useChangeHandlers<RecordingFormState>({
        connectAccessId: '',
        connectCallerId: '',
        connectionType: undefined,
        connectPhoneNumber: '',
        connectPin: '',
        connectUrl: '',
        meetingType: '',
        onConnectDialNumber: '',
        participationType: '',
        smsAlertBeforeCall: false,
    });
    const [step, setStep] = useState<number>(1);

    const isNextButtonDisabled = useMemo(() => step >= 1 && !state.connectionType, [state, step]);

    return (
        <RecordingFormUI
            connectAccessId={state.connectAccessId}
            connectCallerId={state.connectCallerId}
            connectionType={state.connectionType}
            connectPhoneNumber={state.connectPhoneNumber}
            connectPin={state.connectPin}
            connectUrl={state.connectUrl}
            isNextButtonDisabled={isNextButtonDisabled}
            meetingType={state.meetingType}
            onBack={onBack}
            onChangeConnectionType={handlers.connectionType}
            onConnectDialNumber={state.onConnectDialNumber}
            onNextStep={setStep}
            onPrevStep={setStep}
            onSubmit={() => console.log('SUBMITTED')}
            participationType={state.participationType}
            smsAlertBeforeCall={state.smsAlertBeforeCall}
            step={step}
        />
    );
}
