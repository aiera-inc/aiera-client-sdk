import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType } from 'react';

export function PanelContentRow({
    text,
    onClick,
    onClickIcon,
    Icon,
    iconClassName,
    className,
}: {
    text: string;
    className?: string;
    iconClassName?: string;
    Icon?: ComponentType<IconProps>;
    onClick: () => void;
    onClickIcon: () => void;
}) {
    return (
        <div
            className={classNames(
                'flex hover:bg-slate-200/80 pl-2.5 pr-1.5 mx-5',
                'rounded-lg justify-between items-center py-1 text-slate-600',
                className
            )}
            onClick={onClick}
        >
            <p className="text-base line-clamp-1 hover:text-blue-700 cursor-pointer">{text}</p>
            {Icon && (
                <div
                    className="ml-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onClickIcon();
                    }}
                >
                    <Icon className={classNames('w-4 cursor-pointer', iconClassName)} />
                </div>
            )}
        </div>
    );
}
