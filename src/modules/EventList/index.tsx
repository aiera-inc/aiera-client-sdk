import React, {
    Dispatch,
    Fragment,
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
import { PlayButton } from './PlayButton';
import './styles.css';

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
    eventsQuery: QueryResult<EventListQuery, EventListQueryVariables>;
    eventsQueryUpcoming: QueryResult<EventListQuery, EventListQueryVariables>;
    filterByTypeOptions: FilterByTypeOption[];
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    loadMore?: (event: MouseEvent) => void;
    maxHits?: number;
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
    showCompanyFilter: boolean;
    showForm: boolean;
    showFormButton: boolean;
    showHeaderControls: boolean;
    toggleForm: MouseEventHandler;
    useConfigOptions: boolean;
    userQuery: QueryResult<EventListCurrentUserQuery>;
    userStatusInactive: boolean;
}

interface EventRowProps {
    customOnly: boolean;
    event: EventListEvent;
    index: number;
    isRefetching: boolean;
    maxHits?: number;
    numMentions: number | null | undefined;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    refetch?: () => void;
    renderedRefetch: boolean;
    searchTerm?: string;
    setFocus?: Dispatch<SetStateAction<number>>;
    showDivider: boolean;
}

const EventRow = ({
    customOnly,
    event,
    numMentions,
    maxHits = 0,
    isRefetching,
    onSelectEvent,
    refetch,
    renderedRefetch,
    searchTerm,
    index,
    setFocus,
    showDivider,
}: EventRowProps) => {
    const hitRatio = (numMentions || 0) / maxHits;
    // Need to include these hardcoded to
    // make sure tailwind doesn't purge
    // w-1/12 w-2/12 w-3/12 w-4/12 w-5/12 w-6/12 w-7/12 w-8/12 w-9/12 w-10/12 w-11/12
    const hitRatioClass = hitRatio === 1 ? 'full' : hitRatio === 0 ? '0' : `${Math.ceil(hitRatio * 12)}/12`;
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
                                    eventType: event.eventType,
                                    localTicker: primaryQuote?.localTicker,
                                    quote: primaryQuote,
                                    title: event.title,
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
                            {customOnly ? createdBy : event.eventType.replace(/_/g, ' ')}
                        </div>
                        {searchTerm && (
                            <div className="flex items-center mt-[2px]">
                                <div className="rounded-full h-[6px] w-20 bg-gray-200">
                                    <div className={`rounded-full h-[6px] bg-blue-500 w-${hitRatioClass}`} />
                                </div>
                                <div className="uppercase font-semibold ml-2 text-black tracking-wide text-xs">
                                    {numMentions || 0} hit
                                    {numMentions !== 1 && 's'}
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
};

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        company,
        customOnly,
        darkMode = false,
        event,
        eventListView,
        eventsQuery,
        eventsQueryUpcoming,
        filterByTypeOptions,
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
        refetch,
        scrollRef,
        searchTerm,
        setFocus,
        showCompanyFilter,
        showForm,
        showFormButton,
        showHeaderControls,
        toggleForm,
        useConfigOptions,
        userQuery,
        userStatusInactive,
    } = props;

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
    const showAllEvents = !!company || eventListView === 'combined';
    let prevEventDate: DateTime | null = null;
    let renderedRefetch = false;
    let theme = darkMode;
    if (useConfigOptions && config.options) {
        if (config.options.darkMode !== undefined) {
            theme = config.options.darkMode;
        }
    }

    return (
        <div className={classNames('h-full flex flex-col eventlist', { dark: theme })}>
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
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll dark:bg-bluegray-7" ref={scrollRef}>
                <div className="flex flex-col flex-grow">
                    <div className="sticky top-0 px-3 pt-3 pb-2 z-10">
                        <FilterBy onChange={onSelectFilterBy} options={filterByTypeOptions} value={filterByTypes}>
                            {showAllEvents ? (
                                <p className="text-sm font-semibold dark:text-white">All Events</p>
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
                                                                maxHits={maxHits}
                                                                numMentions={hit.numMentions}
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
                                            prevEventDate.toFormat('MM/dd/yyyy') !== eventDate.toFormat('MM/dd/yyyy')
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
                                                maxHits={maxHits}
                                                numMentions={hit.numMentions}
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

export interface EventListProps {
    defaultLive?: boolean;
    useConfigOptions?: boolean;
    showHeaderControls?: boolean;
}

interface EventListState {
    company?: CompanyFilterResult;
    event?: EventListEvent;
    filterByTypes: FilterByType[];
    fromIndex: number;
    listType: EventView;
    pageSize: number;
    searchTerm: string;
    showForm: boolean;
    userStatusInactive: boolean;
    userStatusLoaded: boolean;
    watchlist: string[];
}

export const EventList = ({
    useConfigOptions = false,
    defaultLive = true,
    showHeaderControls = true,
}: EventListProps): ReactElement => {
    const { state, handlers, mergeState } = useChangeHandlers<EventListState>({
        company: undefined,
        event: undefined,
        filterByTypes: [],
        fromIndex: 0,
        listType: defaultLive ? EventView.LiveAndUpcoming : EventView.Recent,
        pageSize: 30,
        searchTerm: '',
        showForm: false,
        userStatusInactive: false,
        userStatusLoaded: false,
        watchlist: [],
    });

    const { settings } = useSettings();
    const resolveCompany = useCompanyResolver();
    const resolveUserStatus = useUserStatus();
    const track = useTrack();

    const config = useConfig();

    const loadTicker = async (ticker: InstrumentID) => {
        const companies = await resolveCompany(ticker);
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
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');

            // We don't need to emit events
            // when going back to the event list
            if (eventDate && title) {
                bus?.emit(
                    'event-selected',
                    {
                        ticker,
                        title,
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
    }, [state.listType, state.listType, state.company, state.filterByTypes, state.searchTerm, state.event]);

    const eventsGQL = gql`
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
                            audioRecordingUrl
                            audioRecordingOffsetMs
                            eventDate
                            eventType
                            isLive
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
        }
        return types;
    }, [config, state.filterByTypes]);

    const eventsQuery = usePagingQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: (data) => data.search.events.numTotalHits === 0,
        requestPolicy: 'cache-and-network',
        query: eventsGQL,
        mergeResults,
        variables: {
            view: state.company || config.options?.eventListView === 'combined' ? EventView.Recent : state.listType,
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
            },
        },
    });

    const eventsQueryUpcoming = usePagingQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: (data) => data.search.events.numTotalHits === 0,
        requestPolicy: 'cache-and-network',
        query: eventsGQL,
        mergeResults,
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
            customOnly={!!config.options?.customOnly}
            darkMode={settings.darkMode}
            event={state.event}
            eventListView={config.options?.eventListView}
            eventsQuery={eventsQuery}
            eventsQueryUpcoming={eventsQueryUpcoming}
            filterByTypeOptions={filterByTypeOptions}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
            loadMore={hasMoreResults ? loadMore : undefined}
            maxHits={maxHits}
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
            showCompanyFilter={
                config.options?.showCompanyFilter === undefined ? true : config.options?.showCompanyFilter
            }
            showForm={state.showForm}
            showFormButton={!!config.options?.showScheduleRecording}
            showHeaderControls={showHeaderControls}
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
