import React, { ReactElement } from 'react';
import { match } from 'ts-pattern';

import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { Input } from '@aiera/client-sdk/components/Input';
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
const ZOOM_MEETING_TYPE_OPTIONS = [ZOOM_MEETING_TYPE_OPTION_PHONE, ZOOM_MEETING_TYPE_OPTION_WEB];

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
        onChangeZoomMeetingType,
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
                                            <FormFieldInput
                                                autoFocus
                                                className="mt-5 px-4 py-3"
                                                clearable
                                                description="Enter the Zoom meeting url"
                                                label="Meeting URL*"
                                                name="connectUrl"
                                                onChange={onChangeConnectUrl}
                                                placeholder="https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5"
                                                value={connectUrl}
                                            />
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
                                            <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                                                <p className="font-semibold text-base text-black">Meeting ID*</p>
                                                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                                    Enter the meeting ID
                                                </p>
                                                <div className="mt-3 w-full">
                                                    <Input
                                                        clearable
                                                        name="connectAccessId"
                                                        onChange={onChangeConnectAccessId}
                                                        placeholder="1234567890"
                                                        value={connectAccessId}
                                                    />
                                                </div>
                                            </div>
                                            {renderPasscodeField()}
                                            <FormFieldSelect
                                                className="mt-2.5"
                                                name="zoomMeetingType"
                                                onChange={onChangeZoomMeetingType}
                                                options={participationTypeOptions}
                                                value={zoomMeetingType}
                                            />
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
                    </>
                ))
                .with(ConnectionType.Webcast, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
                ))
                .with(ConnectionType.PhoneNumber, () => <>{dialInField}</>)
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
