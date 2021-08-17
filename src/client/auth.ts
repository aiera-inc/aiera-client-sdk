/**
 * Auth utilities and a default auth implementation
 * for use cases that use a login form and/or use the GQL
 * API directly form teh client to login.
 * @module
 */
import { makeOperation } from '@urql/core';
import { AuthConfig } from '@urql/exchange-auth';
import gql from 'graphql-tag';

import { RefreshMutation } from 'types/generated';
import storage from 'lib/storage';

/**
 * For docs only
 * @internal
 */
export { AuthConfig };

export type AuthTokens = {
    /** A bearer token to be passed in HTTP Authorization header */
    accessToken: string;
    /** A bearer token to be passed in HTTP Authorization header,
     * only when requesting a new accessToken */
    refreshToken: string;
};

/**
 * Writes {@link AuthTokens} to local storage
 */
export function setAuth(tokens: AuthTokens): void {
    storage.put('auth:accessToken', tokens.accessToken);
    storage.put('auth:refreshToken', tokens.refreshToken);
}

/**
 * Retrieves {@link AuthTokens} from local storage
 */
export function getAuth(): AuthTokens | null {
    const accessToken = storage.get('auth:accessToken');
    const refreshToken = storage.get('auth:refreshToken');
    if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
    }

    return null;
}

/**
 * Clears {@link AuthTokens} from local storage
 */
export function clearAuth(): void {
    storage.del('auth:accessToken');
    storage.del('auth:refreshToken');
}

/**
 * This is the default implementation of the auth interface that
 * uses local storage to store tokens and the refresh mutation
 * to get new ones. This will work well when implementing a login
 * page for auth.
 *
 * For other use cases, such as server side token exchange, you
 * may need to supply a different implementation.
 */
export const defaultAuthConfig: AuthConfig<AuthTokens> = {
    // eslint-disable-next-line @typescript-eslint/require-await
    getAuth: async ({ authState, mutate }) => {
        if (!authState) {
            return getAuth();
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
            setAuth(result.data.refresh);
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
