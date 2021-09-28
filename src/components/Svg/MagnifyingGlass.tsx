import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function MagnifyingGlass({
    className,
    alt = 'Magnifying Glass',
}: {
    className?: string;
    alt?: string;
}): ReactElement {
    return (
        <svg
            className={classNames(className, 'Svg', 'Svg__magnifyingGlass')}
            width="100%"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                d="M11 11L8.41379 8.41379L11 11ZM1 5.31034C1 2.92981 2.92981 1 5.31034 1C7.6909 1 9.62069 2.92981 9.62069 5.31034C9.62069 7.6909 7.6909 9.62069 5.31034 9.62069C2.92981 9.62069 1 7.6909 1 5.31034Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
