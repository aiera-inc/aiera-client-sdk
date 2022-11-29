/**
 * Consts, types, and interfaces for RecordingForm and its sub-modules
 */

import { SyntheticEvent } from 'react';
import { CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { ValueOf } from '@aiera/client-sdk/types';

/**
 * Interfaces
 */
export interface InputErrorState {
    [key: string]: string | undefined;
}
export interface InputTouchedState {
    [key: string]: boolean;
}
export interface RecordingFormState {
    confirmPermission: boolean;
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectOffsetSeconds: number;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    hasAieraInterventionPermission: boolean;
    meetingType: string;
    onConnectDialNumber: string;
    onFailure?: OnFailure;
    onFailureDialNumber: string;
    onFailureInstructions: string;
    onFailureSmsNumber: string;
    participationType?: ParticipationType;
    scheduleDate: Date;
    scheduleMeridiem: ScheduleMeridiem;
    scheduleTime?: string;
    scheduleType?: ScheduleType;
    selectedCompany?: CompanyFilterResult;
    smsAlertBeforeCall: boolean;
    title: string;
    useOnConnectDialNumber: boolean;
    zoomMeetingType?: ZoomMeetingType;
}
export interface RecordingFormStateChangeEvent {
    name?: string;
    value?: ValueOf<RecordingFormState> | null;
}

/**
 * Types
 */
export type RecordingFormStateChangeHandler<E extends SyntheticEvent = SyntheticEvent> = (
    event: E | Event | null,
    change: RecordingFormStateChangeEvent
) => void;

/**
 * Constants
 */
export const AIERA_INTERVENTION_START_TIME = '8:00 AM';
export const AIERA_INTERVENTION_END_TIME = '5:30 PM';

/**
 * Enums
 */
export enum ConnectionType {
    GoogleMeet = 'google_meet',
    PhoneNumber = 'phone',
    Webcast = 'webcast',
    Zoom = 'zoom',
}
export enum OnFailure {
    AieraIntervention = 'aiera_intervention',
    ManualInterventionCall = 'manual_intervention_call',
    ManualInterventionSms = 'manual_intervention_sms',
    None = 'none',
}
export enum ParticipationType {
    NotParticipating = 'not_participating',
    Participating = 'participating',
}
export enum ScheduleMeridiem {
    AM = 'AM',
    PM = 'PM',
}
export enum ScheduleType {
    Now = 'now',
    Future = 'future',
}
export enum ZoomMeetingType {
    Phone = 'phone',
    Web = 'web',
}

/**
 * ConnectionType sub-module
 */
export const CONNECTION_TYPE_OPTION_GOOGLE = {
    label: 'Google Meet',
    value: ConnectionType.GoogleMeet,
    description: 'Connect to a Google Meet dial-in number',
};
export const CONNECTION_TYPE_OPTION_PHONE = {
    label: 'Phone Number',
    value: ConnectionType.PhoneNumber,
    description: 'Connect to any phone number, with optional pin',
};
export const CONNECTION_TYPE_OPTION_WEBCAST = {
    label: 'Webcast URL',
    value: ConnectionType.Webcast,
    description: 'Connect to a webcast url',
};
export const CONNECTION_TYPE_OPTION_ZOOM = {
    label: 'Zoom',
    value: ConnectionType.Zoom,
    description: 'Connect to a Zoom dial-in number',
};
export const CONNECTION_TYPE_OPTIONS = [
    CONNECTION_TYPE_OPTION_ZOOM,
    CONNECTION_TYPE_OPTION_GOOGLE,
    CONNECTION_TYPE_OPTION_WEBCAST,
    CONNECTION_TYPE_OPTION_PHONE,
];
export const CONNECTION_TYPE_OPTIONS_MAP = {
    [CONNECTION_TYPE_OPTION_GOOGLE.value]: CONNECTION_TYPE_OPTION_GOOGLE,
    [CONNECTION_TYPE_OPTION_PHONE.value]: CONNECTION_TYPE_OPTION_PHONE,
    [CONNECTION_TYPE_OPTION_WEBCAST.value]: CONNECTION_TYPE_OPTION_WEBCAST,
    [CONNECTION_TYPE_OPTION_ZOOM.value]: CONNECTION_TYPE_OPTION_ZOOM,
};

/**
 * ConnectionDetails sub-module
 */
export const PARTICIPATION_TYPE_OPTION_NOT_PARTICIPATING = {
    label: 'Set it & forget it',
    value: ParticipationType.NotParticipating,
    description:
        "We'll automatically connect, then transcribe and record the call for you. You can join later if you " +
        'change your mind.',
};
export const PARTICIPATION_TYPE_OPTION_PARTICIPATING = {
    label: 'Call me',
    value: ParticipationType.Participating,
    description:
        "We'll call you, and then connect you to the call. Please enter any required pins, or speak to an " +
        'operator, if needed. The call will continue to record & transcribe even after you disconnect. You may ' +
        'end the recording manually from the transcript in Aiera.',
};
export const PARTICIPATION_TYPE_OPTIONS = [
    PARTICIPATION_TYPE_OPTION_NOT_PARTICIPATING,
    PARTICIPATION_TYPE_OPTION_PARTICIPATING,
];
export const ZOOM_MEETING_TYPE_OPTION_PHONE = {
    label: 'Dial-in number',
    value: ZoomMeetingType.Phone,
    description: 'Connect to Zoom meeting via dial-in number',
};
export const ZOOM_MEETING_TYPE_OPTION_WEB = {
    label: 'Web URL',
    value: ZoomMeetingType.Web,
    description: 'Connect to Zoom meeting via web url',
};
export const ZOOM_MEETING_TYPE_OPTIONS = [ZOOM_MEETING_TYPE_OPTION_WEB, ZOOM_MEETING_TYPE_OPTION_PHONE];

/**
 * Scheduling sub-module
 */
export const CONNECT_OFFSET_SECONDS_OPTIONS = [
    { label: 'When the call starts', value: 0 },
    { label: '1 minute before', value: -60 },
    { label: '2 minutes before', value: -120 },
    { label: '3 minutes before', value: -180 },
    { label: '4 minutes before', value: -240 },
    { label: '5 minutes before', value: -300 },
];
export const SCHEDULE_MERIDIEM_OPTIONS = [
    {
        label: 'AM',
        value: ScheduleMeridiem.AM,
    },
    {
        label: 'PM',
        value: ScheduleMeridiem.PM,
    },
];
const SCHEDULE_TYPE_OPTION_NOW = {
    label: 'Now',
    value: ScheduleType.Now,
    description: 'Aiera will attempt to connect when you create the recording',
};
const SCHEDULE_TYPE_OPTION_FUTURE = {
    label: 'In the future',
    value: ScheduleType.Future,
    description: 'Schedule a time for Aiera to attempt connecting to the event',
};
export const SCHEDULE_TYPE_OPTIONS = [SCHEDULE_TYPE_OPTION_NOW, SCHEDULE_TYPE_OPTION_FUTURE];

/**
 * Troubleshooting sub-module
 */
const TROUBLESHOOTING_TYPE_OPTION_INTERVENTION = {
    label: 'Attempt Aiera intervention',
    value: OnFailure.AieraIntervention,
    description:
        'Give permission to the Aiera team to intervene. Only available Monday - Friday, ' +
        `${AIERA_INTERVENTION_START_TIME} - ${AIERA_INTERVENTION_END_TIME} EST`,
};
const TROUBLESHOOTING_TYPE_OPTION_CALL = {
    label: 'Call me',
    value: OnFailure.ManualInterventionCall,
    description: "We'll call you and then connect you to the number you provided",
};
const TROUBLESHOOTING_TYPE_OPTION_NONE = {
    label: 'Do nothing',
    value: OnFailure.None,
    description: 'Let the event transcription fail silently',
};
const TROUBLESHOOTING_TYPE_OPTION_SMS = {
    label: 'Alert me by SMS',
    value: OnFailure.ManualInterventionSms,
    description: "We'll alert you by SMS if we can't connect to your event",
};
export const TROUBLESHOOTING_TYPE_OPTIONS = [
    TROUBLESHOOTING_TYPE_OPTION_SMS,
    TROUBLESHOOTING_TYPE_OPTION_CALL,
    TROUBLESHOOTING_TYPE_OPTION_NONE,
];
export const TROUBLESHOOTING_TYPE_INTERVENTION_OPTIONS = [
    TROUBLESHOOTING_TYPE_OPTION_INTERVENTION,
    TROUBLESHOOTING_TYPE_OPTION_NONE,
];
