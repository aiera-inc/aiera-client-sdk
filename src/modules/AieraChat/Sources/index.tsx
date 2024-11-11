import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { MicroPaperclip } from '@aiera/client-sdk/components/Svg/MicroPaperclip';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { SourceMode } from '..';
import { Panel } from '../Panel';

const data = [
    {
        eventId: '1',
        title: 'AAPL Q2 2024 Earnings call',
    },
    {
        eventId: '2',
        title: 'TSLA Q3 2024 Earnings call',
    },
    {
        eventId: '3',
        title: 'META Q2 2024 Earnings call',
    },
];

interface SourceModeType {
    id: SourceMode;
    label: string;
    description: string;
}

const sourceModes: SourceModeType[] = [
    {
        id: 'suggest',
        label: 'Automatic Sources',
        description: 'Sources will be suggested based on each question asked.',
    },
    {
        id: 'manual',
        label: 'Manual Sources',
        description: 'All questions will run against the sources you specify.',
    },
];

function SourcesUI({
    onClose,
    mode,
    onSetSourceMode,
}: {
    onSetSourceMode: (m: SourceMode) => void;
    onClose: () => void;
    mode: SourceMode;
}) {
    return (
        <Panel className="px-5 mt-2" Icon={MicroPaperclip} title="Chat Sources" onClose={onClose} side="right">
            <div className="flex flex-col flex-1">
                <div className="bg-slate-100 rounded-lg px-4 pb-4 pt-3 mb-4">
                    {sourceModes.map(({ id, label, description }, index) => (
                        <Fragment key={id}>
                            <div
                                onClick={() => onSetSourceMode(id)}
                                className={classNames('cursor-pointer group', {
                                    'border-t border-t-slate-200 pt-3 mt-3': index !== 0,
                                })}
                            >
                                <div
                                    className={classNames('flex items-center', {
                                        'text-blue-700': mode === id,
                                        'text-black group-hover:text-blue-700': mode !== id,
                                    })}
                                >
                                    <div className="w-6 pr-2 flex-shrink-0">
                                        {mode === id && <MicroCheck className="w-4" />}
                                    </div>
                                    <p className={classNames('font-bold text-sm antialiased')}>{label}</p>
                                </div>
                                <p className="text-slate-600 text-sm leading-4 ml-6 text-balance mt-1">{description}</p>
                            </div>
                        </Fragment>
                    ))}
                </div>
                {mode === 'manual' && (
                    <>
                        <input
                            type="text"
                            name="source_autocomplete"
                            className="text-sm border border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3 mb-4"
                            placeholder="Add Source..."
                        />
                        {data.map(({ eventId, title }) => (
                            <div
                                key={eventId}
                                className="flex hover:bg-slate-200/80 pl-2.5 ml-0.5 pr-1.5 mr-1.5 rounded-lg flex-1 justify-between items-center py-1 text-slate-600"
                            >
                                <p className="text-sm line-clamp-1 hover:text-blue-700 cursor-pointer">{title}</p>
                                <MicroTrash className="w-4 ml-2 hover:text-red-600 cursor-pointer" />
                            </div>
                        ))}
                    </>
                )}
            </div>
        </Panel>
    );
}

export function Sources({
    onClose,
    sourceMode,
    setSourceMode,
}: {
    sourceMode: SourceMode;
    setSourceMode: (v: SourceMode) => void;
    onClose: () => void;
}) {
    return <SourcesUI onClose={onClose} mode={sourceMode} onSetSourceMode={setSourceMode} />;
}
