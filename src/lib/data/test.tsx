import React, { ReactNode, useEffect } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { fromValue } from 'wonka';

import { actAndFlush, getMockedClient, MockProvider, renderWithProvider } from 'testUtils';

import { useAppConfig, useAutoTrack, useTrack, useSettings, defaultSettings } from '.';

describe('useTrack', () => {
    const TestComponent = () => {
        const track = useTrack();
        useEffect(() => {
            void track('View', 'Event', { eventId: 1 });
        }, []);
        return null;
    };

    test('calls the track mutation', () => {
        const { client } = renderWithProvider(<TestComponent />);
        expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
            event: 'View | Event',
            properties: { eventId: 1 },
        });
    });
});

describe('useAutoTrack', () => {
    const TestComponent = ({ id, other: _, skip = false }: { id: string; other?: string; skip?: boolean }) => {
        useAutoTrack('View', 'Event', { eventId: id }, [id], skip);
        return null;
    };

    test('calls the track mutation, and calls it again on changes', () => {
        const { client, rerender } = renderWithProvider(<TestComponent id="1" />);

        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );

        rerender(<TestComponent id="2" />);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '2' },
            })
        );
    });

    test('doesnt call it again if deps dont change', () => {
        const { client, rerender } = renderWithProvider(<TestComponent id="1" other="1" />);

        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );

        rerender(<TestComponent id="1" other="2" />);
        expect(client.mutation).toHaveBeenCalledTimes(1);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );
    });

    test('handles "skip" option', () => {
        const { client, rerender } = renderWithProvider(<TestComponent id="1" skip />);

        expect(client.mutation).not.toHaveBeenCalled();

        rerender(<TestComponent id="2" />);
        expect(client.mutation).toHaveBeenCalledTimes(1);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '2' },
            })
        );
    });
});

describe('useAppConfig', () => {
    test('returns the application configuration from the server', () => {
        const data = {
            configuration: {
                pusherAppCluster: 'cluster',
                pusherAppKey: 'key',
            },
        };
        const mockedClient = getMockedClient({
            executeQuery: () =>
                fromValue({
                    data,
                }),
        });
        function TestProvider({ children }: { children: ReactNode }) {
            return <MockProvider client={mockedClient}>{children}</MockProvider>;
        }
        const { result } = renderHook(() => useAppConfig(), { wrapper: TestProvider });
        expect(result.current.state.data).toEqual(data);
    });
});

describe('useSettings', () => {
    test('returns the default settings', async () => {
        const { result } = await actAndFlush(() => renderHook(() => useSettings(), { wrapper: MockProvider }));
        expect(result.current.settings).toEqual(defaultSettings);
    });

    test('returns the stored settings', async () => {
        const storedSettings = {
            darkMode: true,
            textSentiment: true,
            tonalSentiment: true,
        };
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify(storedSettings));
        const { result } = await actAndFlush(() => renderHook(() => useSettings(), { wrapper: MockProvider }));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.getItem).toHaveBeenLastCalledWith('aiera:sdk:settings');
        expect(result.current.settings).toEqual(storedSettings);
    });

    test('updates settings', async () => {
        const initialSettings = {
            darkMode: true,
            textSentiment: true,
            tonalSentiment: true,
        };
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        jest.spyOn(window.localStorage.__proto__, 'setItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify(initialSettings));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = jest.fn();
        const hook = await actAndFlush(() => renderHook(() => useSettings(), { wrapper: MockProvider }));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.getItem).toHaveBeenLastCalledWith('aiera:sdk:settings');
        expect(hook?.result.current.settings).toEqual(initialSettings);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify({ ...initialSettings, darkMode: false }));
        await actAndFlush(() => {
            hook?.result.current.updateSettings({ darkMode: false });
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.setItem).toHaveBeenLastCalledWith(
            'aiera:sdk:settings',
            JSON.stringify({ darkMode: false, textSentiment: true, tonalSentiment: true })
        );
        expect(hook?.result.current.settings).toEqual({ ...initialSettings, darkMode: false });
    });
});
