import React, {
    Fragment,
    ReactElement,
    SyntheticEvent,
    MouseEvent,
    MouseEventHandler,
    useEffect,
    useCallback,
    useMemo,
    useState,
    useRef,
    RefObject,
    Dispatch,
    SetStateAction,
} from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';
import classNames from 'classnames';

import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { EventListQuery, EventListQueryVariables, EventType, EventView } from '@aiera/client-sdk/types/generated';
import { QueryResult, usePagingQuery } from '@aiera/client-sdk/api/client';
import { isToday } from '@aiera/client-sdk/lib/datetimes';
import { useMessageListener, Message } from '@aiera/client-sdk/lib/msg';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { getPrimaryQuote, useCompanyResolver, useAutoTrack, useSettings } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { useAlertList } from '@aiera/client-sdk/lib/data';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { TimeAgo } from '@aiera/client-sdk/components/TimeAgo';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { FilterBy } from './FilterBy';
import { PlayButton } from './PlayButton';
import './styles.css';

enum FilterByType {
    transcript,
    earningsOnly,
}

export type EventListEvent = EventListQuery['search']['events']['hits'][0]['event'];
export type { CompanyFilterResult };

export interface EventListUIProps {
    refetch?: () => void;
    company?: CompanyFilterResult;
    darkMode?: boolean;
    event?: EventListEvent;
    eventsQuery: QueryResult<EventListQuery, EventListQueryVariables>;
    filterByTypes?: FilterByType[];
    loadMore?: (event: MouseEvent) => void;
    listType?: EventView;
    loading?: boolean;
    maxHits?: number;
    onBackFromTranscript?: MouseEventHandler;
    onCompanyChange?: ChangeHandler<CompanyFilterResult>;
    onSearchChange?: ChangeHandler<string>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    onSelectEventById?: ChangeHandler<string>;
    scrollRef: RefObject<HTMLDivElement>;
    searchTerm?: string;
    setFocus?: Dispatch<SetStateAction<number>>;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        refetch,
        company,
        darkMode = false,
        event,
        eventsQuery,
        filterByTypes,
        loadMore,
        listType,
        maxHits = 0,
        onBackFromTranscript,
        onCompanyChange,
        onSearchChange,
        onSelectFilterBy,
        onSelectListType,
        onSelectEvent,
        onSelectEventById,
        scrollRef,
        searchTerm,
        setFocus,
    } = props;

    if (event) {
        return <Transcript eventId={event.id} onBack={onBackFromTranscript} />;
    }

    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate: DateTime | null = null;
    let renderedRefetch = false;

    return (
        <div className={classNames('h-full flex flex-col eventlist', { dark: darkMode })}>
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 eventlist__header">
                <div className="flex items-center mb-3">
                    <Input
                        icon={<MagnifyingGlass />}
                        name="search"
                        onChange={onSearchChange}
                        placeholder="Events & Transcripts..."
                        value={searchTerm}
                    />
                    <div className="mx-2">
                        <CompanyFilterButton onChange={onCompanyChange} value={company} />
                    </div>
                    <SettingsButton showSyncWatchlist showTonalSentiment={false} />
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll dark:bg-bluegray-7" ref={scrollRef}>
                <div className="flex flex-col flex-grow">
                    <div className="sticky top-0 px-3 pt-3 pb-2 z-10">
                        <FilterBy
                            onChange={onSelectFilterBy}
                            options={[
                                { value: FilterByType.transcript, label: 'Transcripts' },
                                { value: FilterByType.earningsOnly, label: 'Earnings' },
                            ]}
                            value={filterByTypes}
                        >
                            <Tabs<EventView>
                                className="ml-1 eventlist__tabs"
                                kind="line"
                                onChange={onSelectListType}
                                options={[
                                    {
                                        value: EventView.LiveAndUpcoming,
                                        label: 'Live Events',
                                    },
                                    { value: EventView.Recent, label: 'Recent' },
                                ]}
                                value={listType}
                            />
                        </FilterBy>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        {match(eventsQuery)
                            .with({ status: 'loading' }, () => (
                                <ul className="w-full EventList__loading">
                                    {new Array(15).fill(0).map((_, idx) => (
                                        <li key={idx} className="p-2 animate-pulse mx-2">
                                            <div className="flex items-center">
                                                <div className="rounded-full bg-gray-300 dark:bg-bluegray-5 w-9 h-9" />
                                                <div className="flex flex-col flex-1 min-w-0 p-2 pr-4">
                                                    <div className="flex">
                                                        <div className="rounded-full bg-gray-500 dark:bg-bluegray-5 h-[10px] mr-2 w-7" />
                                                        <div className="rounded-full bg-gray-400 dark:bg-bluegray-6 h-[10px] mr-2 w-12" />
                                                    </div>
                                                    <div className="flex">
                                                        <div className="rounded-full bg-gray-300 dark:bg-bluegray-5 h-[10px] mr-2 w-28 mt-2" />
                                                        <div className="rounded-full bg-gray-200 dark:bg-bluegray-6 h-[10px] mr-2 w-16 mt-2" />
                                                        <div className="rounded-full bg-gray-200 dark:bg-bluegray-6 h-[10px] mr-2 w-10 mt-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ))
                            .with({ status: 'paused' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading events.'))
                            .with({ status: 'empty' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'success' }, ({ data, isPaging, isRefetching }) => (
                                <ul className="w-full">
                                    {data.search.events.hits.map((hit, index) => {
                                        const event = hit.event;
                                        const hitRatio = (hit.numMentions || 0) / maxHits;
                                        // Need to include these hardcoded to
                                        // make sure tailwind doesn't purge
                                        // w-1/12 w-2/12 w-3/12 w-4/12 w-5/12 w-6/12 w-7/12 w-8/12 w-9/12 w-10/12 w-11/12
                                        const hitRatioClass =
                                            hitRatio === 1
                                                ? 'full'
                                                : hitRatio === 0
                                                ? '0'
                                                : `${Math.ceil(hitRatio * 12)}/12`;
                                        const primaryQuote = getPrimaryQuote(event.primaryCompany);
                                        const eventDate = DateTime.fromISO(event.eventDate);
                                        const audioOffset = (event.audioRecordingOffsetMs ?? 0) / 1000;
                                        let divider = null;
                                        if (
                                            !prevEventDate ||
                                            prevEventDate.toFormat('MM/dd/yyyy') !== eventDate.toFormat('MM/dd/yyyy')
                                        ) {
                                            prevEventDate = eventDate;
                                            divider = (
                                                <li className="sticky top-[56px] px-3">
                                                    <div className="px-1 py-2 backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 font-semibold dark:bg-bluegray-7 dark:bg-opacity-70">
                                                        {eventDate.toFormat('DDDD')}
                                                        <div className="ml-2 flex flex-1 h-[1px] bg-gradient-to-r from-gray-200 dark:from-bluegray-5"></div>
                                                        {!renderedRefetch && (
                                                            <div
                                                                onClick={!isRefetching ? refetch : undefined}
                                                                className="text-gray-400 cursor-pointer hover:text-gray-500 w-[50px]"
                                                            >
                                                                {isRefetching ? (
                                                                    <div className="flex justify-center group">
                                                                        <div className="w-1 h-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation" />
                                                                        <div className="w-1 h-1 ml-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation-delay-100" />
                                                                        <div className="w-1 h-1 ml-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation-delay-200" />
                                                                    </div>
                                                                ) : (
                                                                    'Refresh'
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                            renderedRefetch = true;
                                        }
                                        return (
                                            <Fragment key={event.id}>
                                                {divider}
                                                <li
                                                    tabIndex={0}
                                                    className={classNames(
                                                        'group text-xs text-gray-300 mx-1 rounded-lg px-2 cursor-pointer hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-bluegray-6 dark:active:bg-bluegray-5',
                                                        {
                                                            'h-12': !searchTerm,
                                                            'h-14': !!searchTerm,
                                                        }
                                                    )}
                                                    onClick={(e) => onSelectEvent?.(e, { value: event })}
                                                    onFocus={() => setFocus?.(index)}
                                                    onBlur={() => setFocus?.(-1)}
                                                >
                                                    <Tooltip
                                                        className={classNames('flex flex-row', {
                                                            'h-12': !searchTerm,
                                                            'h-14': !!searchTerm,
                                                        })}
                                                        content={
                                                            <div className="max-w-[300px] bg-black bg-opacity-80 dark:bg-bluegray-4 px-1.5 py-0.5 rounded text-white dark:text-bluegray-7 ml-9">
                                                                {prettyLineBreak(event.title)}
                                                            </div>
                                                        }
                                                        grow="up-right"
                                                        openOn="hover"
                                                        position="top-left"
                                                        yOffset={4}
                                                        hideOnDocumentScroll
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex items-center justify-center w-8 h-8">
                                                                <PlayButton
                                                                    metaData={{
                                                                        quote: primaryQuote,
                                                                        eventType: event.eventType,
                                                                        eventDate: eventDate
                                                                            ? eventDate.toISO()
                                                                            : undefined,
                                                                        localTicker: primaryQuote?.localTicker,
                                                                    }}
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
                                                        <div className="flex flex-col justify-center flex-1 min-w-0 pl-2 pr-4">
                                                            <div className="flex items-end">
                                                                {primaryQuote?.localTicker ? (
                                                                    <>
                                                                        <span className="leading-none text-sm text-blue-600 dark:text-blue-500 pr-1 font-bold group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                                                                            {primaryQuote?.localTicker}
                                                                        </span>
                                                                        <span className="leading-none mb-[1px] tracking-wider text-xs text-gray-400 group-hover:text-gray-500">
                                                                            {primaryQuote?.exchange?.shortName}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="leading-none text-sm text-black dark:text-white truncate font-bold">
                                                                        {event.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="leading-none flex text-sm capitalize items-center mt-1 text-black dark:text-white">
                                                                {event.eventType.replace(/_/g, ' ')}
                                                            </div>
                                                            {searchTerm && (
                                                                <div className="flex items-center mt-[2px]">
                                                                    <div className="rounded-full h-[6px] w-20 bg-gray-200">
                                                                        <div
                                                                            className={`rounded-full h-[6px] bg-blue-500 w-${hitRatioClass}`}
                                                                        />
                                                                    </div>
                                                                    <div className="uppercase font-semibold ml-2 text-black tracking-wide text-xs">
                                                                        {hit.numMentions || 0} hit
                                                                        {hit.numMentions !== 1 && 's'}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-center items-end">
                                                            {event.isLive ? (
                                                                <div className="text-xs leading-none flex justify-center items-center text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-bluegray-6 rounded px-1 pt-0.5 pb-[3px] mb-0.5 group-hover:bg-red-500 group-hover:text-white">
                                                                    {`Live • ${eventDate.toFormat('h:mma')}`}
                                                                </div>
                                                            ) : (
                                                                <div className="leading-none text-gray-500 group-hover:text-black dark:group-hover:text-gray-300">
                                                                    {isToday(event.eventDate) ? (
                                                                        <TimeAgo date={event.eventDate} realtime />
                                                                    ) : (
                                                                        eventDate.toFormat('h:mma')
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="leading-none mt-1 text-gray-300 group-hover:text-gray-500">
                                                                {eventDate.toFormat('MMM dd, yyyy')}
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                    {loadMore && (
                                        <li className="px-3 cursor-pointer" onClick={!isPaging ? loadMore : undefined}>
                                            <div className="px-1 py-2 backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 font-semibold dark:bg-bluegray-7 dark:bg-opacity-70">
                                                <div className="mr-2 flex-1 h-[1px] bg-gradient-to-l from-gray-200 dark:from-bluegray-5"></div>
                                                {isPaging ? (
                                                    <div className="flex justify-center items-center group h-[15px]">
                                                        <div className="w-1 h-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation" />
                                                        <div className="w-1 h-1 ml-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation-delay-100" />
                                                        <div className="w-1 h-1 ml-1 bg-gray-400 group-hover:bg-gray-500 rounded-full animate-bounce animation-delay-200" />
                                                    </div>
                                                ) : (
                                                    'Load more'
                                                )}
                                                <div className="ml-2 flex-1 h-[1px] bg-gradient-to-r from-gray-200 dark:from-bluegray-5"></div>
                                            </div>
                                        </li>
                                    )}
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
    fromIndex: number;
    pageSize: number;
    watchlist: string[];
    event?: EventListEvent;
    filterByTypes: FilterByType[];
    listType: EventView;
    searchTerm: string;
}

export const EventList = (_props: EventListProps): ReactElement => {
    const { state, handlers, mergeState } = useChangeHandlers<EventListState>({
        company: undefined,
        fromIndex: 0,
        pageSize: 30,
        watchlist: [],
        event: undefined,
        filterByTypes: [],
        listType: EventView.LiveAndUpcoming,
        searchTerm: '',
    });

    const { settings } = useSettings();
    const resolveCompany = useCompanyResolver();
    const bus = useMessageListener(
        'instrument-selected',
        async (msg: Message<'instrument-selected'>) => {
            const companies = await resolveCompany(msg.data);
            if (companies?.[0]) {
                const company = companies[0];
                mergeState({ company, event: undefined });
            }
        },
        'in'
    );

    useMessageListener(
        'instruments-selected',
        async (msg: Message<'instruments-selected'>) => {
            const companyIds = (await Promise.all(msg.data.map(resolveCompany)))
                .flat()
                .map((c) => c?.id)
                .filter((n) => n) as string[];
            mergeState({ watchlist: companyIds });
        },
        'in'
    );

    const onSelectEvent = useCallback<ChangeHandler<EventListEvent>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value?.primaryCompany);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.event(event, change);
            // If we are going back to the event list, refetch immediately
            if (!change.value) {
                eventsQuery.refetch();
            }
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

    const mergeResults = (prevQuery: EventListQuery, newQuery: EventListQuery) => {
        const prevHits = prevQuery.search?.events.hits || [];
        const newHits = newQuery.search.events.hits || [];
        const prevIds = new Set(prevHits.map((hit) => hit.event.id));
        return {
            search: {
                events: {
                    ...newQuery.search.events,
                    hits: [...prevHits, ...newHits.filter((h) => !prevIds.has(h.event.id))],
                },
            },
        };
    };

    useEffect(() => {
        if (state.fromIndex) mergeState({ fromIndex: 0 });
    }, [state.listType, state.listType, state.company, state.filterByTypes, state.searchTerm, state.event]);

    const eventsQuery = usePagingQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: (data) => data.search.events.numTotalHits === 0,
        requestPolicy: 'cache-and-network',
        query: gql`
            query EventList($filter: EventSearchFilter!, $view: EventView, $size: Int, $fromIndex: Int) {
                search {
                    events(filter: $filter, view: $view, fromIndex: $fromIndex, size: $size) {
                        id
                        numTotalHits
                        hits {
                            id
                            numMentions
                            event {
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
                    }
                }
            }
        `,
        mergeResults,
        variables: {
            view: state.listType,
            fromIndex: state.fromIndex,
            size: state.pageSize,
            filter: {
                hasTranscripts: state.filterByTypes.includes(FilterByType.transcript) ? true : undefined,
                eventTypes: state.filterByTypes.includes(FilterByType.earningsOnly) ? [EventType.Earnings] : undefined,
                searchTerm: state.searchTerm || undefined,
                companyIds: state.company?.id
                    ? [state.company.id]
                    : state.watchlist?.length && settings.syncWatchlist
                    ? state.watchlist
                    : undefined,
            },
        },
    });

    const hasMoreResults = useMemo(() => {
        if (eventsQuery.status === 'success') {
            return eventsQuery.data.search.events.hits.length < eventsQuery.data.search.events.numTotalHits;
        }
        return false;
    }, [eventsQuery.status]);

    const loadMore = useCallback(
        (event: MouseEvent) => handlers.fromIndex(event, { value: state.fromIndex + state.pageSize }),
        [handlers.fromIndex, state.fromIndex]
    );

    const maxHits = useMemo(
        () =>
            match(eventsQuery)
                .with({ status: 'success' }, ({ data: { search } }) =>
                    Math.max(...search.events.hits.map((h) => h.numMentions || 0))
                )
                .otherwise(() => 0),
        [eventsQuery.state]
    );

    const scrollRef = useRef<HTMLDivElement>(null);
    const refetch = useCallback(() => {
        const hasPaged = state.fromIndex > 0;
        mergeState({ fromIndex: 0 });
        if (!hasPaged) eventsQuery.refetch();
    }, [eventsQuery.refetch, state.fromIndex]);

    // Refresh every 15 seconds, but only if the user is at the top of the list,
    // if they are on another page we dont want to wipe out their results.
    useInterval(() => {
        if ((scrollRef.current?.scrollTop || 0) <= 10) {
            refetch();
        }
    }, 15000);

    const [focusIndex, setFocus] = useState(-1);

    useWindowListener('keydown', (event: KeyboardEvent) => {
        // Focus is -1 on mount and on blur, so when >= 0, we actually want
        // to handle the keyboard event
        if (focusIndex >= 0 && event.key === 'Enter') {
            match(eventsQuery)
                .with({ status: 'success' }, ({ data }) => {
                    const selectedOption = data.search.events.hits[focusIndex]?.event;
                    if (selectedOption) {
                        setFocus(-1);
                        onSelectEvent(event, { value: selectedOption });
                    }
                })
                .otherwise(() => true);
        }
    });

    const onSelectEventById = useCallback<ChangeHandler<string>>(
        (event, change) => {
            if (eventsQuery.status === 'success') {
                const selectedEvent = eventsQuery.data.search.events.hits.find(
                    ({ event }) => event.id === change.value
                )?.event;
                if (selectedEvent) {
                    onSelectEvent(event, { value: selectedEvent });
                }
            }
        },
        [eventsQuery.status]
    );

    useAutoTrack('Click', 'Event Filter By', { filterBy: state.filterByTypes }, [state.filterByTypes]);
    useAutoTrack('Submit', 'Event Search', { searchTerm: state.searchTerm }, [state.searchTerm], !state.searchTerm);

    // Will poll alerts when passing true
    useAlertList(true);

    return (
        <EventListUI
            company={state.company}
            darkMode={settings.darkMode}
            event={state.event}
            eventsQuery={eventsQuery}
            filterByTypes={state.filterByTypes}
            loadMore={hasMoreResults ? loadMore : undefined}
            refetch={refetch}
            listType={state.listType}
            maxHits={maxHits}
            onBackFromTranscript={useCallback(
                (event: SyntheticEvent<Element, Event>) => onSelectEvent(event, { value: null }),
                [onSelectEvent]
            )}
            onCompanyChange={onSelectCompany}
            onSearchChange={handlers.searchTerm}
            onSelectFilterBy={handlers.filterByTypes}
            onSelectListType={handlers.listType}
            onSelectEvent={onSelectEvent}
            onSelectEventById={onSelectEventById}
            scrollRef={scrollRef}
            searchTerm={state.searchTerm}
            setFocus={setFocus}
        />
    );
};
