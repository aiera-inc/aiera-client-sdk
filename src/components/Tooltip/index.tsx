import React, { RefObject, SyntheticEvent, ReactElement, ReactNode, useRef, useState, useCallback } from 'react';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks';
import './styles.css';

/** @notExported */
type ToggleTooltip = (event?: SyntheticEvent) => void;
/** @notExported */
type TooltipRenderProps = (args: { showTooltip: ToggleTooltip; hideTooltip: ToggleTooltip }) => ReactNode;

/** @notExported */
interface TooltipUIProps {
    children: TooltipProps['children'];
    content: TooltipProps['content'];
    targetRef: RefObject<HTMLDivElement>;
    hideTooltip: ToggleTooltip;
    onTargetClick: (event?: SyntheticEvent) => void;
    onTargetMouseEnter: (event?: SyntheticEvent) => void;
    onTargetMouseLeave: (event?: SyntheticEvent) => void;
    showTooltip: ToggleTooltip;
    tooltipRef: RefObject<HTMLDivElement>;
    visible: boolean;
}

export const TooltipUI = (props: TooltipUIProps): ReactElement => {
    const {
        children,
        content,
        hideTooltip,
        onTargetClick,
        onTargetMouseEnter,
        onTargetMouseLeave,
        showTooltip,
        targetRef,
        tooltipRef,
        visible,
    } = props;

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
            </div>
            {visible && <div ref={tooltipRef}>{content}</div>}
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
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

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

interface TooltipState {
    visible: boolean;
}

/**
 * A Tooltip component that will render children and any custom
 * content within the tooltip.
 *
 * Example usage:
 * ```typescript
 * <Tooltip content={<div>Hello World!</div>}>
 *     {({ showTooltip, ref }) => {
 *         return (
 *             <button ref={ref as RefObject<HTMLButtonElement>} onClick={showTooltip}>
 *                 Button
 *             </button>
 *         );
 *     }}
 * </Tooltip>
 * ```
 */
export const Tooltip = (props: TooltipProps): ReactElement => {
    const { children, closeOn = 'hover', content, openOn = 'hover' } = props;

    // Set up visible state and show/hide functions
    const [state, setState] = useState<TooltipState>({ visible: false });
    const showTooltip = useCallback(() => {
        setState((s) => ({ ...s, visible: true }));
    }, [state]);
    const hideTooltip = useCallback(() => {
        setState((s) => ({ ...s, visible: false }));
    }, [state]);

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

    // Set up target handlers
    const onTargetMouseEnter = useCallback(() => {
        if (openOn === 'hover') showTooltip();
    }, [openOn]);
    const onTargetMouseLeave = useCallback(() => {
        if (closeOn === 'hover') hideTooltip();
    }, [closeOn]);
    const onTargetClick = useCallback(() => {
        if (openOn === 'click') showTooltip();
    }, [openOn]);

    return (
        <TooltipUI
            content={content}
            targetRef={targetRef}
            hideTooltip={hideTooltip}
            onTargetClick={onTargetClick}
            onTargetMouseEnter={onTargetMouseEnter}
            onTargetMouseLeave={onTargetMouseLeave}
            showTooltip={showTooltip}
            tooltipRef={tooltipRef}
            visible={state.visible}
        >
            {children}
        </TooltipUI>
    );
};
