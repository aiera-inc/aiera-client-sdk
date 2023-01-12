import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import {
    CONNECTION_TYPE_OPTION_ZOOM,
    ZOOM_MEETING_TYPE_OPTION_WEB,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import { RecordingForm } from '.';

describe('RecordingForm', () => {
    const onBack = jest.fn();

    test('handles back button', () => {
        renderWithProvider(<RecordingForm onBack={onBack} />);
        const backButton = screen.getByText('Events');
        userEvent.click(backButton);
        expect(onBack).toHaveBeenCalled();
    });

    test('renders steps', () => {
        renderWithProvider(<RecordingForm onBack={onBack} />);
        screen.getByText('Step 1 of 5');
    });

    test('handles next step button', async () => {
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
            expect(nextButton).toBeDisabled();
            // Fill out required fields
            await waitFor(() => userEvent.click(screen.getByText(ZOOM_MEETING_TYPE_OPTION_WEB.label)));
            const meetingUrlInput = screen.getByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5');
            await waitFor(() =>
                fireEvent.change(meetingUrlInput, { target: { value: 'https://zoom.us/j/8881234567' } })
            );
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 3 of 5');
            screen.getByText('Troubleshooting');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Now')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 4 of 5');
            screen.getByText('Recording Details');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Do nothing')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 5 of 5');
            screen.getByText('Create Recording');
            expect(nextButton).toBeDisabled();
            const titleInput = rendered.container.querySelector('input[name="title"]');
            if (titleInput) {
                await waitFor(() => fireEvent.change(titleInput, { target: { value: 'test' } }));
            }
            expect(nextButton).not.toBeDisabled();
        }
    });

    test('handles previous step button', async () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(nextButton).not.toBeNull();
        expect(rendered.container.querySelector('.prev-step')).toBeNull();
        expect(nextButton).toBeDisabled();
        // Click through and fill out required fields to get to last step
        userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
        if (nextButton) {
            userEvent.click(nextButton);
            screen.getByText('Step 2 of 5');
            screen.getByText('Scheduling');
            expect(nextButton).toBeDisabled();
            // Fill out required fields
            await waitFor(() => userEvent.click(screen.getByText(ZOOM_MEETING_TYPE_OPTION_WEB.label)));
            const meetingUrlInput = screen.getByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5');
            await waitFor(() =>
                fireEvent.change(meetingUrlInput, { target: { value: 'https://zoom.us/j/8881234567' } })
            );
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 3 of 5');
            screen.getByText('Troubleshooting');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Now')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 4 of 5');
            screen.getByText('Recording Details');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Do nothing')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            screen.getByText('Step 5 of 5');
            screen.getByText('Create Recording');
            expect(nextButton).toBeDisabled();
            const titleInput = rendered.container.querySelector('input[name="title"]');
            if (titleInput) {
                await waitFor(() => fireEvent.change(titleInput, { target: { value: 'test' } }));
            }
            expect(nextButton).not.toBeDisabled();
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

    test('renders sub-module for step', async () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(rendered.container.querySelector('.connection-type')).not.toBeNull();
        if (nextButton) {
            // Select an option to enable the next button
            userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.connection-details')).not.toBeNull();
            screen.getByText('Step 2 of 5');
            screen.getByText('Scheduling');
            expect(nextButton).toBeDisabled();
            // Fill out required fields
            await waitFor(() => userEvent.click(screen.getByText(ZOOM_MEETING_TYPE_OPTION_WEB.label)));
            const meetingUrlInput = screen.getByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5');
            await waitFor(() =>
                fireEvent.change(meetingUrlInput, { target: { value: 'https://zoom.us/j/8881234567' } })
            );
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.scheduling')).not.toBeNull();
            screen.getByText('Step 3 of 5');
            screen.getByText('Troubleshooting');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Now')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.troubleshooting')).not.toBeNull();
            screen.getByText('Step 4 of 5');
            screen.getByText('Recording Details');
            expect(nextButton).toBeDisabled();
            await waitFor(() => userEvent.click(screen.getByText('Do nothing')));
            expect(nextButton).not.toBeDisabled();
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.recording-details')).not.toBeNull();
            screen.getByText('Step 5 of 5');
            screen.getByText('Create Recording');
            expect(nextButton).toBeDisabled();
            const titleInput = rendered.container.querySelector('input[name="title"]');
            if (titleInput) {
                await waitFor(() => fireEvent.change(titleInput, { target: { value: 'test' } }));
            }
            expect(nextButton).not.toBeDisabled();
        }
    });

    test('when there are errors, hovering over the button should show a tooltip', async () => {
        const { rendered } = renderWithProvider(<RecordingForm onBack={onBack} />);
        const nextButton = rendered.container.querySelector('.next-step');
        expect(rendered.container.querySelector('.connection-type')).not.toBeNull();
        if (nextButton) {
            // Select an option to enable the next button
            userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label));
            userEvent.click(nextButton);
            expect(rendered.container.querySelector('.connection-details')).not.toBeNull();
            screen.getByText('Step 2 of 5');
            screen.getByText('Scheduling');
            expect(nextButton).toBeDisabled();
            // Fill out required fields
            await waitFor(() => userEvent.click(screen.getByText(ZOOM_MEETING_TYPE_OPTION_WEB.label)));
            screen.getByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5');
            await waitFor(() => {
                fireEvent.mouseEnter(nextButton);
                screen.getByText('Required: URL');
            });
        }
    });

    test('clicking ok in the has changes confirm dialog should call onBack', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm');
        const onBack = jest.fn();
        confirmSpy.mockImplementation(jest.fn(() => true));
        renderWithProvider(<RecordingForm onBack={onBack} />);
        await waitFor(() => userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label)));
        const backButton = screen.getByText('Events');
        userEvent.click(backButton);
        expect(onBack).toHaveBeenCalled();
        confirmSpy.mockReset();
    });

    test('clicking cancel in the has changes confirm dialog should not call onBack', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm');
        const onBack = jest.fn();
        confirmSpy.mockImplementation(jest.fn(() => false));
        renderWithProvider(<RecordingForm onBack={onBack} />);
        await waitFor(() => userEvent.click(screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label)));
        const backButton = screen.getByText('Events');
        userEvent.click(backButton);
        expect(onBack).not.toHaveBeenCalled();
        confirmSpy.mockReset();
    });
});
