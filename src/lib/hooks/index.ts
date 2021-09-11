import { useCallback, useState, Dispatch, SetStateAction, useEffect, RefObject } from 'react';
import { useCallback, useState, Dispatch, SetStateAction, useEffect, useRef, RefObject, DependencyList } from 'react';

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
 * This is alpha stage, use only where it's easy to revert since the API may change
 * significantly.
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

export function useTimedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    deps: DependencyList = [],
    delay = 0,
    existing: 'preserve' | 'cancel' = 'cancel'
): [callback: T, ref: RefObject<number>] {
    const ref = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (ref.current) {
                window.clearTimeout(ref.current);
            }
        };
    });

    return [
        useCallback(
            ((...args: unknown[]) => {
                if (ref.current && existing === 'cancel') {
                    window.clearTimeout(ref.current);
                    ref.current = null;
                }
                if (!ref.current) ref.current = window.setTimeout(() => callback(...args), delay);
            }) as T,
            deps.concat(delay)
        ),
        ref,
    ];
}
