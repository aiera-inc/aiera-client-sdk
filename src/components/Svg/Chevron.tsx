import React, { ReactElement } from 'react';
import classNames from 'classnames';

export default function Chevron({ className, alt = 'Chevron' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            alt={alt}
            className={classNames(className, 'Svg__chevron')}
            width="100%"
            viewBox="0 0 8 5"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L4 2.58579L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
            />
        </svg>
    );
}
