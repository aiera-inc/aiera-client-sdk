import React, { ReactElement, MouseEvent, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';

import { ChangeHandler } from 'types';
import { Tabs } from 'components';
import { EventListQuery, EventListQueryVariables, EventType, EventView } from 'types/generated';
import { FilterBy } from './FilterBy';
import './styles.css';

enum FilterByType {
    transcript,
    earningsOnly,
}

export interface EventListUIProps {
    events?: EventListQuery['events'];
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: (event: MouseEvent) => void;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const { events, filterByTypes, listType, loading, onSelectFilterBy, onSelectListType, onSelectEvent } = props;
    return (
        <div className="h-full eventlist">
            <div className="flex items-center h-16 p-3 bg-gray-200 eventlist__header">
                <input className="w-3/4 p-2 text-sm rounded-lg" placeholder="Search Events and Transcripts" />
            </div>
            <div className="overflow-y-scroll h-full">
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
                                {events.map((event) => (
                                    <li className="text-sm" onClick={onSelectEvent} key={event.id}>
                                        <div className="flex flex-row">
                                            <div className="flex items-center justify-center p-2">
                                                <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded-full" />
                                            </div>
                                            <div className="flex flex-col justify-center flex-1 p-2 ">
                                                <div>
                                                    <span className="pr-1 font-semibold">AMZN</span>
                                                    <span className="text-gray-200">NYSE</span>
                                                    <span className="text-gray-400"> • {event.eventType}</span>
                                                </div>
                                                <div>{event.title}</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center text-xs">
                                                <div>March 3rd</div>
                                                <div>5:30 PM 2021</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
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
}

export const EventList = (props: EventListProps): ReactElement => {
    const { onSelectEvent } = props;
    const [state, setState] = useState<EventListState>({
        filterByTypes: [],
        listType: EventView.LiveAndUpcoming,
    });
    const [eventListResult] = useQuery<EventListQuery, EventListQueryVariables>({
        query: gql`
            query EventList($filter: EventFilter, $view: EventView) {
                events(filter: $filter, view: $view) {
                    id
                    title
                    eventDate
                    eventType
                }
            }
        `,
        variables: {
            view: state.listType,
            filter: {
                hasTranscript: state.filterByTypes.includes(FilterByType.transcript),
                eventTypes: state.filterByTypes.includes(FilterByType.earningsOnly) ? [EventType.Earnings] : undefined,
            },
        },
    });
    return (
        <EventListUI
            events={eventListResult.data?.events}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
            loading={eventListResult.fetching}
            onSelectFilterBy={(_, { value }) => setState({ ...state, filterByTypes: value })}
            onSelectListType={(_, { value }) => setState({ ...state, listType: value })}
            onSelectEvent={onSelectEvent}
        />
    );
};
