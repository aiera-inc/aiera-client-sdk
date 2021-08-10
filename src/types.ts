import { CombinedError } from 'urql';

export interface Event {
    id: string;
    title: string;
    ticker: string;
}

export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
}

export interface GQLHook {
    loading: boolean;
    error?: CombinedError;
    refetch: () => void;
}
