import React, { Dispatch, ReactElement, SetStateAction, useMemo } from 'react';
import { match } from 'ts-pattern';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { PhoneNumberInput } from '@aiera/client-sdk/components/PhoneNumberInput';
import { ChangeHandler, useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import {
    ConnectionType,
    ParticipationType,
    ZOOM_MEETING_TYPE_OPTION_PHONE,
    ZOOM_MEETING_TYPE_OPTIONS,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import { SelectOption } from '@aiera/client-sdk/types';
import './styles.css';

interface ConnectionDetailsSharedProps {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    onChangeConnectAccessId: ChangeHandler<string>;
    onChangeConnectCallerId: ChangeHandler<string>;
    onChangeConnectDialNumber: Dispatch<SetStateAction<string>>;
    onChangeConnectPhoneNumber: ChangeHandler<string>;
    onChangeConnectPin: ChangeHandler<string>;
    onChangeConnectUrl: ChangeHandler<string>;
    onChangeParticipationType: ChangeHandler<ParticipationType>;
    onConnectDialNumber: string;
    participationType?: ParticipationType;
    participationTypeOptions: SelectOption<ParticipationType>[];
}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {
    onChangeZoomMeetingType: ChangeHandler<string>;
    showCallMeFields: boolean;
    zoomMeetingType?: string;
}

export function ConnectionDetailsUI(props: ConnectionDetailsUIProps): ReactElement {
    const {
        connectAccessId,
        connectCallerId,
        connectionType,
        connectPhoneNumber,
        connectPin,
        connectUrl,
        onChangeConnectAccessId,
        onChangeConnectCallerId,
        onChangeConnectDialNumber,
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        onChangeZoomMeetingType,
        onConnectDialNumber,
        participationType,
        participationTypeOptions,
        showCallMeFields,
        zoomMeetingType,
    } = props;
    const dialInField = (
        <FormFieldInput
            autoFocus
            className="mt-5 px-4 py-3"
            clearable
            description="Enter the dial-in number"
            label="Dial-in number*"
            name="connectPhoneNumber"
            onChange={onChangeConnectPhoneNumber}
            placeholder="(888)-123-4567"
            value={connectPhoneNumber}
        />
    );
    const participationTypeField = (
        <FormFieldSelect
            className="mt-2.5"
            name="participationType"
            onChange={onChangeParticipationType}
            options={participationTypeOptions}
            value={participationType}
        />
    );
    const renderConnectUrlField = (description: string, label: string) => (
        <FormFieldInput
            autoFocus
            className="mt-5 px-4 py-3"
            clearable
            description={description}
            label={label}
            name="connectUrl"
            onChange={onChangeConnectUrl}
            placeholder="https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5"
            value={connectUrl}
        />
    );
    const renderMeetingIdField = (label: string, description: string) => (
        <FormFieldInput
            className="mt-5 px-4 py-3"
            clearable
            description={description}
            label={label}
            name="connectAccessId"
            onChange={onChangeConnectAccessId}
            placeholder="1234567890"
            value={connectAccessId}
        />
    );
    const renderPasscodeField = (label = 'Passcode', description = 'Enter the passcode (optional)') => (
        <FormFieldInput
            className="mt-5 px-4 py-3"
            clearable
            description={description}
            label={label}
            name="connectPin"
            onChange={onChangeConnectPin}
            value={connectPin}
        />
    );
    return (
        <div className="py-3 connection-details">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Configure Connection</p>
            {match(connectionType)
                .with(ConnectionType.Zoom, () => (
                    <>
                        <FormFieldSelect
                            className="mt-2.5"
                            name="zoomMeetingType"
                            onChange={onChangeZoomMeetingType}
                            options={ZOOM_MEETING_TYPE_OPTIONS}
                            value={zoomMeetingType}
                        />
                        {!!zoomMeetingType && (
                            <>
                                {match(zoomMeetingType)
                                    .with('web', () => (
                                        <>
                                            {renderConnectUrlField('Enter the Zoom meeting url', 'Meeting URL*')}
                                            {renderPasscodeField()}
                                            <FormFieldInput
                                                className="mt-5 px-4 py-3"
                                                clearable
                                                description="Enter the name of the caller ID Aiera should use when connecting (optional)"
                                                label="Caller ID"
                                                name="connectCallerId"
                                                onChange={onChangeConnectCallerId}
                                                value={connectCallerId}
                                            />
                                        </>
                                    ))
                                    .with('phone', () => (
                                        <>
                                            {dialInField}
                                            {renderMeetingIdField('Meeting ID*', 'Enter the meeting ID')}
                                            {renderPasscodeField()}
                                            {participationTypeField}
                                        </>
                                    ))
                                    .otherwise(() => null)}
                            </>
                        )}
                    </>
                ))
                .with(ConnectionType.GoogleMeet, () => (
                    <>
                        {dialInField}
                        {renderPasscodeField('PIN', 'Enter a PIN (optional)')}
                        {participationTypeField}
                    </>
                ))
                .with(ConnectionType.Webcast, () => (
                    <>{renderConnectUrlField('Enter the url to access recording', 'Host URL*')}</>
                ))
                .with(ConnectionType.PhoneNumber, () => (
                    <>
                        {dialInField}
                        {renderMeetingIdField('Meeting ID / Access Code', 'Enter the meeting ID or access code')}
                        {renderPasscodeField('PIN', 'Enter a PIN (optional)')}
                        {participationTypeField}
                    </>
                ))
                .otherwise(() => null)}
            {showCallMeFields && (
                <FormField className="mt-5 px-4 py-3">
                    <p className="font-semibold text-base text-black form-field__label">Your phone number</p>
                    <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                        Must be a direct line. Extensions are not supported for personal numbers
                    </p>
                    <PhoneNumberInput
                        className="mt-3"
                        defaultCountry="US"
                        name="onConnectDialNumber"
                        onChange={onChangeConnectDialNumber}
                        placeholder="(888)-123-4567"
                        value={onConnectDialNumber}
                    />
                </FormField>
            )}
        </div>
    );
}

/** @notExported */
export interface ConnectionDetailsProps extends ConnectionDetailsSharedProps {}

/**
 * Renders ConnectionDetails
 */
export function ConnectionDetails(props: ConnectionDetailsProps): ReactElement {
    const { state, handlers } = useChangeHandlers({ zoomMeetingType: '' });
    const {
        connectAccessId,
        connectCallerId,
        connectionType,
        connectPhoneNumber,
        connectPin,
        connectUrl,
        onChangeConnectAccessId,
        onChangeConnectCallerId,
        onChangeConnectDialNumber,
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        onConnectDialNumber,
        participationType,
        participationTypeOptions,
    } = props;
    // Only show the call me fields if the participation type is "Call me"
    // and the connection type is either Google Meet, Phone Number,
    // or Zoom with the "phone" meeting type selected
    const showCallMeFields = useMemo(
        () =>
            participationType === ParticipationType.Participating &&
            !!connectionType &&
            ([ConnectionType.GoogleMeet, ConnectionType.PhoneNumber].includes(connectionType) ||
                (connectionType === ConnectionType.Zoom &&
                    state.zoomMeetingType === ZOOM_MEETING_TYPE_OPTION_PHONE.value)),
        [connectionType, participationType]
    );
    return (
        <ConnectionDetailsUI
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
            onChangeZoomMeetingType={handlers.zoomMeetingType}
            onConnectDialNumber={onConnectDialNumber}
            participationType={participationType}
            participationTypeOptions={participationTypeOptions}
            showCallMeFields={showCallMeFields}
            zoomMeetingType={state.zoomMeetingType}
        />
    );
}
