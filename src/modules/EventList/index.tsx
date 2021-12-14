import React, {
    Fragment,
    ReactElement,
    SyntheticEvent,
    MouseEventHandler,
    useCallback,
    useState,
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
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useMessageListener, Message } from '@aiera/client-sdk/lib/msg';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { getPrimaryQuote, useCompanyResolver, useAutoTrack, useSettings } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
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

export type EventListEvent = EventListQuery['events'][0];
export type { CompanyFilterResult };

export interface EventListUIProps {
    company?: CompanyFilterResult;
    darkMode?: boolean;
    event?: EventListEvent;
    eventsQuery: QueryResult<EventListQuery, EventListQueryVariables>;
    filterByTypes?: FilterByType[];
    listType?: EventView;
    loading?: boolean;
    onBackFromTranscript?: MouseEventHandler;
    onCompanyChange?: ChangeHandler<CompanyFilterResult>;
    onSearchChange?: ChangeHandler<string>;
    onSelectFilterBy?: ChangeHandler<FilterByType[]>;
    onSelectListType?: ChangeHandler<EventView>;
    onSelectEvent?: ChangeHandler<EventListEvent>;
    onSelectEventById?: ChangeHandler<string>;
    searchTerm?: string;
    setFocus?: Dispatch<SetStateAction<number>>;
}

export const EventListUI = (props: EventListUIProps): ReactElement => {
    const {
        company,
        darkMode = false,
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
        setFocus,
    } = props;

    if (event) {
        return <Transcript eventId={event.id} onBack={onBackFromTranscript} />;
    }

    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate: DateTime | null = null;

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
                    <SettingsButton />
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll dark:bg-bluegray-7">
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
                            .with({ status: 'success' }, ({ data: { events } }) => (
                                <ul className="w-full">
                                    {events.map((event, index) => {
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
                                                        <div className="ml-2 w-full flex h-[1px] bg-gradient-to-r from-gray-200 dark:from-bluegray-5"></div>
                                                    </div>
                                                </li>
                                            );
                                        }
                                        return (
                                            <Fragment key={event.id}>
                                                {divider}
                                                <li
                                                    tabIndex={0}
                                                    className="group h-12 text-xs text-gray-300 mx-1 rounded-lg px-2 cursor-pointer hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-bluegray-6 dark:active:bg-bluegray-5"
                                                    onClick={(e) => onSelectEvent?.(e, { value: event })}
                                                    onFocus={() => setFocus?.(index)}
                                                    onBlur={() => setFocus?.(-1)}
                                                >
                                                    <Tooltip
                                                        className="h-12 flex flex-row"
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
                                                                    alertOnLive={!event.isLive && index % 2 === 0}
                                                                    metaData={{
                                                                        quote: primaryQuote,
                                                                        eventType: event.eventType,
                                                                        eventDate: eventDate
                                                                            ? eventDate.toString()
                                                                            : undefined,
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
                                                        </div>
                                                        <div className="flex flex-col justify-center items-end">
                                                            {event.isLive ? (
                                                                <div className="text-xs leading-none flex justify-center items-center text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-bluegray-6 rounded px-1 pt-0.5 pb-[3px] mb-0.5 group-hover:bg-red-500 group-hover:text-white">
                                                                    {`Live • ${eventDate.toFormat('h:mma')}`}
                                                                </div>
                                                            ) : (
                                                                <div className="leading-none text-gray-500 group-hover:text-black dark:group-hover:text-gray-300">
                                                                    {eventDate.toFormat('h:mma')}
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

    const { settings } = useSettings();
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
            // If we are going back to the event list, refresh immediately
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

    const eventsQuery = useQuery<EventListQuery, EventListQueryVariables>({
        isEmpty: ({ events }) => events.length === 0,
        requestPolicy: 'cache-and-network',
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

    const [focusIndex, setFocus] = useState(-1);

    useWindowListener('keydown', (event: KeyboardEvent) => {
        // Focus is -1 on mount and on blur, so when >= 0, we actually want
        // to handle the keyboard event
        if (focusIndex >= 0 && event.key === 'Enter') {
            match(eventsQuery)
                .with({ status: 'success' }, ({ data: { events } }) => {
                    const selectedOption = events[focusIndex];
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
                const selectedEvent = eventsQuery.data.events.find((event) => event.id === change.value);
                if (selectedEvent) {
                    onSelectEvent(event, { value: selectedEvent });
                }
            }
        },
        [eventsQuery.status]
    );

    useAutoTrack('Click', 'Event Filter By', { filterBy: state.filterByTypes }, [state.filterByTypes]);
    useAutoTrack('Submit', 'Event Search', { searchTerm: state.searchTerm }, [state.searchTerm], !state.searchTerm);

    return (
        <EventListUI
            company={state.company}
            darkMode={settings.darkMode}
            event={state.event}
            eventsQuery={eventsQuery}
            filterByTypes={state.filterByTypes}
            listType={state.listType}
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
            searchTerm={state.searchTerm}
            setFocus={setFocus}
        />
    );
};
