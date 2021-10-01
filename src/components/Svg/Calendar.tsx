import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Calendar({ className, alt = 'Calendar' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'stroke-current', 'Svg', 'Svg__Calendar')}
            width="100%"
            fill="rgba(0,0,0,0)"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>

            <path
                d="M6 5V1V5ZM14 5V1V5ZM5 9H15H5ZM3 19H17C17.5304 19 18.0391 18.7893 18.4142 18.4142C18.7893 18.0391 19 17.5304 19 17V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H3C2.46957 3 1.96086 3.21071 1.58579 3.58579C1.21071 3.96086 1 4.46957 1 5V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
