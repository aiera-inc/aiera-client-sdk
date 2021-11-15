import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromValue } from 'wonka';

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

const companyTwo = {
    id: '2',
    commonName: 'Game',
    instruments: [
        {
            id: '1',
            isPrimary: true,
            quotes: [
                {
                    id: '1',
                    isPrimary: true,
                    localTicker: 'TICLE',
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
        screen.getByText('By Company');
    });

    test('handles loading state', async () => {
        renderWithProvider(<CompanyFilterButton />);
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        screen.getByText('Loading...');
    });

    test('handles no results state', async () => {
        renderWithProvider(<CompanyFilterButton />, {
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
        renderWithProvider(<CompanyFilterButton onChange={onChange} />, {
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

    test('selects company on "enter"', async () => {
        const onChange = jest.fn();
        renderWithProvider(<CompanyFilterButton onChange={onChange} />, {
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
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: company });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('navigates company by keyboard arrow', async () => {
        const onChange = jest.fn();
        renderWithProvider(<CompanyFilterButton onChange={onChange} />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company, companyTwo],
                    },
                }),
        });
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('navigates company by keyboard tab', async () => {
        const onChange = jest.fn();
        renderWithProvider(<CompanyFilterButton onChange={onChange} />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company, companyTwo],
                    },
                }),
        });
        const button = screen.getByText('By Company');
        userEvent.click(button);
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        userEvent.tab();
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
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
