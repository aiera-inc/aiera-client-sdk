import { useEffect, useLayoutEffect, useRef, RefObject } from 'react';

/**
 * Very simple implementation of autoscroll based on the length of some array
 * changing. Anytime the length changes, this will autoscroll to the bottom.
 *
 * @param   length - the length of the array of items being rendered in the scroll container
 * @param   skip   - set to true to skip auto scrolling altogether
 *
 * @returns A React ref object that should be set on the scroll container
 */
export function useAutoScroll<T extends HTMLElement>(length: number, skip = false): RefObject<T> {
    const element = useRef<T>(null);
    const isAutoScrolling = useRef<boolean>(false);
    const scrollStopTimer = useRef<number>(0);
    const scrolledManually = useRef<boolean>(false);
    const prevLengthRef = useRef(length);
    const prevLength = prevLengthRef.current;

    function onScroll() {
        if (isAutoScrolling.current) {
            window.clearTimeout(scrollStopTimer.current);
            scrollStopTimer.current = window.setTimeout(() => {
                isAutoScrolling.current = false;
            }, 100);
        } else {
            const scrollTop = element.current?.scrollTop || 0;
            const height = element.current?.clientHeight || 0;
            // If scroll to the bottom, go back to autoscrolling
            scrolledManually.current = scrollTop + height + 5 <= (element.current?.scrollHeight || 0);
        }
    }

    useEffect(() => {
        if (element.current) {
            element.current.addEventListener('scroll', onScroll);
        }
        return () => element.current?.removeEventListener('scroll', onScroll);
    }, [element.current]);

    useLayoutEffect(() => {
        prevLengthRef.current = length;
        if (!skip && !scrolledManually.current && prevLength < length && element.current) {
            isAutoScrolling.current = true;
            element.current.scrollTo({ top: element.current.scrollHeight });
        }
    }, [length, element.current?.scrollHeight, skip]);

    return element;
}
