import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Equity, ScheduledAudioCall as Event } from 'types/generated';
import { EventList } from '.';

describe('EventList', () => {
    test('renders an empty state', () => {
        render(<EventList />);
        screen.getByText('No events.');
    });

    test('renders an event list and selects and event on click', () => {
        const onSelectEvent = jest.fn();
        render(
            <EventList
                events={[{ id: '1', title: 'Event Title', equity: { localTicker: 'AIERA' } as Equity } as Event]}
                onSelectEvent={onSelectEvent}
            />
        );
        fireEvent(screen.getByText('AIERA - Event Title'), new MouseEvent('click', { bubbles: true }));
        expect(onSelectEvent).toHaveBeenCalled();
    });
});
