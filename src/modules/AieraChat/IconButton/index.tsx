import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType, useState } from 'react';

type HintAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type HintGrow = 'up-left' | 'up-right' | 'down-left' | 'down-right';

const HEIGHT = 30;
const WIDTH = 30;

function Hint({ text, anchor, grow }: { text: string; anchor: HintAnchor; grow: HintGrow }) {
    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;
    let left: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (anchor.includes('bottom')) {
        top = HEIGHT + 6;
    }

    if (anchor.includes('top')) {
        bottom = HEIGHT + 6;
    }

    if (anchor.includes('left') && grow.includes('right')) {
        left = 0;
    }

    if (anchor.includes('left') && grow.includes('left')) {
        right = WIDTH + 6;
    }

    if (anchor.includes('right') && grow.includes('left')) {
        right = 0;
    }

    if (anchor.includes('right') && grow.includes('right')) {
        left = WIDTH + 6;
    }

    return (
        <div
            style={{
                top,
                bottom,
                left,
                right,
            }}
            className={classNames(
                'absolute bg-slate-900/90 text-white rounded-md z-50',
                'text-sm font-semibold antialiased px-2 py-0.5 text-nowrap'
            )}
        >
            {text}
        </div>
    );
}

export function IconButton({
    Icon,
    className,
    textClass,
    bgClass,
    onClick,
    hintText,
    hintAnchor = 'bottom-left',
    hintGrow = 'down-right',
}: {
    hintAnchor?: HintAnchor;
    hintGrow?: HintGrow;
    hintText?: string;
    onClick?: () => void;
    className?: string;
    textClass?: string;
    bgClass?: string;
    Icon: ComponentType<IconProps>;
}) {
    const [showHint, setShowHint] = useState(false);
    return (
        <button
            onMouseEnter={() => setShowHint(true)}
            onMouseOver={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            onMouseOut={() => setShowHint(false)}
            onClick={onClick}
            style={{
                height: HEIGHT,
                width: WIDTH,
            }}
            className={classNames(
                'flex-shrink-0 transition-all',
                'rounded-lg flex items-center justify-center',
                'active:scale-90 relative z-20',
                {
                    'text-slate-600': !textClass,
                    'bg-slate-200/60-solid hover:bg-slate-300/80 active:bg-slate-300/60': !bgClass,
                },
                bgClass,
                textClass,
                className
            )}
        >
            {hintText && showHint && <Hint grow={hintGrow} anchor={hintAnchor} text={hintText} />}
            <Icon className="w-4 pointer-events-none" />
        </button>
    );
}
