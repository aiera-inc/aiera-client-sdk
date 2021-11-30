import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { fromValue } from 'wonka';
import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { PriceChart } from '.';

const data = {
    events: [
        {
            id: '1',
            quotePrices: [
                {
                    currentDayClosePrice: 576.97,
                    currentDayOpenPrice: 579.84,
                    endPrice: null,
                    id: '1998087:408',
                    previousDayClosePrice: 577.19,
                    quote: {
                        exchange: {
                            id: '133',
                            shortName: 'NYSE',
                        },
                        id: '408',
                        localTicker: 'RH',
                    },
                    startPrice: 641.414,
                    realtimePrices: [
                        {
                            date: '2021-12-08T22:46:28+00:00',
                            id: '-5197890410824443545',
                            price: 631,
                            priceChangeFromStartPercent: -0.0006,
                            priceChangeFromStartValue: -0.415,
                            volume: 1187459,
                            volumeChangeFromLastPercent: 0.0022,
                            volumeChangeFromLastValue: 2548,
                            volumeChangeFromStartPercent: 0.0148,
                            volumeChangeFromStartValue: 17370,
                        },
                        {
                            date: '2021-12-08T22:47:48+00:00',
                            id: '-6197890410824443545',
                            price: 641,
                            priceChangeFromStartPercent: -0.0006,
                            priceChangeFromStartValue: -0.415,
                            volume: 1187459,
                            volumeChangeFromLastPercent: 0.0022,
                            volumeChangeFromLastValue: 2548,
                            volumeChangeFromStartPercent: 0.0148,
                            volumeChangeFromStartValue: 17370,
                        },
                        {
                            date: '2021-12-08T22:48:58+00:00',
                            id: '-7197890410824443545',
                            price: 642,
                            priceChangeFromStartPercent: -0.0006,
                            priceChangeFromStartValue: -0.415,
                            volume: 1187459,
                            volumeChangeFromLastPercent: 0.0022,
                            volumeChangeFromLastValue: 2548,
                            volumeChangeFromStartPercent: 0.0148,
                            volumeChangeFromStartValue: 17370,
                        },
                        {
                            date: '2021-12-08T22:50:58+00:00',
                            id: '-5197890410824443546',
                            price: 641,
                            priceChangeFromStartPercent: -0.0006,
                            priceChangeFromStartValue: -0.415,
                            volume: 1187459,
                            volumeChangeFromLastPercent: 0.0022,
                            volumeChangeFromLastValue: 2548,
                            volumeChangeFromStartPercent: 0.0148,
                            volumeChangeFromStartValue: 17370,
                        },
                    ],
                },
            ],
        },
    ],
};

describe('PriceChart', () => {
    test('renders', async () => {
        const toggle = jest.fn();
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(
                <PriceChart eventId={'1'} headerExpanded={true} priceChartExpanded togglePriceChart={toggle} />,
                {
                    executeQuery: () => fromValue({ data: data }),
                }
            )
        );

        const label = screen.getByTitle('Chevron');
        fireEvent.click(label);
        expect(toggle).toHaveBeenCalledTimes(1);
        expect(rendered.container.querySelector('.highcharts-container')).not.toBeNull();
    });

    test('tab to focus pin', async () => {
        const toggle = jest.fn();
        const { rendered } = await actAndFlush(() =>
            renderWithProvider(
                <PriceChart eventId={'1'} headerExpanded={true} priceChartExpanded togglePriceChart={toggle} />,
                {
                    executeQuery: () => fromValue({ data: data }),
                }
            )
        );

        const pin = rendered.container.querySelector('.price_chart__pin');
        expect(pin).not.toHaveFocus();
        userEvent.tab();
        expect(pin).toHaveFocus();
    });
});
