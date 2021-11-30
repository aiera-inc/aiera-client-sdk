import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromValue } from 'wonka';

import { ContentType } from '@aiera/client-sdk/types/generated';
import { actAndFlush, getByTextWithMarkup, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Content } from '.';

const content = [
    {
        id: '1',
        body: 'This is a paragraph',
        contentType: 'news',
        primaryCompany: {
            instruments: [
                {
                    isPrimary: true,
                    quotes: [
                        {
                            isPrimary: true,
                            localTicker: 'GME',
                            exchange: {
                                country: { countryCode: 'US' },
                                shortName: 'NYSE',
                            },
                        },
                    ],
                },
            ],
        },
        publishedDate: '2021-11-30T09:00:00+00:00',
        source: 'lexisnexis',
        title: 'Article Title',
    },
];

describe('Content', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders Content', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Content contentId="1" contentType={ContentType.News} onBack={jest.fn()} />, {
                executeQuery: () =>
                    fromValue({
                        data: { content },
                    }),
            })
        );
        screen.getByText('Article Title');
        screen.getByText('GME');
        screen.getByText('NYSE');
        screen.getByText('Nov 30, 2021');
        screen.getByText('lexisnexis');
    });

    test('renders search matches', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Content contentId="1" contentType={ContentType.News} onBack={jest.fn()} />, {
                executeQuery: () =>
                    fromValue({
                        data: { content },
                    }),
            })
        );
        const searchInput = screen.getByPlaceholderText('Search Article...');
        fireEvent.change(searchInput, { target: { value: 'paragraph' } });
        getByTextWithMarkup('Showing 1 result for "paragraph"');
    });
});
