import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

type HintAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type HintGrow = 'up-left' | 'up-right' | 'down-left' | 'down-right';

// USAGE INSTRUCTIONS
// Make sure any parent has the className 'hintTarget' for the hint to appear

const PADDING = 8; // Padding from viewport edges

export function Hint({
    text,
    anchor,
    grow,
    targetHeight,
    targetWidth,
    yOffset = 6,
    xOffset = 6,
    maxWidth: maxWidthProp,
}: {
    yOffset?: number;
    xOffset?: number;
    targetHeight: number;
    targetWidth: number;
    text: string;
    anchor: HintAnchor;
    grow: HintGrow;
    maxWidth?: number | string;
}) {
    const hintRef = useRef<HTMLSpanElement>(null);
    const [adjustedAnchor, setAdjustedAnchor] = useState<HintAnchor>(anchor);
    const [adjustedGrow, setAdjustedGrow] = useState<HintGrow>(grow);
    const [dynamicMaxWidth, setDynamicMaxWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        const hint = hintRef.current;
        if (!hint) return;

        const checkPosition = () => {
            const rect = hint.getBoundingClientRect();

            // Skip if hint is not visible (width/height will be 0)
            if (rect.width === 0 || rect.height === 0) return;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newAnchor = anchor;
            let newGrow = grow;
            let constrainedWidth: number | undefined = undefined;

            // Check horizontal bounds
            if (rect.right > viewportWidth - PADDING) {
                // Off right edge - flip anchor to right and grow to left
                // e.g., top-left -> top-right, grow up-right -> up-left
                if (anchor.includes('left')) {
                    newAnchor = anchor.replace('left', 'right') as HintAnchor;
                }
                if (grow.includes('right')) {
                    newGrow = grow.replace('right', 'left') as HintGrow;
                }

                // If still off-screen after flip, constrain width
                const parent = hint.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    if (parentRect.left < PADDING) {
                        constrainedWidth = viewportWidth - PADDING * 2;
                    }
                }
            } else if (rect.left < PADDING) {
                // Off left edge - flip anchor to left and grow to right
                // e.g., top-right -> top-left, grow up-left -> up-right
                if (anchor.includes('right')) {
                    newAnchor = anchor.replace('right', 'left') as HintAnchor;
                }
                if (grow.includes('left')) {
                    newGrow = grow.replace('left', 'right') as HintGrow;
                }

                // If still off-screen after flip, constrain width
                const parent = hint.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    if (parentRect.right > viewportWidth - PADDING) {
                        constrainedWidth = viewportWidth - PADDING * 2;
                    }
                }
            }

            // Check vertical bounds
            if (rect.bottom > viewportHeight - PADDING) {
                // Off bottom edge - flip anchor to top and grow to up
                if (anchor.includes('bottom')) {
                    newAnchor = newAnchor.replace('bottom', 'top') as HintAnchor;
                }
                if (grow.includes('down')) {
                    newGrow = newGrow.replace('down', 'up') as HintGrow;
                }
            } else if (rect.top < PADDING) {
                // Off top edge - flip anchor to bottom and grow to down
                if (anchor.includes('top')) {
                    newAnchor = newAnchor.replace('top', 'bottom') as HintAnchor;
                }
                if (grow.includes('up')) {
                    newGrow = newGrow.replace('up', 'down') as HintGrow;
                }
            }

            setAdjustedAnchor(newAnchor);
            setAdjustedGrow(newGrow);
            setDynamicMaxWidth(constrainedWidth);
        };

        // Use MutationObserver to detect when hint becomes visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkPosition();
                }
            });
        });

        // Observe the parent for class changes (when hintTarget gets :hover)
        const parent = hint.parentElement;
        if (parent) {
            observer.observe(parent, { attributes: true, attributeFilter: ['class'] });
        }

        // Also check on hover
        const handleMouseEnter = () => {
            // Small delay to ensure display:flex has been applied
            setTimeout(checkPosition, 0);
        };

        const handleMouseLeave = () => {
            setAdjustedAnchor(anchor);
            setAdjustedGrow(grow);
            setDynamicMaxWidth(undefined);
        };

        parent?.addEventListener('mouseenter', handleMouseEnter);
        parent?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            observer.disconnect();
            parent?.removeEventListener('mouseenter', handleMouseEnter);
            parent?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [anchor, grow]);

    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;
    let left: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (adjustedAnchor.includes('bottom')) {
        top = targetHeight + yOffset;
    }

    if (adjustedAnchor.includes('top')) {
        bottom = targetHeight + yOffset;
    }

    if (adjustedAnchor.includes('left') && adjustedGrow.includes('right')) {
        left = 0;
    }

    if (adjustedAnchor.includes('left') && adjustedGrow.includes('left')) {
        right = targetWidth + xOffset;
    }

    if (adjustedAnchor.includes('right') && adjustedGrow.includes('left')) {
        right = 0;
    }

    if (adjustedAnchor.includes('right') && adjustedGrow.includes('right')) {
        left = targetWidth + xOffset;
    }

    // Use prop maxWidth if provided, otherwise use dynamically calculated one
    const effectiveMaxWidth = maxWidthProp ?? dynamicMaxWidth;

    return (
        <span
            ref={hintRef}
            style={{
                top,
                bottom,
                left: dynamicMaxWidth !== undefined && left === undefined ? PADDING : left,
                right: dynamicMaxWidth !== undefined && right === undefined ? PADDING : right,
                maxWidth: effectiveMaxWidth,
                width: effectiveMaxWidth ? 'max-content' : undefined,
            }}
            className={classNames(
                'absolute bg-slate-900/90 text-white rounded-md z-50',
                'text-sm font-semibold antialiased px-2 py-0.5 hint hidden',
                effectiveMaxWidth ? 'whitespace-normal' : 'whitespace-nowrap'
            )}
        >
            {text}
        </span>
    );
}
