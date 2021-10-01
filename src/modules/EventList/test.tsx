/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { DocumentNode } from 'graphql';
import { fireEvent, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { Event } from '@aiera/client-sdk/types/generated';
import { MessageBus, Provider } from '@aiera/client-sdk/lib/msg';
import { EventList, EventListUI } from '.';

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

describe('EventListUI', () => {
    test('renders a loading state', () => {
        renderWithClient(<EventListUI loading />);
        screen.getByText('Loading...');
    });

    test('renders an empty state', () => {
        renderWithClient(<EventListUI />);
        screen.getByText('No events.');
    });

    test('renders an event list and selects and event on click', () => {
        const onSelectEvent = jest.fn();
        const event = { id: '1', title: 'Event Title' } as Event;
        renderWithClient(<EventListUI events={[event]} onSelectEvent={onSelectEvent} />);
        fireEvent(screen.getByText('Event Title'), new MouseEvent('click', { bubbles: true }));
        expect(onSelectEvent).toHaveBeenCalledWith(expect.anything(), { value: event });
    });
});

describe('EventList', () => {
    test('handles loading state', () => {
        renderWithClient(<EventList />);
        screen.getByText('Loading...');
    });

    test('handles empty state', () => {
        renderWithClient(<EventList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: [],
                    },
                }),
        });
        screen.getByText('No events.');
    });

    test('handles event list', () => {
        renderWithClient(<EventList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: eventList,
                    },
                }),
        });
        screen.getByText('Event Title');
        screen.getByText('TICK');
        screen.getByText('EXCH');
        screen.getByText('Aug 25');
        screen.getByText('2:00PM 2021');
        screen.getByText(/earnings$/);
    });

    test('handles company selection via message bus', () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <EventList />
                </Provider>
            );
        };

        const { client } = renderWithClient(<TestComponent />);
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'in');
        expect(client.query).toHaveBeenCalled();
    });

    test('renders calendar when there is no audio url', () => {
        renderWithClient(<EventList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: eventList,
                    },
                }),
        });
        const row = screen.getByText('Event Title').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Calendar');
    });

    test('renders play when there is an audio url', () => {
        renderWithClient(<EventList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: [{ ...eventList[0], audioRecordingUrl: 'mp3!' }],
                    },
                }),
        });
        const row = screen.getByText('Event Title').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByTitle('Play');
    });

    test('handles selecting an event', () => {
        renderWithClient(<EventList />, {
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
        });
        userEvent.click(screen.getByText('Event Title'));
        screen.getByText('Transcript for 1');
    });
});
