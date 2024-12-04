import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartMetaBase, ChartType, ChartSeries, ChartBlock, COLORS } from '..';

export interface LineChartMeta extends ChartMetaBase {
    chartType: ChartType.line;
    series: ChartSeries[];
}

export function LineChartBlock({ data, meta }: ChartBlock) {
    const { series, xAxis, yAxis } = meta as LineChartMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" label={xAxis ? { value: xAxis, position: 'bottom' } : undefined} />
                <YAxis label={yAxis ? { value: yAxis, angle: -90, position: 'left' } : undefined} />
                <Tooltip />
                <Legend />
                {series.map((s, index) => (
                    <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={s.color || COLORS[index % COLORS.length]}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
