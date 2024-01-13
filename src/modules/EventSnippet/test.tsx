import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { EventSnippet } from '.';

describe('EventSnippet', () => {
    test('renders', () => {
        renderWithProvider(<EventSnippet />);
        screen.getByText('AIERA');
    });
});
