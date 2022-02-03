import React, { ReactElement } from 'react';
import './styles.css';

interface ConnectionTypeSharedProps {}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {}

export function ConnectionTypeUI(_props: ConnectionTypeUIProps): ReactElement {
    return (
        <div className="py-3 connection-type">
            <p className="font-bold text-[#C1C7D7] text-sm tracking-widest uppercase">Connection Type</p>
            <div className="bg-white border-gray-500 border-solid mt-1 rounded shadow">
                <div className="border-b flex h-20 items-center px-4 py-3">
                    <div className="">
                        <p className="font-semibold text-black text-lg">Zoom</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-base">Connect to a Zoom dial-in number</p>
                    </div>
                    <div className="ml-auto">Checkbox</div>
                </div>
                <div className="border-b flex h-20 items-center px-4 py-3">
                    <div className="">
                        <p className="font-semibold text-black text-lg">Google Meet</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-base">
                            Connect to a Google Meet dial-in number
                        </p>
                    </div>
                    <div className="ml-auto">Checkbox</div>
                </div>
                <div className="border-b flex h-20 items-center px-4 py-3">
                    <div className="">
                        <p className="font-semibold text-black text-lg">Webcast URL</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-base">Connect to a webcast url</p>
                    </div>
                    <div className="ml-auto">Checkbox</div>
                </div>
                <div className="flex h-20 items-center px-4 py-3">
                    <div className="">
                        <p className="font-semibold text-black text-lg">Phone Number</p>
                        <p className="font-light pt-0.25 text-[#ABB2C7] text-base">
                            Connect to any phone number, including optional pin
                        </p>
                    </div>
                    <div className="ml-auto">Checkbox</div>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface ConnectionTypeProps extends ConnectionTypeSharedProps {}

/**
 * Renders ConnectionType
 */
export function ConnectionType(_props: ConnectionTypeProps): ReactElement {
    return <ConnectionTypeUI />;
}
