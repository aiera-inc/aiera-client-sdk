import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function MicroBars({ className, alt = 'Micro Bars' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__microBars')}
            width="100%"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                d="M2 2.75A.75.75 0 0 1 2.75 2h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 2.75Zm0 10.5a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 6.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.75Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
