import React, { ReactElement } from 'react';
import classNames from 'classnames';

import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { ConnectionType as ConnectionTypeEnum, ConnectionTypeOption } from '@aiera/client-sdk/modules/RecordingForm';
import './styles.css';

interface ConnectionTypeSharedProps {
    connectionType?: ConnectionTypeEnum;
    connectionTypeOptions: ConnectionTypeOption;
    onChange: ChangeHandler<ConnectionTypeEnum>;
}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {}

export function ConnectionTypeUI(props: ConnectionTypeUIProps): ReactElement {
    const { connectionType, connectionTypeOptions, onChange } = props;
    return (
        <div className="py-3 connection-type">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Connection Type</p>
            <div className="bg-white border border-gray-100 mt-2 rounded shadow-xl">
                {Object.values(connectionTypeOptions).map((option) => (
                    <div
                        className="border-b border-gray-100 cursor-pointer flex h[70px] items-center px-4 py-3 hover:bg-gray-50 last:border-0"
                        key={option.value}
                        onClick={(e) => onChange(e, { name: 'connectionType', value: option.value })}
                    >
                        <div>
                            <p
                                className={classNames([
                                    'text-black text-base',
                                    { 'font-semibold': connectionType === option.value },
                                ])}
                            >
                                {option.label}
                            </p>
                            <p className="font-light pt-0.25 text-[#ABB2C7] text-sm">{option.description}</p>
                        </div>
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
    const { connectionType, connectionTypeOptions, onChange } = props;
    return (
        <ConnectionTypeUI
            connectionType={connectionType}
            connectionTypeOptions={connectionTypeOptions}
            onChange={onChange}
        />
    );
}
