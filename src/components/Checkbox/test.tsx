import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import { Checkbox } from '.';

describe('Checkbox', () => {
    const onChange = jest.fn();

    test('renders', () => {
        const { rendered } = renderWithProvider(<Checkbox checked={false} className="checkbox" onChange={onChange} />);
        const checkbox = rendered.container.querySelector('.checkbox');
        expect(checkbox).not.toBeNull();
        if (checkbox) {
            userEvent.click(checkbox);
            expect(onChange).toHaveBeenCalled();
        }
    });

    test('renders checkmark when checked', () => {
        const { rendered } = renderWithProvider(<Checkbox checked className="checkbox" onChange={onChange} />);
        expect(rendered.container.querySelector('.checkbox')).not.toBeNull();
        expect(rendered.container.querySelector('svg')).not.toBeNull();
    });

    test('renders label when provided', () => {
        renderWithProvider(<Checkbox checked label="Test 123" onChange={onChange} />);
        screen.getByText('Test 123');
    });

    test('when kind is checkbox, renders checkbox border style', () => {
        const { rendered } = renderWithProvider(<Checkbox checked label="Test 123" onChange={onChange} />);
        expect(rendered.container.getElementsByClassName('rounded-sm').length).toBe(1);
    });

    test('when kind is radio, renders radio border style', () => {
        const { rendered } = renderWithProvider(<Checkbox checked kind="radio" label="Test 123" onChange={onChange} />);
        expect(rendered.container.getElementsByClassName('rounded-xl').length).toBe(1);
    });

    test('when not checked and required, render error styles', () => {
        const { rendered } = renderWithProvider(
            <Checkbox checked={false} label="Test 123" onChange={onChange} required />
        );
        expect(rendered.container.getElementsByClassName('border-red-600').length).toBe(1);
        expect(rendered.container.getElementsByClassName('text-red-600').length).toBe(1);
    });

    test('when checked and required, do not render error styles', () => {
        const { rendered } = renderWithProvider(<Checkbox checked label="Test 123" onChange={onChange} required />);
        expect(rendered.container.getElementsByClassName('border-red-600').length).toBe(0);
        expect(rendered.container.getElementsByClassName('text-red-600').length).toBe(0);
    });
});
