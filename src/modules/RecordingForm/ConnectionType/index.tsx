import React, { ReactElement } from 'react';
import './styles.css';

interface ConnectionTypeSharedProps {}

/** @notExported */
interface ConnectionTypeUIProps extends ConnectionTypeSharedProps {}

export function ConnectionTypeUI(_props: ConnectionTypeUIProps): ReactElement {
    return (
        <div className="font-medium py-3 text-gray-400 text-xs tracking-wide uppercase connection-type">
            <p>Connection Type</p>
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
