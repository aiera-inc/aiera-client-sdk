import React, {
    Dispatch,
    FocusEvent,
    FocusEventHandler,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { useMutation } from 'urql';

import { Button } from '@aiera/client-sdk/components/Button';
import { CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import {
    CreatePrivateRecordingInput,
    CreatePrivateRecordingMutation,
    CreatePrivateRecordingMutationVariables,
    PrOnFailure,
    RecordingsQuery,
    RecordingsQueryVariables,
    UpdatePrivateRecordingInput,
    UpdatePrivateRecordingMutation,
    UpdatePrivateRecordingMutationVariables,
} from '@aiera/client-sdk/types/generated';

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
    ConnectionType,
    InputErrorState,
    InputTouchedState,
    OnFailure,
    PARTICIPATION_TYPE_OPTIONS,
    ParticipationType,
    RecordingFormState,
    RecordingFormStateChangeEvent,
    RecordingFormStateChangeHandler,
    ScheduleMeridiem,
    ScheduleType,
    ZOOM_MEETING_TYPE_OPTION_WEB,
    ZoomMeetingType,
} from './types';
import validateInput from './validateInput';
import './styles.css';
import { useQuery } from '@aiera/client-sdk/api/client';

// Map validated input names to error hints displayed above the submit button
const INPUT_FIELD_LABELS = {
    audioUpload: 'File',
    confirmPermission: 'Agent intervention permission checkbox',
    connectAccessId: 'Meeting ID',
    connectionType: 'Type of connection',
    connectPhoneNumber: 'Dial-in number',
    connectPin: 'PIN',
    connectUrl: 'URL',
    localeCode: 'Language',
    onConnectDialNumber: 'Your phone number',
    onFailurePhoneNumber: 'Best number to reach you',
    participationType: 'How we should connect',
    scheduleTime: 'Time',
    title: 'Title',
} as { [key: keyof InputErrorState]: string };
const NUM_STEPS = 5;

interface RecordingFormSharedProps {
    onBack: MouseEventHandler;
    privateRecordingId?: number | string;
}

type PrivateRecording = RecordingsQuery['privateRecordings'][0];
type SubmitState = 'none' | 'loading' | 'error' | 'submitted';

/** @notExported */
interface RecordingFormUIProps extends RecordingFormSharedProps {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectOffsetSeconds: number;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    editing: boolean;
    errorHints?: { [key: string]: string[] };
    errors: InputErrorState;
    hasAieraInterventionPermission: boolean;
    isNextButtonDisabled: boolean;
    isWebcast: boolean;
    meetingType: string;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    onCompleteEmailCreator: boolean;
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
    submitState: SubmitState;
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
        editing,
        errorHints,
        errors,
        hasAieraInterventionPermission,
        isNextButtonDisabled,
        isWebcast,
        onBack,
        onBlur,
        onChange,
        onCompleteEmailCreator,
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
        submitState,
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
                        Back to list
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
                            errors={errors}
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
                        <RecordingDetails
                            errors={errors}
                            onBlur={onBlur}
                            onChange={onChange}
                            onCompleteEmailCreator={onCompleteEmailCreator}
                            selectedCompany={selectedCompany}
                            title={title}
                        />
                    ))
                    .otherwise(() => null)}
            </div>
            <div className="bg-white border-gray-200 border-opacity-80 border-t flex flex-col pt-3 px-3 shadow-inner recording-form__footer">
                <div className="flex items-center mb-3 relative">
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
                    <Tooltip
                        className="ml-auto"
                        closeOn="hover"
                        content={
                            isNextButtonDisabled && errorHints && Object.keys(errorHints).length > 0 ? (
                                <div className="backdrop-blur-[6px] bg-black flex-col items-start justify-center py-1 px-1.5 rounded-md text-sm text-white">
                                    {Object.keys(errorHints).map((key) => (
                                        <span className="leading-5 text-sm" key={key}>
                                            {`${key}: ${(errorHints[key] as string[]).join(', ')}`}
                                            <br />
                                        </span>
                                    ))}
                                </div>
                            ) : null
                        }
                        grow="up-left"
                        hideOnDocumentScroll
                        openOn="hover"
                        position="top-right"
                        yOffset={12}
                    >
                        {match(submitState)
                            .with('none', 'error', 'submitted', () => (
                                <Button
                                    className={classNames(
                                        'bg-blue-500 cursor-pointer flex items-center rounded-0.375 active:bg-blue-700 hover:bg-blue-600 next-step',
                                        { 'cursor-not-allowed': isNextButtonDisabled }
                                    )}
                                    disabled={isNextButtonDisabled}
                                    onClick={(event) => (step === NUM_STEPS ? onSubmit(event) : onNextStep(step + 1))}
                                >
                                    <span className="font-light text-sm text-white">
                                        {match(step)
                                            .with(1, () => {
                                                const connectionTypeOption = connectionType
                                                    ? CONNECTION_TYPE_OPTIONS_MAP[connectionType]
                                                    : null;
                                                return `Configure ${
                                                    connectionTypeOption ? connectionTypeOption.label : ''
                                                }`;
                                            })
                                            .with(2, () => 'Scheduling')
                                            .with(3, () => 'Troubleshooting')
                                            .with(4, () => 'Recording Details')
                                            .with(5, () => `${editing ? 'Update' : 'Create'} Recording`)
                                            .otherwise(() => null)}
                                    </span>
                                    <ArrowLeft className="fill-current ml-2 relative rotate-180 text-white w-3.5 z-1 group-active:fill-current group-active:text-white" />
                                </Button>
                            ))
                            .with('loading', () => {
                                return (
                                    <Button className="justify-center w-32" disabled kind="primary">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce animation" />
                                        <div className="w-2 h-2 ml-1 bg-white rounded-full animate-bounce animation-delay-100" />
                                        <div className="w-2 h-2 ml-1 bg-white rounded-full animate-bounce animation-delay-200" />
                                    </Button>
                                );
                            })
                            .exhaustive()}
                    </Tooltip>
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
        connectAccessId: '',
        connectCallerId: '',
        connectionType: undefined,
        connectOffsetSeconds: 0,
        connectPhoneNumber: '',
        connectPin: '',
        connectUrl: '',
        hasAieraInterventionPermission: false,
        meetingType: '',
        onCompleteEmailCreator: true,
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
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    // Keep track of which inputs have been in focus to
    // conditionally show errors, if any
    const [touched, setTouched] = useState<InputTouchedState>({});

    const isNextButtonDisabled: boolean = useMemo(() => {
        let disabled = false;
        if (step >= 1 && !state.connectionType) {
            disabled = true;
        }
        if (
            state.connectionType &&
            step >= 2 &&
            ((state.connectionType === ConnectionType.Zoom && !state.zoomMeetingType) ||
                ([ConnectionType.GoogleMeet, ConnectionType.Phone].includes(state.connectionType) &&
                    !state.participationType) ||
                Object.keys(errors).length > 0)
        ) {
            disabled = true;
        }
        if (step >= 3 && !state.scheduleType) {
            disabled = true;
        }
        if (step >= 4 && !state.onFailure) {
            disabled = true;
        }
        if (step >= NUM_STEPS && (!state.title || !hasChanges)) {
            disabled = true;
        }
        return disabled;
    }, [errors, state.connectionType, state.zoomMeetingType, step]);
    const isWebcast: boolean = useMemo(
        () =>
            state.connectionType === CONNECTION_TYPE_OPTION_WEBCAST.value ||
            (state.connectionType === CONNECTION_TYPE_OPTION_ZOOM.value &&
                state.zoomMeetingType === ZOOM_MEETING_TYPE_OPTION_WEB.value),
        [state.connectionType, state.zoomMeetingType]
    );
    // Converts time to 24 hours
    const convertedTime: string | null = useMemo(() => {
        let converted = null;
        if (state.scheduleTime && state.scheduleMeridiem) {
            const minutes = state.scheduleTime.slice(-2);
            let hour = parseInt(state.scheduleTime.slice(0, state.scheduleTime.length > 3 ? 2 : 1), 0);
            if (hour < 12 && state.scheduleMeridiem === ScheduleMeridiem.PM) {
                hour += 12;
            } else if (hour === 12 && state.scheduleMeridiem === ScheduleMeridiem.AM) {
                hour = 0;
            }
            converted = `${hour < 10 ? `0${hour}` : hour}:${minutes}:00.000Z`;
        }
        return converted;
    }, [state.scheduleTime, state.scheduleMeridiem]);
    const errorHints: { [key: string]: string[] } = useMemo(() => {
        const hints = {} as { [key: string]: string[] };
        if (Object.keys(errors).length) {
            Object.keys(errors).forEach((key: keyof InputErrorState) => {
                const value = errors[key] as string;
                const label = INPUT_FIELD_LABELS[key] as string;
                if (hints[value]) {
                    (hints[value] as string[]).push(label);
                } else {
                    hints[value] = [label];
                }
            });
        }
        return hints;
    }, [errors]);
    const mapStateToOnFailure: PrOnFailure = useMemo(
        () =>
            match(state.onFailure)
                .with(OnFailure.AieraIntervention, () => PrOnFailure.AieraIntervention)
                .with(
                    OnFailure.ManualInterventionCall,
                    OnFailure.ManualInterventionSms,
                    () => PrOnFailure.ManualIntervention
                )
                .otherwise(() => PrOnFailure.None),
        [state.onFailure]
    );
    const mapStateToScheduledFor: string = useMemo(() => {
        let dateTime = (state.scheduleType === ScheduleType.Now ? new Date() : state.scheduleDate).toISOString();
        if (state.scheduleType === ScheduleType.Future && convertedTime) {
            // Combine the date and time from state
            dateTime = dateTime.replace(/[^T]*$/, convertedTime);
        }
        return dateTime;
    }, [convertedTime, state.scheduleDate, state.scheduleMeridiem, state.scheduleTime, state.scheduleType]);
    const privateRecordingInput: CreatePrivateRecordingInput | UpdatePrivateRecordingInput = useMemo(
        () => ({
            companyIds: state.selectedCompany ? [parseInt(state.selectedCompany.id)] : undefined,
            connectAccessId: state.connectAccessId,
            connectCallerId: state.connectCallerId,
            connectionType: state.connectionType as ConnectionType,
            connectOffsetSeconds: state.connectOffsetSeconds,
            connectPhoneNumber: state.connectPhoneNumber,
            connectPin: state.connectPin,
            connectUrl: state.connectUrl,
            onCompleteEmailCreator: state.onCompleteEmailCreator,
            onConnectDialNumber: state.onConnectDialNumber,
            onFailure: mapStateToOnFailure,
            onFailureDialNumber: state.onFailureDialNumber,
            onFailureInstructions: state.onFailureInstructions,
            onFailureSmsNumber: state.onFailureSmsNumber,
            privateRecordingId,
            scheduledFor: mapStateToScheduledFor,
            smsAlertBeforeCall: state.smsAlertBeforeCall,
            title: state.title,
        }),
        [mapStateToOnFailure, mapStateToScheduledFor, privateRecordingId, state]
    );

    /**
     * Recordings query for editing
     */
    const recordingsQuery = useQuery<RecordingsQuery, RecordingsQueryVariables>({
        isEmpty: ({ privateRecordings }) => privateRecordings.length === 0,
        query: gql`
            query Recordings($filter: PrivateRecordingFilter) {
                privateRecordings(filter: $filter) {
                    id
                    connectAccessId
                    connectCallerId
                    connectionType
                    connectOffsetSeconds
                    connectPhoneNumber
                    connectPin
                    connectUrl
                    onCompleteEmailCreator
                    onConnectDialNumber
                    onFailure
                    onFailureDialNumber
                    onFailureInstructions
                    onFailureSmsNumber
                    primaryCompany {
                        id
                        commonName
                        instruments {
                            id
                            isPrimary
                            quotes {
                                id
                                exchange {
                                    id
                                    country {
                                        id
                                        countryCode
                                    }
                                    shortName
                                }
                                isPrimary
                                localTicker
                            }
                        }
                    }
                    scheduledFor
                    smsAlertBeforeCall
                    title
                }
            }
        `,
        pause: !privateRecordingId,
        requestPolicy: 'cache-and-network',
        variables: {
            filter: privateRecordingId ? { privateRecordingId: String(privateRecordingId) } : undefined,
        },
    });

    // Update state when the recording is loaded for editing
    useEffect(() => {
        if (recordingsQuery.status === 'success') {
            const privateRecording: PrivateRecording | undefined = recordingsQuery.data.privateRecordings[0];
            const connectUrl = privateRecording?.connectUrl || '';
            const onConnectDialNumber = privateRecording?.onConnectDialNumber || '';
            const onFailureProp = privateRecording?.onFailure;
            const onFailureDialNumber = privateRecording?.onFailureDialNumber || '';
            const onFailureSmsNumber = privateRecording?.onFailureSmsNumber || '';
            const scheduledFor = privateRecording?.scheduledFor;
            // Map onFailure to state
            let onFailure;
            if (onFailureProp === PrOnFailure.ManualIntervention) {
                if (onFailureDialNumber) {
                    onFailure = OnFailure.ManualInterventionCall;
                }
                if (onFailureSmsNumber) {
                    onFailure = OnFailure.ManualInterventionSms;
                }
            } else if (onFailureProp === PrOnFailure.AieraIntervention) {
                onFailure = OnFailure.AieraIntervention;
            } else {
                onFailure = OnFailure.None;
            }
            // Map scheduledFor to state
            const scheduleDate = scheduledFor ? new Date(scheduledFor) : new Date();
            let scheduleMeridiem = ScheduleMeridiem.AM;
            let scheduleTime = '';
            let scheduleType;
            if (scheduledFor) {
                const timeParts = scheduleDate.toLocaleTimeString().split(' ');
                if (timeParts[1] === 'PM') {
                    scheduleMeridiem = ScheduleMeridiem.PM;
                }
                const time = timeParts[0]?.split(':');
                if (time) {
                    const hour = time[0] || '';
                    const minute = time[1] || '';
                    scheduleTime = `${hour}:${minute}`;
                }
                scheduleType = ScheduleType.Future;
            }
            mergeState({
                connectAccessId: privateRecording?.connectAccessId || '',
                connectCallerId: privateRecording?.connectCallerId || '',
                connectionType: privateRecording?.connectionType,
                connectOffsetSeconds: privateRecording?.connectOffsetSeconds || 0,
                connectPhoneNumber: privateRecording?.connectPhoneNumber || '',
                connectPin: privateRecording?.connectPin || '',
                connectUrl,
                // equityIds: get(privateRecording, 'equityIds', []).map((id) => `${id}`),
                hasAieraInterventionPermission: !!privateRecording,
                onCompleteEmailCreator: privateRecording?.onCompleteEmailCreator || true,
                onConnectDialNumber,
                onFailure,
                onFailureDialNumber,
                onFailureInstructions: privateRecording?.onFailureInstructions || '',
                onFailureSmsNumber,
                participationType: onConnectDialNumber
                    ? ParticipationType.Participating
                    : ParticipationType.NotParticipating,
                scheduleDate,
                scheduleMeridiem,
                scheduleTime,
                scheduleType,
                selectedCompany: privateRecording?.primaryCompany
                    ? (privateRecording.primaryCompany as CompanyFilterResult)
                    : undefined,
                smsAlertBeforeCall: privateRecording?.smsAlertBeforeCall || false,
                title: privateRecording?.title || '',
                useOnConnectDialNumber: [onFailureDialNumber, onFailureSmsNumber].includes(onConnectDialNumber),
                zoomMeetingType: connectUrl.length ? ZoomMeetingType.Web : ZoomMeetingType.Phone,
            });
        }
    }, [mergeState, privateRecordingId, recordingsQuery]);

    /**
     * Mutations
     */
    const [submitState, setSubmitState] = useState<SubmitState>('none');
    const [_, createPrivateRecordingMutation] = useMutation<
        CreatePrivateRecordingMutation,
        CreatePrivateRecordingMutationVariables
    >(gql`
        mutation CreatePrivateRecording($input: CreatePrivateRecordingInput!) {
            createPrivateRecording(input: $input) {
                success
            }
        }
    `);
    const createPrivateRecording = useCallback(async () => {
        setSubmitState('loading');
        return createPrivateRecordingMutation({ input: privateRecordingInput })
            .then((resp) => {
                if (resp.data?.createPrivateRecording?.success) {
                    setSubmitState('submitted');
                } else {
                    throw new Error('Error creating recording');
                }
            })
            .catch((_e) => {
                setSubmitState('error');
            });
    }, [createPrivateRecordingMutation, privateRecordingInput, setSubmitState]);

    const [__, updatePrivateRecordingMutation] = useMutation<
        UpdatePrivateRecordingMutation,
        UpdatePrivateRecordingMutationVariables
    >(gql`
        mutation UpdatePrivateRecording($input: UpdatePrivateRecordingInput!) {
            updatePrivateRecording(input: $input) {
                success
            }
        }
    `);
    const updatePrivateRecording = useCallback(async () => {
        setSubmitState('loading');
        return updatePrivateRecordingMutation({ input: privateRecordingInput as UpdatePrivateRecordingInput })
            .then((resp) => {
                if (resp.data?.updatePrivateRecording?.success) {
                    setSubmitState('submitted');
                } else {
                    throw new Error('Error updating recording');
                }
            })
            .catch((_e) => {
                setSubmitState('error');
            });
    }, [updatePrivateRecordingMutation, privateRecordingInput, setSubmitState]);

    return (
        <RecordingFormUI
            connectAccessId={state.connectAccessId}
            connectCallerId={state.connectCallerId}
            connectionType={state.connectionType}
            connectOffsetSeconds={state.connectOffsetSeconds}
            connectPhoneNumber={state.connectPhoneNumber}
            connectPin={state.connectPin}
            connectUrl={state.connectUrl}
            editing={!!privateRecordingId}
            errorHints={errorHints}
            errors={errors}
            hasAieraInterventionPermission={state.hasAieraInterventionPermission}
            isNextButtonDisabled={isNextButtonDisabled || ['error', 'loading', 'submitted'].includes(submitState)}
            isWebcast={isWebcast}
            meetingType={state.meetingType}
            onBack={useCallback(
                (event: MouseEvent<HTMLDivElement>) => {
                    if (
                        !hasChanges ||
                        (hasChanges && window.confirm('You have unsaved changes. Are you sure you want to cancel?'))
                    ) {
                        onBack(event);
                    }
                },
                [hasChanges, onBack]
            )}
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
                    setHasChanges(true);
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
            onCompleteEmailCreator={state.onCompleteEmailCreator}
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
            onSubmit={useCallback(
                async (event: MouseEvent<HTMLDivElement>) => {
                    if (Object.keys(errors).length === 0) {
                        await (privateRecordingId ? updatePrivateRecording() : createPrivateRecording());
                        setHasChanges(false);
                        setSubmitState('submitted');
                        onBack(event);
                    }
                },
                [createPrivateRecording, privateRecordingId, updatePrivateRecording]
            )}
            participationType={state.participationType}
            scheduleDate={state.scheduleDate}
            scheduleMeridiem={state.scheduleMeridiem}
            scheduleTime={state.scheduleTime}
            scheduleType={state.scheduleType}
            selectedCompany={state.selectedCompany}
            smsAlertBeforeCall={state.smsAlertBeforeCall}
            step={step}
            submitState={submitState}
            title={state.title}
            touched={touched}
            zoomMeetingType={state.zoomMeetingType}
        />
    );
}
