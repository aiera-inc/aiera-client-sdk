import React, { ReactElement } from 'react';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { RecordingFormFieldValue } from '@aiera/client-sdk/modules/RecordingForm';
import { ChangeHandler } from '@aiera/client-sdk/types';
import {
    ConnectionType as ConnectionTypeEnum,
    CONNECTION_TYPE_OPTIONS,
} from '@aiera/client-sdk/modules/RecordingForm/consts';
import './styles.css';

interface ConnectionTypeSharedProps {
    connectionType?: ConnectionTypeEnum;
    onChange: ChangeHandler<RecordingFormFieldValue>;
}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {}

export function ConnectionTypeUI(props: ConnectionTypeUIProps): ReactElement {
    const { connectionType, onChange } = props;
    return (
        <div className="py-3 connection-type">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Connection Type</p>
            <div className="bg-white border border-gray-100 mt-2 rounded shadow-xl">
                {Object.values(CONNECTION_TYPE_OPTIONS).map((option, idx) => (
                    <div
                        className={`${
                            idx === Object.keys(CONNECTION_TYPE_OPTIONS).length - 1 ? '' : 'border-b'
                        } border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50`}
                        key={option.value}
                        onClick={(e) => onChange(e, { name: 'connectionType', value: option.value })}
                    >
                        <>
                            <p
                                className={`${
                                    connectionType === option.value ? 'font-semibold' : ''
                                } text-black text-base`}
                            >
                                {option.label}
                            </p>
                            <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">{option.description}</p>
                        </>
                        <Checkbox checked={connectionType === option.value} className="ml-auto flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** @notExported */
export interface ConnectionTypeProps extends ConnectionTypeSharedProps {}

/**
 * Renders ConnectionType
 */
export function ConnectionType(props: ConnectionTypeProps): ReactElement {
    const { connectionType, onChange } = props;
    return <ConnectionTypeUI connectionType={connectionType} onChange={onChange} />;
}
