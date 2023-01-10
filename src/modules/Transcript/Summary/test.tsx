import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { Summary } from '.';

describe('Summary', () => {
    test('renders', () => {
        const toggle = jest.fn();
        renderWithProvider(<Summary toggleSummary={toggle} summaryExpanded />);
        screen.getByText('Automated Summary');
    });
});
