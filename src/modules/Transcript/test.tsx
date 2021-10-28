import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromValue } from 'wonka';

import { getByTextWithMarkup, renderWithClient } from '@aiera/client-sdk/testUtils';
import { Transcript } from '.';

const events = [
    {
        id: 1,
        eventDate: '2021-08-25T18:00:00+00:00',
        title: 'Event Title',
        eventType: 'earnings',
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
                                paragraphs: [
                                    {
                                        id: '1',
                                        timestamp: '',
                                        sentences: [{ id: '1', text: 'Transcript for 1' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

describe('Transcript', () => {
    test('renders', () => {
        renderWithClient(<Transcript eventId={'1'} />, {
            executeQuery: () =>
                fromValue({
                    data: { events },
                }),
        });
        screen.getByText('Transcript for 1');
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
                    data: { events },
                }),
        });
        const searchInput = screen.getByPlaceholderText('Search Transcripts...');
        fireEvent.change(searchInput, { target: { value: 'for' } });
        getByTextWithMarkup('Showing 1 result for "for"');
    });
});
