import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ConnectionType } from './index';

describe('ConnectionType', () => {
    test('renders', () => {
        renderWithProvider(<ConnectionType />);
        screen.getByText('Connection Type');
    });
});
