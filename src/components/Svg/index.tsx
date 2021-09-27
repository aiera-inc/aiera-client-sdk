import React, { ReactElement, Suspense } from 'react';
import classNames from 'classnames';
import './styles.css';

/** @notExported */
export interface SvgProps {
    alt: string;
    className?: string;
    type: string;
}

/**
 * Renders Svg
 */

const arrowLeft = React.lazy(() => import('./ArrowLeft'));
const building = React.lazy(() => import('./Building'));
const chevron = React.lazy(() => import('./Chevron'));
const gear = React.lazy(() => import('./Gear'));
const magnifyingGlass = React.lazy(() => import('./MagnifyingGlass'));

export function Svg(props: SvgProps): ReactElement {
    const { alt, className, type } = props;
    const dict = {
        arrowLeft,
        building,
        chevron,
        gear,
        magnifyingGlass,
    };
    const SVG_ELEMENT = dict[type];
    return (
        <Suspense fallback={<div>loading</div>}>
            <SVG_ELEMENT className={classNames(className, 'Svg')} alt={alt} />
        </Suspense>
    );
}
