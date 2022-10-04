import React, { ReactElement } from 'react';
import './styles.css';

interface TroubleshootingSharedProps {}

/** @notExported */
interface TroubleshootingUIProps extends TroubleshootingSharedProps {}

export function TroubleshootingUI(_props: TroubleshootingUIProps): ReactElement {
    return (
        <div className="py-3 troubleshooting">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Troubleshooting</p>
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
