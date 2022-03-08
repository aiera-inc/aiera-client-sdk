import React from 'react';

import { renderWithProvider } from 'testUtils';
import { FormField } from '.';

describe('FormField', () => {
    test('renders', () => {
        const { rendered } = renderWithProvider(<FormField />);
        expect(rendered.container.querySelector('.form-field')).toBeInTheDocument();
    });
});
