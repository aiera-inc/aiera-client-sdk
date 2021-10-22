import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Check({ className, alt = 'Check' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__check')}
            width="100%"
            viewBox="0 0 8 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.69471 1.69471C7.87687 1.50611 7.97766 1.25351 7.97539 0.991311C7.97311 0.729114 7.86794 0.478302 7.68253 0.292894C7.49712 0.107485 7.24631 0.00231622 6.98411 3.78025e-05C6.72192 -0.00224062 6.46931 0.0985542 6.28071 0.280712L2.98771 3.57371L1.69471 2.28071C1.50611 2.09855 1.25351 1.99776 0.991311 2.00004C0.729114 2.00232 0.478302 2.10749 0.292894 2.29289C0.107485 2.4783 0.00231622 2.72911 3.78025e-05 2.99131C-0.00224062 3.25351 0.0985542 3.50611 0.280712 3.69471L2.28071 5.69471C2.46824 5.88218 2.72255 5.9875 2.98771 5.9875C3.25288 5.9875 3.50718 5.88218 3.69471 5.69471L7.69471 1.69471Z"
            />
        </svg>
    );
}
