import React, {
    Dispatch,
    FocusEvent,
    FocusEventHandler,
    MouseEventHandler,
    ReactElement,
    SetStateAction,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { match } from 'ts-pattern';

import { Button } from '@aiera/client-sdk/components/Button';
import { CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
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
    InputErrorState,
    InputTouchedState,
    OnFailure,
    ParticipationType,
    RecordingFormState,
    RecordingFormStateChangeEvent,
    RecordingFormStateChangeHandler,
    ScheduleMeridiem,
    ScheduleType,
    ZoomMeetingType,
} from './types';
import validateInput from './validateInput';
import './styles.css';

const NUM_STEPS = 5;

interface RecordingFormSharedProps {
    onBack: MouseEventHandler;
    privateRecordingId?: number | string;
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
    errors: InputErrorState;
    hasAieraInterventionPermission: boolean;
    isNextButtonDisabled: boolean;
    isWebcast: boolean;
    meetingType: string;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    onConnectDialNumber: string;
    onFailure?: OnFailure;
    onFailureDialNumber: string;
    onFailureInstructions: string;
    onFailureSmsNumber: string;
    onFocus: FocusEventHandler;
    onNextStep: Dispatch<SetStateAction<number>>;
    onPrevStep: Dispatch<SetStateAction<number>>;
    onSubmit: MouseEventHandler;
    participationType?: ParticipationType;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
    selectedCompany?: CompanyFilterResult;
    smsAlertBeforeCall: boolean;
    step: number;
    title: string;
    touched: InputTouchedState;
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
        errors,
        hasAieraInterventionPermission,
        isNextButtonDisabled,
        isWebcast,
        onBack,
        onBlur,
        onChange,
        onConnectDialNumber,
        onFailure,
        onFailureDialNumber,
        onFailureInstructions,
        onFailureSmsNumber,
        onFocus,
        onNextStep,
        onPrevStep,
        onSubmit,
        participationType,
        scheduleDate,
        scheduleMeridiem,
        scheduleTime,
        scheduleType,
        selectedCompany,
        smsAlertBeforeCall,
        step,
        title,
        touched,
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
                            onChange={onChange}
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
                            errors={errors}
                            onBlur={onBlur}
                            onChange={onChange}
                            onConnectDialNumber={onConnectDialNumber}
                            onFocus={onFocus}
                            participationType={participationType}
                            participationTypeOptions={PARTICIPATION_TYPE_OPTIONS}
                            smsAlertBeforeCall={smsAlertBeforeCall}
                            touched={touched}
                            zoomMeetingType={zoomMeetingType}
                        />
                    ))
                    .with(3, () => (
                        <Scheduling
                            connectOffsetSeconds={connectOffsetSeconds}
                            errors={errors}
                            onBlur={onBlur}
                            onChange={onChange}
                            scheduleDate={scheduleDate}
                            scheduleMeridiem={scheduleMeridiem}
                            scheduleTime={scheduleTime}
                            scheduleType={scheduleType}
                        />
                    ))
                    .with(4, () => (
                        <Troubleshooting
                            hasAieraInterventionPermission={hasAieraInterventionPermission}
                            isWebcast={isWebcast}
                            onBlur={onBlur}
                            onChange={onChange}
                            onFailure={onFailure}
                            onFailureDialNumber={onFailureDialNumber}
                            onFailureInstructions={onFailureInstructions}
                            onFailureSmsNumber={onFailureSmsNumber}
                        />
                    ))
                    .with(5, () => (
                        <RecordingDetails onChange={onChange} selectedCompany={selectedCompany} title={title} />
                    ))
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

/**
 * Renders RecordingForm
 */
export function RecordingForm(props: RecordingFormProps): ReactElement {
    const { onBack, privateRecordingId } = props;
    const { mergeState, state } = useChangeHandlers<RecordingFormState>({
        confirmPermission: true,
        connectAccessId: '',
        connectCallerId: '',
        connectionType: undefined,
        connectOffsetSeconds: 0,
        connectPhoneNumber: '',
        connectPin: '',
        connectUrl: '',
        hasAieraInterventionPermission: false,
        meetingType: '',
        onConnectDialNumber: '',
        onFailure: undefined,
        onFailureDialNumber: '',
        onFailureInstructions: '',
        onFailureSmsNumber: '',
        participationType: undefined,
        scheduleDate: new Date(),
        scheduleMeridiem: ScheduleMeridiem.AM,
        scheduleTime: '',
        scheduleType: undefined,
        selectedCompany: undefined,
        smsAlertBeforeCall: false,
        title: '',
        useOnConnectDialNumber: false,
        zoomMeetingType: undefined,
    });
    const [step, setStep] = useState<number>(1);

    const [errors, setErrors] = useState<InputErrorState>({});
    // Keep track of which inputs have been in focus to
    // conditionally show errors, if any
    const [touched, setTouched] = useState<InputTouchedState>({});

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
            errors={errors}
            hasAieraInterventionPermission={state.hasAieraInterventionPermission}
            isNextButtonDisabled={isNextButtonDisabled}
            isWebcast={isWebcast}
            meetingType={state.meetingType}
            onBack={onBack}
            onBlur={useCallback(
                (event: FocusEvent<HTMLInputElement>) =>
                    setErrors(
                        validateInput({
                            errorState: errors,
                            isNewRecording: !!privateRecordingId,
                            name: event?.target?.name,
                            state,
                            value: event?.target?.value,
                        })
                    ),
                [errors, privateRecordingId, state, validateInput]
            )}
            onChange={useCallback(
                (_, { name = '', value }: RecordingFormStateChangeEvent) => {
                    mergeState({ [name]: value });
                    setErrors(
                        validateInput({
                            errorState: errors,
                            isNewRecording: !!privateRecordingId,
                            name,
                            state,
                            value,
                        })
                    );
                },
                [errors, validateInput]
            )}
            onConnectDialNumber={state.onConnectDialNumber}
            onFailure={state.onFailure}
            onFailureDialNumber={state.onFailureDialNumber}
            onFailureInstructions={state.onFailureInstructions}
            onFailureSmsNumber={state.onFailureSmsNumber}
            onFocus={useCallback(
                (event: FocusEvent<HTMLInputElement>) => {
                    const name = event?.target?.name;
                    if (name) {
                        setTouched({ [name]: true });
                    }
                },
                [setTouched]
            )}
            onNextStep={setStep}
            onPrevStep={setStep}
            onSubmit={() => console.log('SUBMITTED')}
            participationType={state.participationType}
            scheduleDate={state.scheduleDate}
            scheduleMeridiem={state.scheduleMeridiem}
            scheduleTime={state.scheduleTime}
            scheduleType={state.scheduleType}
            selectedCompany={state.selectedCompany}
            smsAlertBeforeCall={state.smsAlertBeforeCall}
            step={step}
            title={state.title}
            touched={touched}
            zoomMeetingType={state.zoomMeetingType}
        />
    );
}
