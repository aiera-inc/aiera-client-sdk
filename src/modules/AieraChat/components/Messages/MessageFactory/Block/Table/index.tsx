import React, { useEffect, useRef, useState } from 'react';
import { BaseBlock, BlockType, CitableContent } from '..';
import { Citation } from '../../Citation';
import { SearchableText } from '../../SearchableText';

// Table cell metadata
interface CellMeta {
    currency?: string;
    unit?: string;
    format?: 'number' | 'percentage' | 'date';
    decimals?: number;
}

// Table block types
export interface TableBlock extends BaseBlock {
    type: BlockType.TABLE;
    headers: string[];
    rows: CitableContent[][];
    meta: {
        columnAlignment: ('left' | 'center' | 'right')[];
        columnMeta?: CellMeta[]; // Metadata for each column
    };
}

export function Table({ headers, rows }: TableBlock) {
    const tableRef = useRef<HTMLTableElement | null>(null);
    const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (tableRef.current) {
            const { height } = tableRef.current.getBoundingClientRect();
            setTableHeight(height + 16);
        }
    }, []);

    return (
        <div
            style={{ height: tableHeight }}
            className="relative w-full max-w-full overflow-x-auto overflow-y-hidden border bg-slate-400/10 rounded-md border-slate-500/30 px-3.5 py-2"
        >
            <table ref={tableRef} className="absolute text-base antialiased w-full">
                {headers.length > 0 && (
                    <thead>
                        {headers.map((header, headerIndex) => (
                            <th key={`header-${headerIndex}`} className="text-nowrap pr-4">
                                <SearchableText text={header} />
                            </th>
                        ))}
                    </thead>
                )}
                {rows.length > 0 && (
                    <tbody>
                        {rows.map((cells, rowIndex) => (
                            <tr key={`row-${rowIndex}`}>
                                {cells.map((content, cellIndex) => {
                                    return (
                                        <td key={`cell-${cellIndex}`} className="text-nowrap pr-4 font-mono">
                                            {content.map((c, contentIndex) =>
                                                typeof c === 'string' ? (
                                                    <SearchableText
                                                        key={`row-${rowIndex}-cell-${cellIndex}-content-${contentIndex}`}
                                                        text={c}
                                                    />
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
        </div>
    );
}
