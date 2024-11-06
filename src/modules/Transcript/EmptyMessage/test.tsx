import React from 'react';
import { screen } from '@testing-library/react';
import { EventConnectionStatus } from '@aiera/client-sdk/types/generated';
import { renderWithProvider } from 'testUtils';
import { EmptyMessage, Event } from '.';

const event = {
    id: '1',
    eventDate: '2021-08-25T18:00:00+00:00',
    title: 'Event Title',
    eventType: 'earnings',
    hasConnectionDetails: true,
    connectionStatus: EventConnectionStatus.Connected,
    isLive: true,
    publishedTranscriptExpected: true,
    firstTranscriptItemStartMs: 0,
    hasTranscript: true,
    hasPublishedTranscript: true,
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
        renderWithProvider(<EmptyMessage event={event as Event} />);
        screen.getByText('Event Title');
    });

    test('EventStatus Connection Not Expected', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.ConnectionNotExpected,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('no connection details');
    });

    test('EventStatus Connection Expected', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.ConnectionExpected,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('connection expected');
    });

    test('EventStatus Waiting to Connect', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.WaitingToConnect,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('waiting for connection');
    });

    test('EventStatus Connected', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.Connected,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('connected');
    });

    test('EventStatus Missed', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.Missed,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('missed');
    });

    test('EventStatus Transcribing', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.Transcribing,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('This message should not appear');
    });

    test('EventStatus Transcribed', () => {
        const testEvent = {
            ...event,
            connectionStatus: EventConnectionStatus.Transcribed,
        };
        renderWithProvider(<EmptyMessage event={testEvent as Event} />);
        screen.getByText('This message should not appear');
    });
});
