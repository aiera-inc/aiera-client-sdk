import React, { ReactElement } from 'react';
import { match } from 'ts-pattern';

import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { ChangeHandler, useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { ConnectionType, ParticipationType } from '@aiera/client-sdk/modules/RecordingForm';
import { SelectOption } from '@aiera/client-sdk/types';
import './styles.css';

const ZOOM_MEETING_TYPE_OPTION_PHONE = {
    label: 'Dial-in number',
    value: 'phone',
    description: 'Connect to Zoom meeting via dial-in number',
};
const ZOOM_MEETING_TYPE_OPTION_WEB = {
    label: 'Web URL',
    value: 'web',
    description: 'Connect to Zoom meeting via web url',
};
const ZOOM_MEETING_TYPE_OPTIONS = [ZOOM_MEETING_TYPE_OPTION_WEB, ZOOM_MEETING_TYPE_OPTION_PHONE];

interface ConnectionDetailsSharedProps {
    connectAccessId: string;
    connectCallerId: string;
    connectionType?: ConnectionType;
    connectPhoneNumber: string;
    connectPin: string;
    connectUrl: string;
    onChangeConnectAccessId: ChangeHandler<string>;
    onChangeConnectCallerId: ChangeHandler<string>;
    onChangeConnectPhoneNumber: ChangeHandler<string>;
    onChangeConnectPin: ChangeHandler<string>;
    onChangeConnectUrl: ChangeHandler<string>;
    onChangeParticipationType: ChangeHandler<ParticipationType>;
    participationType?: ParticipationType;
    participationTypeOptions: SelectOption<ParticipationType>[];
}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {
    onChangeZoomMeetingType: ChangeHandler<string>;
    zoomMeetingType?: string;
    zoomMeetingTypeOptions: SelectOption<string>[];
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
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        onChangeZoomMeetingType,
        participationType,
        participationTypeOptions,
        zoomMeetingType,
        zoomMeetingTypeOptions,
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
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Configure Connection</p>
            {match(connectionType)
                .with(ConnectionType.Zoom, () => (
                    <>
                        <FormFieldSelect
                            className="mt-2.5"
                            name="zoomMeetingType"
                            onChange={onChangeZoomMeetingType}
                            options={zoomMeetingTypeOptions}
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
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        participationType,
        participationTypeOptions,
    } = props;
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
            onChangeConnectPhoneNumber={onChangeConnectPhoneNumber}
            onChangeConnectPin={onChangeConnectPin}
            onChangeConnectUrl={onChangeConnectUrl}
            onChangeParticipationType={onChangeParticipationType}
            onChangeZoomMeetingType={handlers.zoomMeetingType}
            participationType={participationType}
            participationTypeOptions={participationTypeOptions}
            zoomMeetingType={state.zoomMeetingType}
            zoomMeetingTypeOptions={ZOOM_MEETING_TYPE_OPTIONS}
        />
    );
}
