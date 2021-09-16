import {
    useCallback,
    useState,
    Dispatch,
    SetStateAction,
    useEffect,
    useLayoutEffect,
    useRef,
    RefObject,
    DependencyList,
} from 'react';

import { ChangeHandlers } from '@aiera/client-sdk/types';

/**
 * This is a utility for taking a a set of fields
 * that will be used in forms, change/click handlers, etc.
 * to update state. It returns the initial state and the setState
 * function like `useState` does, however it also generates a change
 * handler for each field that is set up to work well with the
 * ChangeHandler interface.
 *
 * Example:
 * ```typescript
 * type Option = 'option1' | 'option2';
 * interface MyState {
 *     field1: Option;
 * }
 * const MyForm = () => {
 *     const { state, handlers } = useChangeHandlers<MyState>({ field1: 'option1' });
 *     return <Select<Option> onChange={handlers.field1} />;
 * }
 * ```
 *
 * This is alpha stage, use only where it's easy to revert since the API may change significantly.
 *
 * @param initialState
 * @alpha
 */
export function useChangeHandlers<T>(initialState: T): {
    state: T;
    handlers: ChangeHandlers<T>;
    setState: Dispatch<SetStateAction<T>>;
} {
    const [state, setState] = useState<T>(initialState);
    const handlers = {} as ChangeHandlers<T>;
    for (const key in initialState) {
        handlers[key] = useCallback((_, change) => setState({ ...state, [key]: change.value }), [state]);
    }
    /** The same as the `state` value from useState */
    return {
        state,
        setState,
        handlers,
    };
}

/**
 * This is a utility for tracking clicks outside of
 * a set of elements.
 *
 * ```typescript
 * const MyComponent = () => {
 *     const ref = useRef<HTMLDivElement>(null);
 *     useOutsideClickHandler(
 *         [ref],
 *         useCallback(() => {
 *             alert('Clicked outside!');
 *         }, [])
 *     );
 *
 *     return (
 *         <div className="outside">
 *             outside
 *             <div className="inside" ref={ref}>inside</div>
 *         </div>
 *     );
 * };
 * ```
 *
 * @param refs - A list of react refs to components that when clicked will NOT
 *               fire the outsideClickHandler
 * @param outsideClickHandler - The handler to run when an element outside of `refs`
 *                              is clicked.
 */
export function useOutsideClickHandler(
    refs: RefObject<HTMLElement | null | undefined>[],
    outsideClickHandler: (event: MouseEvent) => void
): void {
    return useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (event?.target instanceof Node) {
                // Unfortunately need to cast to Node here since the React and DOM typings don't
                // handle this well: https://stackoverflow.com/questions/61164018/typescript-ev-target-and-node-contains-eventtarget-is-not-assignable-to-node
                const isInside = refs.some((ref) => ref.current?.contains(event?.target as Node));
                if (!isInside) {
                    outsideClickHandler(event);
                }
            }
        };
        document.addEventListener('mousedown', handler);

        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, [...refs, outsideClickHandler]);
}

/**
 * Returns the current window size and updates when the screen is resized.
 */
export function useWindowSize(): { height: number; width: number } {
    const [size, setSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    const onResize = () =>
        setSize({
            height: window.innerHeight,
            width: window.innerWidth,
        });

    useLayoutEffect(() => {
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return size;
}

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
            ((...args) => {
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
