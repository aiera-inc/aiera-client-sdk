import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithClient } from 'testUtils';
import { EmptyMessage, Event } from '.';

const event = {
    id: '1',
    eventDate: '2021-08-25T18:00:00+00:00',
    title: 'Event Title',
    eventType: 'earnings',
    hasConnectionDetails: true,
    isLive: true,
    expectPublishedTranscript: true,
    hasTranscript: true,
    hasPublishedTranscript: true,
    audioRecordingOffsetMs: 0,
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

describe('EmptyMessage', () => {
    test('renders', () => {
        renderWithClient(<EmptyMessage event={event as Event} />);
        screen.getByText('Event Title');
    });

    /*
    test('EventStatus Connection Not Expected', () => {
        renderWithClient(
            <EmptyMessage event={event as Event} eventStatus={'connection_not_expected' as EventStatus} />
        );
        screen.getByText('no connection details');
    });

    test('EventStatus Connection Expected', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'connection_expected' as EventStatus} />);
        screen.getByText('connection expected');
    });

    test('EventStatus Waiting to Connect', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'waiting_to_connect' as EventStatus} />);
        screen.getByText('waiting for connection');
    });

    test('EventStatus Connected', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'connected' as EventStatus} />);
        screen.getByText('connected');
    });

    test('EventStatus Missed', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'missed' as EventStatus} />);
        screen.getByText('missed');
    });

    test('EventStatus Transcribing', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'transcribing' as EventStatus} />);
        screen.getByText('This message should not appear');
    });

    test('EventStatus Transcribed', () => {
        renderWithClient(<EmptyMessage event={event as Event} eventStatus={'transcribed' as EventStatus} />);
        screen.getByText('This message should not appear');
    });
     */
});
