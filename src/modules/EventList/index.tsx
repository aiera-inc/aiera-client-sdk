import React, {
    Dispatch,
    Fragment,
    JSXElementConstructor,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    RefObject,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { QueryResult, usePagingQuery, useQuery } from '@aiera/client-sdk/api/client';
import { Button } from '@aiera/client-sdk/components/Button';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Input } from '@aiera/client-sdk/components/Input';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Plus } from '@aiera/client-sdk/components/Svg/Plus';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { TimeAgo } from '@aiera/client-sdk/components/TimeAgo';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { EventListFilter, EventListView, useConfig } from '@aiera/client-sdk/lib/config';
import {
    getEventCreatorName,
    getPrimaryQuote,
    useAlertList,
    useAutoTrack,
    useCompanyResolver,
    usePrimaryWatchlistResolver,
    useSettings,
    useTrack,
    useUserStatus,
} from '@aiera/client-sdk/lib/data';
import { isToday } from '@aiera/client-sdk/lib/datetimes';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { Message, useMessageListener } from '@aiera/client-sdk/lib/msg';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { RecordingForm } from '@aiera/client-sdk/modules/RecordingForm';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';
import { ChangeHandler } from '@aiera/client-sdk/types';
import {
    EventListCurrentUserQuery,
    EventListQuery,
    EventListQueryVariables,
    EventType,
    EventView,
    User,
} from '@aiera/client-sdk/types/generated';
import { InstrumentID } from '@aiera/client-sdk/web/embed';

import { FilterBy } from './FilterBy';
import { PlayButton } from '@aiera/client-sdk/components/PlayButton';
import './styles.css';
import { Calendar as CalendarIcon } from '@aiera/client-sdk/components/Svg/Calendar';
import { Calendar } from '../Calendar';

enum FilterByType {
    transcript,
    earningsOnly,
}

interface FilterByTypeOption {
    label: string;
    value: FilterByType;
    defaultValue?: boolean;
    visible?: boolean;
}

export type EventListEvent = EventListQuery['search']['events']['hits'][0]['event'];
export type { CompanyFilterResult };

export interface EventListUIProps {
    company?: CompanyFilterResult;
    customOnly: boolean;
    darkMode?: boolean;
    event?: EventListEvent;
    eventListView?: EventListView;
    EventRow?: JSXElementConstructor<any>;
    eventsQuery: QueryResult<EventListQuery, EventListQueryVariables>;
    eventsQueryUpcoming: QueryResult<EventListQuery, EventListQueryVariables>;
    filterByTypeOptions: FilterByTypeOption[];
    filterByTypes?: FilterByType[];
    hideHeader?: boolean;
    hidePlaybar?: boolean;
    listType?: EventView;
    loading?: boolean;
    loadMore?: (event: MouseEvent) => void;
    loadingWatchlist: LoadingWatchlist;
    onBackFromTranscript?: MouseEventHandler;
    onCompanyChange?: ChangeHandler<CompanyFilterResult>;
    onSearchChange?: ChangeHandler<string>;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    onSelectEventById?: ChangeHandler<string>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    refetch?: () => void;
    scrollRef: RefObject<HTMLDivElement>;
    searchTerm?: string;
    setFocus?: Dispatch<SetStateAction<number>>;
    showCalendar: boolean;
    showCalendarToggle?: boolean;
    showCompanyFilter: boolean;
    showForm: boolean;
    showFormButton: boolean;
    showHeaderControls: boolean;
    toggleCalendar: MouseEventHandler;
    toggleForm: MouseEventHandler;
    useConfigOptions: boolean;
    userQuery: QueryResult<EventListCurrentUserQuery>;
    userStatusInactive: boolean;
}

export interface EventRowProps {
    customOnly: boolean;
    event: EventListEvent;
    index: number;
    isRefetching: boolean;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    refetch?: () => void;
    renderedRefetch: boolean;
    searchTerm?: string;
    setFocus?: Dispatch<SetStateAction<number>>;
    showDivider: boolean;
}

const LoadingEventList = () => (
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
);

const DefaultEventRow = ({
    customOnly,
    event,
    isRefetching,
    onSelectEvent,
    refetch,
    renderedRefetch,
    searchTerm,
    index,
    setFocus,
    showDivider,
}: EventRowProps) => {
    const primaryQuote = getPrimaryQuote(event.primaryCompany);
    const eventDate = DateTime.fromISO(event.eventDate);
    const audioOffset = (event.audioRecordingOffsetMs ?? 0) / 1000;
    const createdBy = getEventCreatorName(event.creator as User);
    let divider = null;
    if (showDivider) {
        divider = (
            <li className={classNames('sticky px-3 top-[56px] event-row-divider')}>
                <div className="px-1 py-2 backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 font-semibold dark:bg-bluegray-7 dark:bg-opacity-70">
                    {isToday(event.eventDate) ? `Today, ${eventDate.toFormat('DDD')}` : eventDate.toFormat('DDDD')}
                    <div className="ml-2 flex flex-1 h-[1px] bg-gradient-to-r from-gray-200 dark:from-bluegray-5" />
                    {!renderedRefetch && (
                        <div
                            onClick={!isRefetching ? refetch : undefined}
                            className="text-gray-400 cursor-pointer hover:text-gray-500 w-[50px] event-row-divider__refresh"
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
    }
    return (
        <Fragment key={event.id}>
            {divider}
            <li
                tabIndex={0}
                className={classNames(
                    'group text-xs text-gray-300 mx-1 rounded-lg px-2',
                    'hover:bg-blue-50 dark:hover:bg-bluegray-6',
                    {
                        'cursor-pointer active:bg-blue-100 dark:active:bg-bluegray-5':
                            event.eventType !== 'earnings_release',
                        'h-12': !searchTerm,
                        'h-14': !!searchTerm,
                    },
                    'event-row'
                )}
                onClick={
                    event.eventType !== 'earnings_release' ? (e) => onSelectEvent?.(e, { value: event }) : undefined
                }
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
                                    createdBy,
                                    eventDate: eventDate ? eventDate.toISO() : undefined,
                                    eventStream: event.audioStreamUri,
                                    eventType: event.eventType,
                                    externalAudioStreamUrl: event.externalAudioStreamUrl,
                                    isLive: !!event?.isLive,
                                    localTicker: primaryQuote?.localTicker,
                                    quote: primaryQuote,
                                    title: event.title,
                                }}
                                id={event.id}
                                url={event.isLive ? event.liveStreamUrl : event.audioProxy}
                                offset={audioOffset || 0}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 pl-2 pr-4">
                        <div className="flex items-baseline">
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
                            {customOnly ? createdBy : event.eventType.replace(/_/g, ' ')}
                        </div>
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
};

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        company,
        customOnly,
        darkMode = false,
        event,
        eventListView,
        eventsQuery,
        EventRow: EventRowOverride,
        eventsQueryUpcoming,
        filterByTypeOptions,
        filterByTypes,
        hideHeader,
        hidePlaybar,
        loadMore,
        loadingWatchlist,
        listType,
        onBackFromTranscript,
        onCompanyChange,
        onSearchChange,
        onSelectFilterBy,
        onSelectListType,
        onSelectEvent,
        onSelectEventById,
        refetch,
        scrollRef,
        searchTerm,
        setFocus,
        showCalendar,
        showCalendarToggle,
        showCompanyFilter,
        showForm,
        showFormButton,
        showHeaderControls,
        toggleCalendar,
        toggleForm,
        useConfigOptions,
        userQuery,
        userStatusInactive,
    } = props;

    const EventRow = EventRowOverride || DefaultEventRow;

    if (userStatusInactive) {
        return (
            <div className="flex flex-col justify-center items-center flex-1 h-full px-4">
                <h1 className="text-4xl font-bold">Uh-oh...</h1>
                <p className="text-slate-500 text-center">
                    You no longer have access
                    <br />
                    to transcripts by Aiera.
                </p>
                <div className="bg-yellow-100 rounded-xl px-5 py-3 mt-4 text-center">
                    <p>
                        Please reach out to{' '}
                        <a href="mailto:sales@aiera.com" className="text-blue-600">
                            sales@aiera.com
                        </a>
                        <br />
                        if you would like access to be enabled
                    </p>
                </div>
            </div>
        );
    }

    if (event && !showForm) {
        const editable =
            event.creator && userQuery.status === 'success' && userQuery.data.currentUser.id === event.creator.id;
        return (
            <Transcript
                eventId={event.id}
                initialSearchTerm={searchTerm}
                onBack={onBackFromTranscript}
                onEdit={editable ? toggleForm : undefined}
                showHeaderControls={showHeaderControls}
                useConfigOptions={useConfigOptions}
            />
        );
    }

    if (showForm) {
        return <RecordingForm onBack={toggleForm} privateRecordingId={event?.id} />;
    }

    const config = useConfig();
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    const showAllEvents = !!company || eventListView === 'combined' || (searchTerm && searchTerm.length > 0);
    let prevEventDate: DateTime | null = null;
    let renderedRefetch = false;
    let theme = darkMode;
    if (useConfigOptions && config.options) {
        if (config.options.darkMode !== undefined) {
            theme = config.options.darkMode;
        }
    }

    return (
        <div className={classNames('h-full flex flex-col eventlist relative z-30', { dark: theme })}>
            {!hideHeader && (
                <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 eventlist__header">
                    <div className="flex items-center mb-3">
                        <Input
                            icon={<MagnifyingGlass />}
                            name="search"
                            onChange={onSearchChange}
                            placeholder="Events & Transcripts..."
                            value={searchTerm}
                        />
                        {showHeaderControls && (
                            <>
                                {showCompanyFilter && (
                                    <div className="ml-2">
                                        <CompanyFilterButton onChange={onCompanyChange} value={company} />
                                    </div>
                                )}
                                <SettingsButton showSyncWatchlist showTonalSentiment={false} />
                                {showFormButton && (
                                    <Tooltip
                                        content={
                                            <div className="bg-black bg-opacity-80 px-1.5 py-0.5 rounded text-sm text-white dark:bg-bluegray-4 dark:text-bluegray-7">
                                                Schedule a new recording
                                            </div>
                                        }
                                        grow="down-left"
                                        hideOnDocumentScroll
                                        openOn="hover"
                                        position="bottom-right"
                                        yOffset={6}
                                    >
                                        <Button
                                            className="cursor-pointer flex flex-shrink-0 items-center justify-center ml-2 rounded-0.375 w-[34px]"
                                            kind="primary"
                                            onClick={toggleForm}
                                        >
                                            <Plus className="h-4 mb-0.5 text-white w-2.5" />
                                        </Button>
                                    </Tooltip>
                                )}
                                {showCalendarToggle && (
                                    <Tooltip
                                        content={
                                            <div className="bg-black bg-opacity-80 px-1.5 py-0.5 rounded text-sm text-white dark:bg-bluegray-4 dark:text-bluegray-7">
                                                Show Calendar
                                            </div>
                                        }
                                        grow="down-left"
                                        hideOnDocumentScroll
                                        openOn="hover"
                                        position="bottom-right"
                                        yOffset={6}
                                    >
                                        <Button
                                            className="cursor-pointer flex flex-shrink-0 items-center justify-center ml-2 rounded-0.375 w-[34px]"
                                            kind="primary"
                                            onClick={toggleCalendar}
                                        >
                                            <CalendarIcon className="h-6 mb-0.5 text-white w-6" />
                                        </Button>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </div>
                    {showCalendar && <Calendar />}
                </div>
            )}
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll dark:bg-bluegray-7" ref={scrollRef}>
                <div className="flex flex-col flex-grow">
                    <div
                        className={classNames('sticky top-0 pb-2 z-10', {
                            'pt-3 px-3': !hideHeader,
                            'pt-2 px-2': hideHeader,
                        })}
                    >
                        <FilterBy onChange={onSelectFilterBy} options={filterByTypeOptions} value={filterByTypes}>
                            {showAllEvents ? (
                                searchTerm && searchTerm.length > 0 ? (
                                    <p className="text-sm font-semibold dark:text-white">Matching Events</p>
                                ) : (
                                    <p className="text-sm font-semibold dark:text-white">All Events</p>
                                )
                            ) : (
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
                            )}
                        </FilterBy>
                    </div>
                    <div className={classNames('flex flex-col items-center justify-center flex-1')}>
                        {match(eventsQuery)
                            .with({ status: 'loading' }, () => <LoadingEventList />)
                            .with({ status: 'paused' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading events.'))
                            .with({ status: 'empty' }, () => wrapMsg('There are no events.'))
                            .with({ status: 'success' }, ({ data, isPaging, isRefetching }) =>
                                loadingWatchlist !== 'complete' ? (
                                    <LoadingEventList />
                                ) : (
                                    <ul className="w-full">
                                        {showAllEvents &&
                                            match(eventsQueryUpcoming)
                                                .with(
                                                    { status: 'success' },
                                                    ({ data: dataUpcoming, isRefetching: isUpcomingRefetching }) =>
                                                        dataUpcoming.search.events.hits.map((hit, index) => {
                                                            const eventDate = DateTime.fromISO(hit.event.eventDate);
                                                            let showDivider = false;
                                                            if (
                                                                !prevEventDate ||
                                                                prevEventDate.toFormat('MM/dd/yyyy') !==
                                                                    eventDate.toFormat('MM/dd/yyyy')
                                                            ) {
                                                                prevEventDate = eventDate;
                                                                showDivider = true;
                                                            }
                                                            if (!renderedRefetch) {
                                                                renderedRefetch = true;
                                                            }
                                                            return (
                                                                <EventRow
                                                                    customOnly={customOnly}
                                                                    event={hit.event}
                                                                    index={index}
                                                                    isRefetching={isUpcomingRefetching}
                                                                    key={`${hit.event.id}-${index}`}
                                                                    onSelectEvent={onSelectEvent}
                                                                    refetch={refetch}
                                                                    renderedRefetch={index !== 0}
                                                                    searchTerm={searchTerm}
                                                                    setFocus={setFocus}
                                                                    showDivider={showDivider}
                                                                />
                                                            );
                                                        })
                                                )
                                                .otherwise(() => null)}
                                        {data.search.events.hits.map((hit, index) => {
                                            const eventDate = DateTime.fromISO(hit.event.eventDate);
                                            let showDivider = false;
                                            if (
                                                !prevEventDate ||
                                                prevEventDate.toFormat('MM/dd/yyyy') !==
                                                    eventDate.toFormat('MM/dd/yyyy')
                                            ) {
                                                prevEventDate = eventDate;
                                                showDivider = true;
                                            }
                                            if (index > 0 && !renderedRefetch) {
                                                renderedRefetch = true;
                                            }
                                            return (
                                                <EventRow
                                                    customOnly={customOnly}
                                                    event={hit.event}
                                                    index={index}
                                                    isRefetching={isRefetching}
                                                    key={`${hit.event.id}-${index}`}
                                                    onSelectEvent={onSelectEvent}
                                                    refetch={refetch}
                                                    renderedRefetch={renderedRefetch}
                                                    searchTerm={searchTerm}
                                                    setFocus={setFocus}
                                                    showDivider={showDivider}
                                                />
                                            );
                                        })}
                                        {loadMore && (
                                            <li
                                                className="px-3 cursor-pointer"
                                                onClick={!isPaging ? loadMore : undefined}
                                            >
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
                                )
                            )
                            .exhaustive()}
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
            {!hidePlaybar && <Playbar onClickCalendar={onSelectEventById} />}
        </div>
    );
};

export interface EventListProps {
    noEarningsRelease?: boolean;
    controlledSearchTerm?: string;
    defaultLive?: boolean;
    hidePlaybar?: boolean;
    hideHeader?: boolean;
    useConfigOptions?: boolean;
    showHeaderControls?: boolean;
    EventRow?: JSXElementConstructor<any>;
}

type LoadingWatchlist = 'initialized' | 'started' | 'loading-query' | 'loading-refetch' | 'complete';

interface EventListState {
    company?: CompanyFilterResult;
    event?: EventListEvent;
    filterByTypes: FilterByType[];
    fromIndex: number;
    listType: EventView;
    loadingWatchlist: LoadingWatchlist;
    pageSize: number;
    searchTerm: string;
    showCalendar: boolean;
    showForm: boolean;
    userStatusInactive: boolean;
    userStatusLoaded: boolean;
    watchlist: string[];
    watchlistId?: string;
}

export const EventList = ({
    noEarningsRelease = false,
    controlledSearchTerm = '',
    useConfigOptions = false,
    defaultLive = true,
    hideHeader,
    hidePlaybar,
    showHeaderControls = true,
    EventRow,
}: EventListProps): ReactElement => {
    const { state, handlers, mergeState } = useChangeHandlers<EventListState>({
        company: undefined,
        event: undefined,
        filterByTypes: [],
        fromIndex: 0,
        listType: defaultLive ? EventView.LiveAndUpcoming : EventView.Recent,
        loadingWatchlist: 'complete',
        pageSize: 30,
        searchTerm: controlledSearchTerm,
        showCalendar: false,
        showForm: false,
        userStatusInactive: false,
        userStatusLoaded: false,
        watchlist: [],
        watchlistId: undefined,
    });

    const { settings } = useSettings();
    const resolveCompany = useCompanyResolver();
    const resolveUserStatus = useUserStatus();
    const track = useTrack();
    const upsertPrimaryWatchlist = usePrimaryWatchlistResolver();

    const config = useConfig();

    const loadTicker = async (ticker: InstrumentID) => {
        const companies = await resolveCompany([ticker]);
        if (companies?.[0]) {
            const company = companies[0];
            mergeState({ company, event: undefined });
        }
    };

    useEffect(() => {
        if (!state.company && config.options?.ticker) {
            void loadTicker([config.options.ticker] as InstrumentID);
        }
    }, [loadTicker, state, state.company, config, config?.options]);

    const bus = useMessageListener(
        'instrument-selected',
        async (msg: Message<'instrument-selected'>) => {
            const companies = await resolveCompany([msg.data]);
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
            const watchlistUsername = config?.tracking?.userId;
            /**
             * If there's a userId defined in the tracking config,
             * upsert a primary watchlist instead of resolving the company ids.
             * This watchlist approach avoids 414s from EventList queries
             * when there are thousands of company ids.
             */
            if (watchlistUsername) {
                mergeState({ loadingWatchlist: 'initialized' });
                const watchlistId = await upsertPrimaryWatchlist(msg.data, watchlistUsername);
                mergeState({ watchlistId, loadingWatchlist: 'started' });
                refetch();
            } else {
                let companyIds: string[] = [];
                const companies = await resolveCompany(msg.data);
                if (companies && companies.length) {
                    companyIds = companies.map((c) => c?.id).filter((n) => n);
                }
                mergeState({ watchlist: companyIds });
                refetch();
            }
        },
        'in'
    );

    const loadUserStatus = async (email: string) => {
        const userState = await resolveUserStatus(email);
        if (userState?.userStatus) {
            mergeState({ userStatusLoaded: true });
            void track('Load', 'User Status', {
                email,
                userStatusActive: userState.userStatus.active,
                userStatus: userState.userStatus.status,
            });
            if (!userState.userStatus.active) {
                mergeState({ userStatusInactive: true });
                bus?.emit('user-status-inactive', userState.userStatus, 'out');
            }
        }
    };

    useEffect(() => {
        if (!state.userStatusLoaded && config.user?.email) {
            void loadUserStatus(config.user.email);
        }
    }, [state, state.userStatusLoaded, loadUserStatus, config, config?.user]);

    const onSelectEvent = useCallback<ChangeHandler<EventListEvent>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value?.primaryCompany);
            const ticker = primaryQuote?.localTicker;
            const title = change.value?.title;
            const eventDate = change.value?.eventDate;
            const eventType = change.value?.eventType;
            const eventId = change.value?.id;
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');

            // We don't need to emit events
            // when going back to the event list
            if (eventDate && title) {
                bus?.emit(
                    'event-selected',
                    {
                        ticker,
                        title,
                        eventId,
                        eventType,
                        eventDate,
                    },
                    'out'
                );
            }
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
    }, [
        state.company,
        state.event,
        state.filterByTypes,
        state.listType,
        state.searchTerm,
        state.watchlist,
        state.watchlistId,
    ]);

    const eventsGQL = (type = '') => gql`
        query EventList${type}($filter: EventSearchFilter!, $view: EventView, $size: Int, $fromIndex: Int) {
            search {
                events(filter: $filter, view: $view, fromIndex: $fromIndex, size: $size) {
                    id
                    numTotalHits
                    hits {
                        id
                        event {
                            id
                            audioProxy
                            audioRecordingUrl
                            audioRecordingOffsetMs
                            audioStreamUri
                            connectionStatus
                            externalAudioStreamUrl
                            hasPublishedTranscript
                            hasTranscript
                            eventDate
                            eventType
                            isLive
                            liveStreamUrl
                            title
                            creator {
                                id
                                firstName
                                lastName
                                primaryEmail
                                username
                            }
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
    `;

    const eventTypes = useMemo(() => {
        let types;
        if (config.options?.customOnly) {
            types = [EventType.Custom];
        } else if (state.filterByTypes.includes(FilterByType.earningsOnly)) {
            types = [EventType.Earnings];
        } else if (noEarningsRelease) {
            types = Object.values(EventType).filter(
                (type) => ![EventType.EarningsRelease, EventType.Test].includes(type)
            );
        }
        return types;
    }, [config, state.filterByTypes]);

    const eventsQuery = usePagingQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: (data) => data.search.events.numTotalHits === 0,
        requestPolicy: 'cache-and-network',
        query: eventsGQL(),
        mergeResults,
        pause: !!state.event,
        variables: {
            view:
                state.company || config.options?.eventListView === 'combined' || state.searchTerm.length > 0
                    ? EventView.Recent
                    : state.listType,
            fromIndex: state.fromIndex,
            size: state.pageSize,
            filter: {
                hasTranscripts: state.filterByTypes.includes(FilterByType.transcript) ? true : undefined,
                eventTypes,
                searchTerm: state.searchTerm || undefined,
                companyIds: state.company?.id
                    ? [state.company.id]
                    : state.watchlist?.length && settings.syncWatchlist
                    ? state.watchlist
                    : undefined,
                watchlistId: state.watchlistId,
            },
        },
    });

    const eventsQueryUpcoming = usePagingQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: (data) => data.search.events.numTotalHits === 0,
        requestPolicy: 'cache-and-network',
        query: eventsGQL('Upcoming'),
        mergeResults,
        pause: !!state.event,
        variables: {
            view: EventView.LiveAndUpcoming,
            fromIndex: state.fromIndex,
            size: state.pageSize,
            filter: {
                hasTranscripts: state.filterByTypes.includes(FilterByType.transcript) ? true : undefined,
                eventTypes,
                searchTerm: state.searchTerm || undefined,
                companyIds: state.company?.id
                    ? [state.company.id]
                    : state.watchlist?.length && settings.syncWatchlist
                    ? state.watchlist
                    : undefined,
                watchlistId: state.watchlistId,
            },
        },
    });

    const userQuery = useQuery<EventListCurrentUserQuery>({
        requestPolicy: 'cache-only',
        query: gql`
            query EventListCurrentUser {
                currentUser {
                    id
                }
            }
        `,
    });

    const filterByTypeOptions: FilterByTypeOption[] = useMemo(() => {
        let options: FilterByTypeOption[] = [];
        if (config.options?.eventListFilters) {
            const defaultValues: FilterByType[] = [];
            config.options.eventListFilters.forEach((filter: EventListFilter) => {
                if (filter.name === 'transcripts') {
                    if (filter.visible) {
                        options.push({
                            value: FilterByType.transcript,
                            label: 'Transcripts',
                        });
                    }
                    if (filter.defaultValue) {
                        defaultValues.push(FilterByType.transcript);
                    }
                }
                if (filter.name === 'earningsOnly') {
                    if (filter.visible) {
                        options.push({
                            value: FilterByType.earningsOnly,
                            label: 'Earnings',
                        });
                    }
                    if (filter.defaultValue) {
                        defaultValues.push(FilterByType.earningsOnly);
                    }
                }
            });
            handlers.filterByTypes(new Event('mouse'), { value: defaultValues });
        } else {
            options = [
                { value: FilterByType.transcript, label: 'Transcripts' },
                { value: FilterByType.earningsOnly, label: 'Earnings' },
            ];
        }
        return options;
    }, [config]);

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

    const scrollRef = useRef<HTMLDivElement>(null);
    const refetch = useCallback(() => {
        const hasPaged = state.fromIndex > 0;
        mergeState({ fromIndex: 0 });
        if (!hasPaged) {
            if (state.company || config.options?.eventListView === 'combined' || state.searchTerm.length > 0) {
                // Reasons to refetch both
                eventsQuery.refetch();
                eventsQueryUpcoming.refetch();
            } else if (state.listType === 'recent') {
                eventsQuery.refetch();
            } else if (state.listType === 'live_and_upcoming') {
                eventsQueryUpcoming.refetch();
            }
        }
    }, [
        state.listType,
        eventsQuery.refetch,
        eventsQueryUpcoming.refetch,
        state.fromIndex,
        state.company,
        state.searchTerm,
        config.options?.eventListView,
    ]);

    // Refresh every 15 seconds, but only if the user is at the top of the list
    // If they are on another page we don't want to wipe out their results
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

    useAutoTrack('Click', 'Event Filter By', { filterBy: state.filterByTypes, widgetUserId: config.tracking?.userId }, [
        state.filterByTypes,
        config.tracking?.userId,
    ]);
    useAutoTrack(
        'Submit',
        'Event Search',
        { searchTerm: state.searchTerm, widgetUserId: config.tracking?.userId },
        [state.searchTerm, config.tracking?.userId],
        !state.searchTerm
    );
    useAutoTrack('View', 'Events', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);

    // Will poll alerts when passing true
    useAlertList(true);

    useEffect(() => {
        handlers.searchTerm(new KeyboardEvent('keydown'), { value: controlledSearchTerm });
    }, [controlledSearchTerm]);

    // Handle watchlist loading UI
    useEffect(() => {
        // We've started loading the watchlist
        const watchlistQuery = state.listType === 'recent' ? eventsQuery : eventsQueryUpcoming;
        if (state.loadingWatchlist === 'started') {
            if (watchlistQuery.state.stale) {
                // If it's a refetch query
                mergeState({ loadingWatchlist: 'loading-refetch' });
            } else if (watchlistQuery.status === 'loading') {
                // If it's a query load
                mergeState({ loadingWatchlist: 'loading-query' });
            }
        } else if (state.loadingWatchlist === 'loading-refetch') {
            if (!watchlistQuery.state.stale) {
                // Refetch completed
                mergeState({ loadingWatchlist: 'complete' });
            }
        } else if (state.loadingWatchlist === 'loading-query') {
            if (watchlistQuery.status === 'success' || !watchlistQuery.state.stale) {
                // Query completed
                mergeState({ loadingWatchlist: 'complete' });
            }
        }
    }, [state.listType, state.loadingWatchlist, eventsQuery, eventsQueryUpcoming]);

    return (
        <EventListUI
            company={state.company}
            customOnly={!!config.options?.customOnly}
            darkMode={settings.darkMode}
            event={state.event}
            eventListView={config.options?.eventListView}
            eventsQuery={eventsQuery}
            eventsQueryUpcoming={eventsQueryUpcoming}
            EventRow={EventRow}
            filterByTypeOptions={filterByTypeOptions}
            filterByTypes={state.filterByTypes}
            hideHeader={hideHeader}
            hidePlaybar={hidePlaybar}
            listType={state.listType}
            loadMore={hasMoreResults ? loadMore : undefined}
            loadingWatchlist={state.loadingWatchlist}
            onBackFromTranscript={useCallback(
                (event: SyntheticEvent<Element, Event>) => onSelectEvent(event, { value: null }),
                [onSelectEvent]
            )}
            onCompanyChange={onSelectCompany}
            onSearchChange={handlers.searchTerm}
            onSelectEvent={onSelectEvent}
            onSelectEventById={onSelectEventById}
            onSelectFilterBy={handlers.filterByTypes}
            onSelectListType={handlers.listType}
            refetch={refetch}
            scrollRef={scrollRef}
            searchTerm={state.searchTerm}
            setFocus={setFocus}
            showCalendar={state.showCalendar}
            showCompanyFilter={
                config.options?.showCompanyFilter === undefined ? true : config.options?.showCompanyFilter
            }
            showForm={state.showForm}
            showFormButton={!!config.options?.showScheduleRecording}
            showCalendarToggle={!!config.options?.showCalendarToggle}
            showHeaderControls={showHeaderControls}
            toggleCalendar={useCallback(
                (event: SyntheticEvent<Element, Event>) => {
                    handlers.showCalendar(event, { value: !state.showCalendar });
                },
                [state.showCalendar]
            )}
            toggleForm={useCallback(
                (event: SyntheticEvent<Element, Event>) => {
                    handlers.showForm(event, { value: !state.showForm });
                },
                [state.showForm]
            )}
            useConfigOptions={useConfigOptions}
            userQuery={userQuery}
            userStatusInactive={state.userStatusInactive}
        />
    );
};
