import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProvider } from 'testUtils';
import { CalendarTooltip, Event } from '.';

const event = {
    id: '1',
    eventDate: '2021-08-25T18:00:00+00:00',
    title: 'Event Title',
    eventType: 'earnings',
    hasConnectionDetails: true,
    connectionStatus: 'connection_expected',
    isLive: false,
    publishedTranscriptExpected: true,
    hasTranscript: false,
    hasPublishedTranscript: false,
    audioRecordingOffsetMs: 0,
    dialInPin: '232323',
    dialInPhoneNumbers: ['23131232', '213123123'],
    webcastUrls: ['http://www.example.com'],
    primaryCompany: {
        commonName: 'Example Corp',
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

describe('CalendarTooltip', () => {
    test('renders', () => {
        renderWithProvider(<CalendarTooltip event={event as Event} />);
        screen.getByText('Add to your calendar');
    });
});
