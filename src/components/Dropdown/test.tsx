import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProvider } from 'testUtils';
import { Dropdown } from '.';

describe('Dropdown', () => {
    const onChange = jest.fn();
    const options = [
        { label: 'Option 1', value: 1 },
        { label: 'Option 2', value: 2 },
        { label: 'Option 3', value: 3 },
    ];

    test('renders', () => {
        const { rendered } = renderWithProvider(<Dropdown options={options} onChange={onChange} value={1} />);
        expect(rendered.container.querySelector('svg')).toBeInTheDocument();
        screen.getByText('Option 1');
    });

    test('when tooltip is hidden, do not show options', () => {
        const { rendered } = renderWithProvider(<Dropdown options={options} onChange={onChange} value={1} />);
        expect(rendered.container.querySelector('svg')).toBeInTheDocument();
        expect(rendered.container.querySelector('.dropdown-menu')).toBeNull();
        screen.getByText('Option 1');
        expect(screen.queryByText('Option 2')).toBeNull();
        expect(screen.queryByText('Option 3')).toBeNull();
    });

    test('when tooltip is visible, show options', async () => {
        const { rendered } = renderWithProvider(<Dropdown options={options} onChange={onChange} value={2} />);
        expect(rendered.container.querySelector('svg')).toBeInTheDocument();
        screen.getByText('Option 2');
        expect(screen.queryByText('Option 1')).toBeNull();
        expect(screen.queryByText('Option 3')).toBeNull();
        const selected = rendered.container.querySelector('.dropdown');
        if (selected) {
            userEvent.click(selected);
        }
        await waitFor(() => expect(rendered.container.querySelector('.dropdown-menu')).toBeInTheDocument());
        screen.getByText('Option 1');
        screen.getByText('Option 3');
    });

    test('can select option with keyboard', async () => {
        const { rendered } = renderWithProvider(<Dropdown options={options} onChange={onChange} value={1} />);
        expect(rendered.container.querySelector('svg')).toBeInTheDocument();
        screen.getByText('Option 1');
        expect(screen.queryByText('Option 2')).toBeNull();
        expect(screen.queryByText('Option 3')).toBeNull();
        const selected = rendered.container.querySelector('.dropdown');
        if (selected) {
            userEvent.click(selected);
        }
        await waitFor(() => expect(rendered.container.querySelector('.dropdown-menu')).toBeInTheDocument());
        screen.getByText('Option 2');
        screen.getByText('Option 3');
        if (selected) {
            fireEvent.keyDown(selected, { key: 'ArrowDown' });
            fireEvent.keyDown(selected, { key: 'Enter' });
        }
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: 2 });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(rendered.container.querySelector('.dropdown-menu')).toBeNull());
    });
});
