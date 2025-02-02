import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function MicroDocumentMinus({
    className,
    alt = 'Micro Document Minus',
}: {
    className?: string;
    alt?: string;
}): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__microDocumentMinus')}
            width="100%"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm7 7a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h4.5A.75.75 0 0 1 11 9Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
