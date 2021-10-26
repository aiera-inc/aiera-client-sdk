import React, { MouseEventHandler, ReactElement, useState, useCallback, useRef, Ref } from 'react';
import { match } from 'ts-pattern';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { useOutsideClickHandler } from '@aiera/client-sdk/lib/hooks/useOutsideClickHandler';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import { Button } from '@aiera/client-sdk/components/Button';
import { Input } from '@aiera/client-sdk/components/Input';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import { TranscriptQuery, TranscriptQueryVariables } from '@aiera/client-sdk/types/generated';
import { QueryResult } from '@aiera/client-sdk/api/client';
import { EventDetails } from '../EventDetails';
import { PriceChart } from '../PriceChart';
import './styles.css';

export type EventQuery = QueryResult<TranscriptQuery, TranscriptQueryVariables>;
interface HeaderSharedProps {
    eventQuery: EventQuery;
    onBack?: MouseEventHandler;
    searchTerm?: string;
    onChangeSearchTerm?: ChangeHandler<string>;
}

/** @notExported */
interface HeaderUIProps extends HeaderSharedProps {
    headerExpanded: boolean;
    headerRef: Ref<HTMLDivElement>;
    toggleHeader: () => void;
    eventDetailsExpanded: boolean;
    toggleEventDetails: () => void;
    priceChartExpanded: boolean;
    togglePriceChart: () => void;
}

export function HeaderUI(props: HeaderUIProps): ReactElement {
    const {
        eventQuery,
        onBack,
        headerRef,
        headerExpanded,
        toggleHeader,
        eventDetailsExpanded,
        toggleEventDetails,
        priceChartExpanded,
        togglePriceChart,
        searchTerm,
        onChangeSearchTerm,
    } = props;

    return (
        <div
            ref={headerRef}
            className={classNames(
                'bg-white relative pt-3 rounded-b-lg -mb-1 z-10 transition-all overflow-hidden',
                {
                    'shadow-3xl': !headerExpanded,
                    'shadow-xl': headerExpanded,
                },
                'transcript__header'
            )}
        >
            <div className="flex items-center px-3">
                {onBack && (
                    <Button className="mr-2" onClick={onBack}>
                        <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                        Events
                    </Button>
                )}
                <Input
                    name="search"
                    className="mr-3"
                    placeholder="Search Transcripts..."
                    value={searchTerm}
                    onChange={onChangeSearchTerm}
                >
                    <MagnifyingGlass />
                </Input>
                <div className="items-center flex">
                    <Gear className="w-5" />
                </div>
            </div>
            {match(eventQuery)
                .with({ status: 'loading' }, () => {
                    return (
                        <div className="flex flex-row p-3 items-center">
                            <div className="animate-pulse flex-1">
                                <div className="flex">
                                    <div className="rounded-md bg-gray-500 h-[10px] m-1 w-7" />
                                    <div className="rounded-md bg-gray-400 h-[10px] m-1 w-10" />
                                    <div className="rounded-md bg-gray-300 h-[10px] m-1 w-20" />
                                    <div className="rounded-md bg-gray-300 h-[10px] m-1 w-20" />
                                </div>
                                <div className="flex">
                                    <div className="rounded-md bg-gray-300 h-[10px] m-1 flex-1" />
                                </div>
                            </div>
                            <ExpandButton
                                className="ml-2 mt-2 self-start"
                                onClick={toggleHeader}
                                expanded={headerExpanded}
                            />
                        </div>
                    );
                })
                .with({ status: 'empty' }, { status: 'success' }, ({ data }) => {
                    const event = data.events[0];
                    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
                    const eventDate = data.events[0]?.eventDate && DateTime.fromISO(data.events[0].eventDate);
                    const hasEventExtras =
                        event?.dialInPhoneNumbers?.length ||
                        event?.dialInPin ||
                        event?.webcastUrls?.length ||
                        event?.audioRecordingUrl;

                    return (
                        <>
                            <div
                                className={classNames('flex flex-row p-3 items-center', {
                                    'cursor-pointer': hasEventExtras,
                                    group: hasEventExtras,
                                })}
                                onClick={hasEventExtras ? toggleHeader : undefined}
                            >
                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                    <div className="text-xs">
                                        {primaryQuote?.localTicker && (
                                            <span className="pr-1 font-semibold">{primaryQuote?.localTicker}</span>
                                        )}
                                        {primaryQuote?.exchange?.shortName && (
                                            <span className="text-gray-400 group-hover:text-gray-500">
                                                {primaryQuote?.exchange?.shortName}
                                            </span>
                                        )}
                                        {event?.eventType && (
                                            <span className="text-gray-300 group-hover:text-gray-400 capitalize">
                                                {' '}
                                                • {event?.eventType}
                                            </span>
                                        )}
                                        {eventDate && (
                                            <span className="text-gray-300 group-hover:text-gray-400">
                                                {' '}
                                                • {eventDate.toFormat('h:mma M/dd/yyyy')}
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className={
                                            headerExpanded
                                                ? 'text-sm'
                                                : 'text-sm truncate whitespace-normal line-clamp-1'
                                        }
                                    >
                                        {event?.title}
                                    </div>
                                </div>
                                {hasEventExtras && (
                                    <ExpandButton
                                        className={classNames('ml-2 mt-2 self-start', {
                                            'group-hover:bg-gray-200': !headerExpanded,
                                            'group-hover:bg-blue-700': headerExpanded,
                                            'group-active:bg-gray-400': !headerExpanded,
                                            'group-active:bg-blue-900': headerExpanded,
                                        })}
                                        onClick={toggleHeader}
                                        expanded={headerExpanded}
                                    />
                                )}
                            </div>
                            {headerExpanded && event && (
                                <EventDetails
                                    event={event}
                                    eventDetailsExpanded={eventDetailsExpanded}
                                    toggleEventDetails={toggleEventDetails}
                                />
                            )}
                            <PriceChart
                                headerExpanded={headerExpanded}
                                priceChartExpanded={priceChartExpanded}
                                togglePriceChart={togglePriceChart}
                            />
                        </>
                    );
                })
                .otherwise(() => null)}
        </div>
    );
}

/** @notExported */
export interface HeaderProps extends HeaderSharedProps {}

/**
 * Renders Header
 */
export function Header(props: HeaderProps): ReactElement {
    const { eventQuery, onBack, searchTerm, onChangeSearchTerm } = props;
    const [headerExpanded, setHeaderState] = useState(false);
    const [priceChartExpanded, setPriceChartState] = useState(false);
    const [eventDetailsExpanded, setEventDetailsState] = useState(false);

    const toggleHeader = useCallback(() => setHeaderState(!headerExpanded), [headerExpanded]);

    const toggleEventDetails = useCallback(() => {
        setEventDetailsState(!eventDetailsExpanded);
        if (priceChartExpanded && !eventDetailsExpanded) {
            setPriceChartState(false);
        }
    }, [eventDetailsExpanded, priceChartExpanded]);

    const togglePriceChart = useCallback(() => {
        setPriceChartState(!priceChartExpanded);
        if (eventDetailsExpanded && !priceChartExpanded) {
            setEventDetailsState(false);
        }
    }, [priceChartExpanded, eventDetailsExpanded]);

    // Collapse Expanded Header on Outside Click
    const headerRef = useRef<HTMLDivElement>(null);
    useOutsideClickHandler(
        [headerRef],
        useCallback(() => {
            if (headerExpanded) {
                toggleHeader();
            }
        }, [headerExpanded])
    );

    return (
        <HeaderUI
            eventQuery={eventQuery}
            onBack={onBack}
            headerRef={headerRef}
            headerExpanded={headerExpanded}
            toggleHeader={toggleHeader}
            eventDetailsExpanded={eventDetailsExpanded}
            toggleEventDetails={toggleEventDetails}
            togglePriceChart={togglePriceChart}
            priceChartExpanded={priceChartExpanded}
            searchTerm={searchTerm}
            onChangeSearchTerm={onChangeSearchTerm}
        />
    );
}
