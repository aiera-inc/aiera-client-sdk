import React, { ReactElement, useState, useCallback } from 'react';
import classNames from 'classnames';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { TranscriptQuery } from '@aiera/client-sdk/types/generated';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import { Pin } from '@aiera/client-sdk/components/Svg/Pin';
import { PinSolid } from '@aiera/client-sdk/components/Svg/PinSolid';
import { MovementArrow } from '@aiera/client-sdk/components/Svg/MovementArrow';
import './styles.css';

export type Event = TranscriptQuery['events'][0];
interface PriceChartSharedProps {
    //event: Event;
    priceChartExpanded: boolean;
    togglePriceChart: () => void;
}

/** @notExported */
interface PriceChartUIProps extends PriceChartSharedProps {
    pinned: boolean;
    togglePin: () => void;
    currentPrice: number;
    setPrice: (price: number) => void;
}

function addMin(min: number): number {
    return 1635266013785 + 60000 * min;
}

const chartData: { x: number; y: number }[] = [
    {
        x: addMin(1),
        y: 76.32,
    },
    {
        x: addMin(2),
        y: 74.3,
    },
    {
        x: addMin(3),
        y: 73.3,
    },
    {
        x: addMin(4),
        y: 76.8,
    },
    {
        x: addMin(5),
        y: 76.5,
    },
    {
        x: addMin(6),
        y: 74.54,
    },
    {
        x: addMin(7),
        y: 76.75,
    },
    {
        x: addMin(8),
        y: 77.32,
    },
    {
        x: addMin(9),
        y: 75.23,
    },
    {
        x: addMin(10),
        y: 76.42,
    },
    {
        x: addMin(11),
        y: 78.43,
    },
    {
        x: addMin(12),
        y: 79.64,
    },
    {
        x: addMin(13),
        y: 82.32,
    },
    {
        x: addMin(14),
        y: 75.23,
    },
    {
        x: addMin(15),
        y: 74.42,
    },
    {
        x: addMin(16),
        y: 79.43,
    },
    {
        x: addMin(17),
        y: 76.64,
    },
    {
        x: addMin(18),
        y: 82.32,
    },
    {
        x: addMin(19),
        y: 84.42,
    },
    {
        x: addMin(20),
        y: 89.76,
    },
];

export function PriceChartUI(props: PriceChartUIProps): ReactElement {
    const { togglePin, togglePriceChart, pinned, priceChartExpanded, currentPrice, setPrice } = props;
    const price: number = parseFloat(currentPrice?.toFixed(2));
    const originalPrice = 75.32;
    const absolutePriceChange: number = parseFloat((price - originalPrice).toFixed(2));
    const percentPriceChange: number = parseFloat(((absolutePriceChange * 100) / originalPrice).toFixed(2));

    const options: Highcharts.Options = {
        chart: {
            type: 'areaspline',
            spacing: [0, 0, 0, 0],
            height: 60,
        },
        credits: { enabled: false },
        scrollbar: { enabled: false },
        series: [
            {
                type: 'areaspline',
                fillColor: 'rgb(135, 206, 235, 0.08)',
                lineColor: '#0094FF',
                shadow: {
                    color: '#C1DFF0',
                    opacity: 0.3,
                    offsetY: 2,
                    width: 5,
                },
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
                    color: 'orange',
                    value: 1635267129890,
                    width: 3,
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
            maxPadding: 0.0,
            minPadding: 0.21, // Need to have enough space at the bottom to be above the xAxis label, so hover works
            height: 60,
            gridLineColor: 'transparent',
            labels: {
                format: '${value}',
            },
        },
    };

    return (
        <div>
            <div className="flex flex-col justify-start border-t-[1px] border-gray-100">
                <div className="flex items-center justify-start h-10 px-3">
                    <span className="text-sm block font-semibold w-28 mr-1 cursor-pointer" onClick={togglePriceChart}>
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
                        {`$${price} ${
                            absolutePriceChange > 0 ? '+' : ''
                        }${absolutePriceChange} (${percentPriceChange}%)`}
                        <MovementArrow className={classNames('ml-1 w-2', { 'rotate-180': absolutePriceChange < 0 })} />
                    </span>
                    <div
                        className={classNames('flex mr-1 cursor-pointer', {
                            'text-blue-600': pinned,
                            'text-gray-400': !pinned,
                            'hover:text-blue-700': pinned,
                            'hover:text-gray-600': !pinned,
                            'active:text-blue-900': pinned,
                            'active:text-gray-900': !pinned,
                        })}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePin();
                        }}
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
    headerExpanded: boolean;
}

/**
 * Renders PriceChart
 */
export function PriceChart(props: PriceChartProps): ReactElement | null {
    const { headerExpanded, togglePriceChart, priceChartExpanded } = props;
    const [pinned, setPinState] = useState(false);
    const [currentPrice, setPrice] = useState(chartData[chartData.length - 1]?.y);
    const togglePin = useCallback(() => setPinState(!pinned), [pinned]);

    if ((!pinned && !headerExpanded) || typeof currentPrice !== 'number') return null;

    return (
        <PriceChartUI
            togglePriceChart={togglePriceChart}
            togglePin={togglePin}
            currentPrice={currentPrice || 0}
            setPrice={setPrice}
            pinned={pinned}
            priceChartExpanded={priceChartExpanded}
        />
    );
}
