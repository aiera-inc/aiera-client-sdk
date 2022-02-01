import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Scheduling } from './index';

describe('Scheduling', () => {
    test('renders', () => {
        renderWithProvider(<Scheduling />);
        screen.getByText('Scheduling');
    });
});
