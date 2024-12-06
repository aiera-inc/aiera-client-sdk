import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType, ReactNode } from 'react';
import { Hint } from '../Hint';

type HintAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type HintGrow = 'up-left' | 'up-right' | 'down-left' | 'down-right';

const HEIGHT = 30;
const WIDTH = 30;

export function IconButton({
    Icon,
    className,
    children,
    textClass,
    bgClass,
    onClick,
    hintText,
    hintAnchor = 'bottom-left',
    hintGrow = 'down-right',
}: {
    children?: ReactNode;
    hintAnchor?: HintAnchor;
    hintGrow?: HintGrow;
    hintText?: string;
    onClick?: () => void;
    className?: string;
    textClass?: string;
    bgClass?: string;
    Icon: ComponentType<IconProps>;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                height: HEIGHT,
                width: children ? undefined : WIDTH,
            }}
            className={classNames(
                'flex-shrink-0 transition-all',
                'rounded-lg flex items-center justify-center',
                'active:scale-90 relative z-20 hintTarget',
                {
                    'text-slate-600': !textClass,
                    'bg-slate-200/60-solid hover:bg-slate-300/80 active:bg-slate-300/60': !bgClass,
                    'px-1.5': !!children,
                },
                bgClass,
                textClass,
                className
            )}
        >
            {hintText && (
                <Hint targetHeight={HEIGHT} targetWidth={WIDTH} grow={hintGrow} anchor={hintAnchor} text={hintText} />
            )}
            {children && <p className="text-sm font-bold antialiased ml-0.5 mr-0.5">{children}</p>}
            <Icon className="w-4 pointer-events-none" />
        </button>
    );
}
