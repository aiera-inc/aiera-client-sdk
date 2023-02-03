import React, { FocusEventHandler, ReactElement, useMemo } from 'react';
import { match } from 'ts-pattern';
import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { PhoneNumberInput } from '@aiera/client-sdk/components/PhoneNumberInput';
import {
    ConnectionType,
    InputErrorState,
    InputTouchedState,
    ParticipationType,
    RecordingFormStateChangeHandler,
    ZoomMeetingType,
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
    errors: InputErrorState;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    onConnectDialNumber: string;
    onFocus: FocusEventHandler;
    participationType?: ParticipationType;
    participationTypeOptions: SelectOption<ParticipationType>[];
    smsAlertBeforeCall: boolean;
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
        errors,
        onBlur,
        onChange,
        onConnectDialNumber,
        onFocus,
        participationType,
        participationTypeOptions,
        showCallMeFields,
        smsAlertBeforeCall,
        zoomMeetingType,
    } = props;
    const dialInField = (
        <FormField className="mt-5 px-4 py-3">
            <p className="font-semibold text-base text-black form-field__label">Dial-in number*</p>
            <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                Enter the dial-in number
            </p>
            <PhoneNumberInput
                className="mt-5"
                defaultCountry="US"
                error={errors.connectPhoneNumber}
                name="connectPhoneNumber"
                onBlur={onBlur}
                onChange={(value?: string) => onChange(null, { name: 'connectPhoneNumber', value })}
                onFocus={onFocus}
                placeholder="(888)-123-4567"
                value={connectPhoneNumber}
            />
        </FormField>
    );
    const participationTypeField = (
        <FormFieldSelect
            className="mt-2.5"
            name="participationType"
            onChange={onChange}
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
            error={errors.connectUrl}
            label={label}
            name="connectUrl"
            onBlur={onBlur}
            onChange={onChange}
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
            error={errors.connectAccessId}
            inputType="number"
            label={label}
            name="connectAccessId"
            onBlur={onBlur}
            onChange={onChange}
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
            error={errors.connectPin}
            label={label}
            name="connectPin"
            onBlur={onBlur}
            onChange={onChange}
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
                            onChange={onChange}
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
                                                onChange={onChange}
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
                .with(ConnectionType.Phone, () => (
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
                            Must be a direct line. Extensions are not supported
                        </p>
                        <PhoneNumberInput
                            className="mt-5"
                            defaultCountry="US"
                            error={errors.onConnectDialNumber}
                            name="onConnectDialNumber"
                            onBlur={onBlur}
                            onChange={(value?: string) => onChange(null, { name: 'onConnectDialNumber', value })}
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
                            name="smsAlertBeforeCall"
                            onChange={onChange}
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
        onChange,
        onConnectDialNumber,
        onFocus,
        participationType,
        participationTypeOptions,
        smsAlertBeforeCall,
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
            ([ConnectionType.GoogleMeet, ConnectionType.Phone].includes(connectionType) ||
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
            onChange={onChange}
            onConnectDialNumber={onConnectDialNumber}
            onFocus={onFocus}
            participationType={participationType}
            participationTypeOptions={participationTypeOptions}
            showCallMeFields={showCallMeFields}
            smsAlertBeforeCall={smsAlertBeforeCall}
            touched={touched}
            zoomMeetingType={zoomMeetingType}
        />
    );
}
