import React, { ReactElement } from 'react';
import classNames from 'classnames';
import arrowLeft from './ArrowLeft';
import building from './Building';
import chevron from './Chevron';
import gear from './Gear';
import magnifyingGlass from './MagnifyingGlass';

export const SvgMap = {
    arrowLeft,
    building,
    chevron,
    gear,
    magnifyingGlass,
};

/** @notExported */
export interface SvgProps {
    alt: string;
    className?: string;
    type: keyof typeof SvgMap;
}

/**
 * Renders Svg
 */

export function Svg(props: SvgProps): ReactElement {
    const { alt, className, type } = props;
    const SvgElement = SvgMap[type];
    return <SvgElement className={classNames(className, 'Svg')} alt={alt} />;
}
