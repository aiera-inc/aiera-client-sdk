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
    ConnectionType,
    InputErrorState,
    InputTouchedState,
    OnFailure,
    PARTICIPATION_TYPE_OPTIONS,
    ParticipationType,
    ScheduleMeridiem,
    ScheduleType,
    ZOOM_MEETING_TYPE_OPTION_WEB,
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
    errors: InputErrorState;
    hasAieraInterventionPermission: boolean;
    isNextButtonDisabled: boolean;
    isWebcast: boolean;
    meetingType: string;
    onBlur: FocusEventHandler;
    onChangeCompany: ChangeHandler<CompanyFilterResult>;
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
    onChangeOnFailureInstructions: ChangeHandler<string>;
    onChangeOnFailureSmsNumber: Dispatch<SetStateAction<string>>;
    onChangeParticipationType: ChangeHandler<ParticipationType>;
    onChangeScheduleDate: ChangeHandler<Date>;
    onChangeScheduleMeridiem: ChangeHandler<ScheduleMeridiem>;
    onChangeScheduleTime: ChangeHandler<string>;
    onChangeScheduleType: ChangeHandler<ScheduleType>;
    onChangeTitle: ChangeHandler<string>;
    onChangeZoomMeetingType: ChangeHandler<ZoomMeetingType>;
    onConnectDialNumber: string;
    onFailure?: OnFailure;
    onFailureDialNumber?: string;
    onFailureInstructions?: string;
    onFailureSmsNumber?: string;
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
    title?: string;
    toggleAieraInterventionPermission: ChangeHandler<boolean>;
    toggleSMSAlertBeforeCall: ChangeHandler<boolean>;
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
        onChangeCompany,
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
        onChangeOnFailureInstructions,
        onChangeOnFailureSmsNumber,
        onChangeParticipationType,
        onChangeScheduleDate,
        onChangeScheduleMeridiem,
        onChangeScheduleTime,
        onChangeScheduleType,
        onChangeTitle,
        onChangeZoomMeetingType,
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
        toggleAieraInterventionPermission,
        toggleSMSAlertBeforeCall,
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
                            errors={errors}
                            onBlur={onBlur}
                            onChangeConnectAccessId={onChangeConnectAccessId}
                            onChangeConnectCallerId={onChangeConnectCallerId}
                            onChangeConnectDialNumber={onChangeConnectDialNumber}
                            onChangeConnectPhoneNumber={onChangeConnectPhoneNumber}
                            onChangeConnectPin={onChangeConnectPin}
                            onChangeConnectUrl={onChangeConnectUrl}
                            onChangeParticipationType={onChangeParticipationType}
                            onChangeZoomMeetingType={onChangeZoomMeetingType}
                            onConnectDialNumber={onConnectDialNumber}
                            onFocus={onFocus}
                            participationType={participationType}
                            participationTypeOptions={PARTICIPATION_TYPE_OPTIONS}
                            smsAlertBeforeCall={smsAlertBeforeCall}
                            toggleSMSAlertBeforeCall={toggleSMSAlertBeforeCall}
                            touched={touched}
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
                            hasAieraInterventionPermission={hasAieraInterventionPermission}
                            isWebcast={isWebcast}
                            onChangeOnFailure={onChangeOnFailure}
                            onChangeOnFailureDialNumber={onChangeOnFailureDialNumber}
                            onChangeOnFailureInstructions={onChangeOnFailureInstructions}
                            onChangeOnFailureSmsNumber={onChangeOnFailureSmsNumber}
                            onFailure={onFailure}
                            onFailureDialNumber={onFailureDialNumber}
                            onFailureInstructions={onFailureInstructions}
                            onFailureSmsNumber={onFailureSmsNumber}
                            toggleAieraInterventionPermission={toggleAieraInterventionPermission}
                        />
                    ))
                    .with(5, () => (
                        <RecordingDetails
                            onChangeCompany={onChangeCompany}
                            onChangeTitle={onChangeTitle}
                            selectedCompany={selectedCompany}
                            title={title}
                        />
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

interface RecordingFormState {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectOffsetSeconds: number;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    hasAieraInterventionPermission: boolean;
    meetingType: string;
    onFailure?: OnFailure;
    onFailureInstructions?: string;
    participationType?: ParticipationType;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
    selectedCompany?: CompanyFilterResult;
    smsAlertBeforeCall: boolean;
    title?: string;
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
        hasAieraInterventionPermission: false,
        meetingType: '',
        onFailure: undefined,
        onFailureInstructions: '',
        participationType: undefined,
        scheduleDate: new Date(),
        scheduleMeridiem: ScheduleMeridiem.AM,
        scheduleTime: '',
        scheduleType: undefined,
        selectedCompany: undefined,
        smsAlertBeforeCall: false,
        title: '',
        zoomMeetingType: undefined,
    });
    const [step, setStep] = useState<number>(1);

    const [errors, setErrors] = useState<InputErrorState>({});
    // Keep track of which inputs have been in focus to
    // conditionally show errors, if any
    const [touched, setTouched] = useState<InputTouchedState>({});

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

    const validateInput = ({ name, value }: { name: string; value: string | number }) => {
        const isString = typeof value === 'string';
        const hasValue = isString ? value.trim().length > 0 : !!value;
        const trimmedValue = isString ? value.replace(/\s/g, '') : value;
        if (name === 'connectAccessId') {
            if (!hasValue && state.connectionType === ConnectionType.Zoom) {
                setErrors({ connectAccessId: 'Required' });
            } else if (hasValue && !/^[\d#]+$/.test(trimmedValue as string)) {
                setErrors({ connectAccessId: 'Must only contain numbers or #' });
            } else if (errors.connectAccessId) {
                setErrors({ connectAccessId: undefined });
            }
        }
    };

    // const validateInput = ({ name, value }: { name: string; value: string | number }) => {
    //     const isString = typeof value === 'string';
    //     const hasValue = isString ? value.trim().length > 0 : !!value;
    //     const trimmedValue = isString ? value.replace(/\s/g, '') : value;
    //     if (name === 'connectAccessId') {
    //         if (!hasValue && state.connectionType === ConnectionType.Zoom) {
    //             setErrors({ connectAccessId: 'Required' });
    //         } else if (hasValue && !/^[\d#]+$/.test(trimmedValue as string)) {
    //             setErrors({ connectAccessId: 'Must only contain numbers or #' });
    //         } else if (errors.connectAccessId) {
    //             setErrors({ connectAccessId: undefined });
    //         }
    //     }
    //     if (['connectPhoneNumber', 'localeCode', 'title'].includes(name)) {
    //         if (!hasValue) {
    //             errors[name] = 'Required';
    //         } else if (errors[name]) {
    //             delete errors[name];
    //         }
    //     }
    //     if (name === 'audioUpload') {
    //         if (value && errors.audioUpload) {
    //             delete errors.audioUpload;
    //         } else {
    //             errors.audioUpload = 'Required';
    //         }
    //     }
    //     if (name === 'confirmPermission') {
    //         if (value && errors.confirmPermission) {
    //             delete errors.confirmPermission;
    //         } else {
    //             errors.confirmPermission = 'Required';
    //         }
    //     }
    //     if (name === 'connectAccessId') {
    //         if (!hasValue && state.connectionType === ConnectionType.Zoom) {
    //             errors.connectAccessId = 'Required';
    //         } else if (hasValue && !/^[\d#]+$/.test(trimmedValue)) {
    //             errors.connectAccessId = 'Must only contain numbers or #';
    //         } else if (errors.connectAccessId) {
    //             delete errors.connectAccessId;
    //         }
    //     }
    //     // Add errors for onConnectDialNumber and onFailurePhoneNumber
    //     // if either of them are the same as connectPhoneNumber
    //     if (name === 'connectPhoneNumber') {
    //         if (hasValue && value === onConnectDialNumber) {
    //             errors.onConnectDialNumber = 'Cannot be the same as the "Dial-in number"';
    //         } else if (errors.onConnectDialNumber === 'Cannot be the same as the "Dial-in number"') {
    //             delete errors.onConnectDialNumber;
    //         }
    //         if (hasValue && value === onFailurePhoneNumber) {
    //             errors.onFailurePhoneNumber = 'Cannot be the same as the "Dial-in number"';
    //         } else if (errors.onFailurePhoneNumber === 'Cannot be the same as the "Dial-in number"') {
    //             delete errors.onFailurePhoneNumber;
    //         }
    //     }
    //     // Allow digit-only PINs for phone-based connection types
    //     // Exclude Zoom web urls
    //     if (name === 'connectPin') {
    //         if (
    //             !errors.connectPin &&
    //             hasValue &&
    //             meetingType !== ZOOM_MEETING_TYPES.web.value &&
    //             !/^[\d#]+$/.test(trimmedValue)
    //         ) {
    //             errors.connectPin = 'Must only contain numbers or #';
    //         } else if (errors.connectPin && (!hasValue || (hasValue && /^\d+$/.test(trimmedValue)))) {
    //             delete errors.connectPin;
    //         }
    //     }
    //     if (name === 'connectionType') {
    //         // connectPhoneNumber is only required for Google Meet and phone number types
    //         if (
    //             [CONNECTION_TYPES.googleMeet.value, CONNECTION_TYPES.phoneNumber.value].includes(value) &&
    //             !connectPhoneNumber &&
    //             !errors.connectPhoneNumber
    //         ) {
    //             errors.connectPhoneNumber = 'Required';
    //         }
    //         if (value === CONNECTION_TYPES.webcast.value) {
    //             if (!connectUrl) {
    //                 errors.connectUrl = 'Required';
    //             } else {
    //                 const validUrl = validateUrl(connectUrl);
    //                 if (!validUrl) {
    //                     errors.connectUrl = 'Must be a valid url starting with http or https';
    //                 }
    //                 if (validUrl && errors.connectUrl) {
    //                     delete errors.connectUrl;
    //                 }
    //             }
    //             // We don't collect connectPhoneNumber for webcasts
    //             if (errors.connectPhoneNumber) {
    //                 delete errors.connectPhoneNumber;
    //             }
    //             // No phone intervention for webcasts
    //             if (errors.onFailurePhoneNumber) {
    //                 delete errors.onFailurePhoneNumber;
    //             }
    //         }
    //         if (value === CONNECTION_TYPES.audioStream.value) {
    //             if (!externalAudioStreamUrl) {
    //                 errors.externalAudioStreamUrl = 'Required';
    //             } else {
    //                 const validUrl = validateUrl(externalAudioStreamUrl);
    //                 if (!validUrl) {
    //                     errors.externalAudioStreamUrl = 'Must be a valid url starting with http or https';
    //                 }
    //                 if (validUrl && errors.externalAudioStreamUrl) {
    //                     delete errors.externalAudioStreamUrl;
    //                 }
    //             }
    //             // We don't collect connectPhoneNumber for audio streams
    //             if (errors.connectPhoneNumber) {
    //                 delete errors.connectPhoneNumber;
    //             }
    //             // No phone intervention for audio streams
    //             if (errors.onFailurePhoneNumber) {
    //                 delete errors.onFailurePhoneNumber;
    //             }
    //         } else if (errors.externalAudioStreamUrl) {
    //             delete errors.externalAudioStreamUrl;
    //         }
    //         if (value === CONNECTION_TYPES.zoom.value) {
    //             if (!connectAccessId && !errors.connectAccessId) {
    //                 errors.connectAccessId = 'Required';
    //             }
    //             // We require connectUrl for "web" Zoom meeting type
    //             // We don't require connectAccessId & connectPhoneNumber
    //             if (meetingType === ZOOM_MEETING_TYPES.web.value) {
    //                 if (!connectUrl && !errors.connectUrl) {
    //                     errors.connectUrl = 'Required';
    //                 }
    //                 if (errors.connectAccessId) {
    //                     delete errors.connectAccessId;
    //                 }
    //                 if (errors.connectPhoneNumber) {
    //                     delete errors.connectPhoneNumber;
    //                 }
    //             }
    //             // We require connectAccessId & connectPhoneNumber for "phone" Zoom meeting type
    //             // We don't require connectUrl
    //             if (meetingType === ZOOM_MEETING_TYPES.phone.value) {
    //                 if (!connectAccessId && !errors.connectAccessId) {
    //                     errors.connectAccessId = 'Required';
    //                 }
    //                 if (!connectPhoneNumber && !errors.connectPhoneNumber) {
    //                     errors.connectPhoneNumber = 'Required';
    //                 }
    //                 if (errors.connectUrl) {
    //                     delete errors.connectUrl;
    //                 }
    //             }
    //         }
    //         // Only Zoom requires a connectAccessId, so remove the error if the connection type changes
    //         if (value !== CONNECTION_TYPES.zoom.value && errors.connectAccessId) {
    //             delete errors.connectAccessId;
    //         }
    //         // Only Zoom (web meeting type only) and Webcast require a connectUrl,
    //         // so remove the error if the connection type changes to something else
    //         if (![CONNECTION_TYPES.webcast.value, CONNECTION_TYPES.zoom.value].includes(value) && errors.connectUrl) {
    //             delete errors.connectUrl;
    //         }
    //         // Add onConnectDialNumber error if selecting Google Meet, Zoom phone, or phone number connection types,
    //         // "Call me" option is selected,
    //         // and onConnectDialNumber isn't set.
    //         // Otherwise, delete the onConnectDialNumber error if it's set and the above conditions aren't met
    //         if (
    //             [CONNECTION_TYPES.googleMeet.value, CONNECTION_TYPES.phoneNumber.value].includes(value) ||
    //             (value === CONNECTION_TYPES.zoom.value && meetingType === ZOOM_MEETING_TYPES.phone)
    //         ) {
    //             if (participationType === PARTICIPATION_TYPES.participating.value && !onConnectDialNumber) {
    //                 errors.onConnectDialNumber = 'Required when selecting "Call me" option';
    //             } else if (errors.onConnectDialNumber) {
    //                 delete errors.onConnectDialNumber;
    //             }
    //         } else if (errors.onConnectDialNumber) {
    //             delete errors.onConnectDialNumber;
    //         }
    //         // Remove "Aiera Intervention" permission checkbox error if switching connection types
    //         if (value !== connectionType && errors.confirmPermission) {
    //             delete errors.confirmPermission;
    //         }
    //         // For uploading audio files, add required error if no file is in state
    //         if (value === CONNECTION_TYPES.audioUpload.value) {
    //             if (!file && !errors.audioUpload) {
    //                 errors.audioUpload = 'Required';
    //             }
    //             // Remove any other errors because the audio upload
    //             // only validates the file and recording title
    //             const nonAudioFileErrorKeys = Object.keys(errors);
    //             if (nonAudioFileErrorKeys.length) {
    //                 nonAudioFileErrorKeys
    //                     .filter(eK => !['audioUpload', 'title'].includes(eK))
    //                     .forEach(errorKey => {
    //                         delete errors[errorKey];
    //                     });
    //             }
    //         } else if (errors.audioUpload) {
    //             delete errors.audioUpload;
    //         }
    //     }
    //     if (name === 'connectUrl') {
    //         if (!hasValue) {
    //             errors.connectUrl = 'Required';
    //         } else {
    //             const validUrl = validateUrl(value);
    //             if (!validUrl) {
    //                 errors.connectUrl = 'Must be a valid url starting with http or https';
    //             }
    //             if (validUrl && errors.connectUrl) {
    //                 delete errors.connectUrl;
    //             }
    //         }
    //     }
    //     if (name === 'externalAudioStreamUrl') {
    //         if (!hasValue) {
    //             errors.externalAudioStreamUrl = 'Required';
    //         } else {
    //             const validUrl = validateUrl(value);
    //             if (!validUrl) {
    //                 errors.externalAudioStreamUrl = 'Must be a valid url starting with http or https';
    //             }
    //             if (validUrl && errors.externalAudioStreamUrl) {
    //                 delete errors.externalAudioStreamUrl;
    //             }
    //         }
    //     }
    //     // Update required fields based on Zoom meeting type (web or phone)
    //     if (name === 'meetingType') {
    //         if (value === 'web') {
    //             if (!connectUrl) {
    //                 errors.connectUrl = 'Required';
    //             } else {
    //                 const validUrl = validateUrl(connectUrl);
    //                 if (!validUrl) {
    //                     errors.connectUrl = 'Must be a valid url starting with http or https';
    //                 }
    //                 if (validUrl && errors.connectUrl) {
    //                     delete errors.connectUrl;
    //                 }
    //             }
    //             // Remove connectAccessId and connectPhoneNumber errors when meetingType is web
    //             if (errors.connectAccessId) {
    //                 delete errors.connectAccessId;
    //             }
    //             if (errors.connectPhoneNumber) {
    //                 delete errors.connectPhoneNumber;
    //             }
    //             // Remove connectPin validation error for web
    //             if (errors.connectPin) {
    //                 delete errors.connectPin;
    //             }
    //         }
    //         if (value === 'phone') {
    //             if (!connectAccessId) {
    //                 errors.connectAccessId = 'Required';
    //             }
    //             if (!connectPhoneNumber) {
    //                 errors.connectPhoneNumber = 'Required';
    //             }
    //             // Remove connectUrl error when meetingType is phone
    //             if (errors.connectUrl) {
    //                 delete errors.connectUrl;
    //             }
    //             // Only allow digits for PIN
    //             if (!errors.connectPin && !!connectPin && !/^[\d#]+$/.test(connectPin)) {
    //                 errors.connectPin = 'Must only contain numbers or #';
    //             } else if (errors.connectPin && (!connectPin || (hasValue && /^\d+$/.test(connectPin)))) {
    //                 delete errors.connectPin;
    //             }
    //             // Remove "Aiera Intervention" permission checkbox error if switching to phone meetingType
    //             if (errors.confirmPermission) {
    //                 delete errors.confirmPermission;
    //             }
    //         }
    //     }
    //     if (name === 'onConnectDialNumber') {
    //         if (participationType === PARTICIPATION_TYPES.participating.value) {
    //             if (!hasValue) {
    //                 errors.onConnectDialNumber = 'Required when selecting "Call me" option';
    //                 // Add error for onFailurePhoneNumber if useOnConnectDialNumber is checked off
    //                 if (useOnConnectDialNumber && !errors.onFailurePhoneNumber) {
    //                     errors.onFailurePhoneNumber = 'Required';
    //                 }
    //             } else {
    //                 if (errors.onConnectDialNumber) {
    //                     delete errors.onConnectDialNumber;
    //                 }
    //                 // Delete the onFailurePhoneNumber error if it exists and useOnConnectDialNumber is checked off
    //                 if (useOnConnectDialNumber && errors.onFailurePhoneNumber) {
    //                     delete errors.onFailurePhoneNumber;
    //                 }
    //             }
    //         } else if (errors.onConnectDialNumber) {
    //             delete errors.onConnectDialNumber;
    //         }
    //         // Add error if the same value as connectPhoneNumber
    //         if (hasValue && value === connectPhoneNumber) {
    //             errors.onConnectDialNumber = 'Cannot be the same as the "Dial-in number"';
    //         }
    //     }
    //     if (name === 'onFailure') {
    //         if ([TROUBLESHOOTING_TYPES.sms.value, TROUBLESHOOTING_TYPES.call.value].includes(value)) {
    //             if (!onFailurePhoneNumber && !useOnConnectDialNumber) {
    //                 errors.onFailurePhoneNumber = 'Required';
    //             } else if (errors.onFailurePhoneNumber) {
    //                 delete errors.onFailurePhoneNumber;
    //             }
    //         }
    //         // For new private recordings, add error to confirm permission checkbox when selecting
    //         // "Aiera intervention" troubleshooting option
    //         if (
    //             value === TROUBLESHOOTING_TYPES.aieraIntervention.value &&
    //             privateRecordingId === 'new' &&
    //             !confirmPermission &&
    //             !errors.confirmPermission
    //         ) {
    //             errors.confirmPermission = 'Required';
    //         }
    //         if (value === TROUBLESHOOTING_TYPES.none.value) {
    //             if (errors.onFailurePhoneNumber) {
    //                 delete errors.onFailurePhoneNumber;
    //             }
    //             if (errors.confirmPermission) {
    //                 delete errors.confirmPermission;
    //             }
    //         }
    //     }
    //     // onFailurePhoneNumber isn't a Private Recording field, but is used in the Troubleshooting component
    //     // as the input name and value.
    //     // When the form is submitted, its value is mapped to either onFailureSmsNumber or onFailureDialNumber
    //     // depending on the current onFailure value.
    //     if (name === 'onFailurePhoneNumber') {
    //         if ([TROUBLESHOOTING_TYPES.sms.value, TROUBLESHOOTING_TYPES.call.value].includes(onFailure)) {
    //             if (!hasValue) {
    //                 errors.onFailurePhoneNumber = 'Required';
    //             } else if (errors.onFailurePhoneNumber) {
    //                 delete errors.onFailurePhoneNumber;
    //             }
    //         } else if (errors.onFailurePhoneNumber) {
    //             delete errors.onFailurePhoneNumber;
    //         }
    //         // Add error if the same value as connectPhoneNumber
    //         if (hasValue && value === connectPhoneNumber) {
    //             errors.onFailurePhoneNumber = 'Cannot be the same as the "Dial-in number"';
    //         }
    //     }
    //     if (name === 'participationType') {
    //         if (value === PARTICIPATION_TYPES.participating.value) {
    //             if (!onConnectDialNumber) {
    //                 errors.onConnectDialNumber = 'Required when selecting "Call me" option';
    //             } else if (errors.onConnectDialNumber) {
    //                 delete errors.onConnectDialNumber;
    //             }
    //         }
    //         if (value === PARTICIPATION_TYPES.notParticipating.value && errors.onConnectDialNumber) {
    //             delete errors.onConnectDialNumber;
    //         }
    //     }
    //     if (name === 'scheduleTime') {
    //         if (scheduleType === SCHEDULE_TYPES.future.value) {
    //             if (!hasValue) {
    //                 errors.scheduleTime = 'Required';
    //             } else {
    //                 const validTime = [3, 4].includes(value.length);
    //                 if (!validTime) {
    //                     errors.scheduleTime = 'Invalid';
    //                 }
    //                 if (validTime && errors.scheduleTime) {
    //                     delete errors.scheduleTime;
    //                 }
    //             }
    //         } else if (errors.scheduleTime) {
    //             delete errors.scheduleTime;
    //         }
    //     }
    //     if (name === 'scheduleType') {
    //         if (value === SCHEDULE_TYPES.future.value && !scheduleTime) {
    //             errors.scheduleTime = 'Required';
    //         }
    //         if (value === SCHEDULE_TYPES.now.value && errors.scheduleTime) {
    //             delete errors.scheduleTime;
    //         }
    //     }
    //     // Add or remove the onFailurePhoneNumber error depending on if useOnConnectDialNumber is checked off
    //     // and whether or not onConnectDialNumber or onFailurePhoneNumber is set
    //     if (name === 'useOnConnectDialNumber') {
    //         if (errors.onFailurePhoneNumber && ((value && onConnectDialNumber) || (!value && onFailurePhoneNumber))) {
    //             delete errors.onFailurePhoneNumber;
    //         }
    //         if (
    //             !errors.onFailurePhoneNumber &&
    //             ((value && !onConnectDialNumber) || (!value && !onFailurePhoneNumber))
    //         ) {
    //             errors.onFailurePhoneNumber = 'Required';
    //         }
    //     }
    // };

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
                    validateInput?.({ name: event?.target?.name, value: event?.target?.value }),
                [validateInput]
            )}
            onChangeCompany={handlers.selectedCompany}
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
            onChangeOnFailureInstructions={handlers.onFailureInstructions}
            onChangeOnFailureSmsNumber={onChangeOnFailureSmsNumber}
            onChangeParticipationType={handlers.participationType}
            onChangeScheduleDate={handlers.scheduleDate}
            onChangeScheduleMeridiem={handlers.scheduleMeridiem}
            onChangeScheduleTime={handlers.scheduleTime}
            onChangeScheduleType={handlers.scheduleType}
            onChangeTitle={handlers.title}
            onChangeZoomMeetingType={handlers.zoomMeetingType}
            onConnectDialNumber={onConnectDialNumber}
            onFailure={state.onFailure}
            onFailureDialNumber={onFailureDialNumber}
            onFailureInstructions={state.onFailureInstructions}
            onFailureSmsNumber={onFailureSmsNumber}
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
            toggleAieraInterventionPermission={handlers.hasAieraInterventionPermission}
            toggleSMSAlertBeforeCall={handlers.smsAlertBeforeCall}
            touched={touched}
            zoomMeetingType={state.zoomMeetingType}
        />
    );
}
