import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from 'testUtils';
import '@testing-library/jest-dom/extend-expect';
import { PriceChart } from '.';

/*
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
    };*/

describe('PriceChart', () => {
    test('renders', () => {
        const toggle = jest.fn();
        const { rendered } = renderWithProvider(
            <PriceChart headerExpanded={true} priceChartExpanded togglePriceChart={toggle} />
        );
        const label = screen.getByText('Price Reaction');
        fireEvent.click(label);
        expect(rendered.container.querySelector('.highcharts-container')).not.toBeNull();
        expect(toggle).toHaveBeenCalledTimes(1);
    });
});
