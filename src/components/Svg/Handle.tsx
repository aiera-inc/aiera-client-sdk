import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Handle({ className, alt = 'Handle' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'stroke-current fill-current', 'Svg', 'Svg__handle')}
            width="100%"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                d="M14.75 8C14.75 8.27614 14.5261 8.5 14.25 8.5C13.9739 8.5 13.75 8.27614 13.75 8C13.75 7.72386 13.9739 7.5 14.25 7.5C14.5261 7.5 14.75 7.72386 14.75 8Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14.75 12C14.75 12.2761 14.5261 12.5 14.25 12.5C13.9739 12.5 13.75 12.2761 13.75 12C13.75 11.7239 13.9739 11.5 14.25 11.5C14.5261 11.5 14.75 11.7239 14.75 12Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.75 8C10.75 8.27614 10.5261 8.5 10.25 8.5C9.97386 8.5 9.75 8.27614 9.75 8C9.75 7.72386 9.97386 7.5 10.25 7.5C10.5261 7.5 10.75 7.72386 10.75 8Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.75 12C10.75 12.2761 10.5261 12.5 10.25 12.5C9.97386 12.5 9.75 12.2761 9.75 12C9.75 11.7239 9.97386 11.5 10.25 11.5C10.5261 11.5 10.75 11.7239 10.75 12Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14.75 16C14.75 16.2761 14.5261 16.5 14.25 16.5C13.9739 16.5 13.75 16.2761 13.75 16C13.75 15.7239 13.9739 15.5 14.25 15.5C14.5261 15.5 14.75 15.7239 14.75 16Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.75 16C10.75 16.2761 10.5261 16.5 10.25 16.5C9.97386 16.5 9.75 16.2761 9.75 16C9.75 15.7239 9.97386 15.5 10.25 15.5C10.5261 15.5 10.75 15.7239 10.75 16Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
