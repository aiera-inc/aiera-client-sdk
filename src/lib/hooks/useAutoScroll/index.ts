import { useLayoutEffect, useRef, RefObject } from 'react';

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
    const prevLengthRef = useRef(length);
    const prevLength = prevLengthRef.current;
    useLayoutEffect(() => {
        prevLengthRef.current = length;
        if (!skip && prevLength < length && element.current) {
            element.current.scrollTo({ top: element.current.scrollHeight, behavior: 'smooth' });
        }
    }, [length, element.current?.scrollHeight, skip]);

    return element;
}
