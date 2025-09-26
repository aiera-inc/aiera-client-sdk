import React from 'react';
import { match } from 'ts-pattern';
import { QueryResult } from '@aiera/client-sdk/api/client';
import { ContentRow } from '@aiera/client-sdk/modules/AieraChat/components/ContentRow';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroDocumentMinus } from '@aiera/client-sdk/components/Svg/MicroDocumentMinus';
import { MicroDocumentPlus } from '@aiera/client-sdk/components/Svg/MicroDocumentPlus';
import { MicroDocumentSearch } from '@aiera/client-sdk/components/Svg/MicroDocumentSearch';
import { hasSource } from '@aiera/client-sdk/modules/AieraChat/modals/AddSourceDialog';
import { SearchEventsQuery, SearchEventsQueryVariables } from '@aiera/client-sdk/types/generated';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';

interface EventSearchResultsProps {
    eventsQuery: QueryResult<SearchEventsQuery, SearchEventsQueryVariables>;
    onAddSource: (s: Source) => void;
    onRemoveSource: (s: Source) => void;
    onSelectSource: (source?: Source) => void;
    searchTerm?: string;
    sources?: Source[];
}

export function EventSearchResults({
    eventsQuery,
    onAddSource,
    onRemoveSource,
    onSelectSource,
    searchTerm,
    sources = [],
}: EventSearchResultsProps) {
    return (
        <>
            {searchTerm && searchTerm?.length > 2
                ? match(eventsQuery)
                      .with({ status: 'loading' }, () => (
                          <div className="mt-6 flex items-center justify-center">
                              <LoadingSpinner heightClass="h-6" widthClass="w-6" />
                          </div>
                      ))
                      .with({ status: 'success' }, ({ data }) =>
                          data.openSearch.events.numTotalHits > 0 ? (
                              data.openSearch.events.hits.map(({ id, event }) => {
                                  const { eventDate, eventId, eventTitle } = event;
                                  const targetId = String(eventId);
                                  const sourceAdded = hasSource(
                                      { targetId, targetType: 'event', title: eventTitle },
                                      sources
                                  );
                                  const toggleSource = sourceAdded
                                      ? () =>
                                            onRemoveSource({
                                                targetId,
                                                targetType: 'event',
                                                title: eventTitle,
                                            })
                                      : () =>
                                            onAddSource({
                                                targetId,
                                                targetType: 'event',
                                                title: eventTitle,
                                                date: eventDate,
                                            });
                                  return (
                                      <ContentRow
                                          key={id}
                                          onClickIcon={[
                                              toggleSource,
                                              () => {
                                                  onSelectSource({
                                                      targetId,
                                                      targetType: 'event',
                                                      title: eventTitle,
                                                  });
                                              },
                                          ]}
                                          onClick={toggleSource}
                                          className="mx-5"
                                          Icon={[
                                              sourceAdded ? MicroDocumentMinus : MicroDocumentPlus,
                                              MicroDocumentSearch,
                                          ]}
                                          iconClassName={[
                                              sourceAdded ? 'text-red-500 hover:text-red-700' : 'hover:text-blue-600',
                                              'hover:text-blue-600',
                                          ]}
                                      >
                                          <div className="flex flex-1 justify-between text-base hover:text-blue-700 cursor-pointer">
                                              <p className="line-clamp-1">{eventTitle}</p>
                                              <p className="flex-shrink-0 ml-3">
                                                  {new Date(eventDate).toLocaleDateString('en-US', {
                                                      dateStyle: 'medium',
                                                  })}
                                              </p>
                                          </div>
                                      </ContentRow>
                                  );
                              })
                          ) : (
                              <div className="text-slate-600 py-1 flex items-center justify-center mx-5">
                                  <p className="text-base text-center text-balance">
                                      No results found for <span className="font-bold antialiased">{searchTerm}</span>
                                  </p>
                              </div>
                          )
                      )
                      .otherwise(() => null)
                : sources.map(({ targetId, targetType, title, date }) => (
                      <ContentRow
                          className="mx-5 group"
                          key={targetId}
                          onClickIcon={[
                              () => onRemoveSource({ targetId, targetType, title }),
                              () => {
                                  onSelectSource({
                                      targetId,
                                      targetType,
                                      title,
                                  });
                              },
                          ]}
                          onClick={() => onRemoveSource({ targetId, targetType, title })}
                          Icon={[MicroDocumentMinus, MicroDocumentSearch]}
                          iconClassName={['group-hover:text-red-500', 'hover:text-blue-600']}
                      >
                          <div className="flex flex-1 justify-between text-base hover:text-blue-700 cursor-pointer">
                              <p className="line-clamp-1">{title}</p>
                              {date && (
                                  <p className="flex-shrink-0 ml-3">
                                      {new Date(date).toLocaleDateString('en-US', {
                                          dateStyle: 'medium',
                                      })}
                                  </p>
                              )}
                          </div>
                      </ContentRow>
                  ))}
        </>
    );
}
