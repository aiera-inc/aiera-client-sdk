import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import { CONNECTION_TYPE_OPTION_ZOOM } from '@aiera/client-sdk/modules/RecordingForm';
import { RecordingForm } from '.';

describe('RecordingForm', () => {
    const onBack = jest.fn();

    test('handles back button', () => {
        renderWithProvider(<RecordingForm onBack={onBack} />);
        const backButton = screen.getByText('Recordings');
        userEvent.click(backButton);
        expect(onBack).toHaveBeenCalled();
    });

    test('renders steps', () => {
        renderWithProvider(<RecordingForm onBack={onBack} />);
        screen.getByText('Step 1 of 5');
    });

    test('handles next step button', () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(nextButton).not.toBeNull();
        expect(nextButton).toBeDisabled();
        // Select an option to enable the next button
        userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
        expect(nextButton).not.toBeDisabled();
        if (nextButton) {
            userEvent.click(nextButton);
            screen.getByText('Step 2 of 5');
            screen.getByText('Scheduling');
            userEvent.click(nextButton);
            screen.getByText('Step 3 of 5');
            screen.getByText('Troubleshooting');
            userEvent.click(nextButton);
            screen.getByText('Step 4 of 5');
            screen.getByText('Recording Details');
            userEvent.click(nextButton);
            screen.getByText('Step 5 of 5');
            screen.getByText('Create Recording');
        }
    });

    test('handles previous step button', () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(nextButton).not.toBeNull();
        expect(rendered.container.querySelector('.prev-step')).toBeNull();
        // Click the next step button 4 times to get to last step
        if (nextButton) {
            // Select an option to enable the next button
            userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
            userEvent.click(nextButton);
            userEvent.click(nextButton);
            userEvent.click(nextButton);
            userEvent.click(nextButton);
            screen.getByText('Step 5 of 5');
            screen.getByText('Troubleshooting');
        }
        // Click the previous step button until first step
        const prevButton = rendered.container.querySelector('.prev-step');
        expect(prevButton).not.toBeNull();
        if (prevButton) {
            userEvent.click(prevButton);
            screen.getByText('Step 4 of 5');
            screen.getByText('Scheduling');
            userEvent.click(prevButton);
            screen.getByText('Step 3 of 5');
            screen.getByText('Change Configuration');
            userEvent.click(prevButton);
            screen.getByText('Step 2 of 5');
            screen.getByText('Change Connection');
            userEvent.click(prevButton);
            screen.getByText('Step 1 of 5');
            expect(rendered.container.querySelector('.prev-step')).toBeNull();
        }
    });

    test('renders sub-module for step', () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(rendered.container.querySelector('.connection-type')).not.toBeNull();
        if (nextButton) {
            // Select an option to enable the next button
            userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.connection-details')).not.toBeNull();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.scheduling')).not.toBeNull();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.troubleshooting')).not.toBeNull();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.recording-details')).not.toBeNull();
        }
    });
});
