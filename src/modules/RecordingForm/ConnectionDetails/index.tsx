import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { Input } from '@aiera/client-sdk/components/Input';
import { ConnectionType } from '@aiera/client-sdk/modules/RecordingForm';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

const ZOOM_MEETING_TYPE_OPTIONS = [
    {
        label: 'Web URL',
        value: 'web',
        description: 'Connect to Zoom meeting via web url',
    },
    {
        label: 'Dial-in number',
        value: 'phone',
        description: 'Connect to Zoom meeting via dial-in number',
    },
];

interface ZoomMeetingTypeOption {
    description: string;
    label: string;
    value: string;
}

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
}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {
    onChangeZoomMeetingType: Dispatch<SetStateAction<string | undefined>>;
    zoomMeetingType?: string;
    zoomMeetingTypeOptions: ZoomMeetingTypeOption[];
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
        zoomMeetingType,
        zoomMeetingTypeOptions,
    } = props;
    return (
        <div className="py-3 connection-details">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Configure Connection</p>
            {match(connectionType)
                .with(ConnectionType.Zoom, () => (
                    <>
                        <div className="bg-white border border-gray-200 mt-2 rounded shadow-xl">
                            {zoomMeetingTypeOptions.map((option) => (
                                <div
                                    className="border-b border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50 first:hover:rounded-t last:hover:rounded-b last:border-0"
                                    key={option.value}
                                    onClick={() => onChangeZoomMeetingType(option.value)}
                                >
                                    <div>
                                        <p
                                            className={classNames([
                                                'text-black text-base',
                                                { 'font-semibold': zoomMeetingType === option.value },
                                            ])}
                                        >
                                            {option.label}
                                        </p>
                                        <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                            {option.description}
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={zoomMeetingType === option.value}
                                        className="ml-auto flex-shrink-0"
                                    />
                                </div>
                            ))}
                        </div>
                        {!!zoomMeetingType && (
                            <>
                                {match(zoomMeetingType)
                                    .with('web', () => (
                                        <>
                                            <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                                                <p className="font-semibold text-base text-black">Meeting URL*</p>
                                                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                                    Enter the Zoom meeting url
                                                </p>
                                                <div className="mt-3 w-full">
                                                    <Input
                                                        autoFocus
                                                        clearable
                                                        name="connectUrl"
                                                        onChange={onChangeConnectUrl}
                                                        placeholder="https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5"
                                                        value={connectUrl}
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                                                <p className="font-semibold text-base text-black">Caller ID</p>
                                                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                                    Enter the name of the caller ID Aiera should use when connecting
                                                    (optional)
                                                </p>
                                                <div className="mt-3 w-full">
                                                    <Input
                                                        clearable
                                                        name="connectCallerId"
                                                        onChange={onChangeConnectCallerId}
                                                        value={connectCallerId}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ))
                                    .with('phone', () => (
                                        <>
                                            <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                                                <p className="font-semibold text-base text-black">Dial-in number*</p>
                                                <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                                    Enter the dial-in number
                                                </p>
                                                <div className="mt-3 w-full">
                                                    <Input
                                                        autoFocus
                                                        clearable
                                                        name="connectPhoneNumber"
                                                        onChange={onChangeConnectPhoneNumber}
                                                        placeholder="(888)-123-4567"
                                                        value={connectPhoneNumber}
                                                    />
                                                </div>
                                            </div>
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
                                        </>
                                    ))
                                    .otherwise(() => null)}
                                <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                                    <p className="font-semibold text-base text-black">Passcode</p>
                                    <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">
                                        Enter the passcode (optional)
                                    </p>
                                    <div className="mt-3 w-full">
                                        <Input
                                            clearable
                                            name="connectPin"
                                            onChange={onChangeConnectPin}
                                            value={connectPin}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ))
                .with(ConnectionType.GoogleMeet, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
                ))
                .with(ConnectionType.Webcast, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
                ))
                .with(ConnectionType.PhoneNumber, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light leading-4 pt-0.5 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
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
    const [zoomMeetingType, setZoomMeetingType] = useState<string | undefined>(undefined);
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
            onChangeZoomMeetingType={setZoomMeetingType}
            zoomMeetingType={zoomMeetingType}
            zoomMeetingTypeOptions={ZOOM_MEETING_TYPE_OPTIONS}
        />
    );
}
