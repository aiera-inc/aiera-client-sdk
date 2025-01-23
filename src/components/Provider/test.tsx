/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactNode } from 'react';
import { useClient } from 'urql';
import { screen, render, renderHook } from '@testing-library/react';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useRealtime } from '@aiera/client-sdk/lib/realtime';
import { useStorage } from '@aiera/client-sdk/lib/storage';
import { Provider, Client, MessageBus, Config, Realtime, Storage } from '.';

import { getMockedClient, getMockedRealtime } from 'testUtils';

describe('Provider', () => {
    test('renders', () => {
        const config: Config = {
            assetPath: 'assets',
            platform: 'aiera-sdk-dev',
            gqlOptions: { clientOptions: { url: 'test' } },
        };
        render(
            <Provider config={config} client={getMockedClient() as unknown as Client}>
                test
            </Provider>
        );
        screen.getByText('test');
    });

    test('provides all contexts', () => {
        const bus = jest.fn() as unknown as MessageBus;
        const client = getMockedClient() as unknown as Client;
        const config: Config = {
            assetPath: 'assets',
            platform: 'aiera-sdk-dev',
            gqlOptions: { clientOptions: { url: 'test' } },
            virtualListKey: process.env.AIERA_SDK_VIRTUAL_LIST_KEY,
        };
        const realtime = getMockedRealtime() as unknown as Realtime;
        const storage = jest.fn() as unknown as Storage;

        function useProvided() {
            return {
                bus: useMessageBus(),
                client: useClient(),
                config: useConfig(),
                realtime: useRealtime(),
                storage: useStorage(),
            };
        }

        function Wrapper({ children }: { children: ReactNode }) {
            return (
                <Provider bus={bus} client={client} config={config} realtime={realtime} storage={storage}>
                    {children}
                </Provider>
            );
        }

        const { result } = renderHook(() => useProvided(), { wrapper: Wrapper });
        expect(result.current.bus).toBe(bus);
        expect(result.current.client).toBe(client);
        expect(result.current.config).toEqual(config);
        expect(result.current.realtime).toBe(realtime);
        // Implementation detail for storage class, but we want to confirm
        // it is passing the correct object here so ignore the error for the test
        // @ts-ignore
        expect(result.current.storage.storage).toBe(storage);
    });
});
