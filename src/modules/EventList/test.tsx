import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { Event } from '@aiera/client-sdk/types/generated';
import { MessageBus, Provider } from '@aiera/client-sdk/msg-bus';
import { EventList, EventListUI } from '.';

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
                        events: [
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
                        ],
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
});
