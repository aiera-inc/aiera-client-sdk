import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS, ChartBlock, ChartMetaBase, ChartSeries, ChartType } from '..';

export interface BarChartMeta extends ChartMetaBase {
    chartType: ChartType.BAR;
    series: ChartSeries[];
    stackedBars?: boolean;
}

export function BarChartBlock({ data, meta }: ChartBlock) {
    const { series, stackedBars, xAxis, yAxis } = meta as BarChartMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" label={xAxis ? { value: xAxis, position: 'bottom' } : undefined} />
                <YAxis label={yAxis ? { value: yAxis, angle: -90, position: 'left' } : undefined} />
                <Tooltip />
                <Legend />
                {series.map((s, index) => (
                    <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label}
                        stackId={stackedBars ? 'stack' : undefined}
                        fill={s.color || COLORS[index % COLORS.length]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}
