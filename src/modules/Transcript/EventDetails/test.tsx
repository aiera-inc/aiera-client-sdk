import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromValue } from 'wonka';

import { renderWithProvider } from 'testUtils';
import { EventDetails, Event } from '.';

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
    attachments: [{ mimeType: 'application/pdf', title: 'Slides', archivedUrl: '' }],
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

const onToggleReport = jest.fn();

describe('EventDetails', () => {
    test('renders', () => {
        const toggle = jest.fn();
        renderWithProvider(
            <EventDetails
                event={event as Event}
                eventDetailsExpanded
                toggleEventDetails={toggle}
                toggleReportIssueModal={onToggleReport}
            />
        );
        const eventDetails = screen.getByText('Event Details');
        fireEvent.click(eventDetails);
        screen.getByText('Open in new window');
        expect(toggle).toHaveBeenCalledTimes(1);
    });

    const transcribedEvent = { ...event, connectionStatus: 'transcribed', attachments: [] };

    function renderDetails(apiKeyPublic: string | null) {
        return renderWithProvider(
            <EventDetails
                event={transcribedEvent as unknown as Event}
                eventDetailsExpanded
                toggleEventDetails={jest.fn()}
                toggleReportIssueModal={onToggleReport}
            />,
            {
                executeQuery: () => fromValue({ data: { currentUser: { id: 1, apiKeyPublic } } }),
            }
        );
    }

    test('links the transcript PDF with the public api key', () => {
        renderDetails('public-key');
        expect(screen.getByText('Download PDF').closest('a')).toHaveAttribute(
            'href',
            'https://audio.aiera.com/api/events/1/audio/transcript?api_key=public-key'
        );
    });

    test('omits the transcript PDF when the user has no public api key', () => {
        renderDetails(null);
        expect(screen.queryByText('Download PDF')).toBeNull();
    });
});
