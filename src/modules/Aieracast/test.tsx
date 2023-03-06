import React from 'react';
import { within } from '@testing-library/dom';
import { screen } from '@testing-library/react';
import { fromValue } from 'wonka';

import { actAndFlush, renderWithProvider } from 'testUtils';
import { Aieracast } from '.';

const EVENT_DATE_TIME = '2021-08-25T18:00:00+00:00';

const eventList = [
    {
        id: '1',
        title: 'Event Title',
        eventType: 'earnings',
        eventDate: EVENT_DATE_TIME,
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
    },
    {
        id: '2',
        title: 'Event Title 2',
        eventType: 'presentation',
        eventDate: new Date(new Date().getTime() + 3000).toISOString(),
        primaryCompany: {
            instruments: [
                {
                    isPrimary: true,
                    quotes: [
                        {
                            isPrimary: true,
                            localTicker: 'TOCK',
                            exchange: {
                                country: { countryCode: 'USA' },
                                shortName: 'NOPE',
                            },
                        },
                    ],
                },
            ],
        },
    },
].map((event) => ({ id: event.id, numTotalHits: 1, event }));

describe('Aieracast', () => {
    test('renders', async () => {
        const { rendered } = await actAndFlush(() => renderWithProvider(<Aieracast />));
        expect(rendered.container.getElementsByClassName('aieracast').length).toBeGreaterThan(0);
    });

    test('handles empty state', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Aieracast />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: 0, hits: [] } },
                        },
                    }),
            })
        );
        screen.getByText('Select events from the left sidebar');
    });

    test('handles event list', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Aieracast />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: { events: { numTotalHits: eventList.length, hits: eventList } },
                        },
                    }),
            })
        );
        screen.getByText('TICK');
        screen.getByText('EXCH');
        const row = screen.getByText('TICK').closest('li');
        expect(row).toBeTruthy();
        if (row) within(row).getByText('Aug 25, 2021');
        if (row) within(row).getByText('earnings');
        screen.getByText(
            new Date(EVENT_DATE_TIME)
                .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                .replace(/\s/, '')
        );
    });
});
