import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProvider } from 'testUtils';
import { Header, EventQuery } from '.';

const eventQuery = {
    data: {
        events: [
            {
                audioRecordingOffsetMs: 0,
                audioRecordingUrl:
                    'https://s3.amazonaws.com/content.aiera.co/assets/1928914_7ffa48726bfc4e2e9dd639312955bc8d_transcribed_audio.mp3',
                attachments: [{ mimeType: 'application/pdf', title: 'Slides', archivedUrl: '' }],
                connectionStatus: 'transcribed',
                dialInPhoneNumbers: [],
                dialInPin: null,
                eventDate: '2021-10-22T18:00:00+00:00',
                eventType: 'shareholder_meeting',
                hasConnectionDetails: true,
                hasPublishedTranscript: false,
                hasTranscript: true,
                id: '1928914',
                isLive: false,
                primaryCompany: {
                    id: '609',
                    commonName: 'Verb Technology Company Inc',
                    instruments: [
                        {
                            id: '604',
                            isPrimary: true,
                            quotes: [
                                {
                                    exchange: {
                                        country: {
                                            countryCode: 'US',
                                            id: 'US',
                                        },
                                        id: '121',
                                        shortName: 'NASDAQ',
                                    },
                                    id: '605',
                                    isPrimary: true,
                                    localTicker: 'VERB',
                                },
                            ],
                        },
                    ],
                    __typename: 'Company',
                },
                publishedTranscriptExpected: false,
                transcripts: [],
                title: 'Verb Technology Company Inc Annual Shareholders Meeting',
                webcastUrls: ['http://www.virtualshareholdermeeting.com/VERB2021'],
            },
        ],
    },
    refetch: jest.fn(),
    state: {
        data: { events: [] },
        error: undefined,
        extensions: undefined,
        fetching: false,
        stale: false,
    },
    status: 'success',
};

function onToggleReport() {
    return null;
}

describe('Header', () => {
    const onBack = jest.fn();

    test('renders', () => {
        renderWithProvider(
            <Header
                containerHeight={500}
                eventId="1928914"
                eventQuery={eventQuery as EventQuery}
                onBack={onBack}
                onBackHeader="Events"
                useConfigOptions={false}
                toggleReportIssueModal={onToggleReport}
            />
        );
        screen.getByText('VERB');
    });

    test('back function is called', () => {
        const onBack = jest.fn();
        renderWithProvider(
            <Header
                containerHeight={500}
                eventId="1928914"
                eventQuery={eventQuery as EventQuery}
                onBack={onBack}
                onBackHeader="Events"
                useConfigOptions={false}
                toggleReportIssueModal={onToggleReport}
            />
        );
        const eventsBtn = screen.getByText('Events');
        fireEvent.click(eventsBtn);
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    test('renders specified text for onBack button', () => {
        renderWithProvider(
            <Header
                containerHeight={500}
                eventId="1928914"
                eventQuery={eventQuery as EventQuery}
                onBack={onBack}
                onBackHeader="Recordings"
                useConfigOptions={false}
                toggleReportIssueModal={onToggleReport}
            />
        );
        screen.getByText('Recordings');
    });

    test('renders search term and fires search change events', () => {
        const onChangeSearchTerm = jest.fn();
        renderWithProvider(
            <Header
                containerHeight={500}
                eventId="1928914"
                eventQuery={eventQuery as EventQuery}
                onBackHeader="Events"
                onChangeSearchTerm={onChangeSearchTerm}
                searchTerm={'test search'}
                useConfigOptions={false}
                toggleReportIssueModal={onToggleReport}
            />
        );
        const searchInput = screen.getByPlaceholderText('Search Transcript...');
        expect((searchInput as HTMLInputElement).value).toBe('test search');
        fireEvent.change(searchInput, { target: { value: 'new search' } });
        expect(onChangeSearchTerm).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ value: 'new search' })
        );
    });
});
