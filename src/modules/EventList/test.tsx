import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithClient } from 'testUtils';
import { Event } from 'types/generated';
import { EventList, EventListUI } from '.';

describe('EventListUI', () => {
    test('renders a loading state', () => {
        render(<EventListUI loading />);
        screen.getByText('Loading...');
    });

    test('renders an empty state', () => {
        render(<EventListUI />);
        screen.getByText('No events.');
    });

    test('renders an event list and selects and event on click', () => {
        const onSelectEvent = jest.fn();
        render(<EventListUI events={[{ id: '1', title: 'Event Title' } as Event]} onSelectEvent={onSelectEvent} />);
        fireEvent(screen.getByText('Event Title'), new MouseEvent('click', { bubbles: true }));
        expect(onSelectEvent).toHaveBeenCalled();
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
                        events: [{ id: '1', title: 'Event Title', eventType: 'earnings', eventDate: '' }],
                    },
                }),
        });
        screen.getByText('Event Title');
        screen.getByText(/earnings$/);
    });
});
