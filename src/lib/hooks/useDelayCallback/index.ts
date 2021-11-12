import { useCallback, useEffect, useRef, DependencyList } from 'react';

/**
 * Similar to `useCallback` but adds a delay so that the callback fires
 * only after `delay` milliseconds.
 *
 * @param callback - Same as `useCallback`
 * @param deps     - Same as `useCallback`
 * @param delay    - How long to delay calling `callback` in milliseconds
 * @param existing - Whether or not to cancel the existing callback or preserve it
 *                   If set to `cancel`, any existing callback will be cancelled and
 *                   the timer will reset, delaying the total time before it executes.
 *                   If set to `preserve`, the existing callback is kept and the new
 *                   call is ignored.
 * @returns        - [callbackFn, cancelFn]
 *                   callbackFn - The function/handler to invoke which is now wrapped
 *                                in setTimeout
 *                   cancelFn   - A function that can be used to manually cancel the timer
 *
 */
// Forced to use any here since it's a true pass through
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDelayCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay = 0,
    deps: DependencyList | undefined = undefined,
    // Could add a 'keep' option here too if needed
    existing: 'prefer' | 'cancel' = 'cancel'
): [callback: T, cancelFn: () => void] {
    const ref = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (ref.current) {
                window.clearTimeout(ref.current);
            }
        };
    }, []);

    const cancel = useCallback(() => {
        if (ref.current) {
            window.clearTimeout(ref.current);
            ref.current = null;
        }
    }, []);

    return [
        useCallback(
            ((...args: Parameters<T>) => {
                if (ref.current && existing === 'cancel') {
                    window.clearTimeout(ref.current);
                    ref.current = null;
                }
                if (!ref.current) ref.current = window.setTimeout(() => callback(...args), delay);
            }) as T,
            deps ? deps.concat(delay) : [callback, delay, existing]
        ),
        cancel,
    ];
}
