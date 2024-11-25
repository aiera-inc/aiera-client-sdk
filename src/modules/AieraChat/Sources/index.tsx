import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroDocumentMinus } from '@aiera/client-sdk/components/Svg/MicroDocumentMinus';
import { MicroDocumentPlus } from '@aiera/client-sdk/components/Svg/MicroDocumentPlus';
import { MicroExclamationCircle } from '@aiera/client-sdk/components/Svg/MicroExclamationCircle';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { Panel } from '../Panel';
import { PanelSearchInput } from '../PanelSearchInput';
import { useEvents } from '../services/events';
import { Source, SourceMode, useChatStore } from '../store';
import { PanelContentRow } from '../PanelContentRow';

interface SourceModeType {
    id: SourceMode;
    label: string;
    description: string;
}

const sourceModes: SourceModeType[] = [
    {
        id: 'manual',
        label: 'Manual',
        description: 'All questions will run against the sources you add below.',
    },
    {
        id: 'suggest',
        label: 'Suggested',
        description: 'Sources will be suggested based on each question asked.',
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

export function Sources({ onClose }: { onClose: () => void }) {
    const { sourceMode: mode, onSetSourceMode, onRemoveSource, sources, onSelectSource, onAddSource } = useChatStore();
    // Separate state for immediate UI updates
    const [inputValue, setInputValue] = useState<string>('');
    // State that will be debounced before being used in queries
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

    const currentModeDescription = sourceModes.find(({ id }) => id === mode)?.description;
    const { eventsQuery } = useEvents(searchTerm);

    // Create a debounced function that will update the searchTerm
    const debouncedSetSearchTerm = useCallback(
        debounce((value: string) => {
            setSearchTerm(value || undefined);
        }, 300),
        [] // Empty dependency array since we don't want this to change
    );

    // Cleanup the debounced function on component unmount
    useEffect(() => {
        return () => {
            debouncedSetSearchTerm.cancel();
        };
    }, [debouncedSetSearchTerm]);
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
                        <PanelSearchInput
                            autoFocus
                            onChange={(newValue) => {
                                if (newValue) {
                                    setInputValue(newValue); // Update the input immediately
                                    debouncedSetSearchTerm(newValue); // Debounce the search term update
                                } else {
                                    setSearchTerm(undefined);
                                    setInputValue('');
                                }
                            }}
                            name="source_autocomplete"
                            value={inputValue}
                            placeholder="Find Source by Event Title..."
                            className="mt-6 mx-5"
                        />
                        <div className="flex-1 flex flex-col relative">
                            <div className="absolute inset-0 overflow-y-auto py-4 flex flex-col flex-1">
                                {searchTerm && searchTerm?.length > 2
                                    ? match(eventsQuery)
                                          .with({ status: 'loading' }, () => (
                                              <div className="mt-6 flex items-center justify-center">
                                                  <LoadingSpinner heightClass="h-6" widthClass="w-6" />
                                              </div>
                                          ))
                                          .with({ status: 'success' }, ({ data }) =>
                                              data.events.length > 0 ? (
                                                  data.events.map(({ id, title }) => {
                                                      const sourceAdded = hasSource(
                                                          { targetId: id, targetType: 'event', title },
                                                          sources
                                                      );
                                                      return (
                                                          <PanelContentRow
                                                              text={title}
                                                              key={id}
                                                              onClick={() => {
                                                                  onSelectSource({
                                                                      targetId: id,
                                                                      targetType: 'event',
                                                                      title,
                                                                  });
                                                              }}
                                                              onClickIcon={
                                                                  sourceAdded
                                                                      ? () => onRemoveSource(id, 'event')
                                                                      : () =>
                                                                            onAddSource({
                                                                                targetId: id,
                                                                                targetType: 'event',
                                                                                title,
                                                                            })
                                                              }
                                                              Icon={
                                                                  sourceAdded ? MicroDocumentMinus : MicroDocumentPlus
                                                              }
                                                              iconClassName={
                                                                  sourceAdded
                                                                      ? 'text-red-500 hover:text-red-700'
                                                                      : 'hover:text-blue-600'
                                                              }
                                                          />
                                                      );
                                                  })
                                              ) : (
                                                  <div className="text-slate-600 py-1 flex items-center justify-center mx-5">
                                                      <p className="text-sm text-center text-balance">
                                                          No results found for{' '}
                                                          <span className="font-bold antialiased">{searchTerm}</span>
                                                      </p>
                                                  </div>
                                              )
                                          )
                                          .otherwise(() => null)
                                    : sources.map(({ targetId, targetType, title }) => (
                                          <PanelContentRow
                                              text={title}
                                              key={targetId}
                                              onClick={() => {
                                                  onSelectSource({
                                                      targetId,
                                                      targetType,
                                                      title,
                                                  });
                                              }}
                                              onClickIcon={() => onRemoveSource(targetId, targetType)}
                                              Icon={MicroDocumentMinus}
                                              iconClassName={'text-red-500 hover:text-red-700'}
                                          />
                                      ))}
                                {!searchTerm && sources.length === 0 && (
                                    <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-rose-100 mx-5 text-rose-800">
                                        <MicroExclamationCircle className="flex-shrink-0 w-4 mr-2" />
                                        <p className="text-sm leading-4 text-balance">
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
