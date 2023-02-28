import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { Aieracast } from '.';

describe('Aieracast', () => {
    test('renders', () => {
        renderWithProvider(<Aieracast />);
        screen.getByText('Earnings');
    });
});
