import React from 'react';

export interface TableBlockProps {
    headers: CellType[];
    rows: TableRow[];
}

export interface TableRow {
    cells: CellType[];
}

interface CellValue {
    value: string | number;
    alignment: 'left' | 'right';
    truncate?: boolean;
    // format / formatter
}

type CellType = string | number | CellValue;

export function TableBlock() {
    return <div>Table block</div>;
}
