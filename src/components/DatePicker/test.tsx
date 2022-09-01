import React from 'react';

import { renderWithProvider } from 'testUtils';
import { DatePicker } from '.';

describe('DatePicker', () => {
    test('renders react-calendar', () => {
        const { rendered } = renderWithProvider(<DatePicker name="date-picker-test" />);
        expect(rendered.container.querySelector('.react-calendar')).toBeInTheDocument();
    });
});
