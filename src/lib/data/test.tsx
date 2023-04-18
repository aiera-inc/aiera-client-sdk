import React, { ReactNode, useEffect } from 'react';
import { actAndFlush, getMockedClient, MockProvider, renderWithProvider } from 'testUtils';
import { fromValue } from 'wonka';
import { renderHook } from '@testing-library/react-hooks';

import { User } from '@aiera/client-sdk/types/generated';
import {
    getEventCreatorName,
    useAppConfig,
    useAutoTrack,
    useTrack,
    useSettings,
    useAlertList,
    usePrimaryWatchlistResolver,
    defaultSettings,
    defaultAlertList,
} from '.';

describe('getEventCreatorName', () => {
    test('renders first name when only first name is defined', () => {
        const user = {
            firstName: 'Tester',
        };
        expect(getEventCreatorName(user as User)).toBe(user.firstName);
    });

    test('renders last name when only last name is defined', () => {
        const user = {
            lastName: 'McTesting',
        };
        expect(getEventCreatorName(user as User)).toBe(user.lastName);
    });

    test('renders first name and last initial when both are defined', () => {
        const user = {
            firstName: 'Tester',
            lastName: 'McTesting',
            username: 'test@aiera.com',
        };
        expect(getEventCreatorName(user as User)).toBe('Tester M.');
    });

    test('renders primary email when set and name is not defined', () => {
        const user = {
            primaryEmail: 'test@aiera.com',
            username: 'tester@example.com',
        };
        expect(getEventCreatorName(user as User)).toBe(user.primaryEmail);
    });

    test('renders username when set and primary email and name are not defined', () => {
        const user = {
            username: 'tester@example.com',
        };
        expect(getEventCreatorName(user as User)).toBe(user.username);
    });
});

describe('useTrack', () => {
    const TestComponent = () => {
        const track = useTrack();
        useEffect(() => {
            void track('View', 'Event', { eventId: '1' });
        }, []);
        return null;
    };

    test('calls the track mutation', () => {
        const { client } = renderWithProvider(<TestComponent />);
        expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
            event: 'View | Event',
            properties: expect.objectContaining({ eventId: '1' }) as { [key: string]: string },
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

        expect(client.mutation).toHaveBeenLastCalledWith(expect.anything(), {
            event: 'View | Event',
            properties: expect.objectContaining({ eventId: '1' }) as { [key: string]: string },
        });

        rerender(<TestComponent id="2" />);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: expect.objectContaining({ eventId: '2' }) as { [key: string]: string },
            })
        );
    });

    test('doesnt call it again if deps dont change', () => {
        const { client, rerender } = renderWithProvider(<TestComponent id="1" other="1" />);

        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: expect.objectContaining({ eventId: '1' }) as { [key: string]: string },
            })
        );

        rerender(<TestComponent id="1" other="2" />);
        expect(client.mutation).toHaveBeenCalledTimes(1);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: expect.objectContaining({ eventId: '1' }) as { [key: string]: string },
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
                properties: expect.objectContaining({ eventId: '2' }) as { [key: string]: string },
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
    afterEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = () => null;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = () => null;
    });

    test('returns the default settings', async () => {
        const { result } = await actAndFlush(() => renderHook(() => useSettings(), { wrapper: MockProvider }));
        expect(result.current.settings).toEqual(defaultSettings);
    });

    test('returns the stored settings', async () => {
        const storedSettings = {
            darkMode: true,
            textSentiment: true,
            tonalSentiment: true,
            syncWatchlist: true,
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
            syncWatchlist: true,
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
            JSON.stringify({ darkMode: false, textSentiment: true, tonalSentiment: true, syncWatchlist: true })
        );
        expect(hook?.result.current.settings).toEqual({ ...initialSettings, darkMode: false });
    });
});

describe('useAlertList', () => {
    afterEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = () => null;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = () => null;
    });

    test('returns the default alertList', async () => {
        const { result } = await actAndFlush(() => renderHook(() => useAlertList(), { wrapper: MockProvider }));
        expect(result.current.alertList).toEqual(defaultAlertList);
    });

    test('returns the stored alertList', async () => {
        const storedAlertList = {
            events: {
                '2003019': {
                    ticker: 'BYND',
                },
            },
            dates: {
                '2022-01-04T16:30:00.000-05:00': ['2003019'],
            },
        };
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify(storedAlertList));
        const { result } = await actAndFlush(() => renderHook(() => useAlertList(), { wrapper: MockProvider }));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.getItem).toHaveBeenLastCalledWith('aiera:sdk:alertList');
        expect(result.current.alertList).toEqual(storedAlertList);
    });

    test('add to alertList', async () => {
        const initialAlertList = {
            events: {
                '2003019': {
                    ticker: 'BYND',
                },
            },
            dates: {
                '2022-01-04T16:30:00.000-05:00': ['2003019'],
            },
        };
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        jest.spyOn(window.localStorage.__proto__, 'setItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify(initialAlertList));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = jest.fn();
        const hook = await actAndFlush(() => renderHook(() => useAlertList(), { wrapper: MockProvider }));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.getItem).toHaveBeenLastCalledWith('aiera:sdk:alertList');
        expect(hook?.result.current.alertList).toEqual(initialAlertList);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() =>
            JSON.stringify({
                events: {
                    ...initialAlertList.events,
                    '2015016': {
                        ticker: 'FB',
                    },
                },
                dates: {
                    ...initialAlertList.dates,
                    '2022-01-05T05:59:00.000-05:00': ['2015016'],
                },
            })
        );
        await actAndFlush(() => {
            hook?.result.current.addAlert('2022-01-05T05:59:00.000-05:00', '2015016', { ticker: 'FB' });
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.setItem).toHaveBeenLastCalledWith(
            'aiera:sdk:alertList',
            JSON.stringify({
                dates: {
                    '2022-01-04T16:30:00.000-05:00': ['2003019'],
                    '2022-01-05T05:59:00.000-05:00': ['2015016'],
                },
                events: {
                    '2003019': {
                        ticker: 'BYND',
                    },
                    '2015016': {
                        ticker: 'FB',
                    },
                },
            })
        );
        expect(hook?.result.current.alertList).toEqual({
            dates: {
                ...initialAlertList.dates,
                '2022-01-05T05:59:00.000-05:00': ['2015016'],
            },
            events: {
                ...initialAlertList.events,
                '2015016': {
                    ticker: 'FB',
                },
            },
        });
    });

    test('remove from alertList', async () => {
        const initialAlertList = {
            dates: {
                '2022-01-04T16:30:00.000-05:00': ['2003019'],
                '2022-01-05T05:59:00.000-05:00': ['2015016'],
            },
            events: {
                '2003019': {
                    ticker: 'FB',
                },
                '2015016': {
                    ticker: 'BYND',
                },
            },
        };
        jest.spyOn(window.localStorage.__proto__, 'getItem');
        jest.spyOn(window.localStorage.__proto__, 'setItem');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() => JSON.stringify(initialAlertList));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.setItem = jest.fn();
        const hook = await actAndFlush(() => renderHook(() => useAlertList(), { wrapper: MockProvider }));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.getItem).toHaveBeenLastCalledWith('aiera:sdk:alertList');
        expect(hook?.result.current.alertList).toEqual(initialAlertList);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        window.localStorage.__proto__.getItem = jest.fn(() =>
            JSON.stringify({
                dates: {
                    '2022-01-04T16:30:00.000-05:00': ['2003019'],
                },
                events: {
                    '2003019': {
                        ticker: 'FB',
                    },
                },
            })
        );
        await actAndFlush(() => {
            hook?.result.current.removeAlert('2022-01-05T05:59:00.000-05:00', '2015016');
        });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(window.localStorage.setItem).toHaveBeenLastCalledWith(
            'aiera:sdk:alertList',
            JSON.stringify({
                dates: {
                    '2022-01-04T16:30:00.000-05:00': ['2003019'],
                },
                events: {
                    '2003019': {
                        ticker: 'FB',
                    },
                },
            })
        );
        expect(hook?.result.current.alertList).toEqual({
            dates: {
                '2022-01-04T16:30:00.000-05:00': ['2003019'],
            },
            events: {
                '2003019': {
                    ticker: 'FB',
                },
            },
        });
    });
});

describe('usePrimaryWatchlistResolver', () => {
    const TestComponent = () => {
        const upsertPrimaryWatchlist = usePrimaryWatchlistResolver();
        useEffect(() => {
            void upsertPrimaryWatchlist(['AAPL', 'NFLX'], 'component-test-user');
        }, []);
        return null;
    };

    test('calls the upsertPrimaryWatchlist mutation', () => {
        const { client } = renderWithProvider(<TestComponent />);
        expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
            input: {
                identifiers: ['AAPL', 'NFLX'],
                creatorUsername: 'component-test-user',
            },
        });
    });
});
