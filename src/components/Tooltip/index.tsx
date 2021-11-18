import React, { RefObject, MouseEvent, ReactElement, ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { match } from 'ts-pattern';
import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { useDelayCallback } from '@aiera/client-sdk/lib/hooks/useDelayCallback';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks/useOutsideClickHandler';
import './styles.css';

/** @notExported */
type TooltipRenderProps = (args: {
    showTooltip: (event?: MouseEvent) => void;
    hideTooltip: (event?: MouseEvent) => void;
}) => ReactNode;

/** @notExported */
interface TooltipUIProps {
    children: TooltipProps['children'];
    className?: string;
    content: TooltipProps['content'];
    targetRef: RefObject<HTMLDivElement>;
    hideTooltip: (event?: MouseEvent) => void;
    modal: boolean;
    onTargetClick: (event?: MouseEvent) => void;
    onTargetMouseEnter: (event?: MouseEvent) => void;
    onTargetMouseLeave: (event?: MouseEvent) => void;
    position?: Position;
    showTooltip: (event?: MouseEvent) => void;
    tooltipRef: RefObject<HTMLDivElement>;
    visible: boolean;
}

function TooltipUI(props: TooltipUIProps): ReactElement {
    const {
        children,
        className = '',
        content,
        hideTooltip,
        modal,
        onTargetClick,
        onTargetMouseEnter,
        onTargetMouseLeave,
        position,
        showTooltip,
        targetRef,
        tooltipRef,
        visible,
    } = props;

    const { top, left, bottom, right, width } = position || {};
    let target = children;
    if (typeof target === 'function') {
        const render = children as TooltipRenderProps;
        target = render({ hideTooltip, showTooltip });
    }
    return (
        <>
            {modal && visible && (
                <div className="fixed z-20 top-0 left-0 right-0 bottom-0 bg-gray-900 opacity-10 dark:opacity-60 tooltip__modal" />
            )}
            <div
                className={`tooltip ${className}`}
                onClick={onTargetClick}
                onMouseEnter={onTargetMouseEnter}
                onMouseLeave={onTargetMouseLeave}
                ref={targetRef}
            >
                {target}
            </div>
            {visible && (
                <div
                    className="fixed z-30 tooltip__content"
                    style={{ top, left, bottom, right, width }}
                    ref={tooltipRef}
                >
                    {typeof content === 'function' ? content({ hideTooltip, showTooltip }) : content}
                </div>
            )}
        </>
    );
}

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
     * styles for element wrapping the children
     */
    className?: string;

    /**
     * Delay hiding the tooltip for [delay] millisenconds.
     */
    closeDelay?: number;

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
    content: ReactNode | TooltipRenderProps;

    /**
     * Force the tooltip content to match the width of the target element.
     *
     * This is useful for dropdowns/autocompletes where you want the tooltip
     * content to automatically just match the input width.
     */
    matchWidth?: boolean;

    /**
     * Block all elements behind the tooltip so they can't be interacted with
     */
    modal?: boolean;

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
     * Hide tooltip when the document scrolls
     */
    hideOnDocumentScroll?: boolean;

    /**
     * Callback after tooltip closes
     */
    onClose?: () => void;

    /**
     * Callback after tooltip opens
     */
    onOpen?: () => void;

    /**
     * Delay showing the tooltip for [delay] millisenconds.
     */
    openDelay?: number;

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
    width?: number;
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
function getTooltipPosition({
    anchor,
    event,
    grow = 'down-right',
    matchWidth = false,
    position,
    xOffset = 0,
    yOffset = 0,
}: {
    anchor?: HTMLElement | null;
    event?: MouseEvent;
    grow?: TooltipProps['grow'];
    matchWidth?: boolean;
    position: TooltipProps['position'];
    xOffset?: number;
    yOffset?: number;
}): Position {
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
    let width: number | undefined;
    if (anchor && position) {
        const rect = anchor.getBoundingClientRect();
        if (matchWidth) {
            width = rect.width;
        }
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
        width,
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
    const {
        children,
        className,
        closeDelay = 0,
        content,
        grow = 'down-right',
        hideOnDocumentScroll = false,
        matchWidth,
        modal = false,
        onClose,
        onOpen,
        openDelay = 0,
        openOn = 'hover',
        position,
        xOffset = 0,
        yOffset = 0,
    } = props;

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

    // Set up visible state and show/hide functions that can be delayed
    const [state, setState] = useState<TooltipState>({ visible: false });
    const [delayedShowTooltip, cancelShow] = useDelayCallback(
        (position: Position) => {
            setState((s) => ({ ...s, position, visible: true }));
            if (onOpen) onOpen();
        },
        openDelay,
        [onOpen]
    );
    const [delayedHideTooltip, cancelHide] = useDelayCallback(
        () => {
            setState((s) => ({ ...s, visible: false }));
            if (onClose) onClose();
        },
        closeDelay,
        [onClose]
    );

    // The actual show/hide callbacks
    const showTooltip = useCallback(
        (event?: MouseEvent) => {
            if (
                !event ||
                (event.type === 'mouseenter' && openOn === 'hover') ||
                (event.type === 'click' && openOn === 'click')
            ) {
                cancelHide();
                delayedShowTooltip(
                    getTooltipPosition({
                        anchor: targetRef?.current,
                        event,
                        grow,
                        matchWidth,
                        position,
                        xOffset,
                        yOffset,
                    })
                );
            }
        },
        [cancelHide, delayedShowTooltip, openOn, matchWidth, position, grow, targetRef?.current, xOffset, yOffset]
    );

    const hideTooltip = useCallback(
        (event?: MouseEvent) => {
            if (
                !event ||
                (event.type === 'mouseleave' && closeOn === 'hover') ||
                (event.type === 'click' && closeOn === 'click')
            ) {
                cancelShow();
                delayedHideTooltip();
            }
        },
        [cancelShow, delayedHideTooltip, closeOn]
    );

    // Setup an outside clickhandler to handle clicks
    // outside the tooltip target or content
    useOutsideClickHandler(
        [tooltipRef, targetRef],
        useCallback(() => {
            if (closeOn && ['hover', 'click'].includes(closeOn)) {
                hideTooltip();
            }
        }, [closeOn, hideTooltip])
    );

    // Hide tooltip on document scrolling
    useEffect(() => {
        if (hideOnDocumentScroll) {
            document.addEventListener('scroll', delayedHideTooltip, true);
        }

        return () => document.removeEventListener('scroll', delayedHideTooltip, true);
    }, [delayedHideTooltip, hideOnDocumentScroll]);

    // Hide tooltip on escape
    useWindowListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideTooltip();
        }
    });

    return (
        <TooltipUI
            className={className}
            content={content}
            targetRef={targetRef}
            hideTooltip={hideTooltip}
            modal={modal}
            onTargetClick={showTooltip}
            onTargetMouseEnter={showTooltip}
            onTargetMouseLeave={hideTooltip}
            position={state.position}
            showTooltip={showTooltip}
            tooltipRef={tooltipRef}
            visible={state.visible}
        >
            {children}
        </TooltipUI>
    );
}
