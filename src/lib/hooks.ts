import { useCallback, useState, Dispatch, SetStateAction } from 'react';

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
