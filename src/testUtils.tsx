/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactElement, ReactNode } from 'react';
import { DocumentNode } from 'graphql';
import { render } from '@testing-library/react';
import { never } from 'wonka';
import { Provider } from 'urql';
import { ResetProvider } from 'api/client';

export type MockFn = ReturnType<typeof jest.fn>;
export interface Client {
    executeQuery: (opts: { query: DocumentNode }) => unknown;
    executeMutation: () => unknown;
    executeSubscription: () => unknown;
    query: () => { toPromise: () => Promise<unknown> };
    mutation: () => { toPromise: () => Promise<unknown> };
}
type Mocked<T> = {
    [P in keyof T]: MockFn;
};
export type MockedClient = Mocked<Client>;

export function renderWithClient(
    children: ReactNode,
    client?: Partial<Client>
): { client: MockedClient; rerender: (el?: ReactElement) => void; rendered: ReturnType<typeof render>; reset: MockFn } {
    const mockedClient = {
        executeQuery: jest.fn(client?.executeQuery || (() => never)),
        executeMutation: jest.fn(client?.executeMutation || (() => never)),
        executeSubscription: jest.fn(client?.executeSubscription || (() => never)),
        query: jest.fn(
            client?.query ||
                (() => ({
                    toPromise: () => Promise.resolve(),
                }))
        ),
        mutation: jest.fn(
            client?.mutation ||
                (() => ({
                    toPromise: () => Promise.resolve(),
                }))
        ),
    };
    const reset = jest.fn();

    const renderComponent = (children: ReactNode) => (
        <ResetProvider value={{ reset }}>
            {/* 
                // @ts-ignore */}
            <Provider value={mockedClient}>{children}</Provider>
        </ResetProvider>
    );

    const rendered = render(renderComponent(children));
    const rerender = (children: ReactNode) => rendered.rerender(renderComponent(children));

    return { client: mockedClient, rerender, rendered, reset };
}
