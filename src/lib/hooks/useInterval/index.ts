import { useEffect, useRef } from 'react';

/**
 * A hook that will run a callback function on a given interval. If the interval
 * changes, the existing callback is cancelled and a new one is setup with the
 * new interval.
 *
 * @param callback - The callback to run.
 * @param interval - The interval to run it on. If null it will cancel any existing
 *                   callback and no longer run.
 */
export function useInterval(callback: () => void, interval: number | null): void {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        // Don't schedule if no delay is specified.
        if (interval === null) {
            return;
        }

        const id = window.setInterval(() => savedCallback.current(), interval);

        return () => window.clearInterval(id);
    }, [interval]);
}
