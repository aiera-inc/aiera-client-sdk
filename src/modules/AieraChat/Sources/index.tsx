import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { MicroDocumentMinus } from '@aiera/client-sdk/components/Svg/MicroDocumentMinus';
import { MicroDocumentPlus } from '@aiera/client-sdk/components/Svg/MicroDocumentPlus';
import { MicroExclamationCircle } from '@aiera/client-sdk/components/Svg/MicroExclamationCircle';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import classNames from 'classnames';
import React, { useState } from 'react';
import { match } from 'ts-pattern';
import { Panel } from '../Panel';
import { useEvents } from '../services/events';
import { Source, SourceMode, useChatStore } from '../store';

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

/**
 * Checks if a given source exists in an array of sources
 * @param source The source to check for
 * @param sources Array of sources to search through
 * @param matchFields Optional array of fields to match on (defaults to all fields)
 * @returns boolean indicating if the source was found
 */
export const hasSource = (
    source: Source,
    sources: Source[],
    matchFields: (keyof Source)[] = ['targetId', 'targetType', 'title']
): boolean => {
    return sources.some((existingSource) => matchFields.every((field) => existingSource[field] === source[field]));
};

function SourcesUI({
    sources,
    onClose,
    mode,
    onSetSourceMode,
    onRemoveSource,
    onAddSource,
    onSelectSource,
}: {
    sources: Source[];
    onAddSource: (s: Source) => void;
    onRemoveSource: (id: string, type: string) => void;
    onSetSourceMode: (m: SourceMode) => void;
    onSelectSource: (s?: Source) => void;
    onClose: () => void;
    mode: SourceMode;
}) {
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
    const currentModeDescription = sourceModes.find(({ id }) => id === mode)?.description;
    const { eventsQuery } = useEvents(searchTerm);
    return (
        <Panel
            className="mt-2 flex-1 flex flex-col"
            Icon={MicroFolder}
            title="Chat Sources"
            onClose={onClose}
            side="right"
        >
            <div className="flex flex-col flex-1">
                <div className="bg-slate-200/60 rounded-lg px-4 mx-5 pb-4 pt-3.5">
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
                        <div className="relative mt-6 mx-5 mb-3">
                            <input
                                type="text"
                                name="source_autocomplete"
                                className="text-sm border border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3 w-full"
                                placeholder="Find Source by Event Title..."
                                value={searchTerm ?? ''}
                                autoFocus
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                            />
                            {searchTerm && searchTerm.length > 0 && (
                                <div
                                    onClick={() => setSearchTerm(undefined)}
                                    className="cursor-pointer absolute text-slate-400 hover:text-slate-600 right-2 top-2"
                                >
                                    <MicroCloseCircle className="w-4" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col relative">
                            <div className="absolute inset-0 overflow-y-auto flex flex-col flex-1">
                                {searchTerm && searchTerm?.length > 2
                                    ? match(eventsQuery)
                                          .with({ status: 'loading' }, () => (
                                              <div className="flex-1 flex flex-col items-center justify-center">
                                                  <LoadingSpinner />
                                              </div>
                                          ))
                                          .with({ status: 'success' }, ({ data }) =>
                                              data.events.map(({ id, title }) => (
                                                  <div
                                                      key={id}
                                                      className="flex hover:bg-slate-200/80 pl-2.5 pr-1.5 mx-5 rounded-lg justify-between items-center py-1 text-slate-600"
                                                      onClick={() => {
                                                          onSelectSource({
                                                              targetId: id,
                                                              targetType: 'event',
                                                              title,
                                                          });
                                                      }}
                                                  >
                                                      <p className="text-sm line-clamp-1 hover:text-blue-700 cursor-pointer">
                                                          {title}
                                                      </p>
                                                      {hasSource(
                                                          { targetId: id, targetType: 'event', title },
                                                          sources
                                                      ) ? (
                                                          <div
                                                              className="ml-2"
                                                              onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  e.preventDefault();
                                                                  onRemoveSource(id, 'event');
                                                              }}
                                                          >
                                                              <MicroDocumentMinus className="w-4 text-red-500 hover:text-red-700 cursor-pointer" />
                                                          </div>
                                                      ) : (
                                                          <div
                                                              className="ml-2"
                                                              onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  e.preventDefault();
                                                                  onAddSource({
                                                                      targetId: id,
                                                                      targetType: 'event',
                                                                      title,
                                                                  });
                                                              }}
                                                          >
                                                              <MicroDocumentPlus className="w-4 hover:text-blue-600 cursor-pointer" />
                                                          </div>
                                                      )}
                                                  </div>
                                              ))
                                          )
                                          .otherwise(() => null)
                                    : sources.map(({ targetId, targetType, title }) => (
                                          <div
                                              key={targetId}
                                              className="flex hover:bg-slate-200/80 pl-2.5 mx-5 pr-1.5 rounded-lg justify-between items-center py-1 text-slate-600"
                                              onClick={() => {
                                                  onSelectSource({ targetId, targetType, title });
                                              }}
                                          >
                                              <p className="text-sm line-clamp-1 hover:text-blue-700 cursor-pointer">
                                                  {title}
                                              </p>
                                              <div
                                                  className="ml-2"
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      onRemoveSource(targetId, targetType);
                                                  }}
                                              >
                                                  <MicroDocumentMinus className="w-4 text-red-500 hover:text-red-700 cursor-pointer" />
                                              </div>
                                          </div>
                                      ))}
                                {!searchTerm && sources.length === 0 && (
                                    <div className="flex items-center justify-center mx-7">
                                        <MicroExclamationCircle className="flex-shrink-0 w-4 mr-2 text-slate-600" />
                                        <p className="text-sm text-slate-600 leading-4 text-balance">
                                            Sources will be suggested if you do not add a source.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Panel>
    );
}

export function Sources({ onClose }: { onClose: () => void }) {
    const { sourceMode, setSourceMode, onRemoveSource, sources, onSelectSource, onAddSource } = useChatStore();
    return (
        <SourcesUI
            sources={sources}
            onClose={onClose}
            mode={sourceMode}
            onAddSource={onAddSource}
            onRemoveSource={onRemoveSource}
            onSetSourceMode={setSourceMode}
            onSelectSource={onSelectSource}
        />
    );
}
