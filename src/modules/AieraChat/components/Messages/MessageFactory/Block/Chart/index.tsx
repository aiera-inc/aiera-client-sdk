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
    AREA = 'area',
    LINE = 'line',
    BAR = 'bar',
    PIE = 'pie',
    SCATTER = 'scatter',
    TREEMAP = 'treemap',
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
    type: BlockType.CHART;
    data: ChartData[];
    meta: ChartMeta;
}

export function Chart(props: ChartBlock) {
    return match(props.meta.chartType)
        .with(ChartType.AREA, () => <AreaChartBlock {...props} />)
        .with(ChartType.BAR, () => <BarChartBlock {...props} />)
        .with(ChartType.LINE, () => <LineChartBlock {...props} />)
        .with(ChartType.PIE, () => <PieChartBlock {...props} />)
        .with(ChartType.SCATTER, () => <ScatterChartBlock {...props} />)
        .with(ChartType.TREEMAP, () => <TreeMapBlock {...props} />)
        .exhaustive();
}
