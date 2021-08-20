import { SyntheticEvent } from 'react';
import { CombinedError } from 'urql';

export type Nullable<T> = {
    [P in keyof T]?: T[P] | null;
};
export type QueryError = CombinedError;

export interface ChangeEvent<T = unknown> {
    /**
     * The name for this input, used so that a single change handler can be used
     *for many inputs.
     */
    name?: string;
    /**
     * Shortcut to get the value from the input.
     */
    value: T;
}
/**
 * Implements a consistent change handler interface for all inputs that
 * is backwards compatible with browser change handler but has an optional
 * second arg with some shortcuts for common use cases.
 */
export type ChangeHandler<T = unknown, E extends SyntheticEvent = SyntheticEvent> = (
    event: E,
    change: ChangeEvent<T>
) => void;
