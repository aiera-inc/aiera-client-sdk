import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Plus({ className, alt = 'Plus' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__plus')}
            width="100%"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                d="M6,4 L9,4 C9.55228475,4 10,4.44771525 10,5 C10,5.55228475 9.55228475,6 9,6 L6,6 L6,9 C6,9.55228475 5.55228475,10 5,10 C4.44771525,10 4,9.55228475 4,9 L4,6 L1,6 C0.44771525,6 6.76353751e-17,5.55228475 0,5 C-6.76353751e-17,4.44771525 0.44771525,4 1,4 L4,4 L4,1 C4,0.44771525 4.44771525,1.01453063e-16 5,0 C5.55228475,-1.01453063e-16 6,0.44771525 6,1 L6,4 Z"
                fillRule="evenodd"
            />
        </svg>
    );
}
