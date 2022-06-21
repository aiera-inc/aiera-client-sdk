import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react';
import { fromValue, never } from 'wonka';

import { actAndFlush, getByTextWithMarkup, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { getQueryNames } from '@aiera/client-sdk/api/client';
import { Transcript } from '.';

const EVENT_DATE_TIME = '2021-08-25T18:00:00+00:00';

describe('Transcript', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
                executeQuery: () =>
                    fromValue({
                        data: { events: generateEventTranscripts(['First paragraph']) },
                    }),
            })
        );
        screen.getByText('First paragraph');
        screen.getByText('Event Title');
        screen.getByText('TICK');
        screen.getByText('EXCH');
        screen.getByText(
            new RegExp(
                `${new Date(EVENT_DATE_TIME)
                    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    .replace(/\s/, '')} 8/25/2021$`
            )
        );
        screen.getByText(/earnings$/);
    });

    test('renders search info', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
                executeQuery: () =>
                    fromValue({
                        data: { events: generateEventTranscripts(['First paragraph']) },
                    }),
            })
        );
        const searchInput = screen.getByPlaceholderText('Search Transcript...');
        fireEvent.change(searchInput, { target: { value: 'paragraph' } });
        getByTextWithMarkup('Showing 1 result for "paragraph"');
    });

    test('renders positive sentiment', async () => {
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
                executeQuery: () =>
                    fromValue({
                        data: { events: generateEventTranscripts(['First paragraph'], 1, false, 'positive') },
                    }),
            })
        );

        expect(rendered.container.querySelector('.text-green-600')).not.toBeNull();
    });

    test('renders negative sentiment', async () => {
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
                executeQuery: () =>
                    fromValue({
                        data: { events: generateEventTranscripts(['First paragraph'], 1, false, 'negative') },
                    }),
            })
        );

        expect(rendered.container.querySelector('.text-red-600')).not.toBeNull();
    });

    test('renders updated paragraphs', async () => {
        const { realtime } = await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
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
            })
        );
        screen.getByText('First paragraph');

        act(() => {
            realtime.trigger('scheduled_audio_call_1_events_changes', 'modified');
        });

        expect(screen.queryByText('First paragraph')).toBeNull();
        screen.getByText('Updated paragraph');
        screen.getByText('Latest paragraph');
    });

    test('renders partials', async () => {
        const { realtime } = await actAndFlush(() =>
            renderWithProvider(<Transcript eventId={'1'} />, {
                executeQuery: ({ query }) => {
                    const op = getQueryNames(query)[0];
                    if (op === 'Transcript') {
                        return fromValue({
                            data: { events: generateEventTranscripts(['First paragraph'], 1, true) },
                        });
                    }

                    if (op === 'LatestParagraphs') {
                        return fromValue({
                            data: { events: generateLatestParagraphs(['Latest paragraph']) },
                        });
                    }

                    return never;
                },
            })
        );
        expect(screen.queryByText('First paragraph')).toBeTruthy();

        act(() => {
            realtime.trigger('scheduled_audio_call_1_events_changes', 'partial_transcript', {
                pretty_transcript: 'Partial 2',
                index: 2,
            });
        });
        expect(screen.queryByText('Partial 2')).toBeTruthy();

        // We shouldn't render a partial with a lower index
        act(() => {
            realtime.trigger('scheduled_audio_call_1_events_changes', 'partial_transcript', {
                pretty_transcript: 'Partial 1',
                index: 1,
            });
        });
        expect(screen.queryByText('Partial 2')).toBeTruthy();
        expect(screen.queryByText('Partial 1')).toBeNull();

        // When we clear the partial, it should stay on the screen until we actually get new
        // paragraphs from the server
        act(() => {
            realtime.trigger('scheduled_audio_call_1_events_changes', 'partial_transcript_clear', {
                index: 2,
            });
        });
        expect(screen.queryByText('Partial 2')).toBeTruthy();

        act(() => {
            realtime.trigger('scheduled_audio_call_1_events_changes', 'modified');
        });

        expect(screen.queryByText('First paragraph')).toBeTruthy();
        expect(screen.queryByText('Latest paragraph')).toBeTruthy();
        expect(screen.queryByText('Partial 2')).toBeNull();
    });
});

function generateEventTranscripts(sentences: string[], startingIndex = 1, isLive = false, sentiment = 'positive') {
    return [
        {
            id: 1,
            eventDate: EVENT_DATE_TIME,
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
                                        sentences: [
                                            {
                                                id: '1',
                                                text: s,
                                                sentiment: {
                                                    id: '21',
                                                    textual: {
                                                        id: '42',
                                                        basicSentiment: sentiment,
                                                        overThreshold: true,
                                                    },
                                                },
                                            },
                                        ],
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
