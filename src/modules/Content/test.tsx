import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromValue } from 'wonka';

import { CONTENT_SOURCE_LABELS } from '@aiera/client-sdk/lib/data';
import { actAndFlush, getByTextWithMarkup, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ContentSource, ContentType } from '@aiera/client-sdk/types/generated';
import { Content } from '.';

const content = [
    {
        id: '1',
        body: '<p>This is a paragraph</p>',
        contentType: ContentType.News,
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
        source: ContentSource.Lexisnexis,
        title: 'Article Title',
    },
];
const contentWithBodyMarkup = [
    {
        ...content[0],
        id: '2',
        body: `
            <p>Hello World!</p>
            <p>This is a paragraph.</p>
            <p>This is a paragraph with <span>markup</span></p>
        `,
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
        screen.getByText(CONTENT_SOURCE_LABELS[ContentSource.Lexisnexis]);
    });

    test('renders search matches', async () => {
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(<Content contentId="1" contentType={ContentType.News} onBack={jest.fn()} />, {
                executeQuery: () =>
                    fromValue({
                        data: { content },
                    }),
            })
        );
        expect(rendered.container.querySelector('.input__search')).not.toBeNull();
        const searchInput = screen.getByPlaceholderText('Search Article...');
        fireEvent.change(searchInput, { target: { value: 'paragraph' } });
        getByTextWithMarkup('Showing 1 result for "paragraph"');
        // When there's a search term but no matches, the body should not have any highlighted text
        fireEvent.change(searchInput, { target: { value: 'fitler' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).toBeNull();
        // When there's a search term and at least one match, the body should have highlighted text
        fireEvent.change(searchInput, { target: { value: 'this' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).not.toBeNull();
        // When there's no search term, the body should not have any highlighted text
        fireEvent.change(searchInput, { target: { value: '' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).toBeNull();
    });

    test('renders body with markup and search highlights', async () => {
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(<Content contentId="2" contentType={ContentType.News} onBack={jest.fn()} />, {
                executeQuery: () =>
                    fromValue({
                        data: { content: contentWithBodyMarkup },
                    }),
            })
        );
        const searchInput = screen.getByPlaceholderText('Search Article...');
        fireEvent.change(searchInput, { target: { value: 'markup' } });
        getByTextWithMarkup('Showing 1 result for "markup"');
        const span = screen.getByText('markup', { selector: 'span' });
        expect(span).toBeTruthy();
        expect(rendered.container.querySelector('.bg-yellow-300')).not.toBeNull();
        // Matches inside html tags should be ignored
        fireEvent.change(searchInput, { target: { value: 'span' } });
        expect(rendered.container.querySelector('.bg-yellow-300')).toBeNull();
    });

    test('renders Content without search', async () => {
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(<Content contentId="1" contentType={ContentType.Spotlight} onBack={jest.fn()} />, {
                executeQuery: () =>
                    fromValue({
                        data: { content },
                    }),
            })
        );
        expect(rendered.container.querySelector('.input__search')).toBeNull();
    });
});
