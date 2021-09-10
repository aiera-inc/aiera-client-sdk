import React, { RefObject, MouseEvent, ReactElement, ReactNode, useRef, useState, useCallback } from 'react';
import { match } from 'ts-pattern';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks';
import './styles.css';

/** @notExported */
type TooltipRenderProps = (args: {
    showTooltip: (event?: MouseEvent) => void;
    hideTooltip: (event?: MouseEvent) => void;
}) => ReactNode;

/** @notExported */
interface TooltipUIProps {
    children: TooltipProps['children'];
    content: TooltipProps['content'];
    targetRef: RefObject<HTMLDivElement>;
    hideTooltip: (event?: MouseEvent) => void;
    onTargetClick: (event?: MouseEvent) => void;
    onTargetMouseEnter: (event?: MouseEvent) => void;
    onTargetMouseLeave: (event?: MouseEvent) => void;
    position?: Position;
    showTooltip: (event?: MouseEvent) => void;
    tooltipRef: RefObject<HTMLDivElement>;
    visible: boolean;
}

const TooltipUI = (props: TooltipUIProps): ReactElement => {
    const {
        children,
        content,
        hideTooltip,
        onTargetClick,
        onTargetMouseEnter,
        onTargetMouseLeave,
        position,
        showTooltip,
        targetRef,
        tooltipRef,
        visible,
    } = props;

    const { top, left, bottom, right } = position || {};
    let target = children;
    if (typeof target === 'function') {
        const render = children as TooltipRenderProps;
        target = render({ hideTooltip, showTooltip });
    }
    return (
        <>
            <div
                onClick={onTargetClick}
                onMouseEnter={onTargetMouseEnter}
                onMouseLeave={onTargetMouseLeave}
                ref={targetRef}
            >
                {target}
                {visible && (
                    <div className="fixed" style={{ top, left, bottom, right }} ref={tooltipRef}>
                        {content}
                    </div>
                )}
            </div>
        </>
    );
};

/**
 *
 * ####  Tooltip terms
 *
 * - **target**         - Refers to the tooltip target, the element that is hovered, clicked, etc. to
 *                        trigger the tooltip to show.
 * - **content**        - Refers to the content inside the tooltip itself.
 * - **anchor**         - Currently refers to the tooltip target, but may be extended to eventually
 *                        allow explicitly passing an anchor element that will be used by `position`
 * - **anchorPoint**    - The corner of the tooltip content that will be used to anchor the tooltip.
 *                        If the tooltip content should go down and right (the default), the anchor
 *                        point will be the top left corner of the tooltip content.
 *                        If the tooltip content should grow up instead of down, the anchor point
 *                        would be the tooltip content's bottom left corner instead.
 */
export interface TooltipProps {
    /**
     * Stops all interactions with content in the background/under the tooltip. The tooltip
     * must first be closed before being able to interact with other elements again.
     */
    blockBackground?: boolean;

    /**
     * The tooltip target
     */
    children: TooltipRenderProps | ReactNode;

    /**
     * Determines whether the component will automatically manage
     * closing the tooltip.
     *
     * - **hover** - Will automatically add an onMouseLeave handler to the the tooltip
     *               target to hide the tooltip when the mouse leaves the target and content.
     * - **click** - Will automatically add a click handler to the tooltip target to hide
     *               the tooltip on click outside of target or content.
     * - **null**  - Will not set up any hide behavior automatically, use the `hideTooltip`
     *               render arg to control this behavior.
     */
    closeOn?: 'hover' | 'click' | null;

    /**
     * The tooltip content
     */
    content: ReactNode;

    /**
     * Delay showing the tooltip for [delay] millisenconds.
     * Only used for `auto="click"` and `auto="hover"` modes.
     */
    delay?: number;

    /**
     * Force the tooltip content to match the width of the target element.
     *
     * This is useful for dropdowns/autocompletes where you want the tooltip
     * content to automatically just match the input width.
     */
    matchWidth?: boolean;

    /**
     * Which direction the tooltip content should grow.
     *
     * - **down-right**     - [default] The tooltip content grows down and to the right as
     *                        as content is added. This will set the `anchorPoint` to the
     *                        top left corner of the tooltip content.
     * - **down-left**      - The tooltip content grows down and to the left as as content
     *                        is added. This will set the `anchorPoint` to the top right corner
     *                        of the tooltip content.
     * - **up-right**       - The tooltip content grows upt and to the right as
     *                        as content is added. This will set the `anchorPoint` to the
     *                        bottom left corner of the tooltip content.
     * - **up-left**        - The tooltip content grows up and to the left as as content
     *                        is added. This will set the `anchorPoint` to the bottom right
     *                        corner of the tooltip content.
     */
    grow?: 'down-right' | 'down-left' | 'up-right' | 'up-left';

    /**
     * Determines whether the component will automatically manage
     * opening the tooltip.
     *
     * - **hover** - Will automatically add an onMouseEnter handler to the the tooltip
     *               target to show the tooltip on hover.
     * - **click** - Will automatically add a click handler to the tooltip target to show
     *               the tooltip on click.
     * - **null**  - Will not set up any show behavior automatically, use the `showTooltip`
     *               render arg to control this behavior.
     */
    openOn?: 'hover' | 'click' | null;

    /**
     * Determines the tooltip content position. If a position is set, the tooltip content's
     * top left corner will be positioned at the specified anchor. Use `xOffset`/`yOffset`
     * to control position from there.
     *
     * - **null**             - Will use the client X and Y offset from the event that triggered
     *                          the tooltip to show. In most cases this will be the mouse position
     *                          when it hovers over or clicks on an element.
     *
     * - **top-left**         - The tooltip content's `anchorPoint` will be placed at the target's
     *                          top left corner.
     *
     * - **top-right**        - The tooltip content's `anchorPoint` will be placed at the target's
     *                          top right corner.
     *
     * - **bottom-left**      - The tooltip content's `anchorPoint` will be placed at the target's
     *                          bottom left corner.
     *
     * - **bottom-right**     - The tooltip content's `anchorPoint` will be placed at the target's
     *                          bottom right corner.
     *
     *
     */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

    /**
     * After determining the base position of the tooltip content using `anchor`,
     * this value will be added to the x position.
     */
    xOffset?: number;

    /**
     * After determining the base position of the tooltip content using `anchor`,
     * this value will be added to the y position.
     */
    yOffset?: number;
}

interface Position {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
}

interface AnchorPoint {
    x: number;
    y: number;
}

interface AnchorType {
    y: 'top' | 'bottom';
    x: 'left' | 'right';
}

/**
 * Calculate tooltip position based on position/grow options as well
 * as anchor or mouse event position.
 */
function getTooltipPosition(
    position: TooltipProps['position'],
    grow: TooltipProps['grow'] = 'down-right',
    xOffset = 0,
    yOffset = 0,
    event?: MouseEvent,
    anchor?: HTMLElement | null
): Position {
    // Figure out the anchor point based on how the tooltip will grow.
    // This decides *how* we position the tooltip, based on top/bottom/left/right
    //
    // Whenever we are growing `up`, we want to anchor using `bottom` positioning,
    // otherwise we use `top`.
    //
    // Whenever we are growing `left`, we want to anchor using `right` positioning,
    // otherwise we use `left`.
    const anchorType = match<typeof grow, AnchorType>(grow)
        .with('down-right', () => ({
            y: 'top',
            x: 'left',
        }))
        .with('up-right', () => ({
            y: 'bottom',
            x: 'left',
        }))
        .with('down-left', () => ({
            y: 'top',
            x: 'right',
        }))
        .with('up-left', () => ({
            y: 'bottom',
            x: 'right',
        }))
        .exhaustive();

    // Get the appropriate x/y offset based on the anchor element (if position is set) or
    // the mouse event.
    //
    // If using bottom/right position, we need to use the window height/width since the
    // position of the anchor/event are all based on the top/left of the window.
    let anchorPoint: AnchorPoint;
    if (anchor && position) {
        const rect = anchor.getBoundingClientRect();
        anchorPoint = match(position)
            .with('top-left', () => ({
                y: anchorType.y === 'top' ? rect.top : window.innerHeight - rect.top,
                x: anchorType.x === 'left' ? rect.left : window.innerWidth - rect.left,
            }))
            .with('bottom-left', () => ({
                y: anchorType.y === 'top' ? rect.bottom : window.innerHeight - rect.bottom,
                x: anchorType.x === 'left' ? rect.left : window.innerWidth - rect.left,
            }))
            .with('top-right', () => ({
                y: anchorType.y === 'top' ? rect.top : window.innerHeight - rect.top,
                x: anchorType.x === 'left' ? rect.right : window.innerWidth - rect.right,
            }))
            .with('bottom-right', () => ({
                y: anchorType.y === 'top' ? rect.bottom : window.innerHeight - rect.bottom,
                x: anchorType.x === 'left' ? rect.right : window.innerWidth - rect.right,
            }))
            .exhaustive();
    } else {
        const y = event?.clientY || 0;
        const x = event?.clientX || 0;
        anchorPoint = {
            y: anchorType.y === 'top' ? y : window.innerHeight - y,
            x: anchorType.x === 'left' ? x : window.innerWidth - x,
        };
    }

    return {
        [anchorType.x]: anchorPoint.x + xOffset,
        [anchorType.y]: anchorPoint.y + yOffset,
    };
}

interface TooltipState {
    position?: Position;
    visible: boolean;
}

/**
 * ### A versatile tooltip component
 * See {@link TooltipProps} for more documentation on how to control the Tooltip
 *
 * @example
 *
 * Example usage:
 * ```typescript
 * <Tooltip content={<div>Hello World!</div>}>
 *     <button openOn="click">
 *         Button
 *     </button>
 * </Tooltip>
 * ```
 */
export function Tooltip(props: TooltipProps): ReactElement {
    const { children, content, grow = 'down-right', openOn = 'hover', position, xOffset = 0, yOffset = 0 } = props;

    // If no closeOn is provided, default to the same type as openOn
    let { closeOn } = props;
    if (closeOn === undefined) {
        closeOn = openOn;
    }

    // Set up a ref for the tooltip target and the content
    // so that we can track when click/hover events happen
    // inside or outside the tooltip elements.
    const tooltipRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    // Setup an outside clickhandler to handle clicks
    // outside the tooltip target or content
    useOutsideClickHandler(
        [tooltipRef, targetRef],
        useCallback(() => {
            if (closeOn && ['hover', 'click'].includes(closeOn)) {
                hideTooltip();
            }
        }, [closeOn])
    );

    // Set up visible state and show/hide functions
    const [state, setState] = useState<TooltipState>({ visible: false });
    const showTooltip = useCallback(
        (event?: MouseEvent) => {
            setState((s) => ({
                ...s,
                position: getTooltipPosition(position, grow, xOffset, yOffset, event, targetRef?.current),
                visible: true,
            }));
        },
        [state, position, grow, targetRef, xOffset, yOffset]
    );
    const hideTooltip = useCallback(() => {
        setState((s) => ({ ...s, visible: false }));
    }, [state]);

    // Set up target handlers
    const onTargetMouseEnter = useCallback(
        (event?: MouseEvent) => {
            if (openOn === 'hover') showTooltip(event);
        },
        [openOn]
    );
    const onTargetMouseLeave = useCallback(() => {
        if (closeOn === 'hover') hideTooltip();
    }, [closeOn]);
    const onTargetClick = useCallback(
        (event?: MouseEvent) => {
            if (openOn === 'click') showTooltip(event);
        },
        [openOn]
    );

    return (
        <TooltipUI
            content={content}
            targetRef={targetRef}
            hideTooltip={hideTooltip}
            onTargetClick={onTargetClick}
            onTargetMouseEnter={onTargetMouseEnter}
            onTargetMouseLeave={onTargetMouseLeave}
            position={state.position}
            showTooltip={showTooltip}
            tooltipRef={tooltipRef}
            visible={state.visible}
        >
            {children}
        </TooltipUI>
    );
}
