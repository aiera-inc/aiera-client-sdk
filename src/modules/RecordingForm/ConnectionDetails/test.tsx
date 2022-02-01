import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ConnectionDetails } from './index';

describe('ConnectionDetails', () => {
    test('renders', () => {
        renderWithProvider(<ConnectionDetails />);
        screen.getByText('Configure Connection');
    });
});
