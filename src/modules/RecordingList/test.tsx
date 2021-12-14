import React from 'react';
import { screen } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithProvider } from 'testUtils';
import { RecordingList } from '.';

describe('RecordingList', () => {
    test('renders new recording button', () => {
        renderWithProvider(<RecordingList />);
        screen.getByText('+ Schedule Recording');
    });

    test('handles loading state', () => {
        const { rendered } = renderWithProvider(<RecordingList />);
        expect(rendered.container.querySelector('.RecordingList__loading')).not.toBeNull();
    });

    test('handles empty state', () => {
        renderWithProvider(<RecordingList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: [],
                    },
                }),
        });
        screen.getByText('There are no recordings.');
    });
});
