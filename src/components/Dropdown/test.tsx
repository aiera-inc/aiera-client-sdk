import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { Dropdown } from '.';

describe('Dropdown', () => {
    test('renders', () => {
        renderWithProvider(<Dropdown />);
        screen.getByText('DropdownUI');
    });
});
