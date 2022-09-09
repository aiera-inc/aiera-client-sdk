import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { PhoneNumberInput } from '.';

describe('PhoneNumberInput', () => {
    test('renders', () => {
        renderWithProvider(<PhoneNumberInput />);
        screen.getByText('PhoneNumberInputUI');
    });
});
