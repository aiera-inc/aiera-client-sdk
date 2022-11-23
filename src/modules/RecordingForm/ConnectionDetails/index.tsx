import React, { Dispatch, FocusEventHandler, ReactElement, SetStateAction, useMemo } from 'react';
import { match } from 'ts-pattern';
import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { PhoneNumberInput } from '@aiera/client-sdk/components/PhoneNumberInput';
import { ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import {
    ConnectionType,
    InputErrorState,
    InputTouchedState,
    ParticipationType,
    ZOOM_MEETING_TYPE_OPTION_PHONE,
    ZOOM_MEETING_TYPE_OPTIONS,
    ZoomMeetingType,
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
    errors: InputErrorState;
    onBlur: FocusEventHandler;
    onChangeConnectAccessId: ChangeHandler<string>;
    onChangeConnectCallerId: ChangeHandler<string>;
    onChangeConnectDialNumber: Dispatch<SetStateAction<string>>;
    onChangeConnectPhoneNumber: ChangeHandler<string>;
    onChangeConnectPin: ChangeHandler<string>;
    onChangeConnectUrl: ChangeHandler<string>;
    onChangeParticipationType: ChangeHandler<ParticipationType>;
    onChangeZoomMeetingType: ChangeHandler<ZoomMeetingType>;
    onConnectDialNumber: string;
    onFocus: FocusEventHandler;
    participationType?: ParticipationType;
    participationTypeOptions: SelectOption<ParticipationType>[];
    smsAlertBeforeCall: boolean;
    toggleSMSAlertBeforeCall: ChangeHandler<boolean>;
    touched: InputTouchedState;
    zoomMeetingType?: ZoomMeetingType;
}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {
    showCallMeFields: boolean;
}

export function ConnectionDetailsUI(props: ConnectionDetailsUIProps): ReactElement {
    const {
        connectAccessId,
        connectCallerId,
        connectionType,
        connectPhoneNumber,
        connectPin,
        connectUrl,
        onBlur,
        onChangeConnectAccessId,
        onChangeConnectCallerId,
        onChangeConnectDialNumber,
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        onChangeZoomMeetingType,
        onConnectDialNumber,
        onFocus,
        participationType,
        participationTypeOptions,
        showCallMeFields,
        smsAlertBeforeCall,
        toggleSMSAlertBeforeCall,
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
            onBlur={onBlur}
            onChange={onChangeConnectPhoneNumber}
            onFocus={onFocus}
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
            onBlur={onBlur}
            onChange={onChangeConnectUrl}
            onFocus={onFocus}
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
            onBlur={onBlur}
            onChange={onChangeConnectAccessId}
            onFocus={onFocus}
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
            onBlur={onBlur}
            onChange={onChangeConnectPin}
            onFocus={onFocus}
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
                                    .with(ZoomMeetingType.Web, () => (
                                        <>
                                            {renderConnectUrlField('Enter the Zoom meeting url', 'Meeting URL*')}
                                            {renderPasscodeField()}
                                            <FormFieldInput
                                                className="mt-5 px-4 py-3"
                                                clearable
                                                description="Enter the name of the caller ID Aiera should use when connecting (optional)"
                                                label="Caller ID"
                                                name="connectCallerId"
                                                onBlur={onBlur}
                                                onChange={onChangeConnectCallerId}
                                                onFocus={onFocus}
                                                value={connectCallerId}
                                            />
                                        </>
                                    ))
                                    .with(ZoomMeetingType.Phone, () => (
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
                <>
                    <FormField className="mt-5 px-4 py-3">
                        <p className="font-semibold text-base text-black form-field__label">Your phone number</p>
                        <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                            Must be a direct line. Extensions are not supported for personal numbers
                        </p>
                        <PhoneNumberInput
                            className="mt-3"
                            defaultCountry="US"
                            name="onConnectDialNumber"
                            onBlur={onBlur}
                            onChange={onChangeConnectDialNumber}
                            onFocus={onFocus}
                            placeholder="(888)-123-4567"
                            value={onConnectDialNumber}
                        />
                    </FormField>
                    <FormField className="mt-5 px-4 py-3">
                        <p className="font-semibold text-base text-black form-field__label">Alert me before</p>
                        <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                            Get an SMS 5 minutes before the call
                        </p>
                        <Checkbox
                            checked={smsAlertBeforeCall}
                            className="flex-shrink-0 ml-auto mt-3"
                            label="Aiera has permission to text me a reminder before the call"
                            onChange={toggleSMSAlertBeforeCall}
                        />
                    </FormField>
                </>
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
    const {
        connectAccessId,
        connectCallerId,
        connectionType,
        connectPhoneNumber,
        connectPin,
        connectUrl,
        errors,
        onBlur,
        onChangeConnectAccessId,
        onChangeConnectCallerId,
        onChangeConnectDialNumber,
        onChangeConnectPhoneNumber,
        onChangeConnectPin,
        onChangeConnectUrl,
        onChangeParticipationType,
        onChangeZoomMeetingType,
        onConnectDialNumber,
        onFocus,
        participationType,
        participationTypeOptions,
        smsAlertBeforeCall,
        toggleSMSAlertBeforeCall,
        touched,
        zoomMeetingType,
    } = props;
    // Only show the call me fields if the participation type is "Call me"
    // and the connection type is either Google Meet, Phone Number,
    // or Zoom with the "phone" meeting type selected
    const showCallMeFields = useMemo(
        () =>
            participationType === ParticipationType.Participating &&
            !!connectionType &&
            ([ConnectionType.GoogleMeet, ConnectionType.PhoneNumber].includes(connectionType) ||
                (connectionType === ConnectionType.Zoom && zoomMeetingType === ZOOM_MEETING_TYPE_OPTION_PHONE.value)),
        [connectionType, participationType, zoomMeetingType]
    );
    return (
        <ConnectionDetailsUI
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
            participationTypeOptions={participationTypeOptions}
            showCallMeFields={showCallMeFields}
            smsAlertBeforeCall={smsAlertBeforeCall}
            toggleSMSAlertBeforeCall={toggleSMSAlertBeforeCall}
            touched={touched}
            zoomMeetingType={zoomMeetingType}
        />
    );
}
