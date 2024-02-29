import { RealtimeTranscrippetPrice } from '@aiera/client-sdk/types/generated';
import React, { RefObject } from 'react';

interface LineChartProps {
    data: RealtimeTranscrippetPrice[];
    selectedIndex: number;
    transcrippetRef: RefObject<HTMLDivElement>;
}

export const LineChart = ({ data, selectedIndex, transcrippetRef }: LineChartProps) => {
    const containerWidth = transcrippetRef?.current?.getBoundingClientRect().width;
    if (!containerWidth) return null;
    const selectedItem = data[selectedIndex];

    // Extracting price values from data
    const prices = data.map((item) => item.price);

    // Finding the highest and lowest prices
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculating SVG path data for the line chart
    const width = containerWidth / (prices.length - 1);
    const pathData = prices
        .map((price, index) => `${index * width},${88 - ((price - minPrice) / (maxPrice - minPrice)) * 88 + 12}`)
        .join(' ');

    // Calculating coordinates for the dot at selectedIndex
    const dotX = selectedIndex * width;
    const dotY = selectedItem ? 88 - ((selectedItem.price - minPrice) / (maxPrice - minPrice)) * 88 + 12 : 0;
    return (
        <svg viewBox={`0 0 ${containerWidth} 100`} className="mb-1">
            {/* Rendering the line */}
            <polyline points={pathData} fill="none" stroke="rgba(79, 70, 229, 0.5)" strokeWidth="2" />

            {/* Rendering the dot at selectedIndex */}
            <circle cx={dotX} cy={dotY} r={5} stroke="rgb(225, 29, 72)" strokeWidth={4} fill="white" />

            {/* Rendering text for lowest price */}
            <text
                x={20}
                y={90}
                fill="rgba(71, 85, 105, 0.7)"
                fontWeight="bold"
                fontFamily="monospace"
                fontSize="12px"
            >{`L: $${minPrice.toFixed(2)}`}</text>

            {/* Rendering text for highest price */}
            <text
                x={20}
                y={76}
                fill="rgba(71, 85, 105, 0.7)"
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="12px"
            >{`H: $${maxPrice.toFixed(2)}`}</text>

            {/* Rendering text for price at selectedIndex */}
            {selectedItem && (
                <text
                    x={dotX + 8 > containerWidth ? dotX - 8 : dotX + 8}
                    y={dotY + 14 > 90 ? dotY - 14 : dotY + 14}
                    fill="black"
                    fontWeight="bold"
                    fontSize="14px"
                >{`$${selectedItem.price.toFixed(2)}`}</text>
            )}
        </svg>
    );
};
