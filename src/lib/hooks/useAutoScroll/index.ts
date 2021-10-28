import { useLayoutEffect, useRef, useState, RefCallback } from 'react';

/**
 * Implementation of autoscroll that watches a `target` and autoscrolls anything the target
 * changes. Target can be a targetRef that you want to keep in view or it can be simply the
 * length of an array that changes and causes a scroll to the bottom.
 *
 * @param   opts
 * @param   opts.skip              - set to true to skip auto scrolling altogether
 * @param   opts.pauseOnUserScroll - set to true to stop autoscrolling when the user manually scrolls
 * @param   opts.initialBehavior   - see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 * @param   opts.behavior          - see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 * @param   opts.block             - see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 * @param   opts.inline            - see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 *
 * @returns A React ref object that should be set on the scroll container, and another ref that should be
 *          the target to scroll into view.
 */
export function useAutoScroll<E extends HTMLElement = HTMLDivElement, T extends HTMLElement = HTMLDivElement>(opts?: {
    skip?: boolean;
    pauseOnUserScroll?: boolean;
    initialBehavior?: ScrollIntoViewOptions['behavior'];
    behavior?: ScrollIntoViewOptions['behavior'];
    block?: ScrollIntoViewOptions['block'];
    inline?: ScrollIntoViewOptions['inline'];
}): [RefCallback<E>, RefCallback<T>] {
    const {
        skip = false,
        pauseOnUserScroll = true,
        initialBehavior = 'auto',
        behavior = 'smooth',
        block = 'nearest',
        inline = 'nearest',
    } = opts || {};
    const [element, setElement] = useState<E | null>(null);
    const [target, setTarget] = useState<T | null>(null);
    const pauseAutoScroll = useRef<boolean>(false);
    const initialScroll = useRef<boolean>(true);

    useLayoutEffect(() => {
        function checkPosition() {
            if (target && element && !skip && pauseOnUserScroll) {
                const targetPosition = target.getBoundingClientRect();
                const containerPosition = element.getBoundingClientRect();

                // If the target is visible in the viewport, we want to keep autoscrolling,
                // but it not then it means the user manually scrolled away and we don't want
                // to auto scroll on them so we pause until they scroll the target back into view.
                if (targetPosition.top <= containerPosition.top) {
                    pauseAutoScroll.current = containerPosition.top - targetPosition.top > targetPosition.height;
                } else {
                    pauseAutoScroll.current = targetPosition.bottom - containerPosition.bottom > targetPosition.height;
                }
            }
        }

        // Whenever one of the refs changes, check if we should scroll to the current target
        if (!skip && !pauseAutoScroll.current && element) {
            // Dont smooth scroll for now, causes issues in chrome
            target?.scrollIntoView?.({
                behavior: initialScroll.current ? initialBehavior : behavior,
                block,
                inline,
            });
            // If we scrolled, reset initial back so we start smooth scrolling from now on
            initialScroll.current = false;
        }

        if (!target) {
            initialScroll.current = true;
        }

        // Check the position on target changes in addition to onScroll
        checkPosition();

        if (element && pauseOnUserScroll) {
            element.addEventListener('scroll', checkPosition);
        }
        return () => element?.removeEventListener('scroll', checkPosition);
    }, [element, target, skip, pauseOnUserScroll, initialBehavior, behavior, block, inline]);

    return [setElement, setTarget];
}
