import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS, ChartBlock, ChartMetaBase, ChartType } from '..';

export interface PieChartMeta extends ChartMetaBase {
    chartType: ChartType.pie;
    valueKey: string; // Which field to use for values
    nameKey: string; // Which field to use for segment names
    colors?: string[]; // Optional array of colors for segments
}

export function PieChartBlock({ data, meta }: ChartBlock) {
    const { valueKey, nameKey, colors = COLORS, title } = meta as PieChartMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" label>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
