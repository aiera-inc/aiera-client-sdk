import React, { Fragment, ReactElement, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import { EventList, EventListEvent, EventRowProps } from '../EventList';
import { Transcript } from '../Transcript';
import { getEventCreatorName, getPrimaryQuote, useAutoTrack } from '@aiera/client-sdk/lib/data';
import { Toggle } from '@aiera/client-sdk/components/Toggle';
import { ChangeEvent, EventConnectionStatus, User } from '@aiera/client-sdk/types';
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
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

interface AieracastSharedProps {}

/** @notExported */
interface AieracastUIProps extends AieracastSharedProps {
    openEventIds: string[];
    toggleEvent: (id: string, event?: EventListEvent) => void;
    onChangeOpenEventIds: (ids: string[]) => void;
    scrollRef: RefObject<HTMLDivElement>;
}

/** @notExported */
interface EventWidths {
    [id: string]: {
        left: number;
        width: number;
    };
}

export function AieracastUI(props: AieracastUIProps): ReactElement {
    const { openEventIds, onChangeOpenEventIds, toggleEvent, scrollRef } = props;
    const [resizingEventId, setResizingState] = useState('');
    const [eventWidths, setEventWidths] = useState<EventWidths>({});
    const [showSidebar, setSidebarState] = useState(true);
    const [searchTerm, setSearchState] = useState<string>('');
    const [globalSearch, setGlobalSearchState] = useState<string>('');
    const toggleSidebar = useCallback(() => setSidebarState(!showSidebar), [showSidebar]);
    const onSearch = useCallback((_, { value }: ChangeEvent<string | null>) => {
        const newValue = value || '';
        setSearchState(newValue);
        updateGlobalSearch(newValue);
    }, []);

    // Store the current eventId we're resizing
    // update that event's current width or set
    // its default value, and grab its left position
    const startResizingEvent = useCallback(
        (e: React.MouseEvent<HTMLDivElement>, id: string) => {
            const target = e.target as HTMLElement;
            const parent = target.parentElement;
            if (parent && parent?.getBoundingClientRect) {
                const parentRect = parent.getBoundingClientRect();
                const left = parentRect.left;
                document.body.style.cursor = 'none';
                setEventWidths((prevWidths) => {
                    const eventWidth = prevWidths[id];
                    const newEventWidth = {
                        left: left,
                        width: eventWidth?.width || 368,
                    };
                    return {
                        ...prevWidths,
                        [id]: newEventWidth,
                    };
                });
                setResizingState(id);
            }
        },
        [eventWidths, setResizingState, setEventWidths]
    );

    // Setup listeners when we have resizingEventId
    // handle the mousemove event, and update the width
    // for that event
    useEffect(() => {
        let rafId: number;
        const onResize = (e: MouseEvent) => {
            const currentWidth = eventWidths[resizingEventId];
            if (currentWidth) {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    setEventWidths((prevWidths) => {
                        return {
                            ...prevWidths,
                            [resizingEventId]: {
                                left: currentWidth.left,
                                width: e.pageX - currentWidth.left > 368 ? e.pageX - currentWidth.left : 368,
                            },
                        };
                    });
                });
            }
        };

        const onReset = () => {
            setResizingState('');
            document.body.style.cursor = 'auto';
            window.removeEventListener('mouseup', onReset);
            window.removeEventListener('mousemove', onResize);
        };

        if (resizingEventId) {
            window.addEventListener('mousemove', onResize);
            window.addEventListener('mouseup', onReset);
        }

        return () => {
            window.removeEventListener('mouseup', onReset);
            window.removeEventListener('mousemove', onResize);
            cancelAnimationFrame(rafId);
        };
    }, [resizingEventId, eventWidths]);

    const config = useConfig();
    let darkMode = false;
    if (config.options) {
        if (config.options.darkMode !== undefined) {
            darkMode = config.options.darkMode;
        }
    }

    const updateGlobalSearch = debounce((v: string) => setGlobalSearchState(v), 250);

    const onDragEnd = useCallback(
        (dragEvent: DragEndEvent) => {
            const { active, over } = dragEvent;
            if (over && active.id !== over?.id) {
                const newIds = [...openEventIds];
                const oldIndex = newIds.indexOf(`${active.id}`);
                const newIndex = newIds.indexOf(`${over.id}`);
                const movedIds = arrayMove(newIds, oldIndex, newIndex);
                onChangeOpenEventIds(movedIds);
            }
        },
        [openEventIds]
    );

    const EventRow = ({ customOnly, event, isRefetching, refetch, renderedRefetch, showDivider }: EventRowProps) => {
        const primaryQuote = getPrimaryQuote(event.primaryCompany);
        const eventDate = DateTime.fromISO(event.eventDate);
        const createdBy = getEventCreatorName(event.creator as User);
        const hasNoTranscript =
            !event.hasPublishedTranscript &&
            !event.hasTranscript &&
            event.connectionStatus === EventConnectionStatus.Missed;
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
                    onClick={event.eventType !== 'earnings_release' ? () => toggleEvent(event.id, event) : undefined}
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
                            {hasNoTranscript ? (
                                <div className="leading-none text-gray-500 group-hover:text-black dark:group-hover:text-gray-300">
                                    No Transcript
                                </div>
                            ) : event.isLive ? (
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
                                    onChange={() => toggleEvent(event.id, event)}
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
                            'flex flex-col',
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
                            className={classNames('h-12 flex flex-col py-2 px-2 -mb-2 mt-0 relative aieracast__search')}
                        >
                            <Input
                                onChange={onSearch}
                                value={searchTerm}
                                icon={<MagnifyingGlass />}
                                name={'aieracastSearch'}
                                placeholder="Search Across Transcripts"
                            />
                        </div>
                        <div className="relative flex-1 flex flex-col overflow-hidden">
                            <EventList
                                noEarningsRelease
                                controlledSearchTerm={globalSearch.length > 0 ? `"${globalSearch}"` : undefined}
                                useConfigOptions
                                hidePlaybar
                                hideHeader
                                EventRow={EventRow}
                            />
                        </div>
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
                        <DndContext
                            onDragEnd={onDragEnd}
                            modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
                        >
                            <div
                                className={classNames('flex flex-1 overflow-x-auto', {
                                    'pointer-events-none select-none': resizingEventId.length > 0,
                                })}
                                ref={scrollRef}
                            >
                                <SortableContext items={openEventIds} strategy={horizontalListSortingStrategy}>
                                    {openEventIds.map((id) => {
                                        let width = '368px';
                                        const eventWidth = eventWidths[id];
                                        if (eventWidth) {
                                            width = `${eventWidth.width}px`;
                                        }
                                        return (
                                            <Transcript
                                                width={width}
                                                startResize={startResizingEvent}
                                                isResizing={id === resizingEventId}
                                                handlesEnabled
                                                key={id}
                                                controlledSearchTerm={globalSearch}
                                                useConfigOptions
                                                onClose={() => toggleEvent(id)}
                                                eventId={id}
                                                hidePlaybar
                                                hideSearch
                                                showHeaderPlayButton
                                            />
                                        );
                                    })}
                                </SortableContext>
                            </div>
                        </DndContext>
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
    const [openEventIds, setOpenEventIdsState] = useState<string[]>([]);
    const [storedScrollWidth, setScrollWidthState] = useState(0);
    const config = useConfig();
    const scrollRef = useRef<HTMLDivElement>(null);
    const bus = useMessageBus();
    const toggleEvent = useCallback(
        (eventId: string, event?: EventListEvent) => {
            const uniqueIds = new Set(openEventIds);
            const primaryQuote = getPrimaryQuote(event?.primaryCompany);
            if (uniqueIds.has(eventId)) {
                uniqueIds.delete(eventId);
            } else {
                if (event?.eventDate && event?.title) {
                    bus?.emit(
                        'event-selected',
                        {
                            ticker: primaryQuote?.localTicker,
                            title: event.title,
                            eventType: event.eventType,
                            eventDate: event.eventDate,
                            eventId: event.id,
                        },
                        'out'
                    );
                }
                uniqueIds.add(eventId);
            }
            setOpenEventIdsState([...uniqueIds]);
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
        if (scrollWidth !== undefined) {
            setScrollWidthState(scrollWidth);
        }
    }, [scrollRef.current?.scrollWidth, openEventIds]);
    useAutoTrack('View', 'Events', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);
    return (
        <AieracastUI
            openEventIds={openEventIds}
            scrollRef={scrollRef}
            onChangeOpenEventIds={setOpenEventIdsState}
            toggleEvent={toggleEvent}
        />
    );
}
