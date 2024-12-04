import React from 'react';
import { match } from 'ts-pattern';
import { BaseBlock, BlockType } from '..';
import { AreaChartBlock, AreaChartMeta } from './Area';
import { BarChartBlock, BarChartMeta } from './Bar';
import { LineChartBlock, LineChartMeta } from './Line';
import { PieChartBlock, PieChartMeta } from './Pie';
import { ScatterChartBlock, ScatterChartMeta } from './Scatter';
import { TreeMapBlock, TreeMapMeta } from './Tree';

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

// Chart series configuration
export interface ChartSeries {
    key: string;
    label: string;
    color?: string;
}

// Updated chart metadata types
export type ChartMetaBase = {
    title?: string;
    xAxis?: string;
    yAxis?: string;
};

export enum ChartType {
    area = 'area',
    line = 'line',
    bar = 'bar',
    pie = 'pie',
    scatter = 'scatter',
    treemap = 'treemap',
}

// Common chart data type
type ChartData = {
    name: string;
    value: number;
    [key: string]: string | number; // Additional properties for different chart types
};

type ChartMeta = AreaChartMeta | LineChartMeta | BarChartMeta | PieChartMeta | ScatterChartMeta | TreeMapMeta;

// Updated chart block type
export interface ChartBlock extends BaseBlock {
    type: BlockType.chart;
    data: ChartData[];
    meta: ChartMeta;
}

export function Chart(props: ChartBlock) {
    return match(props.meta.chartType)
        .with(ChartType.area, () => <AreaChartBlock {...props} />)
        .with(ChartType.bar, () => <BarChartBlock {...props} />)
        .with(ChartType.line, () => <LineChartBlock {...props} />)
        .with(ChartType.pie, () => <PieChartBlock {...props} />)
        .with(ChartType.scatter, () => <ScatterChartBlock {...props} />)
        .with(ChartType.treemap, () => <TreeMapBlock {...props} />)
        .exhaustive();
}
