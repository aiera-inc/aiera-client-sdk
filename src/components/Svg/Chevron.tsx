import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Svg } from '.';
import chevron from '@aiera/client-sdk/assets/chevron.svg';

export function Chevron({ className }: { className?: string }): ReactElement {
    return <Svg alt="chevron" className={classNames(className, 'Svg__chevron')} src={chevron} />;
}
