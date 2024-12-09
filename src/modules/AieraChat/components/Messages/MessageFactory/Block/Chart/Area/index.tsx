import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS, ChartBlock, ChartMetaBase, ChartSeries, ChartType } from '..';

export interface AreaChartMeta extends ChartMetaBase {
    chartType: ChartType.AREA;
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
                <YAxis label={yAxis ? { value: yAxis, angle: -90, position: 'insideLeft' } : undefined} />
                <Tooltip />
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    height={36}
                    margin={{ top: 10, bottom: 0 }}
                />
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
