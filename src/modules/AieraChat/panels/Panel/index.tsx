import React, { ComponentType, ReactNode, useCallback, useState } from 'react';
import './styles.css';
import classNames from 'classnames';
import { IconProps } from '@aiera/client-sdk/types';
import { MicroClose } from '@aiera/client-sdk/components/Svg/MicroClose';

type ChildrenProp = ReactNode | ((props: { onStartExit: () => void }) => ReactNode);
const MAX_WIDTH = 480;

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
    children: ChildrenProp;
    onClose: () => void;
    side: 'left' | 'right';
}) {
    const [startExit, setStartExit] = useState(false);
    const [enableGutter, setEnableGutter] = useState(false);

    const handleGutter = useCallback((node: HTMLDivElement) => {
        if (node && node.getBoundingClientRect) {
            const { width } = node.getBoundingClientRect();
            if (width && width <= MAX_WIDTH) {
                setEnableGutter(true);
            }
        }
    }, []);

    const onStartExit = useCallback(() => {
        setStartExit(true);
    }, []);

    const onAnimationEnd = useCallback(() => {
        if (startExit) {
            onClose();
        }
    }, [startExit, onClose]);
    return (
        <div ref={handleGutter} className="fixed inset-0 z-30">
            <div
                className={classNames(
                    'absolute z-20 top-0 bottom-0',
                    'flex flex-col flex-1 animate-forwards',
                    'bg-slate-50 shadow-xl shadow-metal-800/40',
                    {
                        slideOutToLeft: startExit && side === 'left',
                        'left-0 slideInFromLeft': side === 'left',
                        'right-24': side === 'left' && enableGutter,
                        slideOutToRight: startExit && side === 'right',
                        'right-0 slideInFromRight': side === 'right',
                        'left-24': side === 'right' && enableGutter,
                        'max-w-[30rem] w-full': !enableGutter,
                    }
                )}
            >
                <div className="h-[1.875rem] mt-4 text-slate-800 mx-5 text-base flex items-center font-bold antialiased">
                    <Icon className="w-4 mr-1.5" />
                    <p className="flex-1">{title}</p>
                    <div
                        onClick={onStartExit}
                        className="text-slate-400 mt-1 mr-0.5 hover:text-slate-800 cursor-pointer active:scale-110"
                    >
                        <MicroClose className="w-4" />
                    </div>
                </div>
                <div className={className}>{typeof children === 'function' ? children({ onStartExit }) : children}</div>
            </div>
            <div
                onAnimationEnd={onAnimationEnd}
                className={classNames('absolute animate-forwards inset-0 bg-slate-600/20 fadeIn', {
                    fadeOut: startExit,
                })}
                onClick={onStartExit}
            />
        </div>
    );
}
