import React, { ReactElement, FormEventHandler, MouseEventHandler, useCallback } from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { EventListQuery, EventListQueryVariables, EventType, EventView } from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useMessageListener, Message } from '@aiera/client-sdk/lib/msg';
import { getPrimaryQuote, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
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
    eventsQuery: QueryResult<EventListQuery, EventListQueryVariables>;
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    onBackFromTranscript?: MouseEventHandler;
    onCompanyChange?: ChangeHandler<CompanyFilterResult>;
    onSearchChange?: FormEventHandler<HTMLInputElement>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    onSelectEventById?: ChangeHandler<string>;
    searchTerm?: string;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        company,
        event,
        eventsQuery,
        filterByTypes,
        listType,
        onBackFromTranscript,
        onCompanyChange,
        onSearchChange,
        onSelectFilterBy,
        onSelectListType,
        onSelectEvent,
        onSelectEventById,
        searchTerm,
    } = props;

    if (event) {
        return <Transcript eventId={event.id} onBack={onBackFromTranscript} />;
    }

    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    return (
        <div className="h-full flex flex-col eventlist">
            <div className="flex flex-col p-3 shadow-3xl eventlist__header">
                <div className="flex items-center mb-2">
                    <Input
                        name="search"
                        onChange={onSearchChange}
                        placeholder="Search Events & Transcripts"
                        value={searchTerm}
                        extendClassName="mr-1"
                    >
                        <MagnifyingGlass />
                    </Input>
                    <div className="ml-2">
                        <CompanyFilterButton onChange={onCompanyChange} value={company} />
                    </div>
                </div>
                <Tabs<EventView>
                    onChange={onSelectListType}
                    options={[
                        { value: EventView.LiveAndUpcoming, label: 'Live & Upcoming' },
                        { value: EventView.Recent, label: 'Recent Events' },
                    ]}
                    value={listType}
                />
            </div>
            <div className="flex flex-col flex-1 p-3 pb-2 pt-0 overflow-y-scroll">
                <div className="flex flex-col flex-grow eventlist__tabs">
                    <div className="sticky top-3 mb-2">
                        <FilterBy
                            onChange={onSelectFilterBy}
                            options={[
                                { value: FilterByType.transcript, label: 'Has transcript' },
                                { value: FilterByType.earningsOnly, label: 'Earnings only' },
                            ]}
                            value={filterByTypes}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 mt-3">
                        {match(eventsQuery)
                            .with({ status: 'loading' }, () => (
                                <ul className="w-full EventList__loading">
                                    {new Array(15).fill(0).map((_, idx) => (
                                        <li key={idx} className="p-2 animate-pulse">
                                            <div className="flex items-center">
                                                <div className="rounded-full bg-gray-300 w-9 h-9" />
                                                <div className="flex flex-col flex-1 min-w-0 p-2 pr-4">
                                                    <div className="flex">
                                                        <div className="rounded-full bg-gray-500 h-[10px] mr-2 w-7" />
                                                        <div className="rounded-full bg-gray-400 h-[10px] mr-2 w-12" />
                                                        <div className="rounded-full bg-gray-300 h-[10px] mr-2 w-20" />
                                                    </div>
                                                    <div className="mt-2 rounded-full bg-gray-300 h-[10px] w-full" />
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-300 h-[10px] w-8" />
                                                    <div className="mt-2 rounded-full bg-gray-300 h-[10px] w-10" />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ))
                            .with({ status: 'paused' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading events.'))
                            .with({ status: 'empty' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'success' }, ({ data: { events } }) => (
                                <ul className="w-full">
                                    {events.map((event) => {
                                        const primaryQuote = getPrimaryQuote(event.primaryCompany);
                                        const eventDate = DateTime.fromISO(event.eventDate);
                                        const audioOffset = (event.audioRecordingOffsetMs ?? 0) / 1000;
                                        return (
                                            <li
                                                className="text-xs"
                                                onClick={(e) => onSelectEvent?.(e, { value: event })}
                                                key={event.id}
                                            >
                                                <div className="flex flex-row">
                                                    <div className="flex items-center justify-center">
                                                        <div className="flex items-center justify-center w-9 h-9">
                                                            <PlayButton
                                                                id={event.id}
                                                                url={
                                                                    event.isLive
                                                                        ? `https://storage.media.aiera.com/${event.id}`
                                                                        : event.audioRecordingUrl
                                                                }
                                                                offset={audioOffset || 0}
                                                            />
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
                            ))
                            .exhaustive()}
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
            <Playbar onClickCalendar={onSelectEventById} />
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
                    setState((s) => ({ ...s, company, event: undefined }));
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

    const eventsQuery = useQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: ({ events }) => events.length === 0,
        query: gql`
            query EventList($filter: EventFilter, $view: EventView) {
                events(filter: $filter, view: $view) {
                    id
                    title
                    eventDate
                    eventType
                    isLive
                    audioRecordingUrl
                    audioRecordingOffsetMs
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

    useInterval(
        useCallback(() => eventsQuery.refetch({ requestPolicy: 'cache-and-network' }), [eventsQuery.refetch]),
        15000
    );

    const onSelectEventById = useCallback<ChangeHandler<string>>(
        (event, change) => {
            if (eventsQuery.status === 'success') {
                const selectedEvent = eventsQuery.data.events.find((event) => event.id === change.value);
                if (selectedEvent) {
                    onSelectEvent(event, { value: selectedEvent });
                }
            }
        },
        [eventsQuery.status]
    );

    return (
        <EventListUI
            company={state.company}
            event={state.event}
            eventsQuery={eventsQuery}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
            onBackFromTranscript={(event) => onSelectEvent(event, { value: null })}
            onCompanyChange={onSelectCompany}
            onSearchChange={({ currentTarget: { value } }) => setState({ ...state, searchTerm: value })}
            onSelectFilterBy={handlers.filterByTypes}
            onSelectListType={handlers.listType}
            onSelectEvent={onSelectEvent}
            onSelectEventById={onSelectEventById}
            searchTerm={state.searchTerm}
        />
    );
};
