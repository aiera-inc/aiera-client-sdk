import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { actAndFlush, renderWithProvider } from 'testUtils';
import { SettingsButton } from '.';

describe('SettingsButton', () => {
    test('renders', async () => {
        const { rendered } = renderWithProvider(<SettingsButton />);
        const button = rendered.container.querySelector('.settings_button');
        if (button) fireEvent.click(button);
        await waitFor(() => screen.getByText('Widget Settings'));
    });

    test('has a toggle which will change on click', async () => {
        const { rendered } = renderWithProvider(<SettingsButton />);
        const button = rendered.container.querySelector('.settings_button');
        if (button) fireEvent.click(button);
        await waitFor(() => screen.getByText('Widget Settings'));
        const toggle = rendered.container.querySelectorAll('.toggle')[0] as HTMLInputElement;
        expect(toggle.checked).toEqual(true);
        await actAndFlush(() => {
            fireEvent.click(toggle);
        });
        expect(toggle.checked).toEqual(false);
    });
});
