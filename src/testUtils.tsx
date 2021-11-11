/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactElement, ReactNode } from 'react';
import { DocumentNode } from 'graphql';
import Pusher from 'pusher-js';
import { screen, render } from '@testing-library/react';
import { never } from 'wonka';
import EventEmitter from 'eventemitter3';

import { Provider, Client, EnvConfig, Realtime } from '@aiera/client-sdk/components/Provider';

export type MockFn = ReturnType<typeof jest.fn>;
type Mocked<T> = {
    [P in keyof T]: MockFn;
};
export interface MockClient {
    executeQuery: (opts: { query: DocumentNode }) => unknown;
    executeMutation: () => unknown;
    executeSubscription: () => unknown;
    query: () => { toPromise: () => Promise<unknown> };
    mutation: () => { toPromise: () => Promise<unknown> };
}
export type MockedClient = Mocked<MockClient>;

type Channel = { bind: MockFn; unbind: MockFn; unsubscribe: MockFn };
type MockedRealtime = Mocked<Partial<Pusher>> & {
    trigger: (channelName: string, eventName: string, data?: unknown) => void;
    mockedChannels: { [name: string]: Channel };
};

const mockedConfig = {
    apiUrl: 'test',
    assetPath: 'assets',
};

export function getMockedRealtime(): MockedRealtime {
    const events = new EventEmitter();
    const channels: { [name: string]: Channel } = {};
    return {
        trigger: (channelName: string, eventName: string, data?: unknown) => {
            events.emit(`${channelName}-${eventName}`, data);
        },
        mockedChannels: channels,
        subscribe: jest.fn((channelName: string) => {
            const channel = {
                bind: jest.fn((eventName: string, callback: (data: unknown) => void) => {
                    events.on(`${channelName}-${eventName}`, callback);
                }),
                unbind: jest.fn((eventName: string, callback: (data: unknown) => void) => {
                    events.off(`${channelName}-${eventName}`, callback);
                }),
                unsubscribe: jest.fn(),
            };
            channels[channelName] = channel;
            return channel;
        }),
    };
}

export function getMockedClient(client?: Partial<MockClient>): MockedClient {
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
    client = getMockedClient(),
    config = mockedConfig,
    realtime = getMockedRealtime(),
    reset = jest.fn(),
}: {
    children: ReactNode;
    client?: MockedClient;
    config?: EnvConfig;
    realtime?: MockedRealtime;
    reset?: () => void;
}): ReactElement {
    return (
        <Provider
            config={config}
            client={client as unknown as Client}
            realtime={realtime as unknown as Realtime}
            reset={reset}
        >
            {children}
        </Provider>
    );
}

export function renderWithProvider(
    children: ReactNode,
    client?: Partial<MockClient>
): {
    client: MockedClient;
    realtime: MockedRealtime;
    rerender: (el?: ReactElement) => void;
    rendered: ReturnType<typeof render>;
    reset: MockFn;
} {
    const mockedClient = getMockedClient(client);
    const mockedRealtime = getMockedRealtime();

    const reset = jest.fn();
    const rendered = render(
        <MockProvider config={mockedConfig} client={mockedClient} realtime={mockedRealtime} reset={reset}>
            {children}
        </MockProvider>
    );
    const rerender = (children: ReactNode) =>
        rendered.rerender(
            <MockProvider config={mockedConfig} client={mockedClient} realtime={mockedRealtime} reset={reset}>
                {children}
            </MockProvider>
        );

    return { client: mockedClient, realtime: mockedRealtime, rerender, rendered, reset };
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
