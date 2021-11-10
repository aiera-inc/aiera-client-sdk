/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactElement, ReactNode } from 'react';
import { DocumentNode } from 'graphql';
import { screen, render } from '@testing-library/react';
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

export function getMockedClient(client?: Partial<Client>): MockedClient {
    return {
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
}

export function MockProvider({
    children,
    client,
    reset = jest.fn(),
}: {
    children: ReactNode;
    client: MockedClient;
    reset?: () => void;
}): ReactElement {
    return (
        <ResetProvider value={{ reset }}>
            {/* 
                // @ts-ignore */}
            <Provider value={client}>{children}</Provider>
        </ResetProvider>
    );
}

export function renderWithClient(
    children: ReactNode,
    client?: Partial<Client>
): { client: MockedClient; rerender: (el?: ReactElement) => void; rendered: ReturnType<typeof render>; reset: MockFn } {
    const mockedClient = getMockedClient(client);
    const reset = jest.fn();
    const rendered = render(
        <MockProvider client={mockedClient} reset={reset}>
            {children}
        </MockProvider>
    );
    const rerender = (children: ReactNode) =>
        rendered.rerender(
            <MockProvider client={mockedClient} reset={reset}>
                {children}
            </MockProvider>
        );

    return { client: mockedClient, rerender, rendered, reset };
}

export function getByTextWithMarkup(text: string): void {
    screen.getByText((_content, node: Element | null) => {
        const hasText = (node: Element | null) => node?.textContent === text;
        const childrenDontHaveText = !!(
            node?.children && Array.from(node.children).every((child) => !hasText(child as HTMLElement))
        );
        return hasText(node) && childrenDontHaveText;
    });
}
