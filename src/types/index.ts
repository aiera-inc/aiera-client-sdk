import { CombinedError, UseQueryResponse, UseMutationResponse } from 'urql';

export * from './graphql';

export type Query<T = unknown, V = unknown> = UseQueryResponse<T, V>[0] & { refetch: UseQueryResponse<T, V>[1] };

export type Mutation<T = unknown, V = unknown> = UseMutationResponse<T, V>[0] & {
    mutate: UseMutationResponse<T, V>[1];
};

export type QueryError = CombinedError;
