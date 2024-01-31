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
    clearAuth: () => Promise<void>;
    readAuth: () => Promise<T | null>;
    writeAuth: (authState: T) => Promise<void>;
}

export type AuthTokens = {
    /** A bearer token to be passed in HTTP Authorization header */
    accessToken: string;
    /** A bearer token to be passed in HTTP Authorization header,
     * only when requesting a new accessToken */
    refreshToken: string;
};

type DecodedJWT = {
    exp?: number;
};

const decodeJWT = (token: string): DecodedJWT | null => {
    let decoded: DecodedJWT | null = null;
    try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            decoded = JSON.parse(jsonPayload) as DecodedJWT;
        }
    } catch (error) {
        console.error('Error decoding JWT: ', error);
    }
    return decoded;
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
            if (operation.kind === 'mutation' && definition?.kind === 'OperationDefinition') {
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
            if (error?.graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHORIZED')) {
                return true;
            } else if (error.response) {
                const resp = error.response as Response;
                return resp.status === 401;
            }
            return false;
        },
        willAuthError: ({ authState }) => {
            if (authState?.refreshToken) {
                const decodedToken = decodeJWT(authState.refreshToken);
                if (decodedToken && decodedToken.exp) {
                    return Date.now() >= decodedToken.exp * 1000; // true if expired, triggers addAuthToOperation
                }
            }
            return false; // no refreshToken or unable to decode, do nothing
        },
    };

    return authConfig;
}

export const defaultTokenAuthConfig = createTokenAuthConfig();
