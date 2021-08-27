import React, { ReactElement, FormEventHandler, MouseEvent, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { DateTime } from 'luxon';

import { ChangeHandler } from 'types';
import { Tabs } from 'components';
import { EventListQuery, EventListQueryVariables, EventType, EventView } from 'types/generated';
import { FilterBy } from './FilterBy';
import './styles.css';

enum FilterByType {
    transcript,
    earningsOnly,
}

function getPrimary<T extends { isPrimary?: boolean }>(args?: T[]): T | undefined {
    if (!args) return args;
    const primary = args.find((t) => t.isPrimary);
    return primary || args[0];
}

export interface EventListUIProps {
    events?: EventListQuery['events'];
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    onSearchChange?: FormEventHandler<HTMLInputElement>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: (event: MouseEvent) => void;
    searchTerm?: string;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        events,
        filterByTypes,
        listType,
        loading,
        onSearchChange,
        onSelectFilterBy,
        onSelectListType,
        onSelectEvent,
        searchTerm,
    } = props;
    return (
        <div className="h-full pb-16 eventlist">
            <div className="flex items-center h-16 p-2 bg-gray-100 eventlist__header">
                <input
                    className="w-3/4 p-2 text-sm rounded-lg"
                    onChange={onSearchChange}
                    placeholder="Search Events and Transcripts"
                    value={searchTerm}
                />
            </div>
            <div className="h-full overflow-y-scroll">
                <div className="flex flex-col flex-grow p-2 eventlist__tabs">
                    <div>
                        <Tabs<EventView>
                            onChange={onSelectListType}
                            options={[
                                { value: EventView.LiveAndUpcoming, label: 'Live & Upcoming' },
                                { value: EventView.Recent, label: 'Recent Events' },
                            ]}
                            value={listType}
                        />
                    </div>
                    <div className="sticky top-0 pt-2 bg-white">
                        <FilterBy
                            onChange={onSelectFilterBy}
                            options={[
                                { value: FilterByType.transcript, label: 'Has transcript' },
                                { value: FilterByType.earningsOnly, label: 'Earnings only' },
                            ]}
                            value={filterByTypes}
                        />
                    </div>
                    <div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : events && events.length ? (
                            <ul>
                                {events.map((event) => {
                                    const primaryInstrument = getPrimary(event.primaryCompany?.instruments);
                                    const primaryQuote = getPrimary(primaryInstrument?.quotes);
                                    const eventDate = DateTime.fromISO(event.eventDate);
                                    return (
                                        <li className="text-xs" onClick={onSelectEvent} key={event.id}>
                                            <div className="flex flex-row">
                                                <div className="flex items-center justify-center p-2">
                                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full" />
                                                </div>
                                                <div className="flex flex-col justify-center flex-1 min-w-0 p-2 pr-4">
                                                    <div>
                                                        <span className="pr-1 font-semibold">
                                                            {primaryQuote?.localTicker}
                                                        </span>
                                                        <span className="text-gray-300">
                                                            {primaryQuote?.exchange?.shortName}
                                                        </span>
                                                        <span className="text-gray-400"> • {event.eventType}</span>
                                                    </div>
                                                    <div className="text-sm truncate whitespace-normal line-clamp-2">
                                                        {event.title}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center w-24 pr-1 text-xs">
                                                    {event.isLive && (
                                                        <div className="px-2 font-semibold text-white bg-red-500 rounded-md">
                                                            LIVE
                                                        </div>
                                                    )}
                                                    {!event.isLive && (
                                                        <>
                                                            <div>{eventDate.toFormat('MMM dd')}</div>
                                                            <div>{eventDate.toFormat('h:mma yyyy')}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <span>No events.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export interface EventListProps {
    onSelectEvent?: (event: MouseEvent) => void;
}

interface EventListState {
    filterByTypes: FilterByType[];
    listType: EventView;
    searchTerm: string;
}

export const EventList = (props: EventListProps): ReactElement => {
    const { onSelectEvent } = props;
    const [state, setState] = useState<EventListState>({
        filterByTypes: [],
        listType: EventView.LiveAndUpcoming,
        searchTerm: '',
    });
    const [eventListResult] = useQuery<EventListQuery, EventListQueryVariables>({
        query: gql`
            query EventList($filter: EventFilter, $view: EventView) {
                events(filter: $filter, view: $view) {
                    id
                    title
                    eventDate
                    eventType
                    isLive
                    primaryCompany {
                        id
                        commonName
                        instruments {
                            id
                            isPrimary
                            quotes {
                                id
                                isPrimary
                                localTicker
                                exchange {
                                    id
                                    shortName
                                }
                            }
                        }
                    }
                }
            }
        `,
        variables: {
            view: state.listType,
            filter: {
                hasTranscript: state.filterByTypes.includes(FilterByType.transcript) ? true : undefined,
                eventTypes: state.filterByTypes.includes(FilterByType.earningsOnly) ? [EventType.Earnings] : undefined,
                title: state.searchTerm || undefined,
            },
        },
    });
    return (
        <EventListUI
            events={eventListResult.data?.events}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
            loading={eventListResult.fetching}
            onSearchChange={({ currentTarget: { value } }) => setState({ ...state, searchTerm: value })}
            onSelectFilterBy={(_, { value }) => setState({ ...state, filterByTypes: value })}
            onSelectListType={(_, { value }) => setState({ ...state, listType: value })}
            onSelectEvent={onSelectEvent}
            searchTerm={state.searchTerm}
        />
    );
};
