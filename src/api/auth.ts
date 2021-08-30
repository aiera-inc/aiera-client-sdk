/**
 * Auth utilities and a default auth implementation
 * for use cases that use a login form and/or use the GQL
 * API directly form teh client to login.
 * @module
 */
import { makeOperation } from '@urql/core';
import { AuthConfig as UrqlAuthConfig } from '@urql/exchange-auth';
import gql from 'graphql-tag';

import { RefreshMutation } from '@aiera/client-sdk/types/generated';
import { local as storage, Storage } from '@aiera/client-sdk/lib/storage';

/**
 * For docs only
 * @internal
 */
export { UrqlAuthConfig };

/**
 * Extends the urql built in AuthConfig type with some
 * helpers for writing/reading
 */
export interface TokenAuthConfig<T> extends UrqlAuthConfig<T> {
    readAuth: () => Promise<T | null>;
    writeAuth: (authState: T) => Promise<void>;
    clearAuth: () => Promise<void>;
}

export type AuthTokens = {
    /** A bearer token to be passed in HTTP Authorization header */
    accessToken: string;
    /** A bearer token to be passed in HTTP Authorization header,
     * only when requesting a new accessToken */
    refreshToken: string;
};

/**
 * This is the default implementation of the auth interface that
 * uses local storage to store tokens and the refresh mutation
 * to get new ones. This will work well when implementing a login
 * page for auth.
 *
 * For other use cases, such as server side token exchange, you
 * may need to supply a different implementation.
 */
export function createTokenAuthConfig(store: Storage = storage): TokenAuthConfig<AuthTokens> {
    const authConfig: TokenAuthConfig<AuthTokens> = {
        readAuth: async () => {
            const accessToken = await store.get('auth:accessToken');
            const refreshToken = await store.get('auth:refreshToken');
            if (accessToken && refreshToken) {
                return Promise.resolve({ accessToken, refreshToken });
            }

            return Promise.resolve(null);
        },

        writeAuth: async (authState) => {
            await store.put('auth:accessToken', authState.accessToken);
            await store.put('auth:refreshToken', authState.refreshToken);
            return Promise.resolve();
        },

        clearAuth: async () => {
            await store.del('auth:accessToken');
            await store.del('auth:refreshToken');
            return Promise.resolve();
        },

        // eslint-disable-next-line @typescript-eslint/require-await
        getAuth: async ({ authState, mutate }) => {
            if (!authState) {
                return authConfig.readAuth();
            }

            const result = await mutate<RefreshMutation>(
                gql`
                    mutation Refresh {
                        __typename
                        refresh {
                            __typename
                            accessToken
                            refreshToken
                        }
                    }
                `
            );

            if (result.data?.refresh) {
                await authConfig.writeAuth(result.data.refresh);
                return result.data.refresh;
            }
            return null;
        },

        /**
         * some sstuff
         */
        addAuthToOperation: ({ authState, operation }) => {
            if (!authState || !authState.accessToken) {
                return operation;
            }

            const fetchOptions =
                typeof operation.context.fetchOptions === 'function'
                    ? operation.context.fetchOptions()
                    : operation.context.fetchOptions || {};

            let isRefresh = false;
            const definition = operation.query.definitions[0];
            if (operation.kind === 'mutation' && definition.kind === 'OperationDefinition') {
                isRefresh = definition.name?.value === 'Refresh';
            }

            return makeOperation(operation.kind, operation, {
                ...operation.context,
                fetchOptions: {
                    ...fetchOptions,
                    headers: {
                        ...fetchOptions.headers,
                        Authorization: `Bearer ${isRefresh ? authState.refreshToken : authState.accessToken}`,
                    },
                },
            });
        },

        didAuthError: ({ error }) => {
            if (error.graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHORIZED')) {
                return true;
            } else if (error.response) {
                const resp = error.response as Response;
                return resp.status === 401;
            }
            return false;
        },
    };

    return authConfig;
}

export const defaultTokenAuthConfig = createTokenAuthConfig();
