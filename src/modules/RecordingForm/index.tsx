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
import {
    CONNECTION_TYPE_OPTION_WEBCAST,
    CONNECTION_TYPE_OPTION_ZOOM,
    CONNECTION_TYPE_OPTIONS,
    CONNECTION_TYPE_OPTIONS_MAP,
    PARTICIPATION_TYPE_OPTIONS,
    ZOOM_MEETING_TYPE_OPTION_WEB,
    ConnectionType,
    OnFailure,
    ParticipationType,
    ScheduleMeridiem,
    ScheduleType,
    ZoomMeetingType,
} from './types';
import './styles.css';

const NUM_STEPS = 5;

interface RecordingFormSharedProps {
    onBack: MouseEventHandler;
}

/** @notExported */
interface RecordingFormUIProps extends RecordingFormSharedProps {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectOffsetSeconds: number;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    isNextButtonDisabled: boolean;
    isWebcast: boolean;
    meetingType: string;
    onChangeConnectAccessId: ChangeHandler<string>;
    onChangeConnectCallerId: ChangeHandler<string>;
    onChangeConnectDialNumber: Dispatch<SetStateAction<string>>;
    onChangeConnectionType: ChangeHandler<ConnectionType>;
    onChangeConnectOffsetSeconds: ChangeHandler<number>;
    onChangeConnectPhoneNumber: ChangeHandler<string>;
    onChangeConnectPin: ChangeHandler<string>;
    onChangeConnectUrl: ChangeHandler<string>;
    onChangeOnFailure: ChangeHandler<OnFailure>;
    onChangeOnFailureDialNumber: Dispatch<SetStateAction<string>>;
    onChangeOnFailureSmsNumber: Dispatch<SetStateAction<string>>;
    onChangeParticipationType: ChangeHandler<ParticipationType>;
    onChangeScheduleDate: ChangeHandler<Date>;
    onChangeScheduleMeridiem: ChangeHandler<ScheduleMeridiem>;
    onChangeScheduleTime: ChangeHandler<string>;
    onChangeScheduleType: ChangeHandler<ScheduleType>;
    onChangeZoomMeetingType: ChangeHandler<ZoomMeetingType>;
    onConnectDialNumber: string;
    onFailure?: OnFailure;
    onFailureDialNumber?: string;
    onFailureInstructions?: string;
    onFailureSmsNumber?: string;
    onNextStep: Dispatch<SetStateAction<number>>;
    onPrevStep: Dispatch<SetStateAction<number>>;
    onSubmit: MouseEventHandler;
    participationType?: ParticipationType;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
    smsAlertBeforeCall: boolean;
    step: number;
    toggleSMSAlertBeforeCall: ChangeHandler<boolean>;
    zoomMeetingType?: ZoomMeetingType;
}

export function RecordingFormUI(props: RecordingFormUIProps): ReactElement {
    const {
        connectAccessId,
        connectCallerId,
        connectionType,
        connectOffsetSeconds,
        connectPhoneNumber,
        connectPin,
        connectUrl,
        isNextButtonDisabled,
        isWebcast,
        onBack,
        onChangeConnectAccessId,
        onChangeConnectCallerId,
        onChangeConnectDialNumber,
        onChangeConnectionType,
        onChangeConnectOffsetSeconds,
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeOnFailure,
        onChangeOnFailureDialNumber,
        onChangeOnFailureSmsNumber,
        onChangeParticipationType,
        onChangeScheduleDate,
        onChangeScheduleMeridiem,
        onChangeScheduleTime,
        onChangeScheduleType,
        onChangeZoomMeetingType,
        onConnectDialNumber,
        onFailure,
        onFailureDialNumber,
        onFailureInstructions,
        onFailureSmsNumber,
        onNextStep,
        onPrevStep,
        onSubmit,
        participationType,
        scheduleDate,
        scheduleMeridiem,
        scheduleTime,
        scheduleType,
        smsAlertBeforeCall,
        step,
        toggleSMSAlertBeforeCall,
        zoomMeetingType,
    } = props;
    return (
        <div className="bg-slate-50 h-full flex flex-col justify-between recording-form">
            <div className="bg-white flex flex-col pt-3 px-3 shadow-3xl z-10 dark:shadow-3xl-dark dark:bg-bluegray-6 recording-form__header">
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
            <div className="h-full overflow-y-scroll pb-3 px-3 shadow-3xl">
                {match(step)
                    .with(1, () => (
                        <ConnectionTypeComponent
                            connectionType={connectionType}
                            connectionTypeOptions={CONNECTION_TYPE_OPTIONS}
                            onChange={onChangeConnectionType}
                        />
                    ))
                    .with(2, () => (
                        <ConnectionDetails
                            connectAccessId={connectAccessId}
                            connectCallerId={connectCallerId}
                            connectionType={connectionType}
                            connectPhoneNumber={connectPhoneNumber}
                            connectPin={connectPin}
                            connectUrl={connectUrl}
                            onChangeConnectAccessId={onChangeConnectAccessId}
                            onChangeConnectCallerId={onChangeConnectCallerId}
                            onChangeConnectDialNumber={onChangeConnectDialNumber}
                            onChangeConnectPhoneNumber={onChangeConnectPhoneNumber}
                            onChangeConnectPin={onChangeConnectPin}
                            onChangeConnectUrl={onChangeConnectUrl}
                            onChangeParticipationType={onChangeParticipationType}
                            onChangeZoomMeetingType={onChangeZoomMeetingType}
                            onConnectDialNumber={onConnectDialNumber}
                            participationType={participationType}
                            participationTypeOptions={PARTICIPATION_TYPE_OPTIONS}
                            smsAlertBeforeCall={smsAlertBeforeCall}
                            toggleSMSAlertBeforeCall={toggleSMSAlertBeforeCall}
                            zoomMeetingType={zoomMeetingType}
                        />
                    ))
                    .with(3, () => (
                        <Scheduling
                            connectOffsetSeconds={connectOffsetSeconds}
                            onChangeConnectOffsetSeconds={onChangeConnectOffsetSeconds}
                            onChangeScheduleDate={onChangeScheduleDate}
                            onChangeScheduleMeridiem={onChangeScheduleMeridiem}
                            onChangeScheduleTime={onChangeScheduleTime}
                            onChangeScheduleType={onChangeScheduleType}
                            scheduleDate={scheduleDate}
                            scheduleMeridiem={scheduleMeridiem}
                            scheduleTime={scheduleTime}
                            scheduleType={scheduleType}
                        />
                    ))
                    .with(4, () => (
                        <Troubleshooting
                            isWebcast={isWebcast}
                            onChangeOnFailure={onChangeOnFailure}
                            onChangeOnFailureDialNumber={onChangeOnFailureDialNumber}
                            onChangeOnFailureSmsNumber={onChangeOnFailureSmsNumber}
                            onFailure={onFailure}
                            onFailureDialNumber={onFailureDialNumber}
                            onFailureInstructions={onFailureInstructions}
                            onFailureSmsNumber={onFailureSmsNumber}
                        />
                    ))
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
                                .with(1, () => {
                                    const connectionTypeOption = connectionType
                                        ? CONNECTION_TYPE_OPTIONS_MAP[connectionType]
                                        : null;
                                    return `Configure ${connectionTypeOption ? connectionTypeOption.label : ''}`;
                                })
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
    connectOffsetSeconds: number;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    meetingType: string;
    onFailure?: OnFailure;
    onFailureInstructions?: string;
    participationType?: ParticipationType;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
    smsAlertBeforeCall: boolean;
    zoomMeetingType?: ZoomMeetingType;
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
        connectOffsetSeconds: 0,
        connectPhoneNumber: '',
        connectPin: '',
        connectUrl: '',
        meetingType: '',
        onFailure: undefined,
        onFailureInstructions: '',
        participationType: undefined,
        scheduleDate: new Date(),
        scheduleMeridiem: ScheduleMeridiem.AM,
        scheduleTime: '',
        scheduleType: undefined,
        smsAlertBeforeCall: false,
        zoomMeetingType: undefined,
    });
    const [step, setStep] = useState<number>(1);

    // Need to track onConnectDialNumber, onFailureDialNumber, and onFailureSmsNumber separately
    // because the react-phone-number-input library doesn't send the event with the onChange callback,
    // so we can't use useChangeHandlers
    const [onConnectDialNumber, onChangeConnectDialNumber] = useState<string>('');
    const [onFailureDialNumber, onChangeOnFailureDialNumber] = useState<string>('');
    const [onFailureSmsNumber, onChangeOnFailureSmsNumber] = useState<string>('');

    const isNextButtonDisabled = useMemo(() => step >= 1 && !state.connectionType, [state, step]);
    const isWebcast = useMemo(
        () =>
            state.connectionType === CONNECTION_TYPE_OPTION_WEBCAST.value ||
            (state.connectionType === CONNECTION_TYPE_OPTION_ZOOM.value &&
                state.zoomMeetingType === ZOOM_MEETING_TYPE_OPTION_WEB.value),
        [state.connectionType, state.zoomMeetingType]
    );

    return (
        <RecordingFormUI
            connectAccessId={state.connectAccessId}
            connectCallerId={state.connectCallerId}
            connectionType={state.connectionType}
            connectOffsetSeconds={state.connectOffsetSeconds}
            connectPhoneNumber={state.connectPhoneNumber}
            connectPin={state.connectPin}
            connectUrl={state.connectUrl}
            isNextButtonDisabled={isNextButtonDisabled}
            isWebcast={isWebcast}
            meetingType={state.meetingType}
            onBack={onBack}
            onChangeConnectAccessId={handlers.connectAccessId}
            onChangeConnectCallerId={handlers.connectCallerId}
            onChangeConnectDialNumber={onChangeConnectDialNumber}
            onChangeConnectionType={handlers.connectionType}
            onChangeConnectOffsetSeconds={handlers.connectOffsetSeconds}
            onChangeConnectPhoneNumber={handlers.connectPhoneNumber}
            onChangeConnectPin={handlers.connectPin}
            onChangeConnectUrl={handlers.connectUrl}
            onChangeOnFailure={handlers.onFailure}
            onChangeOnFailureDialNumber={onChangeOnFailureDialNumber}
            onChangeOnFailureSmsNumber={onChangeOnFailureSmsNumber}
            onChangeParticipationType={handlers.participationType}
            onChangeScheduleDate={handlers.scheduleDate}
            onChangeScheduleMeridiem={handlers.scheduleMeridiem}
            onChangeScheduleTime={handlers.scheduleTime}
            onChangeScheduleType={handlers.scheduleType}
            onChangeZoomMeetingType={handlers.zoomMeetingType}
            onConnectDialNumber={onConnectDialNumber}
            onFailure={state.onFailure}
            onFailureDialNumber={onFailureDialNumber}
            onFailureInstructions={state.onFailureInstructions}
            onFailureSmsNumber={onFailureSmsNumber}
            onNextStep={setStep}
            onPrevStep={setStep}
            onSubmit={() => console.log('SUBMITTED')}
            participationType={state.participationType}
            scheduleDate={state.scheduleDate}
            scheduleMeridiem={state.scheduleMeridiem}
            scheduleTime={state.scheduleTime}
            scheduleType={state.scheduleType}
            smsAlertBeforeCall={state.smsAlertBeforeCall}
            toggleSMSAlertBeforeCall={handlers.smsAlertBeforeCall}
            step={step}
            zoomMeetingType={state.zoomMeetingType}
        />
    );
}
