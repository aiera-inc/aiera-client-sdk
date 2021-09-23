import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Svg } from '.';
import magnifyingGlass from '@aiera/client-sdk/assets/magnifyingGlass.svg';

export function MagnifyingGlass({ className }: { className?: string }): ReactElement {
    return (
        <Svg alt="magnifying glass" className={classNames(className, 'Svg__magnifyingGlass')} src={magnifyingGlass} />
    );
}
