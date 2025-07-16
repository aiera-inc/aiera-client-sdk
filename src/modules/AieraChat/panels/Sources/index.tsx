import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { EventSearchResults } from '@aiera/client-sdk/modules/AieraChat/components/SearchResults/events';
import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { MicroExclamationCircle } from '@aiera/client-sdk/components/Svg/MicroExclamationCircle';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { Panel } from '../Panel';
import { SearchInput } from '../../components/SearchInput';
import { useEvents } from '../../services/events';
import { Source, useChatStore } from '../../store';

const EMPTY_SOURCES_MESSAGE = 'Sources will be suggested until a source is added.';

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

export function Sources({ onClearSources, onClose }: { onClearSources: () => void; onClose: () => void }) {
    const {
        onRemoveSource,
        sources,
        onSelectSource,
        onAddSource,
        onClearSources: onClearStoreSources,
    } = useChatStore();
    // Separate state for immediate UI updates
    const [inputValue, setInputValue] = useState<string>('');
    // State that will be debounced before being used in queries
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

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
            className="mt-4 flex-1 flex flex-col"
            Icon={MicroFolder}
            title="Chat Sources"
            onClose={onClose}
            side="right"
        >
            <div className="flex flex-col flex-1">
                <SearchInput
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
                    className="mx-5"
                />
                <div className="flex-1 flex flex-col relative">
                    <div className="absolute inset-0 overflow-y-auto pt-4 pb-6 flex flex-col flex-1">
                        <EventSearchResults
                            eventsQuery={eventsQuery}
                            onAddSource={onAddSource}
                            onRemoveSource={onRemoveSource}
                            onSelectSource={onSelectSource}
                            searchTerm={searchTerm}
                            sources={sources}
                        />
                        {!searchTerm && sources.length === 0 && (
                            <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-rose-100 mx-5 text-rose-800">
                                <MicroExclamationCircle className="flex-shrink-0 w-4 mr-2" />
                                <p className="text-base leading-[1.125rem] text-balance">{EMPTY_SOURCES_MESSAGE}</p>
                            </div>
                        )}
                        {!searchTerm && sources.length > 0 && (
                            <>
                                <div className="flex-1" />
                                <div
                                    onClick={() => {
                                        onClearStoreSources();
                                        onClearSources();
                                    }}
                                    className="flex cursor-pointer items-center justify-center py-2 px-3 rounded-lg bg-rose-100 mx-5 text-rose-800 hover:bg-rose-200"
                                >
                                    <MicroCloseCircle className="flex-shrink-0 w-4 mr-2" />
                                    <p className="text-base leading-4 text-balance">Clear All Sources</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Panel>
    );
}
