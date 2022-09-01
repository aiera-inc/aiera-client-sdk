import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { FormFieldDateInput } from '.';

describe('FormFieldDateInput', () => {
    test('renders', () => {
        renderWithProvider(
            <FormFieldDateInput
                description="Enter the date and time"
                label="Date & time"
                name="form-field-date-input-test"
            />
        );
        screen.getByText('Date & time');
        screen.getByText('Enter the date and time');
    });
});
