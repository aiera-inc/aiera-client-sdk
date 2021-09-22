import React, { ReactElement } from 'react';
import classNames from 'classnames';
import './styles.css';

/** @notExported */
export interface SvgProps {
    alt: string;
    className?: string;
    src: string;
}

/**
 * Renders Svg
 */
export function Svg(props: SvgProps): ReactElement {
    const { alt, className, src } = props;
    return (
        <object className={classNames(className, 'Svg')} data={src} type="image/svg+xml">
            {alt}
        </object>
    );
}
