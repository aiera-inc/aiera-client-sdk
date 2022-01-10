import React from 'react';
import { act, screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { TimeAgo } from '.';

describe('TimeAgo', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('renders', () => {
        const date = new Date();
        renderWithProvider(<TimeAgo date={date} />);
        screen.getByText('just now');
        renderWithProvider(<TimeAgo date={new Date(date.getTime() + 150000)} />); // 2.5 minutes from now
        screen.getByText('in 2 minutes');
        renderWithProvider(<TimeAgo date={new Date(date.getTime() + 3610000)} />); // 1 hour from now
        screen.getByText('in 1 hour');
    });

    test('when realtime is true, it automatically updates the date', () => {
        const date = new Date(new Date().getTime() - 50000); // 50 seconds ago
        renderWithProvider(<TimeAgo date={date} realtime />);
        screen.getByText('50 seconds ago');
        act(() => {
            jest.advanceTimersByTime(1000); // fast-forward 1 second
        });
        screen.getByText('51 seconds ago');
    });
});
