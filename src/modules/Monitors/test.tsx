import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { Monitors } from '.';

describe('Monitors', () => {
    test('renders', () => {
        renderWithProvider(<Monitors />);
        screen.getByText('MonitorsUI');
    });
});
