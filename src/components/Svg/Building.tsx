import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useConfig } from '@aiera/client-sdk/lib/config';
import building from '@aiera/client-sdk/assets/building.svg';
import { Svg } from '.';

export function Building({ className }: { className?: string }): ReactElement {
    const config = useConfig();
    return (
        <Svg alt="building" className={classNames(className, 'Svg__building')} src={`${config.assetPath}${building}`} />
    );
}
