import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Svg } from '.';
import gear from '@aiera/client-sdk/assets/gear.svg';

export function Gear({ className }: { className?: string }): ReactElement {
    return <Svg alt="gear" className={classNames(className, 'Svg__gear')} src={gear} />;
}
