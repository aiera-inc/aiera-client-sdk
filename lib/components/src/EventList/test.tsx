import React from 'react';
import { render, screen } from '@testing-library/react';
import { EventList } from '.';

describe('EventList', () => {
    test('renders an empty state', () => {
        render(<EventList />);
        screen.getByText('No events.');
    });

    test('renders an empty state', () => {
        render(<EventList events={[{ id: '1', title: 'Event Title', ticker: 'AIERA' }]} />);
        screen.getByText('AIERA - Event Title');
    });
});
