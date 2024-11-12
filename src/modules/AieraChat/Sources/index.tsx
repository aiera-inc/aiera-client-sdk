import { MicroExclamationCircle } from '@aiera/client-sdk/components/Svg/MicroExclamationCircle';
import { MicroPaperclip } from '@aiera/client-sdk/components/Svg/MicroPaperclip';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React from 'react';
import { Panel } from '../Panel';
import { Source, SourceMode, useSourcesStore } from '../store';

interface SourceModeType {
    id: SourceMode;
    label: string;
    description: string;
}

const sourceModes: SourceModeType[] = [
    {
        id: 'suggest',
        label: 'Automatic',
        description: 'Sources will be suggested based on each question asked.',
    },
    {
        id: 'manual',
        label: 'Manual',
        description: 'All questions will run against the sources you specify.',
    },
];

function SourcesUI({
    sources,
    onClose,
    mode,
    onSetSourceMode,
    onRemoveSource,
    onSelectSource,
}: {
    sources: Source[];
    onRemoveSource: (id: string, type: string) => void;
    onSetSourceMode: (m: SourceMode) => void;
    onSelectSource: (s?: Source) => void;
    onClose: () => void;
    mode: SourceMode;
}) {
    const currentModeDescription = sourceModes.find(({ id }) => id === mode)?.description;
    return (
        <Panel
            className="px-5 mt-2 flex-1 flex flex-col"
            Icon={MicroPaperclip}
            title="Chat Sources"
            onClose={onClose}
            side="right"
        >
            <div className="flex flex-col flex-1">
                <div className="bg-slate-200/60 rounded-lg px-4 pb-4 pt-3.5">
                    <div className="flex items-center">
                        {sourceModes.map(({ id, label }) => (
                            <div
                                key={id}
                                onClick={() => onSetSourceMode(id)}
                                className={classNames('cursor-pointer group px-2 py-0.5 rounded-lg', {
                                    'bg-blue-600 text-white': mode === id,
                                    'hover:text-blue-700': mode !== id,
                                })}
                            >
                                <p className={classNames('font-bold text-sm antialiased')}>{label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-4 text-balance mt-1.5 ml-2">
                        {currentModeDescription}
                    </p>
                </div>
                {mode === 'manual' && (
                    <>
                        <input
                            type="text"
                            name="source_autocomplete"
                            className="mt-6 text-sm border border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3 mb-3"
                            placeholder="Add Source..."
                        />
                        {sources.map(({ targetId, targetType, title }) => (
                            <div
                                key={targetId}
                                className="flex hover:bg-slate-200/80 pl-2.5 ml-0.5 pr-1.5 mr-1.5 rounded-lg justify-between items-center py-1 text-slate-600"
                                onClick={() => {
                                    onSelectSource({ targetId, targetType, title });
                                }}
                            >
                                <p className="text-sm line-clamp-1 hover:text-blue-700 cursor-pointer">{title}</p>
                                <div
                                    className="ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onRemoveSource(targetId, targetType);
                                    }}
                                >
                                    <MicroTrash className="w-4 hover:text-red-600 cursor-pointer" />
                                </div>
                            </div>
                        ))}
                        {sources.length === 0 && (
                            <div className="flex items-center justify-center mx-2">
                                <MicroExclamationCircle className="flex-shrink-0 w-4 mr-2 text-slate-600" />
                                <p className="text-sm text-slate-600 leading-4 text-balance">
                                    Sources will be suggested if you do not add a source.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Panel>
    );
}

export function Sources({ onClose }: { onClose: () => void }) {
    const { sourceMode, setSourceMode, onRemoveSource, sources, onSelectSource } = useSourcesStore();
    return (
        <SourcesUI
            sources={sources}
            onClose={onClose}
            mode={sourceMode}
            onRemoveSource={onRemoveSource}
            onSetSourceMode={setSourceMode}
            onSelectSource={onSelectSource}
        />
    );
}
