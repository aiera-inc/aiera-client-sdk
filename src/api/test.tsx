/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactNode } from 'react';
import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { makeOperation, CombinedError, GraphQLRequest, OperationContext } from '@urql/core';
import { fromValue } from 'wonka';

import { Provider as ConfigProvider } from '@aiera/client-sdk/lib/config';
import { MockProvider, actAndFlush, getMockedClient } from 'testUtils';
import { Provider, SuccessQueryResult, useClient, usePaginatedQuery } from './client';
import { createTokenAuthConfig } from './auth';

const tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
};

describe('default auth', () => {
    function createMockStore(value: string | null = 'token') {
        return {
            get: jest.fn(() => Promise.resolve(value)),
            put: jest.fn(() => Promise.resolve()),
            del: jest.fn(() => Promise.resolve()),
        };
    }

    test('readAuth returns stored access and refresh token', async () => {
        const store = createMockStore();
        const authConfig = createTokenAuthConfig(store);
        expect(await authConfig.readAuth()).toMatchObject({ accessToken: 'token', refreshToken: 'token' });
        expect(store.get).toHaveBeenCalledWith('auth:accessToken');
        expect(store.get).toHaveBeenCalledWith('auth:refreshToken');
    });

    test('readAuth returns null when no tokens are stored', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        expect(await authConfig.readAuth()).toBeNull();
        expect(store.get).toHaveBeenCalledWith('auth:accessToken');
        expect(store.get).toHaveBeenCalledWith('auth:refreshToken');
    });

    test('writeAuth writes the auth tokens to storage', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        expect(await authConfig.writeAuth(tokens)).toBeUndefined();
        expect(store.put).toHaveBeenCalledWith('auth:accessToken', 'accessToken');
        expect(store.put).toHaveBeenCalledWith('auth:refreshToken', 'refreshToken');
    });

    test('clearAuth clears the auth tokens in storage', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        expect(await authConfig.clearAuth()).toBeUndefined();
        expect(store.del).toHaveBeenCalledWith('auth:accessToken');
        expect(store.del).toHaveBeenCalledWith('auth:refreshToken');
    });

    test('getAuth reads from storage on initial attempt', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        authConfig.readAuth = jest.fn(() => Promise.resolve(tokens));
        const mutate = jest.fn();
        expect(await authConfig.getAuth({ authState: null, mutate })).toMatchObject(tokens);
    });

    test('getAuth calls refresh and writes new auth if authState is stale', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        authConfig.writeAuth = jest.fn(() => Promise.resolve());
        const mutate = jest.fn(() =>
            Promise.resolve({
                data: {
                    refresh: tokens,
                },
            })
        );

        // @ts-ignore
        expect(await authConfig.getAuth({ authState: tokens, mutate })).toMatchObject(tokens);
        expect(authConfig.writeAuth).toHaveBeenCalledWith(tokens);
        expect(mutate).toHaveBeenCalled();
    });

    test('getAuth returns null if it cant refresh', async () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        authConfig.writeAuth = jest.fn(() => Promise.resolve());
        const mutate = jest.fn(() => Promise.resolve({ data: null }));

        // @ts-ignore
        expect(await authConfig.getAuth({ authState: tokens, mutate })).toBeNull();
        expect(authConfig.writeAuth).not.toHaveBeenCalledWith(tokens);
        expect(mutate).toHaveBeenCalled();
    });

    test('addAuthToOperation adds the access token', () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        const query = gql`
            query Test {
                testField
            }
        `;
        const operation = makeOperation('query', { key: 1, query, variables: {} }, {} as OperationContext);
        // @ts-ignore
        const newOperation = authConfig.addAuthToOperation({ authState: tokens, operation });
        const fetchOptions = newOperation.context.fetchOptions as RequestInit;
        expect(fetchOptions.headers).toMatchObject({
            Authorization: `Bearer ${tokens.accessToken}`,
        });
    });

    test('addAuthToOperation adds the refresh token', () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        const query = gql`
            mutation Refresh {
                testField
            }
        `;
        const operation = makeOperation('mutation', { key: 1, query, variables: {} }, {} as OperationContext);
        // @ts-ignore
        const newOperation = authConfig.addAuthToOperation({ authState: tokens, operation });
        const fetchOptions = newOperation.context.fetchOptions as RequestInit;
        expect(fetchOptions.headers).toMatchObject({
            Authorization: `Bearer ${tokens.refreshToken}`,
        });
    });

    test('didAuthError returns true on UNAUTHORIZED or 401', () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        expect(
            authConfig.didAuthError?.({
                error: {
                    graphQLErrors: [{ extensions: { code: 'UNAUTHORIZED' } }] as unknown as GraphQLError[],
                } as CombinedError,
                authState: null,
            })
        ).toBeTruthy();
        expect(
            authConfig.didAuthError?.({
                error: {
                    response: { status: 401 },
                } as CombinedError,
                authState: null,
            })
        ).toBeTruthy();
    });

    test('didAuthError returns false on other errors', () => {
        const store = createMockStore(null);
        const authConfig = createTokenAuthConfig(store);
        expect(
            authConfig.didAuthError?.({
                error: {
                    graphQLErrors: [{ extensions: { code: 'OTHER ERROR' } }] as unknown as GraphQLError[],
                } as CombinedError,
                authState: null,
            })
        ).toBeFalsy();
    });

    test('provider resets the client on reset', () => {
        const config = { assetPath: 'assets', gqlOptions: { clientOptions: { url: 'http://domain.tld' } } };
        let outerClient: unknown;
        function TestComponent() {
            const { client, reset } = useClient();
            outerClient = client;
            return <button data-testid="reset" onClick={reset} />;
        }

        const { rerender } = render(
            <ConfigProvider config={config}>
                <Provider>
                    <TestComponent />
                </Provider>
            </ConfigProvider>
        );

        const client1 = outerClient;
        rerender(
            <ConfigProvider config={config}>
                <Provider>
                    <TestComponent />
                </Provider>
            </ConfigProvider>
        );

        const client2 = outerClient;
        userEvent.click(screen.getByTestId('reset'));
        const client3 = outerClient;
        expect(client1).toBe(client2);
        expect(client1).not.toBe(client3);
    });
});

describe('usePaginatedQuery', () => {
    type QueryVariables = {
        fromIndex: number;
    };
    type TestData = {
        id: string;
        hits: Array<{ id: string }>;
    };
    const query = gql`
        query PaginatedQuery($fromIndex: Int) {
            test(fromIndex: $fromIndex) {
                id
                hits {
                    id
                }
            }
        }
    `;
    const data: TestData = {
        id: '1',
        hits: [{ id: '1' }],
    };
    const refetchData: TestData = {
        id: '2',
        hits: [{ id: '2' }],
    };
    const mockedClient = getMockedClient({
        executeQuery: (request) => {
            const variables = (request as GraphQLRequest)?.variables as QueryVariables;
            return fromValue({
                data: variables?.fromIndex === 0 ? data : refetchData,
            });
        },
    });
    const mergeResults = (prevData: TestData, data: TestData) => {
        const prevHits = prevData?.hits || [];
        const prevIds = new Set(prevHits.map((hit) => hit.id));
        return {
            ...data,
            hits: [...prevHits, ...data.hits.filter((h) => !prevIds.has(h.id))],
        };
    };
    function TestProvider({ children }: { children?: ReactNode }) {
        return <MockProvider client={mockedClient}>{children}</MockProvider>;
    }
    test('handles merging query results', async () => {
        const { result, rerender } = await actAndFlush(() =>
            renderHook(
                (props) =>
                    usePaginatedQuery({
                        mergeResults,
                        query,
                        variables: { fromIndex: props.fromIndex },
                    }),
                {
                    initialProps: { fromIndex: 0 },
                    wrapper: TestProvider,
                }
            )
        );
        expect((result.current as SuccessQueryResult<TestData, QueryVariables>).data).toEqual(data);
        rerender({ fromIndex: 1 });
        expect((result.current as SuccessQueryResult<TestData, QueryVariables>).data.hits).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })])
        );
    });
});
