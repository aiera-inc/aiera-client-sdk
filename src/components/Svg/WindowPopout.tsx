import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function WindowPopout({ className, alt = 'Window Popout' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'stroke-current', 'Svg', 'Svg__windowPopout')}
            width="100%"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                d="M10,0 C11.101563,0 12,0.898438 12,2 L12,2 L12,10 C12,11.101563 11.101563,12 10,12 L10,12 L2.5,12 L3.5,11 L10,11 C10.550781,11 11,10.550781 11,10 L11,10 L11,3 L1,3 L1,8.5 L0,9.5 L0,2 C0,0.898438 0.898438,0 2,0 L2,0 Z M6.976562,5 L6.976562,8.535156 L5.5625,7.121094 L1.05664615,11.6269479 L1.05664615,11.6269479 C0.859459898,11.8219778 0.544655281,11.8202384 0.3515625,11.625 C0.157086476,11.428363 0.157961645,11.1115694 0.353521146,10.9160099 L0.353521146,10.9160099 L4.855468,6.414063 L3.441406,5 L6.976562,5 Z M2,1 L1.5,1 C1.222656,1 1,1.226563 1,1.5 L1,1.5 L1,2 L2,2 L2,1 Z M4,1 L3,1 L3,2 L4,2 L4,1 Z M10.498359,1 L5,1 L5,2 L10.998359,2 L10.998359,1.5 C10.998359,1.226563 10.775703,1 10.498359,1 L10.498359,1 Z"
                fillRule="evenodd"
                strokeWidth="1"
            />
        </svg>
    );
}
