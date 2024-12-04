import React from 'react';
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartMetaBase, ChartType, ChartBlock, COLORS } from '..';

export interface ScatterChartMeta extends ChartMetaBase {
    chartType: ChartType.scatter;
    xKey: string; // Field for X coordinates
    yKey: string; // Field for Y coordinates
    sizeKey?: string; // Optional field for point sizes
    nameKey: string; // Field for point labels
    colors?: string[]; // Optional array of colors
}

export function ScatterChartBlock({ data, meta }: ChartBlock) {
    const { xKey, yKey, sizeKey, nameKey, colors = COLORS, xAxis, yAxis } = meta as ScatterChartMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} name={xAxis} />
                <YAxis dataKey={yKey} name={yAxis} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name={nameKey} data={data} fill={colors[0]} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}
