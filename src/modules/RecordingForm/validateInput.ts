import { ValueOf } from '@aiera/client-sdk/types';
import {
    ConnectionType,
    InputErrorState,
    OnFailure,
    ParticipationType,
    RecordingFormState,
    ScheduleType,
    ZoomMeetingType,
} from './types';

// Slightly modified version of https://stackoverflow.com/a/3809435/461294
function validateUrl(url: string): RegExpMatchArray | null {
    let valid = null;
    if (url?.trim().length) {
        valid = url.match(
            /^(https?:\/\/(www\.)?)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
        );
    }
    return valid;
}

export default function validateInput({
    errorState,
    isNewRecording,
    name,
    state,
    value,
}: {
    errorState: InputErrorState;
    isNewRecording: boolean;
    name: string;
    state: RecordingFormState;
    value: ValueOf<RecordingFormState> | null;
}): InputErrorState {
    const errors = { ...errorState };
    const isString = typeof value === 'string';
    const hasValue = isString ? value.trim().length > 0 : !!value;
    const trimmedValue = isString ? value.replace(/\s/g, '') : value;
    if (['connectPhoneNumber', 'localeCode', 'title'].includes(name)) {
        if (!hasValue) {
            errors[name] = 'Required';
        } else if (errors[name]) {
            delete errors[name];
        }
    }
    if (name === 'audioUpload') {
        if (value && errors.audioUpload) {
            delete errors.audioUpload;
        } else {
            errors.audioUpload = 'Required';
        }
    }
    if (name === 'hasAieraInterventionPermission') {
        if (value && errors.hasAieraInterventionPermission) {
            delete errors.hasAieraInterventionPermission;
        } else {
            errors.hasAieraInterventionPermission = 'Required';
        }
    }
    if (name === 'connectAccessId') {
        if (!hasValue && state.connectionType === ConnectionType.Zoom) {
            errors.connectAccessId = 'Required';
        } else if (hasValue && !/^[\d#]+$/.test(trimmedValue as string)) {
            errors.connectAccessId = 'Must only contain numbers or #';
        } else if (errors.connectAccessId) {
            delete errors.connectAccessId;
        }
    }
    // Add errors for onConnectDialNumber and onFailureDialNumber
    // if either of them are the same as connectPhoneNumber
    if (name === 'connectPhoneNumber') {
        if (hasValue && value === state.onConnectDialNumber) {
            errors.onConnectDialNumber = 'Cannot be the same as the "Dial-in number"';
        } else if (errors.onConnectDialNumber === 'Cannot be the same as the "Dial-in number"') {
            delete errors.onConnectDialNumber;
        }
        if (hasValue && value === state.onFailureDialNumber) {
            errors.onFailureDialNumber = 'Cannot be the same as the "Dial-in number"';
        } else if (errors.onFailureDialNumber === 'Cannot be the same as the "Dial-in number"') {
            delete errors.onFailureDialNumber;
        }
        if (hasValue && value === state.onFailureSmsNumber) {
            errors.onFailureSmsNumber = 'Cannot be the same as the "Dial-in number"';
        } else if (errors.onFailureSmsNumber === 'Cannot be the same as the "Dial-in number"') {
            delete errors.onFailureSmsNumber;
        }
    }
    // Allow digit-only PINs for phone-based connection types
    // Exclude Zoom web urls
    if (name === 'connectPin') {
        if (
            !errors.connectPin &&
            hasValue &&
            state.zoomMeetingType !== ZoomMeetingType.Web &&
            !/^[\d#]+$/.test(trimmedValue as string)
        ) {
            errors.connectPin = 'Must only contain numbers or #';
        } else if (errors.connectPin && (!hasValue || (hasValue && /^\d+$/.test(trimmedValue as string)))) {
            delete errors.connectPin;
        }
    }
    if (name === 'connectionType') {
        // connectPhoneNumber is only required for Google Meet and phone number types
        if (
            [ConnectionType.GoogleMeet, ConnectionType.Phone].includes(value as ConnectionType) &&
            !state.connectPhoneNumber &&
            !errors.connectPhoneNumber
        ) {
            errors.connectPhoneNumber = 'Required';
        }
        if (value === ConnectionType.Webcast) {
            if (!state.connectUrl) {
                errors.connectUrl = 'Required';
            } else {
                const validUrl = validateUrl(state.connectUrl);
                if (!validUrl) {
                    errors.connectUrl = 'Must be a valid url starting with http or https';
                }
                if (validUrl && errors.connectUrl) {
                    delete errors.connectUrl;
                }
            }
            // We don't collect connectPhoneNumber for webcasts
            if (errors.connectPhoneNumber) {
                delete errors.connectPhoneNumber;
            }
            // No phone intervention for webcasts
            if (errors.onFailureDialNumber) {
                delete errors.onFailureDialNumber;
            }
            if (errors.onFailureSmsNumber) {
                delete errors.onFailureSmsNumber;
            }
        }
        // TODO Add support for externalAudioStreamUrl
        // if (value === ConnectionType.AudioStream) {
        //     if (!state.externalAudioStreamUrl) {
        //         errors.externalAudioStreamUrl = 'Required';
        //     } else {
        //         const validUrl = validateUrl(state.externalAudioStreamUrl);
        //         if (!validUrl) {
        //             errors.externalAudioStreamUrl = 'Must be a valid url starting with http or https';
        //         }
        //         if (validUrl && errors.externalAudioStreamUrl) {
        //             delete errors.externalAudioStreamUrl;
        //         }
        //     }
        //     // We don't collect connectPhoneNumber for audio streams
        //     if (errors.connectPhoneNumber) {
        //         delete errors.connectPhoneNumber;
        //     }
        //     // No phone intervention for audio streams
        //     if (errors.onFailureDialNumber) {
        //         delete errors.onFailureDialNumber;
        //     }
        //     if (errors.onFailureSmsNumber) {
        //         delete errors.onFailureSmsNumber;
        //     }
        // } else if (errors.externalAudioStreamUrl) {
        //     delete errors.externalAudioStreamUrl;
        // }
        if (value === ConnectionType.Zoom) {
            if (!state.connectAccessId && !errors.connectAccessId && state.zoomMeetingType) {
                errors.connectAccessId = 'Required';
            }
            // We require connectUrl for "web" Zoom meeting type
            // We don't require connectAccessId & connectPhoneNumber
            if (state.zoomMeetingType === ZoomMeetingType.Web) {
                if (!state.connectUrl && !errors.connectUrl) {
                    errors.connectUrl = 'Required';
                }
                if (errors.connectAccessId) {
                    delete errors.connectAccessId;
                }
                if (errors.connectPhoneNumber) {
                    delete errors.connectPhoneNumber;
                }
            }
            // We require connectAccessId & connectPhoneNumber for "phone" Zoom meeting type
            // We don't require connectUrl
            if (state.zoomMeetingType === ZoomMeetingType.Phone) {
                if (!state.connectAccessId && !errors.connectAccessId) {
                    errors.connectAccessId = 'Required';
                }
                if (!state.connectPhoneNumber && !errors.connectPhoneNumber) {
                    errors.connectPhoneNumber = 'Required';
                }
                if (errors.connectUrl) {
                    delete errors.connectUrl;
                }
            }
        }
        // Only Zoom requires a connectAccessId, so remove the error if the connection type changes
        if (value !== ConnectionType.Zoom && errors.connectAccessId) {
            delete errors.connectAccessId;
        }
        // Only Zoom (web meeting type only) and Webcast require a connectUrl,
        // so remove the error if the connection type changes to something else
        if (![ConnectionType.Webcast, ConnectionType.Zoom].includes(value as ConnectionType) && errors.connectUrl) {
            delete errors.connectUrl;
        }
        // Add onConnectDialNumber error if selecting Google Meet, Zoom phone, or phone number connection types,
        // "Call me" option is selected,
        // and onConnectDialNumber isn't set.
        // Otherwise, delete the onConnectDialNumber error if it's set and the above conditions aren't met
        if (
            [ConnectionType.GoogleMeet, ConnectionType.Phone].includes(value as ConnectionType) ||
            (value === ConnectionType.Zoom && state.zoomMeetingType === ZoomMeetingType.Phone)
        ) {
            if (state.participationType === ParticipationType.Participating && !state.onConnectDialNumber) {
                errors.onConnectDialNumber = 'Required when selecting "Call me" option';
            } else if (errors.onConnectDialNumber) {
                delete errors.onConnectDialNumber;
            }
        } else if (errors.onConnectDialNumber) {
            delete errors.onConnectDialNumber;
        }
        // Remove "Aiera Intervention" permission checkbox error if switching connection types
        if (value !== state.connectionType && errors.hasAieraInterventionPermission) {
            delete errors.hasAieraInterventionPermission;
        }
        // TODO Add support for uploading audio files
        // For uploading audio files, add required error if no file is in state
        // if (value === ConnectionType.AudioUpload) {
        //     if (!state.file && !errors.audioUpload) {
        //         errors.audioUpload = 'Required';
        //     }
        //     // Remove any other errors because the audio upload
        //     // only validates the file and recording title
        //     const nonAudioFileErrorKeys = Object.keys(errors);
        //     if (nonAudioFileErrorKeys.length) {
        //         nonAudioFileErrorKeys
        //             .filter((eK) => !['audioUpload', 'title'].includes(eK))
        //             .forEach((errorKey) => {
        //                 delete errors[errorKey];
        //             });
        //     }
        // } else if (errors.audioUpload) {
        //     delete errors.audioUpload;
        // }
    }
    if (name === 'connectUrl') {
        if (!hasValue) {
            errors.connectUrl = 'Required';
        } else {
            const validUrl = validateUrl(value as string);
            if (!validUrl) {
                errors.connectUrl = 'Must be a valid url starting with http or https';
            }
            if (validUrl && errors.connectUrl) {
                delete errors.connectUrl;
            }
        }
    }
    if (name === 'externalAudioStreamUrl') {
        if (!hasValue) {
            errors.externalAudioStreamUrl = 'Required';
        } else {
            const validUrl = validateUrl(value as string);
            if (!validUrl) {
                errors.externalAudioStreamUrl = 'Must be a valid url starting with http or https';
            }
            if (validUrl && errors.externalAudioStreamUrl) {
                delete errors.externalAudioStreamUrl;
            }
        }
    }
    // Update required fields based on Zoom meeting type (web or phone)
    if (name === 'zoomMeetingType') {
        if (value === ZoomMeetingType.Web) {
            if (!state.connectUrl) {
                errors.connectUrl = 'Required';
            } else {
                const validUrl = validateUrl(state.connectUrl);
                if (!validUrl) {
                    errors.connectUrl = 'Must be a valid url starting with http or https';
                }
                if (validUrl && errors.connectUrl) {
                    delete errors.connectUrl;
                }
            }
            // Remove connectAccessId and connectPhoneNumber errors when meetingType is web
            if (errors.connectAccessId) {
                delete errors.connectAccessId;
            }
            if (errors.connectPhoneNumber) {
                delete errors.connectPhoneNumber;
            }
            // Remove connectPin validation error for web
            if (errors.connectPin) {
                delete errors.connectPin;
            }
        }
        if (value === ZoomMeetingType.Phone) {
            if (!state.connectAccessId) {
                errors.connectAccessId = 'Required';
            }
            if (!state.connectPhoneNumber) {
                errors.connectPhoneNumber = 'Required';
            }
            // Remove connectUrl error when meetingType is phone
            if (errors.connectUrl) {
                delete errors.connectUrl;
            }
            // Only allow digits for PIN
            if (!errors.connectPin && !!state.connectPin && !/^[\d#]+$/.test(state.connectPin)) {
                errors.connectPin = 'Must only contain numbers or #';
            } else if (errors.connectPin && (!state.connectPin || (hasValue && /^\d+$/.test(state.connectPin)))) {
                delete errors.connectPin;
            }
            // Remove "Aiera Intervention" permission checkbox error if switching to phone meetingType
            if (errors.hasAieraInterventionPermission) {
                delete errors.hasAieraInterventionPermission;
            }
        }
    }
    if (name === 'onConnectDialNumber') {
        if (state.participationType === ParticipationType.Participating) {
            if (!hasValue) {
                errors.onConnectDialNumber = 'Required when selecting "Call me" option';
                // Add error for onFailureDialNumber if useOnConnectDialNumber is checked off
                if (state.useOnConnectDialNumber && !errors.onFailureDialNumber) {
                    errors.onFailureDialNumber = 'Required';
                }
            } else {
                if (errors.onConnectDialNumber) {
                    delete errors.onConnectDialNumber;
                }
                // Delete the onFailureDialNumber error if it exists and useOnConnectDialNumber is checked off
                if (state.useOnConnectDialNumber && errors.onFailureDialNumber) {
                    delete errors.onFailureDialNumber;
                }
            }
        } else if (errors.onConnectDialNumber) {
            delete errors.onConnectDialNumber;
        }
        // Add error if the same value as connectPhoneNumber
        if (hasValue && value === state.connectPhoneNumber) {
            errors.onConnectDialNumber = 'Cannot be the same as the "Dial-in number"';
        }
    }
    if (name === 'onFailure') {
        if (OnFailure.ManualInterventionCall === value) {
            if (!state.onFailureDialNumber && !state.useOnConnectDialNumber) {
                errors.onFailureDialNumber = 'Required';
            } else if (errors.onFailureDialNumber) {
                delete errors.onFailureDialNumber;
            }
        }
        if (OnFailure.ManualInterventionSms === value) {
            if (!state.onFailureSmsNumber) {
                errors.onFailureSmsNumber = 'Required';
            } else if (errors.onFailureSmsNumber) {
                delete errors.onFailureSmsNumber;
            }
        }
        // For new private recordings, add error to confirm permission checkbox when selecting
        // "Aiera intervention" troubleshooting option
        if (
            value === OnFailure.AieraIntervention &&
            isNewRecording &&
            !state.hasAieraInterventionPermission &&
            !errors.hasAieraInterventionPermission
        ) {
            errors.hasAieraInterventionPermission = 'Required';
        }
        if (value === OnFailure.None) {
            if (errors.onFailureDialNumber) {
                delete errors.onFailureDialNumber;
            }
            if (errors.onFailureSmsNumber) {
                delete errors.onFailureSmsNumber;
            }
            if (errors.hasAieraInterventionPermission) {
                delete errors.hasAieraInterventionPermission;
            }
        }
    }
    if (name === 'onFailureDialNumber') {
        if (state.onFailure && state.onFailure === OnFailure.ManualInterventionCall) {
            if (!hasValue) {
                errors.onFailureDialNumber = 'Required';
            } else if (errors.onFailureDialNumber) {
                delete errors.onFailureDialNumber;
            }
        } else if (errors.onFailureDialNumber) {
            delete errors.onFailureDialNumber;
        }
        // Add error if the same value as connectPhoneNumber
        if (hasValue && value === state.connectPhoneNumber) {
            errors.onFailureDialNumber = 'Cannot be the same as the "Dial-in number"';
        }
    }
    if (name === 'onFailureSmsNumber') {
        if (state.onFailure && state.onFailure === OnFailure.ManualInterventionSms) {
            if (!hasValue) {
                errors.onFailureSmsNumber = 'Required';
            } else if (errors.onFailureSmsNumber) {
                delete errors.onFailureSmsNumber;
            }
        } else if (errors.onFailureSmsNumber) {
            delete errors.onFailureSmsNumber;
        }
        // Add error if the same value as connectPhoneNumber
        if (hasValue && value === state.connectPhoneNumber) {
            errors.onFailureSmsNumber = 'Cannot be the same as the "Dial-in number"';
        }
    }
    if (name === 'participationType') {
        if (value === ParticipationType.Participating) {
            if (!state.onConnectDialNumber) {
                errors.onConnectDialNumber = 'Required when selecting "Call me" option';
            } else if (errors.onConnectDialNumber) {
                delete errors.onConnectDialNumber;
            }
        }
        if (value === ParticipationType.NotParticipating && errors.onConnectDialNumber) {
            delete errors.onConnectDialNumber;
        }
    }
    if (name === 'scheduleTime') {
        if (state.scheduleType === ScheduleType.Future) {
            if (!hasValue) {
                errors.scheduleTime = 'Required';
            } else {
                const validTime = [3, 4].includes((value as string).length);
                if (!validTime) {
                    errors.scheduleTime = 'Invalid';
                }
                if (validTime && errors.scheduleTime) {
                    delete errors.scheduleTime;
                }
            }
        } else if (errors.scheduleTime) {
            delete errors.scheduleTime;
        }
    }
    if (name === 'scheduleType') {
        if (value === ScheduleType.Future && !state.scheduleTime) {
            errors.scheduleTime = 'Required';
        }
        if (value === ScheduleType.Now && errors.scheduleTime) {
            delete errors.scheduleTime;
        }
    }
    // Add or remove the onFailureDialNumber error depending on if useOnConnectDialNumber is checked off
    // and whether or not onConnectDialNumber or onFailureDialNumber is set
    if (name === 'useOnConnectDialNumber') {
        if (
            errors.onFailureDialNumber &&
            ((value && state.onConnectDialNumber) || (!value && state.onFailureDialNumber))
        ) {
            delete errors.onFailureDialNumber;
        }
        if (
            !errors.onFailureDialNumber &&
            ((value && !state.onConnectDialNumber) || (!value && !state.onFailureDialNumber))
        ) {
            errors.onFailureDialNumber = 'Required';
        }
    }
    return errors;
}
