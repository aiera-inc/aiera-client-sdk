import React, { Fragment } from 'react';
import { BaseBlock, BlockType, CitableContent } from '../types';
import { Citation } from '../../Citation';

// Table cell metadata
interface CellMeta {
    currency?: string;
    unit?: string;
    format?: 'number' | 'percentage' | 'date';
    decimals?: number;
}

// Table block types
export interface TableBlock extends BaseBlock {
    type: BlockType.table;
    headers: string[];
    rows: CitableContent[][];
    meta: {
        columnAlignment: ('left' | 'center' | 'right')[];
        columnMeta?: CellMeta[]; // Metadata for each column
    };
}

export function Table({ headers, rows }: TableBlock) {
    return (
        <table>
            {headers.length > 0 && (
                <thead>
                    {headers.map((header, headerIndex) => (
                        <th key={`header-${headerIndex}`}>{header}</th>
                    ))}
                </thead>
            )}
            {rows.length > 0 && (
                <tbody>
                    {rows.map((cells, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                            {cells.map((content, cellIndex) => {
                                return (
                                    <td key={`cell-${cellIndex}`}>
                                        {content.map((c, contentIndex) =>
                                            typeof c === 'string' ? (
                                                <Fragment
                                                    key={`row-${rowIndex}-cell-${cellIndex}-content-${contentIndex}`}
                                                >
                                                    {c}
                                                </Fragment>
                                            ) : (
                                                <Citation
                                                    key={`row-${rowIndex}-cell-${cellIndex}-content-${contentIndex}`}
                                                />
                                            )
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            )}
        </table>
    );
}
