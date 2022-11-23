// import { ConnectionType } from "@aiera/client-sdk/modules/RecordingForm/types";
//
// const validateInput = ({ errors, name, setErrors, value }: { name: string; value: string | number }) => {
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
//     // AHHHH
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
//         if (!hasValue && connectionType === CONNECTION_TYPES.zoom.value) {
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
