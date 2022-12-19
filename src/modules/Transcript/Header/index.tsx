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
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { TranscriptQuery, TranscriptQueryVariables } from '@aiera/client-sdk/types/generated';
import { QueryResult } from '@aiera/client-sdk/api/client';
import { EventDetails } from '../EventDetails';
import { PriceChart } from '../PriceChart';
import { KeyMentions } from '../KeyMentions';
import './styles.css';
import { useConfig } from '@aiera/client-sdk/lib/config';

export type EventQuery = QueryResult<TranscriptQuery, TranscriptQueryVariables>;
interface HeaderSharedProps {
    containerHeight: number;
    currentParagraphTimestamp?: string | null;
    endTime?: string | null;
    eventId: string;
    eventQuery: EventQuery;
    onBack?: MouseEventHandler;
    onBackHeader: string;
    searchTerm?: string;
    onChangeSearchTerm?: ChangeHandler<string>;
    onSeekAudioByDate?: (date: string) => void;
    startTime?: string | null;
    useConfigOptions: boolean;
}

/** @notExported */
interface HeaderUIProps extends HeaderSharedProps {
    eventDetailsExpanded: boolean;
    headerExpanded: boolean;
    headerRef: Ref<HTMLDivElement>;
    keyMentionsExpanded: boolean;
    priceChartExpanded: boolean;
    toggleEventDetails: () => void;
    toggleHeader: () => void;
    toggleKeyMentions: () => void;
    togglePriceChart: () => void;
}

export function HeaderUI(props: HeaderUIProps): ReactElement {
    const {
        containerHeight,
        currentParagraphTimestamp,
        endTime,
        eventDetailsExpanded,
        eventId,
        eventQuery,
        headerExpanded,
        headerRef,
        keyMentionsExpanded,
        onBack,
        onBackHeader,
        onChangeSearchTerm,
        onSeekAudioByDate,
        priceChartExpanded,
        searchTerm,
        toggleEventDetails,
        toggleHeader,
        toggleKeyMentions,
        togglePriceChart,
        useConfigOptions,
        startTime,
    } = props;

    const config = useConfig();
    const showPriceReaction = !useConfigOptions || (useConfigOptions && config.options?.showPriceReaction);
    const showTitleInfo = !useConfigOptions || (useConfigOptions && config.options?.showTitleInfo);
    const showRecordingDetails = !useConfigOptions || (useConfigOptions && config.options?.showRecordingDetails);
    const showSearch = !useConfigOptions || (useConfigOptions && config.options?.showSearch);

    return (
        <div
            ref={headerRef}
            className={classNames(
                'bg-white relative rounded-b-lg -mb-1 z-20 transition-all flex flex-col overflow-hidden dark:bg-bluegray-6',
                {
                    'shadow-3xl dark:shadow-3xl-dark': !headerExpanded,
                    'shadow-xl': headerExpanded,
                    'pb-3': !showTitleInfo,
                    'pt-3': showSearch,
                },
                'transcript__header'
            )}
            // Height can grow, but should not overlap the audio player (53px)
            style={{ maxHeight: containerHeight > 0 ? containerHeight - 53 : 'calc(100% - 53px)' }}
        >
            {showSearch && (
                <div className="flex items-center px-3">
                    {onBack && (
                        <Button className="mr-2" onClick={onBack}>
                            <ArrowLeft className="fill-current w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                            {onBackHeader}
                        </Button>
                    )}
                    <Input
                        className="transcript__header-search"
                        icon={<MagnifyingGlass />}
                        name="search"
                        placeholder="Search Transcript..."
                        value={searchTerm}
                        onChange={onChangeSearchTerm}
                    />
                    {!useConfigOptions && <SettingsButton showTonalSentiment={false} />}
                </div>
            )}
            {showTitleInfo &&
                match(eventQuery)
                    .with({ status: 'loading' }, () => {
                        return (
                            <div className="flex flex-row p-3 items-center">
                                <div className="animate-pulse flex-1">
                                    <div className="flex">
                                        <div className="rounded-md bg-gray-500 h-[10px] m-1 w-7 dark:bg-bluegray-5" />
                                        <div className="rounded-md bg-gray-400 h-[10px] m-1 w-10 dark:bg-bluegray-5" />
                                        <div className="rounded-md bg-gray-300 h-[10px] m-1 w-20 dark:bg-bluegray-7" />
                                        <div className="rounded-md bg-gray-300 h-[10px] m-1 w-20 dark:bg-bluegray-7" />
                                    </div>
                                    <div className="flex">
                                        <div className="rounded-md bg-gray-300 h-[10px] m-1 flex-1 dark:bg-bluegray-7" />
                                    </div>
                                </div>
                                {(showPriceReaction || showRecordingDetails) && (
                                    <ExpandButton
                                        className="ml-2 mt-2 self-start"
                                        onClick={toggleHeader}
                                        expanded={headerExpanded}
                                    />
                                )}
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
                                        'cursor-pointer': hasEventExtras && (showPriceReaction || showRecordingDetails),
                                        group: hasEventExtras,
                                    })}
                                    onClick={hasEventExtras ? toggleHeader : undefined}
                                >
                                    <div className="flex flex-col justify-center flex-1 min-w-0">
                                        <div className="text-xs">
                                            {primaryQuote?.localTicker && (
                                                <span className="pr-1 font-semibold dark:text-white">
                                                    {primaryQuote?.localTicker}
                                                </span>
                                            )}
                                            {primaryQuote?.exchange?.shortName && (
                                                <span className="text-gray-400 group-hover:text-gray-500">
                                                    {primaryQuote?.exchange?.shortName}
                                                </span>
                                            )}
                                            {event?.eventType && primaryQuote?.localTicker && (
                                                <span className="text-gray-300 group-hover:text-gray-400 capitalize">
                                                    {' '}
                                                    • {event?.eventType.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                            {eventDate && (
                                                <span className="text-gray-300 group-hover:text-gray-400">
                                                    {primaryQuote?.localTicker && ' • '}
                                                    {eventDate.toFormat('h:mma M/dd/yyyy')}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className={classNames('dark:text-white', {
                                                'text-sm': headerExpanded,
                                                'text-sm truncate whitespace-normal line-clamp-1': !headerExpanded,
                                                'font-semibold': !primaryQuote?.localTicker,
                                            })}
                                        >
                                            {event?.title}
                                        </div>
                                    </div>
                                    {hasEventExtras && (showPriceReaction || showRecordingDetails) && (
                                        <ExpandButton
                                            className={classNames('ml-2 mt-2 self-start', {
                                                'group-hover:bg-gray-200 dark:group-hover:bg-bluegray-4 dark:group-hover:bg-opacity-50':
                                                    !headerExpanded,
                                                'group-hover:bg-blue-700': headerExpanded,
                                                'group-active:bg-gray-400 dark:group-active:bg-bluegray-7':
                                                    !headerExpanded,
                                                'group-active:bg-blue-900': headerExpanded,
                                            })}
                                            onClick={toggleHeader}
                                            expanded={headerExpanded}
                                        />
                                    )}
                                </div>
                                {showRecordingDetails && headerExpanded && event && (
                                    <EventDetails
                                        event={event}
                                        eventDetailsExpanded={eventDetailsExpanded}
                                        toggleEventDetails={toggleEventDetails}
                                    />
                                )}
                                {false && headerExpanded && (
                                    <KeyMentions
                                        toggleKeyMentions={toggleKeyMentions}
                                        keyMentionsExpanded={keyMentionsExpanded}
                                    />
                                )}
                                {showPriceReaction && (
                                    <PriceChart
                                        currentParagraphTimestamp={currentParagraphTimestamp}
                                        endTime={endTime}
                                        eventId={eventId}
                                        headerExpanded={headerExpanded}
                                        priceChartExpanded={priceChartExpanded}
                                        togglePriceChart={togglePriceChart}
                                        onSeekAudioByDate={onSeekAudioByDate}
                                        startTime={startTime}
                                    />
                                )}
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
    const {
        useConfigOptions,
        endTime,
        eventId,
        eventQuery,
        onBack,
        onBackHeader,
        searchTerm,
        onChangeSearchTerm,
        onSeekAudioByDate,
        containerHeight,
        currentParagraphTimestamp,
        startTime,
    } = props;
    const [headerExpanded, setHeaderState] = useState(false);
    const [priceChartExpanded, setPriceChartState] = useState(false);
    const [eventDetailsExpanded, setEventDetailsState] = useState(false);
    const [keyMentionsExpanded, setKeyMentionsState] = useState(false);

    const toggleHeader = useCallback(() => setHeaderState(!headerExpanded), [headerExpanded]);

    const toggleKeyMentions = useCallback(() => {
        setKeyMentionsState(!keyMentionsExpanded);
        setPriceChartState(false);
        setEventDetailsState(false);
    }, [keyMentionsExpanded]);

    const toggleEventDetails = useCallback(() => {
        setEventDetailsState(!eventDetailsExpanded);
        setPriceChartState(false);
        setKeyMentionsState(false);
    }, [eventDetailsExpanded]);

    const togglePriceChart = useCallback(() => {
        setPriceChartState(!priceChartExpanded);
        setEventDetailsState(false);
        setKeyMentionsState(false);
    }, [priceChartExpanded]);

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
            useConfigOptions={useConfigOptions}
            containerHeight={containerHeight}
            currentParagraphTimestamp={currentParagraphTimestamp}
            eventDetailsExpanded={eventDetailsExpanded}
            endTime={endTime}
            eventId={eventId}
            eventQuery={eventQuery}
            headerExpanded={headerExpanded}
            headerRef={headerRef}
            keyMentionsExpanded={keyMentionsExpanded}
            onBack={onBack}
            onBackHeader={onBackHeader}
            onChangeSearchTerm={onChangeSearchTerm}
            onSeekAudioByDate={onSeekAudioByDate}
            priceChartExpanded={priceChartExpanded}
            searchTerm={searchTerm}
            startTime={startTime}
            toggleEventDetails={toggleEventDetails}
            toggleHeader={toggleHeader}
            toggleKeyMentions={toggleKeyMentions}
            togglePriceChart={togglePriceChart}
        />
    );
}
