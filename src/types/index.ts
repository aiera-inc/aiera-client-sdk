import { SyntheticEvent } from 'react';
import { CombinedError } from 'urql';

export * from './generated';

export type Maybe<T> = T | null | undefined;
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
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
    value?: T;
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

/**
 * Utility type for creating a set of functions to handle
 * changes for multiple fields, like a form
 */
export type ChangeHandlers<T> = {
    [key in keyof T]-?: ChangeHandler<T[key]>;
};

/**
 * Partial only goes one level deep,
 * this makes all the nested types partials
 * as well.
 *
 * The main use case for this is working with
 * GQL results.
 *
 * If you have a utility function that you want
 * to work on `Company` but you only queried
 * some of the fields on `Company` (and it's
 * child fields) which is almost always the case,
 * then you'd get an error when passing the company
 * field through even if you handle null/undefined
 * properly. This allows you to specify the input type
 * as DeepPartial<Company> so that it works and forces
 * you to handle null/undefined.
 *
 * If the function can't handle null/undefined, specify
 * the full expected shape in your input type.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
