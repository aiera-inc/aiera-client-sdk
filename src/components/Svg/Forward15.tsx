import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Forward15({ className, alt = 'Forward15' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__forward15')}
            width="100%"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.8828 0.917188C15.9604 0.995588 16 1.0976 16 1.2V4.8C16 5.01217 15.9157 5.21566 15.7657 5.36569C15.6157 5.51571 15.4122 5.6 15.2 5.6H11.6C11.4976 5.6 11.3948 5.56121 11.3172 5.48281C11.1612 5.32681 11.1612 5.07319 11.3172 4.91719L12.6313 3.60313C11.4685 2.37401 9.83157 1.6 8 1.6C4.45547 1.6 1.6 4.45547 1.6 8C1.6 11.5445 4.45547 14.4 8 14.4C11.3025 14.4 14.0035 11.9132 14.3578 8.7125C14.3803 8.50847 14.4803 8.32088 14.6372 8.18853C14.7941 8.05618 14.9959 7.9892 15.2008 8.00145C15.4057 8.01369 15.5981 8.10422 15.7381 8.2543C15.8781 8.40439 15.9551 8.60256 15.9531 8.80781C15.9529 8.83444 15.9513 8.86103 15.9484 8.8875C15.5059 12.8852 12.1087 16 8 16C3.59093 16 0 12.4091 0 8C0 3.59093 3.59093 0 8 0C10.2652 0 12.3041 0.956018 13.7594 2.475L15.3172 0.917188C15.4732 0.761187 15.7268 0.761187 15.8828 0.917188ZM4.6 5H6V10.6H4.6V5ZM9.20387 10.8C10.5979 10.8 11.5086 9.95347 11.5058 8.75491C11.5086 7.66811 10.7487 6.89981 9.72907 6.89981C9.148 6.89981 8.67867 7.15684 8.49988 7.50328H8.46635L8.5781 6.24046H11.1482V5H7.30421L7.08072 8.15145L8.44401 8.41965C8.57531 8.14027 8.87422 7.97264 9.20387 7.97264C9.67879 7.97264 10.0112 8.29952 10.0084 8.79961C10.0112 9.29971 9.67879 9.62659 9.20387 9.62659C8.79321 9.62659 8.45518 9.37514 8.44401 8.97842H6.93545C6.94383 10.0457 7.88528 10.8 9.20387 10.8Z"
            />
        </svg>
    );
}