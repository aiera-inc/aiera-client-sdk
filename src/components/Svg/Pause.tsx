import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Pause({ className, alt = 'Pause' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__pause')}
            width="100%"
            fill="white"
            viewBox="0 0 12 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <rect width="4" height="16" rx="2" />
            <rect x="8" width="4" height="16" rx="2" />
        </svg>
    );
}
