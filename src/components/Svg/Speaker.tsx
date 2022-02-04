import React, { ReactElement } from 'react';
import classNames from 'classnames';

export function Speaker({ className, alt = 'Speaker' }: { className?: string; alt?: string }): ReactElement {
    return (
        <svg
            className={classNames(className, 'fill-current', 'Svg', 'Svg__speaker')}
            width="100%"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{alt}</title>
            <path d="M9.29833 0C9.12627 0 8.95097 0.0568191 8.80792 0.180887L4.00147 4.37884H2.00073C0.895329 4.37884 0 5.16082 0 6.12628V7.87372C0 8.83918 0.895329 9.62116 2.00073 9.62116H4.00147L8.80792 13.8191C8.95097 13.9441 9.12627 14 9.29833 14C9.65847 14 10.0037 13.7561 10.0037 13.3874V0.612628C10.0037 0.243918 9.65847 0 9.29833 0ZM12.1158 4.2645C11.9168 4.26455 11.7223 4.31643 11.5572 4.41351C11.3922 4.5106 11.264 4.64847 11.1891 4.8095C11.1142 4.97054 11.096 5.14743 11.1368 5.31754C11.1777 5.48766 11.2756 5.64328 11.4183 5.76451C12.2086 6.45482 12.2086 7.54518 11.4183 8.23549C11.3252 8.31661 11.2514 8.41294 11.2009 8.51899C11.1505 8.62503 11.1245 8.73872 11.1244 8.85354C11.1243 8.96837 11.1501 9.08208 11.2003 9.1882C11.2505 9.29432 11.3242 9.39076 11.4171 9.47201C11.51 9.55326 11.6203 9.61773 11.7417 9.66173C11.8632 9.70574 11.9933 9.72843 12.1248 9.72849C12.2563 9.72855 12.3865 9.706 12.5079 9.66211C12.6294 9.61822 12.7398 9.55386 12.8328 9.4727C14.3873 8.11501 14.3873 5.88669 12.8328 4.52901C12.7396 4.44531 12.6281 4.37878 12.505 4.33335C12.3818 4.28792 12.2495 4.26451 12.1158 4.2645Z" />
        </svg>
    );
}