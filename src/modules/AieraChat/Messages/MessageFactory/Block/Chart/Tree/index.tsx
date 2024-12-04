import React from 'react';
import { Cell, ResponsiveContainer, Treemap } from 'recharts';
import { COLORS, ChartBlock, ChartMetaBase, ChartType } from '..';

export interface TreeMapMeta extends ChartMetaBase {
    chartType: ChartType.treemap;
    valueKey: string; // Field for box sizes
    nameKey: string; // Field for box labels
    colors?: string[]; // Optional array of colors
}

export function TreeMapBlock({ data, meta }: ChartBlock) {
    const { valueKey, nameKey, colors = COLORS } = meta as TreeMapMeta;
    return (
        <ResponsiveContainer width="100%" height={400}>
            <Treemap data={data} dataKey={valueKey} nameKey={nameKey} aspectRatio={4 / 3}>
                {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Treemap>
        </ResponsiveContainer>
    );
}
