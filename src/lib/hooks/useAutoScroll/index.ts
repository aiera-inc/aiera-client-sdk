import { useEffect, useLayoutEffect, useRef, RefObject } from 'react';

/**
 * Implementation of autoscroll that watches a `target` and autoscrolls anything the target
 * changes. Target can be a targetRef that you want to keep in view or it can be simply the
 * length of an array that changes and causes a scroll to the bottom.
 *
 * @param   skip   - set to true to skip auto scrolling altogether
 *
 * @returns A React ref object that should be set on the scroll container, and another ref that should be
 *          the target to scroll into view.
 */
export function useAutoScroll<E extends HTMLElement = HTMLDivElement, T extends HTMLElement = HTMLDivElement>(opts?: {
    skip?: boolean;
}): [RefObject<E>, RefObject<T>] {
    const { skip = false } = opts || {};
    const element = useRef<E>(null);
    const target = useRef<T>(null);
    const pauseAutoScroll = useRef<boolean>(false);

    useEffect(() => {
        function onScroll() {
            if (target.current && element.current) {
                const targetPosition = target.current.getBoundingClientRect();
                const containerPosition = element.current.getBoundingClientRect();

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

        if (element.current) {
            element.current.addEventListener('scroll', onScroll);
        }
        return () => element.current?.removeEventListener('scroll', onScroll);
    }, [element.current]);

    useLayoutEffect(() => {
        if (!skip && !pauseAutoScroll.current && element.current) {
            target.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
        }
    }, [target.current, skip]);

    return [element, target];
}
