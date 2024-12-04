import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS, ChartBlock, ChartMetaBase, ChartSeries, ChartType } from '..';

export interface AreaChartMeta extends ChartMetaBase {
    chartType: ChartType.area;
    series: ChartSeries[];
    stackedSeries?: boolean;
}

export function AreaChartBlock({ data, meta }: ChartBlock) {
    const { series, stackedSeries, xAxis, yAxis } = meta as AreaChartMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" label={xAxis ? { value: xAxis, position: 'bottom' } : undefined} />
                <YAxis label={yAxis ? { value: yAxis, angle: -90, position: 'left' } : undefined} />
                <Tooltip />
                <Legend />
                {series.map((s, index) => (
                    <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stackId={stackedSeries ? 'stack' : undefined}
                        fill={s.color || COLORS[index % COLORS.length]}
                        stroke={s.color || COLORS[index % COLORS.length]}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
