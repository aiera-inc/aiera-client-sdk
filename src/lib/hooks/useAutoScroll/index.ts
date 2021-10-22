import { useEffect, useLayoutEffect, useRef, useState, RefCallback } from 'react';

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
}): [RefCallback<E>, RefCallback<T>] {
    const { skip = false } = opts || {};
    const [element, setElement] = useState<E | null>(null);
    const [target, setTarget] = useState<T | null>(null);
    const pauseAutoScroll = useRef<boolean>(false);

    useEffect(() => {
        function onScroll() {
            if (target && element) {
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

        if (element) {
            element.addEventListener('scroll', onScroll);
        }
        return () => element?.removeEventListener('scroll', onScroll);
    }, [element, target]);

    useLayoutEffect(() => {
        if (!skip && !pauseAutoScroll.current && element) {
            target?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
        }
    }, [element, target, skip]);

    return [setElement, setTarget];
}
