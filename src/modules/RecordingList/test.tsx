import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

import { renderWithProvider } from 'testUtils';
import { RecordingList } from '.';

describe('RecordingList', () => {
    test('handles loading state', () => {
        const { rendered } = renderWithProvider(<RecordingList />);
        expect(rendered.container.querySelector('.RecordingList__loading')).not.toBeNull();
    });

    test('handles empty state', () => {
        renderWithProvider(<RecordingList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        customEvents: [],
                    },
                }),
        });
        screen.getByText('There are no recordings.');
    });

    test('handles showing form', () => {
        const { rendered } = renderWithProvider(<RecordingList />);
        const showFormButton = screen.getByText('Schedule Recording');
        userEvent.click(showFormButton);
        expect(rendered.container.querySelector('.recording-form')).not.toBeNull();
    });
});
