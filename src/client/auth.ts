import { makeOperation } from '@urql/core';
import { AuthConfig } from '@urql/exchange-auth';
import gql from 'graphql-tag';

import { RefreshMutation } from 'types/generated';
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
