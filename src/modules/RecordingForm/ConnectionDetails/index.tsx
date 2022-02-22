import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { ConnectionType } from '@aiera/client-sdk/modules/RecordingForm';
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
    connectionType?: ConnectionType;
}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {
    onChangeZoomMeetingType: Dispatch<SetStateAction<string>>;
    zoomMeetingType: string;
    zoomMeetingTypeOptions: ZoomMeetingTypeOption[];
}

export function ConnectionDetailsUI(props: ConnectionDetailsUIProps): ReactElement {
    const { connectionType, onChangeZoomMeetingType, zoomMeetingType, zoomMeetingTypeOptions } = props;
    return (
        <div className="py-3 connection-details">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Configure Connection</p>
            {match(connectionType)
                .with(ConnectionType.Zoom, () => (
                    <>
                        <div className="bg-white border border-gray-200 mt-2 rounded shadow-xl">
                            {zoomMeetingTypeOptions.map((option) => (
                                <div
                                    className="border-b border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50 hover:rounded last:border-0"
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
                                        <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">
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
                        <div className="bg-white border border-gray-200 mt-5 px-4 py-3 rounded shadow-xl">
                            <p className="font-semibold text-base text-black">Dial-in number</p>
                            <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                        </div>
                    </>
                ))
                .with(ConnectionType.GoogleMeet, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
                ))
                .with(ConnectionType.Webcast, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
                    </div>
                ))
                .with(ConnectionType.PhoneNumber, () => (
                    <div className="bg-white border border-gray-200 mt-2 px-4 py-3 rounded shadow-xl">
                        <p className="font-semibold text-base text-black">Dial-in number</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">Enter the dial-in number</p>
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
    const [zoomMeetingType, setZoomMeetingType] = useState<string>('web');

    const { connectionType } = props;
    return (
        <ConnectionDetailsUI
            connectionType={connectionType}
            onChangeZoomMeetingType={setZoomMeetingType}
            zoomMeetingType={zoomMeetingType}
            zoomMeetingTypeOptions={ZOOM_MEETING_TYPE_OPTIONS}
        />
    );
}
