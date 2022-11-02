import React from 'react';
import { fromValue } from 'wonka';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from 'testUtils';
import { CompanySelect } from '.';

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

describe('CompanySelect', () => {
    const onChangeSearchTerm = jest.fn();
    const searchTerm = 'test';

    test('renders', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} />);
        screen.getByPlaceholderText('Search...');
        screen.getByText('Type to search...');
    });

    test('handles loading state', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm={searchTerm} />);
        const input = screen.getByPlaceholderText('Search...');
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        screen.getByText('Loading...');
    });

    test('handles no results state', async () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [],
                    },
                }),
        });
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        screen.getByText('No results.');
    });

    test('renders companies', async () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="test" />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company],
                    },
                }),
        });
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        userEvent.click(screen.getByText('TICK'));
        expect(onChangeSearchTerm).toHaveBeenCalledWith(expect.anything(), { value: company });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('selects company on "enter"', async () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="test" />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company],
                    },
                }),
        });
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChangeSearchTerm).toHaveBeenCalledWith(expect.anything(), { value: company });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('navigates company by keyboard arrow', async () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="test" />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company, companyTwo],
                    },
                }),
        });
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChangeSearchTerm).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('navigates company by keyboard tab', async () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="test" />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [company, companyTwo],
                    },
                }),
        });
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'tic');
        userEvent.tab();
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChangeSearchTerm).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
        // Make sure the tooltip is hidden after the onchange
        await waitFor(() => expect(screen.queryByPlaceholderText('Search...')).toBeNull());
    });

    test('renders selected company', () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="tick" value={company} />);
        const button = screen.getByText('TICK');
        screen.getByText('Name');
        screen.getByTitle('Close');
        userEvent.click(button);
        expect(onChangeSearchTerm).toHaveBeenCalledWith(expect.anything(), { value: null });
    });
});
