import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { CompanySelect } from '.';

describe('CompanySelect', () => {
    test('renders', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={jest.fn()} />);
        screen.getByPlaceholderText('Search...');
        screen.getByText('Type to search...');
    });
});
