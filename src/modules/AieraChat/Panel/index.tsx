import React, { ComponentType, ReactNode, useCallback, useState } from 'react';
import './styles.css';
import classNames from 'classnames';
import { IconProps } from '@aiera/client-sdk/types';
import { MicroClose } from '@aiera/client-sdk/components/Svg/MicroClose';

export function Panel({
    onClose,
    side = 'left',
    children,
    title,
    Icon,
    className,
}: {
    className?: string;
    Icon: ComponentType<IconProps>;
    title: string;
    children: ReactNode;
    onClose: () => void;
    side: 'left' | 'right';
}) {
    const [startExit, setStartExit] = useState(false);
    const onStartExit = useCallback(() => {
        setStartExit(true);
    }, []);

    const onAnimationEnd = useCallback(() => {
        if (startExit) {
            onClose();
        }
    }, [startExit, onClose]);
    return (
        <div className="fixed inset-0 z-30">
            <div
                className={classNames('absolute z-20 top-0 bottom-0', 'bg-slate-50 shadow-xl shadow-metal-800/40', {
                    slideOutToLeft: startExit && side === 'left',
                    'left-0 right-24 slideInFromLeft': side === 'left',
                    slideOutToRight: startExit && side === 'right',
                    'left-24 right-0 slideInFromRight': side === 'right',
                })}
            >
                <div className="h-[1.875rem] mt-4 text-slate-800 mx-5 text-base flex items-center font-bold antialiased">
                    <Icon className="w-4 mr-1.5" />
                    <p className="flex-1">{title}</p>
                    <div
                        onClick={onClose}
                        className="text-slate-400 mt-1 mr-0.5 hover:text-slate-800 cursor-pointer active:scale-110"
                    >
                        <MicroClose className="w-4" />
                    </div>
                </div>
                <div className={className}>{children}</div>
            </div>
            <div
                onAnimationEnd={onAnimationEnd}
                className={classNames('absolute inset-0 bg-slate-600/20 fadeIn', {
                    fadeOut: startExit,
                })}
                onClick={onStartExit}
            />
        </div>
    );
}
