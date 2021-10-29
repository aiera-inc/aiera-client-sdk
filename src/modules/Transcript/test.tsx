import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import { fromValue, never } from 'wonka';

import { getByTextWithMarkup, renderWithClient } from '@aiera/client-sdk/testUtils';
import { getQueryNames } from '@aiera/client-sdk/api/client';
import { Transcript } from '.';

describe('Transcript', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders', () => {
        renderWithClient(<Transcript eventId={'1'} />, {
            executeQuery: () =>
                fromValue({
                    data: { events: generateEventTranscripts(['First paragraph']) },
                }),
        });
        screen.getByText('First paragraph');
        screen.getByText('Event Title');
        screen.getByText('TICK');
        screen.getByText('EXCH');
        screen.getByText(/2:00PM 8\/25\/2021$/);
        screen.getByText(/earnings$/);
    });

    test('renders search info', () => {
        renderWithClient(<Transcript eventId={'1'} />, {
            executeQuery: () =>
                fromValue({
                    data: { events: generateEventTranscripts(['First paragraph']) },
                }),
        });
        const searchInput = screen.getByPlaceholderText('Search Transcripts...');
        fireEvent.change(searchInput, { target: { value: 'paragraph' } });
        getByTextWithMarkup('Showing 1 result for "paragraph"');
    });

    test('renders updated paragraphs', () => {
        jest.useFakeTimers();
        // const { source, push } = makeSubject();

        renderWithClient(<Transcript eventId={'1'} />, {
            executeQuery: ({ query }) => {
                const op = getQueryNames(query)[0];
                if (op === 'Transcript') {
                    return fromValue({
                        data: { events: generateEventTranscripts(['First paragraph'], 1, true) },
                    });
                }

                if (op === 'LatestParagraphs') {
                    return fromValue({
                        data: { events: generateLatestParagraphs(['Updated paragraph', 'Latest paragraph'], 1) },
                    });
                }

                return never;
            },
        });
        screen.getByText('First paragraph');

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.queryByText('First paragraph')).toBeNull();
        screen.getByText('Updated paragraph');
        screen.getByText('Latest paragraph');
    });
});

function generateEventTranscripts(sentences: string[], startingIndex = 1, isLive = false) {
    return [
        {
            id: 1,
            eventDate: '2021-08-25T18:00:00+00:00',
            title: 'Event Title',
            eventType: 'earnings',
            isLive,
            primaryCompany: {
                instruments: [
                    {
                        isPrimary: true,
                        quotes: [
                            {
                                isPrimary: true,
                                localTicker: 'TICK',
                                exchange: {
                                    country: { countryCode: 'US' },
                                    shortName: 'EXCH',
                                },
                            },
                        ],
                    },
                ],
            },
            transcripts: [
                {
                    id: '1',
                    sections: [
                        {
                            id: '1',
                            speakerTurns: [
                                {
                                    id: '1',
                                    speaker: {
                                        id: '1',
                                        name: 'Speaker Name',
                                        title: 'Speaker Title',
                                    },
                                    paragraphs: sentences.map((s, idx) => ({
                                        id: String(startingIndex + idx),
                                        timestamp: '',
                                        sentences: [{ id: '1', text: s }],
                                    })),
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
}

function generateLatestParagraphs(sentences: string[], startingIndex = 2) {
    return [
        {
            id: 1,
            transcripts: [
                {
                    id: '1',
                    latestParagraphs: sentences.map((s, idx) => ({
                        id: String(startingIndex + idx),
                        timestamp: '',
                        syncMs: idx * 1000,
                        sentences: [{ id: `p-${idx}-1`, text: s }],
                    })),
                },
            ],
        },
    ];
}
