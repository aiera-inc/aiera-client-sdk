import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function MovementArrow({
    className,
    alt = 'Movement Arrow',
}: {
    className?: string;
    alt?: string;
}): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__movementArrow')}
            width="100%"
            viewBox="0 0 8 10"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path d="M3.07553 1.24173C3.41575 0.416723 4.58425 0.416724 4.92447 1.24173L7.76051 8.11875C8.03196 8.77699 7.54805 9.5 6.83604 9.5H1.16396C0.451948 9.5 -0.0319641 8.77699 0.239489 8.11875L3.07553 1.24173Z" />
        </svg>
    );
}
