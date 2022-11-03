import React from 'react';
import { fromValue } from 'wonka';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
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

    test('renders', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} />);
        screen.getByPlaceholderText('Search...');
    });

    test('handles loading state', () => {
        const onChangeSearchTerm = jest.fn();
        const { rerender } = renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} />);
        const input = screen.getByPlaceholderText('Search...');
        expect(screen.queryByText('Loading...')).toBeNull();
        userEvent.type(input, 'Goo');
        expect(onChangeSearchTerm).toHaveBeenNthCalledWith(1, expect.anything(), {
            name: 'company-select__search',
            value: 'G',
        });
        expect(onChangeSearchTerm).toHaveBeenNthCalledWith(2, expect.anything(), {
            name: 'company-select__search',
            value: 'o',
        });
        expect(onChangeSearchTerm).toHaveBeenNthCalledWith(3, expect.anything(), {
            name: 'company-select__search',
            value: 'o',
        });
        rerender(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="Goo" />);
        screen.getByText('Loading...');
    });

    test('handles empty state', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="Goo" />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        companies: [],
                    },
                }),
        });
        screen.getByText('No results.');
    });

    test('handles error state', () => {
        renderWithProvider(<CompanySelect onChangeSearchTerm={onChangeSearchTerm} searchTerm="Goo" />, {
            executeQuery: () => fromValue({ error: 'error' }),
        });
        screen.getByText('There was an error searching.');
    });

    test('renders companies', () => {
        const onChange = jest.fn();
        renderWithProvider(
            <CompanySelect onChange={onChange} onChangeSearchTerm={onChangeSearchTerm} searchTerm="tic" />,
            {
                executeQuery: () =>
                    fromValue({
                        data: {
                            companies: [company, companyTwo],
                        },
                    }),
            }
        );
        userEvent.click(screen.getByText('TICK'));
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: company });
    });

    test('selects company on "enter"', async () => {
        const onChange = jest.fn();
        renderWithProvider(
            <CompanySelect onChange={onChange} onChangeSearchTerm={onChangeSearchTerm} searchTerm="tic" />,
            {
                executeQuery: () =>
                    fromValue({
                        data: {
                            companies: [company],
                        },
                    }),
            }
        );
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: company });
    });

    test('navigates company by keyboard arrow', async () => {
        const onChange = jest.fn();
        renderWithProvider(
            <CompanySelect onChange={onChange} onChangeSearchTerm={onChangeSearchTerm} searchTerm="tic" />,
            {
                executeQuery: () =>
                    fromValue({
                        data: {
                            companies: [company, companyTwo],
                        },
                    }),
            }
        );
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
    });

    test('navigates company by keyboard tab', async () => {
        const onChange = jest.fn();
        renderWithProvider(
            <CompanySelect onChange={onChange} onChangeSearchTerm={onChangeSearchTerm} searchTerm="tic" />,
            {
                executeQuery: () =>
                    fromValue({
                        data: {
                            companies: [company, companyTwo],
                        },
                    }),
            }
        );
        const input = await waitFor(() => screen.getByPlaceholderText('Search...'));
        userEvent.tab();
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(expect.anything(), { value: companyTwo });
    });
});
