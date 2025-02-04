import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroDocumentMinus } from '@aiera/client-sdk/components/Svg/MicroDocumentMinus';
import { MicroDocumentPlus } from '@aiera/client-sdk/components/Svg/MicroDocumentPlus';
import { MicroExclamationCircle } from '@aiera/client-sdk/components/Svg/MicroExclamationCircle';
import { MicroFolderOpen } from '@aiera/client-sdk/components/Svg/MicroFolderOpen';
import debounce from 'lodash.debounce';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { ContentRow } from '../../components/ContentRow';
import { Modal } from '../Modal';
import { SearchInput } from '../../components/SearchInput';
import { useEvents } from '../../services/events';
import { Source, useChatStore } from '../../store';

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

interface AddSourceDialogProps {
    onClose: () => void;
    sources?: Source[];
    onAddSource: (s: Source) => void;
    onRemoveSource: (s: Source) => void;
}

export function AddSourceDialog({
    onClose,
    sources = [],
    onAddSource,
    onRemoveSource,
}: AddSourceDialogProps): ReactElement {
    const { onSelectSource } = useChatStore();
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
        <Modal onClose={onClose} title="Manage Sources" className="h-60 -mb-5" Icon={MicroFolderOpen}>
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
                    className=""
                />
                <div className="flex-1 flex flex-col relative -mx-5">
                    <div className="absolute inset-0 overflow-y-auto pt-4 pb-6 flex flex-col flex-1">
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
                                                  <ContentRow
                                                      className="mx-5"
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
                                                              ? () =>
                                                                    onRemoveSource({
                                                                        targetId: id,
                                                                        targetType: 'event',
                                                                        title,
                                                                    })
                                                              : () =>
                                                                    onAddSource({
                                                                        confirmed: true,
                                                                        targetId: id,
                                                                        targetType: 'event',
                                                                        title,
                                                                    })
                                                      }
                                                      Icon={sourceAdded ? MicroDocumentMinus : MicroDocumentPlus}
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
                                              <p className="text-base text-center text-balance">
                                                  No results found for{' '}
                                                  <span className="font-bold antialiased">{searchTerm}</span>
                                              </p>
                                          </div>
                                      )
                                  )
                                  .otherwise(() => null)
                            : sources.map(({ targetId, targetType, title }) => (
                                  <ContentRow
                                      className="mx-5"
                                      text={title}
                                      key={targetId}
                                      onClick={() => {
                                          onSelectSource({
                                              targetId,
                                              targetType,
                                              title,
                                          });
                                      }}
                                      onClickIcon={() => onRemoveSource({ targetId, targetType, title })}
                                      Icon={MicroDocumentMinus}
                                      iconClassName={'text-red-500 hover:text-red-700'}
                                  />
                              ))}
                        {!searchTerm && sources.length === 0 && (
                            <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-rose-100 mx-5 text-rose-800">
                                <MicroExclamationCircle className="flex-shrink-0 w-4 mr-2" />
                                <p className="text-base leading-[1.125rem] text-balance">
                                    At least one source must be specified to generate an answer.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
