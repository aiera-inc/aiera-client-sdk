import React from 'react';

export interface ChartBlockProps {
    type: 'line' | 'bar' | 'pie' | 'scatter';
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
    }[];
    title?: string;
    axes?: {
        x?: { label: string };
        y?: { label: string };
    };
}

export function ChartBlock() {
    return <div>Chart block</div>;
}
