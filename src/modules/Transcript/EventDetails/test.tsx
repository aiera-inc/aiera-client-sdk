import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

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

describe('EventDetails', () => {
    test('renders', () => {
        const toggle = jest.fn();
        renderWithProvider(<EventDetails event={event as Event} eventDetailsExpanded toggleEventDetails={toggle} />);
        const eventDetails = screen.getByText('Event Details');
        fireEvent.click(eventDetails);
        screen.getByText('Open in new window');
        expect(toggle).toHaveBeenCalledTimes(1);
    });
});
