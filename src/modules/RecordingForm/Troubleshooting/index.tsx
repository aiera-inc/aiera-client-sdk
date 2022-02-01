import React, { ReactElement } from 'react';
import './styles.css';

interface TroubleshootingSharedProps {}

/** @notExported */
interface TroubleshootingUIProps extends TroubleshootingSharedProps {}

export function TroubleshootingUI(_props: TroubleshootingUIProps): ReactElement {
    return (
        <div className="font-medium py-3 text-gray-400 text-xs tracking-wide uppercase troubleshooting">
            <p>Troubleshooting</p>
        </div>
    );
}

/** @notExported */
export interface TroubleshootingProps extends TroubleshootingSharedProps {}

/**
 * Renders Troubleshooting
 */
export function Troubleshooting(_props: TroubleshootingProps): ReactElement {
    return <TroubleshootingUI />;
}
