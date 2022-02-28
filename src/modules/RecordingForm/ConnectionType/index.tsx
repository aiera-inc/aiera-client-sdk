import React, { ReactElement, SyntheticEvent, useCallback } from 'react';

import { FormFieldSelect } from '@aiera/client-sdk/components/FormField';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { ConnectionType as ConnectionTypeEnum, ConnectionTypeOption } from '@aiera/client-sdk/modules/RecordingForm';
import './styles.css';

interface ConnectionTypeSharedProps {
    connectionType?: ConnectionTypeEnum;
    connectionTypeOptions: ConnectionTypeOption;
}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {
    onChange: ChangeHandler<string>; // should be using T (generic type)
}

export function ConnectionTypeUI(props: ConnectionTypeUIProps): ReactElement {
    const { connectionType, connectionTypeOptions, onChange } = props;
    return (
        <div className="py-3 connection-type">
            <p className="font-semibold mt-2 text-[#C1C7D7] text-xs tracking-widest uppercase">Connection Type</p>
            <FormFieldSelect
                className="mt-2"
                name="connectionType"
                onChange={onChange}
                options={Object.values(connectionTypeOptions)}
                value={connectionType}
            />
        </div>
    );
}

/** @notExported */
export interface ConnectionTypeProps extends ConnectionTypeSharedProps {
    onChange: ChangeHandler<ConnectionTypeEnum>;
}

/**
 * Renders ConnectionType
 */
export function ConnectionType(props: ConnectionTypeProps): ReactElement {
    const connectionTypeStringToEnum = (connectionType?: string | null): ConnectionTypeEnum | null =>
        connectionType
            ? Object.keys(ConnectionTypeEnum)[Object.values(ConnectionTypeEnum).indexOf(connectionType)]
            : null;
    const { connectionType, connectionTypeOptions, onChange } = props;
    return (
        <ConnectionTypeUI
            connectionType={connectionType}
            connectionTypeOptions={connectionTypeOptions}
            onChange={useCallback(
                (event, { value }: { value?: string | null }) =>
                    onChange(event as SyntheticEvent<Element, Event>, { value: connectionTypeStringToEnum(value) }),
                [onChange]
            )}
        />
    );
}
