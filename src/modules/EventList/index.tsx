import React, { ReactElement, FormEventHandler, MouseEventHandler, useCallback } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { DateTime } from 'luxon';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { EventListQuery, EventListQueryVariables, EventType, EventView } from '@aiera/client-sdk/types/generated';
import { useMessageListener, Message } from '@aiera/client-sdk/lib/msg';
import { getPrimaryQuote, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { FilterBy } from './FilterBy';
import { PlayButton } from './PlayButton';
import './styles.css';

enum FilterByType {
    transcript,
    earningsOnly,
}

export type EventListEvent = EventListQuery['events'][0];
export type { CompanyFilterResult };

export interface EventListUIProps {
    company?: CompanyFilterResult;
    event?: EventListEvent;
    events?: EventListEvent[];
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    onBackFromTranscript?: MouseEventHandler;
    onCompanyChange?: ChangeHandler<CompanyFilterResult>;
    onSearchChange?: FormEventHandler<HTMLInputElement>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    searchTerm?: string;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        company,
        event,
        events,
        filterByTypes,
        listType,
        loading,
        onBackFromTranscript,
        onCompanyChange,
        onSearchChange,
        onSelectFilterBy,
        onSelectListType,
        onSelectEvent,
        searchTerm,
    } = props;
    if (event) {
        return <Transcript eventId={event.id} onBack={onBackFromTranscript} />;
    }
    return (
        <div className="h-full pb-16 eventlist">
            <div className="flex items-center p-3 shadow eventlist__header">
                <input
                    className="flex-1 p-2 text-sm rounded-lg border-gray-200 border"
                    onChange={onSearchChange}
                    placeholder="Search Events and Transcripts"
                    value={searchTerm}
                />
                <div className="ml-2">
                    <CompanyFilterButton onChange={onCompanyChange} value={company} />
                </div>
            </div>
            <div className="p-3 h-full overflow-y-scroll">
                <div className="flex flex-col flex-grow eventlist__tabs">
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
                    <div className="sticky top-0 mt-3">
                        <FilterBy
                            onChange={onSelectFilterBy}
                            options={[
                                { value: FilterByType.transcript, label: 'Has transcript' },
                                { value: FilterByType.earningsOnly, label: 'Earnings only' },
                            ]}
                            value={filterByTypes}
                        />
                    </div>
                    <div className="mt-3">
                        {loading ? (
                            <div>Loading...</div>
                        ) : events && events.length ? (
                            <ul>
                                {events.map((event) => {
                                    const primaryQuote = getPrimaryQuote(event.primaryCompany);
                                    const eventDate = DateTime.fromISO(event.eventDate);
                                    return (
                                        <li
                                            className="text-xs"
                                            onClick={(e) => onSelectEvent?.(e, { value: event })}
                                            key={event.id}
                                        >
                                            <div className="flex flex-row">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center justify-center w-9 h-9">
                                                        <PlayButton id={event.id} url={event.audioRecordingUrl} />
                                                    </div>
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

export interface EventListProps {}

interface EventListState {
    company?: CompanyFilterResult;
    event?: EventListEvent;
    filterByTypes: FilterByType[];
    listType: EventView;
    searchTerm: string;
}

export const EventList = (_props: EventListProps): ReactElement => {
    const { state, handlers, setState } = useChangeHandlers<EventListState>({
        company: undefined,
        event: undefined,
        filterByTypes: [],
        listType: EventView.LiveAndUpcoming,
        searchTerm: '',
    });

    const resolveCompany = useCompanyResolver();
    const bus = useMessageListener(
        'instrument-selected',
        async (msg: Message<'instrument-selected'>) => {
            if (msg.data.ticker) {
                const companies = await resolveCompany(msg.data.ticker);
                if (companies?.[0]) {
                    const company = companies[0];
                    setState((s) => ({ ...s, company }));
                }
            }
        },
        'in'
    );

    const onSelectEvent = useCallback<ChangeHandler<EventListEvent>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value?.primaryCompany);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.event(event, change);
        },
        [state]
    );

    const onSelectCompany = useCallback<ChangeHandler<CompanyFilterResult>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.company(event, change);
        },
        [state]
    );

    const [eventListResult] = useQuery<EventListQuery, EventListQueryVariables>({
        query: gql`
            query EventList($filter: EventFilter, $view: EventView) {
                events(filter: $filter, view: $view) {
                    id
                    title
                    eventDate
                    eventType
                    isLive
                    audioRecordingUrl
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
                                    country {
                                        id
                                        countryCode
                                    }
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
                companyIds: state.company?.id ? [state.company.id] : undefined,
            },
        },
    });

    return (
        <EventListUI
            company={state.company}
            event={state.event}
            events={eventListResult.data?.events}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
            loading={eventListResult.fetching}
            onBackFromTranscript={(event) => onSelectEvent(event, { value: null })}
            onCompanyChange={onSelectCompany}
            onSearchChange={({ currentTarget: { value } }) => setState({ ...state, searchTerm: value })}
            onSelectFilterBy={handlers.filterByTypes}
            onSelectListType={handlers.listType}
            onSelectEvent={onSelectEvent}
            searchTerm={state.searchTerm}
        />
    );
};
