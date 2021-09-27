import React, { ReactElement, Suspense } from 'react';
import classNames from 'classnames';
import './styles.css';

export const SvgMap = {
    arrowLeft: React.lazy(() => import('./ArrowLeft')),
    building: React.lazy(() => import('./Building')),
    chevron: React.lazy(() => import('./Chevron')),
    gear: React.lazy(() => import('./Gear')),
    magnifyingGlass: React.lazy(() => import('./MagnifyingGlass')),
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
    return (
        <Suspense fallback={<div>loading</div>}>
            <SvgElement className={classNames(className, 'Svg')} alt={alt} />
        </Suspense>
    );
}
