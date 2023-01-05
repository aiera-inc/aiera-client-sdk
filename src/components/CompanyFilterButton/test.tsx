import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import { CompanyFilterButton } from '.';

const company = {
    id: '1',
    commonName: 'Name',
    instruments: [
        {
            id: '1',
            isPrimary: true,
            quotes: [
                {
                    id: '1',
                    isPrimary: true,
                    localTicker: 'TICK',
                    exchange: {
                        id: '1',
                        country: { id: '1', countryCode: 'US' },
                        shortName: 'EXCH',
                    },
                },
            ],
        },
    ],
};

describe('CompanyFilterButton', () => {
    test('handles default state', () => {
        renderWithProvider(<CompanyFilterButton />);
        screen.getByText('Company');
    });

    test('renders company select', async () => {
        renderWithProvider(<CompanyFilterButton />);
        const button = screen.getByText('Company');
        userEvent.click(button);
        await waitFor(() => screen.getByPlaceholderText('Search...'));
    });

    test('renders selected company', () => {
        const onChange = jest.fn();
        renderWithProvider(<CompanyFilterButton onChange={onChange} value={company} />);
        const button = screen.getByText('TICK');
        screen.getByText('Name');
        screen.getByTitle('Close');
        userEvent.click(button);
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: null });
    });
});
