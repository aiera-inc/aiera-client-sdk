/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { DocumentNode } from 'graphql';
import { screen, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { getQueryNames } from '@aiera/client-sdk/api/client';
import { MessageBus, Provider } from '@aiera/client-sdk/lib/msg';
import { EventList } from '.';

const EVENT_DATE_TIME = '2021-08-25T18:00:00+00:00';

const eventList = [
    {
        id: '1',
        title: 'Event Title',
        eventDate: EVENT_DATE_TIME,
        eventType: 'earnings',
        externalAudioStreamUrl: 'https://content.knowledgevision.com/index.m3u8',
        liveStreamUrl: 'https://content.knowledgevision.com/index.m3u8',
        primaryCompany: {
            instruments: [
                {
                    isPrimary: true,
                    quotes: [
                        {
                            isPrimary: true,
                            localTicker: 'TICK',
                            exchange: {
                                country: { countryCode: 'US' },
                                shortName: 'EXCH',
                            },
                        },
                    ],
                },
            ],
        },
    },
    {
        id: '2',
        title: 'Event Title 2',
        eventDate: new Date(new Date().getTime() + 3000).toISOString(),
        eventType: 'presentation',
        externalAudioStreamUrl: 'https://content.knowledgevision.com/index.m3u8',
        liveStreamUrl: 'https://content.knowledgevision.com/index.m3u8',
        primaryCompany: {
            instruments: [
                {
                    isPrimary: true,
                    quotes: [
                        {
                            isPrimary: true,
                            localTicker: 'TOCK',
                            exchange: {
                                country: { countryCode: 'USA' },
                                shortName: 'NOPE',
                            },
                        },
                    ],
                },
            ],
        },
    },
].map((event) => ({ id: event.id, numTotalHits: 1, event }));

const eventTranscript = [
    {
        id: 1,
        eventDate: EVENT_DATE_TIME,
        title: 'Event Title',
        eventType: 'earnings',
        primaryCompany: {
            instruments: [
                {
                    isPrimary: true,
                    quotes: [
                        {
                            isPrimary: true,
                            localTicker: 'TICK',
                            exchange: {
                                country: { countryCode: 'US' },
                                shortName: 'EXCH',
                            },
                        },
                    ],
                },
            ],
        },
        transcripts: [
            {
                id: '1',
                sections: [
                    {
                        id: '1',
                        speakerTurns: [
                            {
                                id: '1',
                                speaker: {
                                    id: '1',
                                    name: 'Speaker Name',
                                    title: 'Speaker Title',
                                },
                                paragraphs: [
                                    {
                                        id: '1',
                                        timestamp: '',
                                        sentences: [{ id: '1', text: 'Transcript for 1' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

describe('EventList', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('handles loading state', async () => {
        const { rendered } = await actAndFlush(() => renderWithProvider(<EventList />));
        expect(rendered.container.querySelector('.EventList__loading')).not.toBeNull();
    });

    test('handles empty state', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: 0, hits: [] } },
                        },
                    }),
            })
        );
        screen.getByText('There are no events.');
    });

    test('handles event list', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: eventList.length, hits: eventList } },
                        },
                    }),
            })
        );
        //screen.getByText('Event Title'); would like to add this back as hint
        screen.getByText('TICK');
        screen.getByText('EXCH');
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByText('Aug 25, 2021');
        if (row) within(row).getByText('earnings');
        screen.getByText(
            new Date(EVENT_DATE_TIME)
                .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                .replace(/\s/, '')
        );
    });

    test('handles company selection via message bus', async () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <EventList />
                </Provider>
            );
        };

        const { client } = await actAndFlush(() => renderWithProvider(<TestComponent />));
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'in');
        expect(client.query).toHaveBeenCalled();
    });

    test('handles multiple instruments via message bus', async () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <EventList />
                </Provider>
            );
        };
        const { client } = await actAndFlush(() => renderWithProvider(<TestComponent />));
        await actAndFlush(() => bus.emit('instruments-selected', [{ ticker: 'GME' }, { ticker: 'AAPL' }], 'in'));
        expect(client.query).toHaveBeenCalled();
    });

    test('handles event alert via message bus', async () => {
        const bus = new MessageBus();
        const onAlert = jest.fn();
        bus.on('event-alert', onAlert, 'both');
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <EventList />
                </Provider>
            );
        };

        await actAndFlush(() =>
            renderWithProvider(<TestComponent />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: eventList.length, hits: eventList } },
                        },
                    }),
            })
        );
        await actAndFlush(() => {
            userEvent.click(screen.getByTitle('Bell'));
        });

        await actAndFlush(() => {
            jest.advanceTimersByTime(10000);
        });
        expect(onAlert).toHaveBeenCalled();
    });

    test('renders Calendar when there is no audio url', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: eventList.length, hits: eventList } },
                        },
                    }),
            })
        );
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Calendar');
    });

    test('renders play when there is an live audio url', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: {
                                events: {
                                    numTotalHits: eventList.length,
                                    hits: [
                                        {
                                            ...eventList[0],
                                            event: { ...eventList[0]?.event, isLive: true },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
            })
        );
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Play');
    });

    test('renders play when there is an audio proxy url ', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: {
                                events: {
                                    numTotalHits: eventList.length,
                                    hits: [
                                        {
                                            ...eventList[0],
                                            event: { ...eventList[0]?.event, audioProxy: 'www.audioproxy.com' },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
            })
        );
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Play');
    });

    test('handles selecting an event', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: ({ query }: { query: DocumentNode }) => {
                    const queryName = getQueryNames(query)[0] || '';
                    return ['EventList', 'EventListUpcoming'].includes(queryName)
                        ? fromValue({
                              data: {
                                  search: { events: { numTotalHits: eventList.length, hits: eventList } },
                              },
                          })
                        : fromValue({
                              data: {
                                  events: eventTranscript,
                              },
                          });
                },
            })
        );
        await actAndFlush(() => {
            userEvent.click(screen.getByText('TICK'));
        });
        screen.getByText('Transcript for 1');
    });

    test('handles selecting an event by keyboard', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: ({ query }: { query: DocumentNode }) => {
                    const queryName = getQueryNames(query)[0] || '';
                    return ['EventList', 'EventListUpcoming'].includes(queryName)
                        ? fromValue({
                              data: {
                                  search: { events: { numTotalHits: eventList.length, hits: eventList } },
                              },
                          })
                        : fromValue({
                              data: {
                                  events: eventTranscript,
                              },
                          });
                },
            })
        );
        const eventItem = screen.getByText('TICK');
        if (eventItem.closest('li')) {
            eventItem?.closest('li')?.focus();
        }

        // Select previous item
        userEvent.tab({ shift: true });

        // Select event item
        userEvent.tab();

        await actAndFlush(() => fireEvent.keyDown(document, { key: 'Enter' }));
        screen.getByText('Transcript for 1');
    });

    test('when the event is today, renders time ago', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: {
                                events: {
                                    numTotalHits: 1,
                                    hits: [
                                        {
                                            ...eventList[0],
                                            event: {
                                                ...eventList[0]?.event,
                                                eventDate: new Date(new Date().getTime() - 3600000),
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
            })
        );
        const row = screen.getByText('1 hour ago');
        expect(row).toBeTruthy();
    });
});
