import React, { ReactElement, useEffect, useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useClient } from 'urql';
import { useQuery } from '@aiera/client-sdk/api/client';
import gql from 'graphql-tag';

import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { QuotePricesQuery, QuotePricesQueryVariables } from '@aiera/client-sdk/types/generated';
import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { TranscriptQuery } from '@aiera/client-sdk/types/generated';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import { Pin } from '@aiera/client-sdk/components/Svg/Pin';
import { PinSolid } from '@aiera/client-sdk/components/Svg/PinSolid';
import { MovementArrow } from '@aiera/client-sdk/components/Svg/MovementArrow';
import './styles.css';

export type Event = TranscriptQuery['events'][0];
interface PriceChartSharedProps {
    //event: Event;
    currentParagraphTimestamp?: string | null;
    endTime?: string | null;
    priceChartExpanded: boolean;
    togglePriceChart: () => void;
    onSeekAudioByDate?: (date: string) => void;
    startTime?: string | null;
}

interface ChartData {
    x: number;
    y: number;
}

/** @notExported */
interface PriceChartUIProps extends PriceChartSharedProps {
    pinned: boolean;
    togglePin: () => void;
    chartData: ChartData[];
    currentPrice: number;
    setPrice: (price: number) => void;
    setFocus: Dispatch<SetStateAction<boolean>>;
}

export function PriceChartUI(props: PriceChartUIProps): ReactElement {
    const {
        endTime,
        togglePin,
        togglePriceChart,
        pinned,
        priceChartExpanded,
        chartData,
        currentPrice,
        currentParagraphTimestamp,
        onSeekAudioByDate,
        setFocus,
        setPrice,
        startTime,
    } = props;
    const price: number = parseFloat(currentPrice?.toFixed(2));
    const originalPrice = chartData[0]?.y || 0;
    const absolutePriceChange: number = parseFloat((price - originalPrice).toFixed(2));
    const percentPriceChange: number = parseFloat(((absolutePriceChange * 100) / originalPrice).toFixed(2));

    const options: Highcharts.Options = {
        chart: {
            backgroundColor: 'transparent',
            type: 'areaspline',
            spacing: [0, 0, 0, 0],
            height: 60,
        },
        time: {
            useUTC: false,
        },
        credits: { enabled: false },
        scrollbar: { enabled: false },
        series: [
            {
                type: 'areaspline',
                threshold: null,
                point: {
                    events: {
                        mouseOver: (e) => {
                            const event = e as unknown as MouseEvent & { target?: { x?: unknown; y?: unknown } };
                            if (event?.target?.x) {
                                const hoverPoint = event.target.x;
                                if (typeof hoverPoint === 'number') {
                                    let epoch = chartData[0]?.x;
                                    let idx = 0;
                                    // eslint-disable-next-line no-plusplus
                                    for (let i = 0; i < chartData.length; i++) {
                                        if (
                                            epoch &&
                                            typeof epoch === 'number' &&
                                            Math.abs(hoverPoint - (chartData[i]?.x || 0)) < Math.abs(hoverPoint - epoch)
                                        ) {
                                            epoch = chartData[i]?.x;
                                            idx = i;
                                        }
                                    }
                                    const newPrice = chartData[idx]?.y;
                                    if (typeof newPrice === 'number') {
                                        setPrice(newPrice);
                                    }
                                }
                            }
                        },
                        click: (e) => {
                            if (onSeekAudioByDate && e?.point?.x) onSeekAudioByDate(`${e?.point?.x}`);
                        },
                        mouseOut: () => {
                            const newPrice = chartData[(chartData || []).length - 1]?.y;
                            if (typeof newPrice === 'number') {
                                setPrice(newPrice);
                            }
                        },
                    },
                },
                data: chartData,
            },
        ],
        navigator: { enabled: false },
        rangeSelector: { enabled: false },
        tooltip: {
            enabled: false,
        },
        plotOptions: {
            areaspline: {
                threshold: null,
                zoneAxis: 'x',
                zones: [
                    ...(startTime
                        ? [
                              {
                                  value: new Date(startTime).getTime(),
                                  color: '#bbc6cf',
                                  fillColor: 'rgba(187, 198, 207, 0.22)',
                              },
                          ]
                        : []),
                    ...(endTime
                        ? [
                              {
                                  value: new Date(endTime).getTime(),
                                  color: absolutePriceChange > 0 ? '#15c13e' : '#d9155c',
                                  fillColor:
                                      absolutePriceChange > 0 ? 'rgba(22, 193, 62, 0.15)' : 'rgba(217, 21, 92, 0.10)',
                              },
                          ]
                        : []),
                    {
                        value: new Date().getTime(),
                        color: '#bbc6cf',
                        fillColor: 'rgba(187, 198, 207, 0.22)',
                    },
                ],
            },
        },
        xAxis: {
            gridLineColor: 'transparent',
            labels: {
                enabled: true,
                style: {
                    fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    color: 'rgb(156, 163, 175)',
                },
            },
            top: -6,
            lineWidth: 0,
            plotLines: [
                {
                    color: 'black',
                    width: 1,
                    dashStyle: 'Dash',
                    value: startTime ? new Date(startTime).getTime() : undefined,
                },
                {
                    color: 'orange',
                    value: currentParagraphTimestamp ? new Date(currentParagraphTimestamp).getTime() : undefined,
                    width: 3,
                },
                {
                    color: 'black',
                    width: 1,
                    dashStyle: 'Dash',
                    value: endTime ? new Date(endTime).getTime() : undefined,
                },
            ],
            tickColor: 'transparent',
            title: {
                text: null,
            },
            type: 'datetime',
            zIndex: 1,
        },
        yAxis: {
            offset: -10,
            endOnTick: true,
            tickPixelInterval: 30,
            showFirstLabel: false,
            maxPadding: 0.1,
            minPadding: 0.28, // Need to have enough space at the bottom to be above the xAxis label, so hover works
            height: 60,
            gridLineColor: 'transparent',
            labels: {
                format: '${value}',
            },
        },
    };

    return (
        <div>
            <div className="flex flex-col justify-start border-t-[1px] border-gray-100 dark:border-bluegray-5">
                <div className="flex items-center justify-start h-10 px-3">
                    <span
                        className="text-sm block font-semibold w-28 mr-1 cursor-pointer dark:text-white"
                        onClick={togglePriceChart}
                    >
                        Price Reaction
                    </span>
                    <span className="flex-1" />
                    <span
                        className={classNames('text-sm flex cursor-pointer mr-4', {
                            'text-green-500': absolutePriceChange > 0,
                            'hover:text-green-600': absolutePriceChange > 0,
                            'active:text-green-800': absolutePriceChange > 0,
                            'text-red-500': absolutePriceChange < 0,
                            'hover:text-red-600': absolutePriceChange < 0,
                            'active:text-red-800': absolutePriceChange < 0,
                        })}
                        onClick={togglePriceChart}
                    >
                        {`$${price.toFixed(2)} ${
                            absolutePriceChange > 0 ? '+' : ''
                        }${absolutePriceChange} (${percentPriceChange}%)`}
                        {absolutePriceChange !== 0 && (
                            <MovementArrow
                                className={classNames('ml-1 w-2', { 'rotate-180': absolutePriceChange < 0 })}
                            />
                        )}
                    </span>
                    <div
                        tabIndex={0}
                        className={classNames(
                            'flex mr-1 cursor-pointer',
                            {
                                'text-blue-600': pinned,
                                'text-gray-400': !pinned,
                                'hover:text-blue-700': pinned,
                                'hover:text-gray-600': !pinned,
                                'active:text-blue-900': pinned,
                                'active:text-gray-900': !pinned,
                            },
                            'price_chart__pin'
                        )}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePin();
                        }}
                        onFocus={() => setFocus?.(true)}
                        onBlur={() => setFocus?.(false)}
                    >
                        {pinned ? <PinSolid className="w-[12px]" /> : <Pin className="w-[12px]" />}
                    </div>
                    <ExpandButton
                        className={classNames('ml-2', {
                            'hover:bg-gray-200': !priceChartExpanded,
                            'hover:bg-blue-700': priceChartExpanded,
                            'active:bg-gray-400': !priceChartExpanded,
                            'active:bg-blue-900': priceChartExpanded,
                        })}
                        onClick={togglePriceChart}
                        expanded={priceChartExpanded}
                    />
                </div>
                {priceChartExpanded && (
                    <div className="overflow-hidden relative">
                        <HighchartsReact options={options} highcharts={Highcharts} constructorType={'stockChart'} />
                    </div>
                )}
            </div>
        </div>
    );
}

/** @notExported */
export interface PriceChartProps extends PriceChartSharedProps {
    eventId: string;
    headerExpanded: boolean;
}

const PriceQuery = gql`
    query QuotePrices($eventId: ID!, $after: DateTime) {
        events(filter: { eventIds: [$eventId] }) {
            id
            quotePrices {
                id
                currentDayClosePrice
                currentDayOpenPrice
                endPrice
                previousDayClosePrice
                quote {
                    id
                    localTicker
                    exchange {
                        id
                        shortName
                    }
                }
                realtimePrices(after: $after) {
                    id
                    date
                    price
                    volume
                    priceChangeFromStartValue
                    priceChangeFromStartPercent
                    volumeChangeFromStartValue
                    volumeChangeFromStartPercent
                    volumeChangeFromLastValue
                    volumeChangeFromLastPercent
                }
                startPrice
            }
        }
    }
`;

function useChartData(eventId: string) {
    const [additionalPrices, setAdditionalPrices] = useState<ChartData[]>([]);
    const [initialPrices, setInitialPrices] = useState<ChartData[]>([]);
    const [startPrice, setStartPrice] = useState(0);
    const client = useClient();
    const initialPriceQuery = useQuery<QuotePricesQuery, QuotePricesQueryVariables>({
        query: PriceQuery,
        requestPolicy: 'network-only',
        variables: {
            eventId,
        },
    });

    useEffect(() => {
        if (initialPriceQuery.status === 'success') {
            setInitialPrices(
                initialPriceQuery?.data?.events?.[0]?.quotePrices?.[0]?.realtimePrices?.map(
                    ({ date, price }: { date: string; price: number }) => ({
                        x: new Date(date).getTime(),
                        y: price,
                    })
                ) || []
            );
            setStartPrice(initialPriceQuery?.data?.events?.[0]?.quotePrices?.[0]?.startPrice || 0);
        }
    }, [initialPriceQuery.status]);

    useInterval(async () => {
        const lastPrice = additionalPrices.length ? additionalPrices.slice(-1)[0] : initialPrices.slice(-1)[0];
        if (lastPrice?.x) {
            const result = await client
                .query<QuotePricesQuery, QuotePricesQueryVariables>(PriceQuery, {
                    eventId,
                    after: String(lastPrice.x),
                })
                .toPromise();
            const newPrices =
                result?.data?.events?.[0]?.quotePrices?.[0]?.realtimePrices?.map(
                    ({ date, price }: { date: string; price: number }) => ({
                        x: new Date(date).getTime(),
                        y: price,
                    })
                ) || [];
            setAdditionalPrices((s): ChartData[] => [...s, ...newPrices]);
        }
    }, 15000);

    return useMemo(
        () => ({
            chartData: [...initialPrices, ...additionalPrices],
            startPrice,
        }),
        [initialPrices, additionalPrices, startPrice]
    );
}

/**
 * Renders PriceChart
 */
export function PriceChart(props: PriceChartProps): ReactElement | null {
    const {
        headerExpanded,
        endTime,
        eventId,
        togglePriceChart,
        priceChartExpanded,
        onSeekAudioByDate,
        currentParagraphTimestamp,
        startTime,
    } = props;
    const { chartData, startPrice } = useChartData(eventId);
    const [pinned, setPinState] = useState(false);
    const [currentPrice, setPrice] = useState(startPrice);
    const [inFocus, setFocus] = useState(false);
    const togglePin = useCallback(() => setPinState(!pinned), [pinned]);

    useWindowListener('keydown', (event: KeyboardEvent) => {
        if (inFocus && event.key === 'Enter') {
            togglePin();
        }
    });

    useEffect(() => {
        setPrice(chartData[chartData.length - 1]?.y || 0);
    }, [chartData.length]);

    if ((!pinned && !headerExpanded) || typeof currentPrice !== 'number' || chartData.length < 2) return null;

    return (
        <PriceChartUI
            endTime={endTime}
            togglePriceChart={togglePriceChart}
            togglePin={togglePin}
            chartData={chartData}
            currentPrice={currentPrice || 0}
            currentParagraphTimestamp={currentParagraphTimestamp}
            setFocus={setFocus}
            setPrice={setPrice}
            startTime={startTime}
            onSeekAudioByDate={onSeekAudioByDate}
            pinned={pinned}
            priceChartExpanded={priceChartExpanded}
        />
    );
}
