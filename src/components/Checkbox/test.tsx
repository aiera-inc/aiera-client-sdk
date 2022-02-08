import React from 'react';
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
});
