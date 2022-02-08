import React from 'react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import { Checkbox } from '.';

describe('Checkbox', () => {
    const onClick = jest.fn();

    test('renders', () => {
        const { rendered } = renderWithProvider(<Checkbox checked={false} className="checkbox" onClick={onClick} />);
        const checkbox = rendered.container.querySelector('.checkbox');
        expect(checkbox).not.toBeNull();
        if (checkbox) {
            userEvent.click(checkbox);
            expect(onClick).toHaveBeenCalled();
        }
    });

    test('renders checkmark when checked', () => {
        const { rendered } = renderWithProvider(<Checkbox checked className="checkbox" onClick={onClick} />);
        expect(rendered.container.querySelector('.checkbox')).not.toBeNull();
        expect(rendered.container.querySelector('svg')).not.toBeNull();
    });
});
