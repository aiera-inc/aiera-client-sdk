import React, { ReactElement } from 'react';
import { Svg } from '.';
import building from '@aiera/client-sdk/assets/building.svg';

export function Building({ className }: { className?: string }): ReactElement {
    return <Svg alt="building" className={className} src={building} />;
}
