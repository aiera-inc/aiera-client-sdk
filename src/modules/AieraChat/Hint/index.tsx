import classNames from 'classnames';
import React from 'react';
import './styles.css';

type HintAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type HintGrow = 'up-left' | 'up-right' | 'down-left' | 'down-right';

// USAGE INSTRUCTIONS
// Make sure any parent has the className 'hintTarget' for the hint to appear

export function Hint({
    text,
    anchor,
    grow,
    targetHeight,
    targetWidth,
    yOffset = 6,
    xOffset = 6,
}: {
    yOffset?: number;
    xOffset?: number;
    targetHeight: number;
    targetWidth: number;
    text: string;
    anchor: HintAnchor;
    grow: HintGrow;
}) {
    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;
    let left: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (anchor.includes('bottom')) {
        top = targetHeight + yOffset;
    }

    if (anchor.includes('top')) {
        bottom = targetHeight + yOffset;
    }

    if (anchor.includes('left') && grow.includes('right')) {
        left = 0;
    }

    if (anchor.includes('left') && grow.includes('left')) {
        right = targetWidth + xOffset;
    }

    if (anchor.includes('right') && grow.includes('left')) {
        right = 0;
    }

    if (anchor.includes('right') && grow.includes('right')) {
        left = targetWidth + xOffset;
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
                'text-sm font-semibold antialiased px-2 py-0.5 text-nowrap hint hidden'
            )}
        >
            {text}
        </div>
    );
}
