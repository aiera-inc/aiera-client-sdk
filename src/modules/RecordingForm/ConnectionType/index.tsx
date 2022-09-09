import React, { ReactElement } from 'react';

import { FormFieldSelect } from '@aiera/client-sdk/components/FormField/FormFieldSelect';
import { ConnectionType as ConnectionTypeEnum } from '@aiera/client-sdk/modules/RecordingForm';
import { ChangeHandler, SelectOption } from '@aiera/client-sdk/types';
import './styles.css';

interface ConnectionTypeSharedProps {
    connectionType?: ConnectionTypeEnum;
    connectionTypeOptions: SelectOption<ConnectionTypeEnum>[];
    onChange: ChangeHandler<ConnectionTypeEnum>;
}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {}

export function ConnectionTypeUI(props: ConnectionTypeUIProps): ReactElement {
    const { connectionType, connectionTypeOptions, onChange } = props;
    return (
        <div className="py-3 connection-type">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Connection Type</p>
            <FormFieldSelect
                className="mt-2.5"
                name="connectionType"
                onChange={onChange}
                options={connectionTypeOptions}
                value={connectionType}
            />
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
