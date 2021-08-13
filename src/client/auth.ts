import { makeOperation } from '@urql/core';
import { AuthConfig } from '@urql/exchange-auth';

import storage from 'lib/storage';

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export function setAuth(tokens: AuthTokens): void {
    storage.put('auth:accessToken', tokens.accessToken);
    storage.put('auth:refreshToken', tokens.refreshToken);
}

export function getAuth(): AuthTokens | null {
    const accessToken = storage.get('auth:accessToken');
    const refreshToken = storage.get('auth:refreshToken');
    if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
    }

    return null;
}

export function clearAuth(): void {
    storage.del('auth:accessToken');
    storage.del('auth:refreshToken');
}

export const defaultAuthConfig: AuthConfig<AuthTokens> = {
    // eslint-disable-next-line @typescript-eslint/require-await
    getAuth: async ({ authState }) => {
        console.log('called getAuth with ', { authState });
        if (!authState) {
            return getAuth();
        }
        return null;
    },

    addAuthToOperation: ({ authState, operation }) => {
        console.log('called addAuthtoOperation with ', { authState, operation });
        if (!authState || !authState.accessToken) {
            return operation;
        }

        const fetchOptions =
            typeof operation.context.fetchOptions === 'function'
                ? operation.context.fetchOptions()
                : operation.context.fetchOptions || {};

        return makeOperation(operation.kind, operation, {
            ...operation.context,
            fetchOptions: {
                ...fetchOptions,
                headers: {
                    ...fetchOptions.headers,
                    Authorization: `Bearer ${authState.accessToken}`,
                },
            },
        });
    },

    didAuthError: ({ error }) => {
        console.log(
            'didError',
            error.graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHORIZED')
        );
        return error.graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHORIZED');
    },
};
