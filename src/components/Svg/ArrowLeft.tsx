import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Svg } from '.';
import arrowLeft from '@aiera/client-sdk/assets/arrowLeft.svg';

export function ArrowLeft({ className }: { className?: string }): ReactElement {
    return <Svg alt="arrowLeft" className={classNames(className, 'Svg__arrowLeft')} src={arrowLeft} />;
}
