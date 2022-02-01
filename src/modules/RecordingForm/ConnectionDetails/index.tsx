import React, { ReactElement } from 'react';
import './styles.css';

interface ConnectionDetailsSharedProps {}

/** @notExported */
interface ConnectionDetailsUIProps extends ConnectionDetailsSharedProps {}

export function ConnectionDetailsUI(_props: ConnectionDetailsUIProps): ReactElement {
    return (
        <div className="font-medium py-3 text-gray-400 text-xs tracking-wide uppercase connection-details">
            <p>Configure Connection</p>
        </div>
    );
}

/** @notExported */
export interface ConnectionDetailsProps extends ConnectionDetailsSharedProps {}

/**
 * Renders ConnectionDetails
 */
export function ConnectionDetails(_props: ConnectionDetailsProps): ReactElement {
    return <ConnectionDetailsUI />;
}
