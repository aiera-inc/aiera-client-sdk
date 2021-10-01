import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { Transcript, TranscriptUI } from '.';

describe('TranscriptUI', () => {
    test('renders UI', () => {
        render(
            <TranscriptUI
                toggleHeader={() => true}
                headerExpanded={true}
                paragraphs={[{ id: '1', sentences: [{ id: '1', text: 'TranscriptUI' }] }]}
            />
        );
        screen.getByText('TranscriptUI');
    });
});

describe('Transcript', () => {
    test('renders', () => {
        renderWithClient(<Transcript eventId={'1'} />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        events: [
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
                        ],
                    },
                }),
        });
        screen.getByText('Transcript for 1');
        screen.getByText('Event Title');
        screen.getByText('TICK');
        screen.getByText('EXCH');
        screen.getByText(/2:00PM 8\/25\/2021$/);
        screen.getByText(/earnings$/);
    });
});
