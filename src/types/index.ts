import { CombinedError } from 'urql';

export type Nullable<T> = {
    [P in keyof T]?: T[P] | null;
};
export type QueryError = CombinedError;
