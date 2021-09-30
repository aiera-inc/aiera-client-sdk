import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Play({ className, alt = 'Play' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__play')}
            width="100%"
            viewBox="0 0 13 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path d="M11.383 6.31764C12.6076 7.10491 12.6076 8.89508 11.383 9.68236L3.08152 15.019C1.75049 15.8747 0 14.919 0 13.3367V2.66333C0 1.081 1.75049 0.125316 3.08151 0.980974L11.383 6.31764Z" />
        </svg>
    );
}
