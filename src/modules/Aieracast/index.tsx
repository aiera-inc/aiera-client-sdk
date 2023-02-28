import React, { Fragment, ReactElement, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import { EventList, EventRowProps } from '../EventList';
import { Transcript } from '../Transcript';
import { getEventCreatorName, getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Toggle } from '@aiera/client-sdk/components/Toggle';
import { User } from '@aiera/client-sdk/types';
import { DateTime } from 'luxon';
import classNames from 'classnames';
import { isToday } from '@aiera/client-sdk/lib/datetimes';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { TimeAgo } from '@aiera/client-sdk/components/TimeAgo';

interface AieracastSharedProps {}

/** @notExported */
interface AieracastUIProps extends AieracastSharedProps {
    openEventIds: string[];
    toggleEvent: (id: string) => void;
    scrollRef: RefObject<HTMLDivElement>;
}

export function AieracastUI(props: AieracastUIProps): ReactElement {
    const { openEventIds, toggleEvent, scrollRef } = props;

    const EventRow = ({
        customOnly,
        event,
        numMentions,
        maxHits = 0,
        isRefetching,
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
                        'hover:bg-blue-50 dark:hover:bg-bluegray-6',
                        {
                            'cursor-pointer active:bg-blue-100 dark:active:bg-bluegray-5':
                                event.eventType !== 'earnings_release',
                            'h-12': !searchTerm,
                            'h-14': !!searchTerm,
                        },
                        'event-row'
                    )}
                    onClick={event.eventType !== 'earnings_release' ? () => toggleEvent(event.id) : undefined}
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
                        <div className="flex items-center justify-center ml-3 mr-1">
                            <div className="flex items-center justify-center w-8 h-8">
                                <Toggle on={openEventIds.includes(event.id)} onChange={() => toggleEvent(event.id)} />
                            </div>
                        </div>
                    </Tooltip>
                </li>
            </Fragment>
        );
    };

    return (
        <div className="flex flex-col relative h-full border-2 rounded-lg border-slate-200 overflow-hidden">
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex">
                    <div className="h-full w-[19rem] flex-shrink-0 border-r-2 border-r-slate-200/60">
                        <EventList hidePlaybar hideHeader EventRow={EventRow} />
                    </div>
                    {openEventIds.length > 0 ? (
                        <div className="flex overflow-x-auto" ref={scrollRef}>
                            {openEventIds.map((id) => (
                                <div
                                    key={id}
                                    className="h-full w-[23rem] flex-shrink-0 border-r-2 border-r-slate-200/60"
                                >
                                    <Transcript eventId={id} hidePlaybar />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center flex-1 text-slate-400">
                            Select events from the left sidebar
                        </div>
                    )}
                </div>
            </div>
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const toggleEvent = useCallback(
        (eventId) => {
            const uniqueIds = new Set(openEventIds);
            if (typeof eventId === 'string') {
                if (uniqueIds.has(eventId)) {
                    uniqueIds.delete(eventId);
                } else {
                    uniqueIds.add(eventId);
                }
                openEventIdsState([...uniqueIds]);
            }
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
    return <AieracastUI openEventIds={openEventIds} scrollRef={scrollRef} toggleEvent={toggleEvent} />;
}
