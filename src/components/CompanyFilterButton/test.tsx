import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

import { renderWithClient } from 'testUtils';
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
        renderWithClient(<CompanyFilterButton />);
        screen.getByText('By Company');
    });

    test('handles loading state', async () => {
        renderWithClient(<CompanyFilterButton />);
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        screen.getByText('Loading...');
    });

    test('handles no results state', async () => {
        renderWithClient(<CompanyFilterButton />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [],
                    },
                }),
        });
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        screen.getByText('No results.');
    });

    test('renders companies', async () => {
        const onChange = jest.fn();
        renderWithClient(<CompanyFilterButton onChange={onChange} />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company],
                    },
                }),
        });
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        userEvent.click(screen.getByText('TICK'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: company });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('renders selected company', () => {
        const onChange = jest.fn();
        renderWithClient(<CompanyFilterButton onChange={onChange} value={company} />);
        const button = screen.getByText('TICK');
        screen.getByText('Name');
        screen.getByTitle('Close');
        userEvent.click(button);
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: null });
    });
});
