import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { fromValue } from 'wonka';

import { renderWithProvider } from 'testUtils';
import { DownloadTooltip, Event } from '.';

const event = {
    id: '1',
    eventDate: '2021-08-25T18:00:00+00:00',
    title: 'Event Title',
    eventType: 'earnings',
    hasConnectionDetails: true,
    connectionStatus: 'connected',
    isLive: true,
    publishedTranscriptExpected: true,
    hasTranscript: true,
    hasPublishedTranscript: true,
    audioRecordingOffsetMs: 0,
    dialInPin: '232323',
    dialInPhoneNumbers: ['23131232', '213123123'],
    webcastUrls: ['http://www.example.com'],
    audioRecordingUrl: 'http://www.example.com/audio',
    audioProxy: 'http://www.example.com/audio',
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
};

describe('DownloadTooltip', () => {
    test('renders', () => {
        renderWithProvider(<DownloadTooltip event={event as Event} />);
        screen.getByTestId('downloadButton');
    });

    const transcribedEvent = { ...event, connectionStatus: 'transcribed' };

    test('links the transcript PDF with the public api key', async () => {
        renderWithProvider(<DownloadTooltip event={transcribedEvent as Event} />, {
            executeQuery: () => fromValue({ data: { currentUser: { id: 1, apiKeyPublic: 'public-key' } } }),
        });
        fireEvent.click(screen.getByTestId('downloadButton'));
        const link = await screen.findByText('Transcript PDF');
        expect(link.closest('a')).toHaveAttribute(
            'href',
            'https://audio.aiera.com/api/events/1/audio/transcript?api_key=public-key'
        );
    });

    test('omits the transcript PDF when the user has no public api key', async () => {
        renderWithProvider(<DownloadTooltip event={transcribedEvent as Event} />, {
            executeQuery: () => fromValue({ data: { currentUser: { id: 1, apiKeyPublic: null } } }),
        });
        fireEvent.click(screen.getByTestId('downloadButton'));
        await screen.findByText('Download MP3');
        expect(screen.queryByText('Transcript PDF')).toBeNull();
    });
});
