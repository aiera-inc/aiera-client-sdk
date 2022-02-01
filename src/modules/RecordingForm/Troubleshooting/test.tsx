import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Troubleshooting } from './index';

describe('Troubleshooting', () => {
    test('renders', () => {
        renderWithProvider(<Troubleshooting />);
        screen.getByText('Troubleshooting');
    });
});
