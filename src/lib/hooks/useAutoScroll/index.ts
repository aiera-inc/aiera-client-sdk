import { useLayoutEffect, useCallback, useRef, useState, RefCallback, RefObject } from 'react';

function isVisible(container: HTMLElement, target: HTMLElement) {
    const targetPosition = target.getBoundingClientRect();
    const containerPosition = container.getBoundingClientRect();

    if (targetPosition.top <= containerPosition.top) {
        return containerPosition.top - targetPosition.top < targetPosition.height;
    } else {
        return targetPosition.bottom - containerPosition.bottom < targetPosition.height;
    }
}

async function scrollIntoView(
    scrollContainer: HTMLElement,
    target: HTMLElement,
    opts: ScrollIntoViewOptions,
    delay = 200
): Promise<void> {
    let resetTimer: (() => void) | null = null;

    const promise = new Promise<void>((resolve) => {
        let timer: number;
        resetTimer = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(resolve, delay);
        };
        scrollContainer.addEventListener('scroll', resetTimer);
        resetTimer();
        target.scrollIntoView?.(opts);
    });

    if (resetTimer) {
        scrollContainer.removeEventListener('scroll', resetTimer);
    }

    return promise;
}

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
    track?: boolean;
    log?: boolean;
}): {
    scrollContainerRef: RefCallback<E>;
    targetRef: RefCallback<T>;
    scroll: (opts?: { top?: number; onlyIfNeeded?: boolean }) => void;
    isAutoScrolling: RefObject<Promise<void> | null>;
} {
    const {
        skip = false,
        pauseOnUserScroll = true,
        initialBehavior = 'auto',
        behavior = 'smooth',
        block,
        inline,
    } = opts || {};
    const [scrollContainer, scrollContainerRef] = useState<E | null>(null);
    const [target, targetRef] = useState<T | null>(null);
    const isAutoScrolling = useRef<Promise<void> | null>(null);
    const pauseAutoScroll = useRef<boolean>(false);
    const initialScroll = useRef<boolean>(true);

    useLayoutEffect(() => {
        function onScroll() {
            maybePauseAutoScroll();
        }

        function maybePauseAutoScroll() {
            if (target && scrollContainer && !isAutoScrolling.current && !skip && pauseOnUserScroll) {
                // If the target is visible in the viewport, we want to keep autoscrolling,
                // but it not then it means the user manually scrolled away and we don't want
                // to auto scroll on them so we pause until they scroll the target back into view.
                pauseAutoScroll.current = !isVisible(scrollContainer, target);
            }
        }

        // Whenever one of the refs changes, check if we should scroll to the current target

        if (!skip && !pauseAutoScroll.current && scrollContainer && target) {
            void (async function () {
                isAutoScrolling.current = scrollIntoView(
                    scrollContainer,
                    target,
                    {
                        behavior: initialScroll.current ? initialBehavior : behavior,
                        block,
                        inline,
                    },
                    200
                );
                await isAutoScrolling.current;
                isAutoScrolling.current = null;
            })();

            // If we scrolled, reset initial back so we start smooth scrolling from now on
            initialScroll.current = false;
        }

        if (!target) {
            initialScroll.current = true;
        }

        // Check the position on target changes in addition to onScroll
        maybePauseAutoScroll();

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', onScroll);
        }
        return () => scrollContainer?.removeEventListener('scroll', onScroll);
    }, [scrollContainer, target, skip, pauseOnUserScroll, initialBehavior, behavior, block, inline]);

    const scroll = useCallback(
        (opts?: { top?: number; onlyIfNeeded?: boolean }) => {
            const { top, onlyIfNeeded = false } = opts || {};
            if (top === undefined) {
                if (!onlyIfNeeded || (scrollContainer && target && !isVisible(scrollContainer, target))) {
                    target?.scrollIntoView({
                        behavior: initialScroll.current ? initialBehavior : behavior,
                        block,
                        inline,
                    });
                }
            } else {
                scrollContainer?.scrollTo({ top });
            }
        },
        [scrollContainer, target, initialBehavior, behavior, block, inline]
    );

    return { scrollContainerRef, targetRef, scroll, isAutoScrolling };
}
