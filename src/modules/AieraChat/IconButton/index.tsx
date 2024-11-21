import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType } from 'react';

export function IconButton({
    Icon,
    className,
    textClass,
    bgClass,
    onClick,
}: {
    onClick?: () => void;
    className?: string;
    textClass?: string;
    bgClass?: string;
    Icon: ComponentType<IconProps>;
}) {
    return (
        <button
            onClick={onClick}
            className={classNames(
                'h-[1.875rem] w-[1.875rem] flex-shrink-0 transition-all',
                'rounded-lg flex items-center justify-center',
                'active:scale-90',
                {
                    'text-slate-600': !textClass,
                    'bg-slate-200/60-solid hover:bg-slate-300/80 active:bg-slate-300/60': !bgClass,
                },
                bgClass,
                textClass,
                className
            )}
        >
            <Icon className="w-4 pointer-events-none" />
        </button>
    );
}
