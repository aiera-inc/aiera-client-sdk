import React from 'react';
import { BaseBlock, BlockType } from '..';
import { match } from 'ts-pattern';

// Chart series configuration
interface ChartSeries {
    key: string;
    label: string;
    color?: string;
}

// Updated chart metadata types
type ChartMetaBase = {
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

interface AreaChartMeta extends ChartMetaBase {
    chartType: ChartType.area;
    series: ChartSeries[];
    stackedSeries?: boolean;
}

interface LineChartMeta extends ChartMetaBase {
    chartType: ChartType.line;
    series: ChartSeries[];
}

interface BarChartMeta extends ChartMetaBase {
    chartType: ChartType.bar;
    series: ChartSeries[];
    stackedBars?: boolean;
}

interface PieChartMeta extends ChartMetaBase {
    chartType: ChartType.pie;
    valueKey: string; // Which field to use for values
    nameKey: string; // Which field to use for segment names
    colors?: string[]; // Optional array of colors for segments
}

interface ScatterChartMeta extends ChartMetaBase {
    chartType: ChartType.scatter;
    xKey: string; // Field for X coordinates
    yKey: string; // Field for Y coordinates
    sizeKey?: string; // Optional field for point sizes
    nameKey: string; // Field for point labels
    colors?: string[]; // Optional array of colors
}

interface TreeMapMeta extends ChartMetaBase {
    chartType: ChartType.treemap;
    valueKey: string; // Field for box sizes
    nameKey: string; // Field for box labels
    colors?: string[]; // Optional array of colors
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

export function Chart({ meta }: ChartBlock) {
    return match(meta.chartType)
        .with(ChartType.area, () => <div>Area</div>)
        .with(ChartType.bar, () => <div>Bar</div>)
        .with(ChartType.line, () => <div>Line</div>)
        .with(ChartType.pie, () => <div>Pie</div>)
        .with(ChartType.scatter, () => <div>Scatter</div>)
        .with(ChartType.treemap, () => <div>Treemap</div>)
        .exhaustive();
}
