/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { never } from 'wonka';
import { Provider } from 'urql';
import { ResetProvider } from 'client';

export type MockFn = ReturnType<typeof jest.fn>;
export interface Client {
    executeQuery: () => unknown;
    executeMutation: () => unknown;
    executeSubscription: () => unknown;
}
type Mocked<T> = {
    [P in keyof T]: MockFn;
};
export type MockedClient = Mocked<Client>;

export function renderWithClient(
    children: ReactNode,
    client?: Partial<Client>
): { client: MockedClient; rendered: ReturnType<typeof render>; reset: MockFn } {
    const mockedClient = {
        executeQuery: jest.fn(client?.executeQuery || (() => never)),
        executeMutation: jest.fn(client?.executeMutation || (() => never)),
        executeSubscription: jest.fn(client?.executeSubscription || (() => never)),
    };
    const reset = jest.fn();

    const rendered = render(
        <ResetProvider value={{ reset }}>
            {/* 
                // @ts-ignore */}
            <Provider value={mockedClient}>{children}</Provider>
        </ResetProvider>
    );

    return { client: mockedClient, rendered, reset };
}
