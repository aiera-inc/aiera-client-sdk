import React, { ReactNode } from 'react';
import { useClient } from 'urql';
import { screen, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useRealtime } from '@aiera/client-sdk/lib/realtime';
import { useStorage } from '@aiera/client-sdk/lib/storage';
import { Provider, Client, MessageBus, EnvConfig, Realtime, Storage } from '.';

import { getMockedClient, getMockedRealtime } from 'testUtils';

describe('Provider', () => {
    test('renders', () => {
        const config: EnvConfig = { apiUrl: 'test', assetPath: 'assets' };
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
        const config: EnvConfig = { apiUrl: 'test', assetPath: 'assets' };
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
        expect(result.current.storage).toBe(storage);
    });
});
