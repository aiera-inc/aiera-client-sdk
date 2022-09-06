/**
 * Consts, types, and interfaces for RecordingForm and its sub-components
 */

// TODO: remove these once the server generates them
/**
 * BEGIN TEMPORARY TYPES
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

export enum ParticipationType {
    NotParticipating = 'not_participating',
    Participating = 'participating',
}

export enum ScheduleType {
    Now = 'now',
    Future = 'future',
}

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
    PARTICIPATION_TYPE_OPTION_PARTICIPATING,
    PARTICIPATION_TYPE_OPTION_NOT_PARTICIPATING,
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

export const ZOOM_MEETING_TYPE_OPTION_PHONE = {
    label: 'Dial-in number',
    value: 'phone',
    description: 'Connect to Zoom meeting via dial-in number',
};
export const ZOOM_MEETING_TYPE_OPTION_WEB = {
    label: 'Web URL',
    value: 'web',
    description: 'Connect to Zoom meeting via web url',
};
export const ZOOM_MEETING_TYPE_OPTIONS = [ZOOM_MEETING_TYPE_OPTION_WEB, ZOOM_MEETING_TYPE_OPTION_PHONE];
