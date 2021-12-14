/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { DocumentNode } from 'graphql';
import { screen, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { MessageBus, Provider } from '@aiera/client-sdk/lib/msg';
import { EventList } from '.';

const eventList = [
    {
        id: '1',
        title: 'Event Title',
        eventType: 'earnings',
        eventDate: '2021-08-25T18:00:00+00:00',
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
];

const eventTranscript = [
    {
        id: 1,
        eventDate: '2021-08-25T18:00:00+00:00',
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
                            events: [],
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
                            events: eventList,
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
        screen.getByText('2:00PM');
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

    test('renders Calendar when there is no audio url', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            events: eventList,
                        },
                    }),
            })
        );
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Calendar');
    });

    test('renders play when there is an audio url', async () => {
        await actAndFlush(() =>
            renderWithProvider(<EventList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            events: [{ ...eventList[0], audioRecordingUrl: 'mp3!' }],
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
                    // @ts-ignore
                    const queryName = query?.definitions[0]?.name as string;
                    return queryName === 'EventList'
                        ? fromValue({
                              data: {
                                  events: eventList,
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
                    // @ts-ignore
                    const queryName = query?.definitions[0]?.name as string;
                    return queryName === 'EventList'
                        ? fromValue({
                              data: {
                                  events: eventList,
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
});
