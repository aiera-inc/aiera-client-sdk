import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function PinSolid({ className, alt = 'Pin' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__pinSolid')}
            width="100%"
            viewBox="0 0 12 14"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.3356 1.33475L2.8351 2.74084V4.79647C0.85057 5.41718 0.214343 7.45042 0.0103719 8.69031C-0.0792778 9.23527 0.36184 9.6838 0.914125 9.6838H5.24867V13.2466C5.24867 13.6609 5.58446 13.9966 5.99867 13.9966C6.41288 13.9966 6.74867 13.6609 6.74867 13.2466V9.6838H11.0848C11.6371 9.6838 12.0783 9.23527 11.9886 8.69031C11.7846 7.45042 11.1484 5.41718 9.16387 4.79647V2.74084L9.66338 1.33475C9.89463 0.683783 9.41189 0 8.72107 0H3.2779C2.58709 0 2.10435 0.683783 2.3356 1.33475Z"
            />
        </svg>
    );
}
