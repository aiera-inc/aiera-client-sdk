import React, { Fragment, ReactElement, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import { EventList, EventRowProps } from '../EventList';
import { Transcript } from '../Transcript';
import { getEventCreatorName, getPrimaryQuote, useAutoTrack } from '@aiera/client-sdk/lib/data';
import { Toggle } from '@aiera/client-sdk/components/Toggle';
import { ChangeEvent, User } from '@aiera/client-sdk/types';
import { DateTime } from 'luxon';
import classNames from 'classnames';
import { isToday } from '@aiera/client-sdk/lib/datetimes';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { TimeAgo } from '@aiera/client-sdk/components/TimeAgo';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import debounce from 'lodash.debounce';

interface AieracastSharedProps {}

/** @notExported */
interface AieracastUIProps extends AieracastSharedProps {
    openEventIds: string[];
    toggleEvent: (id: string) => void;
    scrollRef: RefObject<HTMLDivElement>;
}

export function AieracastUI(props: AieracastUIProps): ReactElement {
    const { openEventIds, toggleEvent, scrollRef } = props;
    const [showSidebar, setSidebarState] = useState(true);
    const [searchTerm, setSearchState] = useState<string>('');
    const [globalSearch, setGlobalSearchState] = useState<string>('');
    const toggleSidebar = useCallback(() => setSidebarState(!showSidebar), [showSidebar]);
    const onSearch = useCallback((_, { value }: ChangeEvent<string | null>) => {
        const newValue = value || '';
        setSearchState(newValue);
        updateGlobalSearch(newValue);
    }, []);
    const config = useConfig();
    let darkMode = false;
    if (config.options) {
        if (config.options.darkMode !== undefined) {
            darkMode = config.options.darkMode;
        }
    }

    const updateGlobalSearch = debounce((v: string) => setGlobalSearchState(v), 250);

    const EventRow = ({ customOnly, event, isRefetching, refetch, renderedRefetch, showDivider }: EventRowProps) => {
        const primaryQuote = getPrimaryQuote(event.primaryCompany);
        const eventDate = DateTime.fromISO(event.eventDate);
        const createdBy = getEventCreatorName(event.creator as User);
        let divider = null;
        if (showDivider) {
            divider = (
                <li className={classNames('sticky px-3 top-[52px] event-row-divider')}>
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
                        'hover:bg-blue-50 dark:hover:bg-bluegray-6 h-12',
                        {
                            'cursor-pointer active:bg-blue-100 dark:active:bg-bluegray-5':
                                event.eventType !== 'earnings_release',
                        },
                        'event-row'
                    )}
                    onClick={event.eventType !== 'earnings_release' ? () => toggleEvent(event.id) : undefined}
                >
                    <Tooltip
                        className={classNames('flex flex-row h-12')}
                        content={
                            <div className="max-w-[300px] bg-black bg-opacity-80 dark:bg-bluegray-4 px-1.5 py-0.5 rounded text-white dark:text-bluegray-7">
                                {prettyLineBreak(event.title)}
                            </div>
                        }
                        grow="up-right"
                        openOn="hover"
                        position="top-left"
                        yOffset={4}
                        hideOnDocumentScroll
                    >
                        <div className="flex flex-col justify-center flex-1 min-w-0 pl-1 pr-4">
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
                        <div className="flex items-center justify-center ml-4 mr-2">
                            <div className="flex items-center justify-center w-8 h-8">
                                <Toggle
                                    darkMode={darkMode}
                                    on={openEventIds.includes(event.id)}
                                    onChange={() => toggleEvent(event.id)}
                                />
                            </div>
                        </div>
                    </Tooltip>
                </li>
            </Fragment>
        );
    };

    return (
        <div
            className={classNames(
                'flex flex-col relative h-full border-2 rounded-lg overflow-hidden',
                {
                    dark: darkMode,
                    'border-slate-200': !darkMode,
                    'border-bluegray-7 bg-bluegray-6': darkMode,
                },
                'aieracast'
            )}
        >
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex">
                    <div
                        className={classNames(
                            'h-full w-[19rem] flex-shrink-0 relative',
                            'transition-all aieracast__events',
                            {
                                '-ml-[18.75rem]': !showSidebar,
                            }
                        )}
                    >
                        {showSidebar && (
                            <div className="absolute top-0 left-0 -right-6 h-28 bg-gradient-to-b from-gray-200/40 dark:from-bluegray-7 dark:to-bluegray-7 to-transparent" />
                        )}
                        <div
                            className={classNames(
                                'h-12 flex flex-col py-2 px-2 -mb-2 mt-0 transition-all relative aieracast__search',
                                {
                                    //'-mt-10': !openEventIds || openEventIds.length === 0,
                                }
                            )}
                        >
                            <Input
                                onChange={onSearch}
                                value={searchTerm}
                                icon={<MagnifyingGlass />}
                                name={'aieracastSearch'}
                                placeholder="Search Across Open Transcripts"
                            />
                        </div>
                        <EventList
                            controlledSearchTerm={globalSearch.length > 0 ? `"${globalSearch}"` : ''}
                            useConfigOptions
                            hidePlaybar
                            hideHeader
                            EventRow={EventRow}
                        />
                    </div>
                    <div
                        onClick={toggleSidebar}
                        className={classNames(
                            'flex flex-col w-6 py-1 pr-1 border-r-2 border-slate-200 dark:border-bluegray-7',
                            'text-slate-500 cursor-pointer dark:bg-bluegray-7',
                            'group flex-shrink-0 aieracast__sidebar-tab relative z-20'
                        )}
                    >
                        <div
                            className={classNames(
                                'pl-[1px] bg-slate-200/40 dark:bg-bluegray-6 rounded flex flex-1 items-center justify-center',
                                'hover:bg-slate-200/60 dark:hover:bg-bluegray-5 active:bg-slate-200/80 dark:active:bg-bluegray-6'
                            )}
                        >
                            <Chevron
                                className={classNames('w-2.5 transition-all', {
                                    'rotate-90 group-active:-rotate-90': showSidebar,
                                    '-rotate-90 group-active:rotate-90': !showSidebar,
                                })}
                            />
                        </div>
                    </div>
                    {openEventIds.length > 0 ? (
                        <div className="flex overflow-x-auto" ref={scrollRef}>
                            {openEventIds.map((id) => (
                                <div
                                    key={id}
                                    className="h-full w-[23rem] flex-shrink-0 border-r-2 border-r-slate-200/60 dark:border-r-bluegray-8"
                                >
                                    <Transcript
                                        controlledSearchTerm={globalSearch}
                                        useConfigOptions
                                        onClose={() => toggleEvent(id)}
                                        eventId={id}
                                        hidePlaybar
                                        hideSearch
                                        showHeaderPlayButton
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center flex-1 text-slate-400 aieracast__empty">
                            Select events from the left sidebar
                        </div>
                    )}
                </div>
            </div>
            <Playbar showFullDetails />
        </div>
    );
}

/** @notExported */
export interface AieracastProps extends AieracastSharedProps {}

/**
 * Renders Aieracast
 */
export function Aieracast(): ReactElement {
    const [openEventIds, openEventIdsState] = useState<string[]>([]);
    const [storedScrollWidth, setScrollWidthState] = useState(0);
    const config = useConfig();
    const scrollRef = useRef<HTMLDivElement>(null);
    const toggleEvent = useCallback(
        (eventId: string) => {
            const uniqueIds = new Set(openEventIds);
            if (uniqueIds.has(eventId)) {
                uniqueIds.delete(eventId);
            } else {
                uniqueIds.add(eventId);
            }
            openEventIdsState([...uniqueIds]);
        },
        [openEventIds]
    );

    // Scroll to added event
    useEffect(() => {
        const scrollWidth = scrollRef.current?.scrollWidth;
        if (scrollWidth && scrollWidth > storedScrollWidth) {
            if (scrollRef.current) {
                const width = scrollRef.current.scrollWidth;
                scrollRef.current.scrollTo({ left: width, behavior: 'smooth' });
            }
        }
        if (typeof scrollWidth === 'number') {
            setScrollWidthState(scrollWidth);
        }
    }, [scrollRef.current?.scrollWidth, openEventIds]);
    useAutoTrack('View', 'Events', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);
    return <AieracastUI openEventIds={openEventIds} scrollRef={scrollRef} toggleEvent={toggleEvent} />;
}
