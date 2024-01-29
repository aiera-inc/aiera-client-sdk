import React, {
    Dispatch,
    Fragment,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    ReactNode,
    Ref,
    RefCallback,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { findAll } from 'highlight-words-core';
import { DateTime, Duration } from 'luxon';
import { match } from 'ts-pattern';

import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { AudioPlayer, useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { getEventCreatorName, getPrimaryQuote, useAutoTrack, useSettings } from '@aiera/client-sdk/lib/data';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { ChangeHandler, useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useElementSize } from '@aiera/client-sdk/lib/hooks/useElementSize';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';
import { useRealtimeEvent } from '@aiera/client-sdk/lib/realtime';
import { hash } from '@aiera/client-sdk/lib/strings';
import {
    BasicTextualSentiment,
    EventSummarization,
    EventSummarizationModelType,
    EventSummarizationSummaryType,
    EventUpdatesQuery,
    EventUpdatesQueryVariables,
    LatestEventForTickerQuery,
    LatestEventForTickerQueryVariables,
    LatestParagraphsQuery,
    LatestParagraphsQueryVariables,
    TranscriptQuery,
    TranscriptQueryVariables,
    User,
} from '@aiera/client-sdk/types/generated';
import { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { EmptyMessage } from './EmptyMessage';
import { Header } from './Header';
import './styles.css';

type SpeakerTurn = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0];
type Paragraph = SpeakerTurn['paragraphs'][0];
type Chunk = { text: string; id: string; highlight: boolean; textSentiment?: BasicTextualSentiment | false };
interface Sentence {
    id: string;
    chunks: Chunk[];
}
interface ParagraphWithMatches {
    sentences: Sentence[];
    paragraph: Paragraph;
}
type SpeakerTurnsWithMatches = SpeakerTurn & { paragraphsWithMatches: ParagraphWithMatches[] };
type Partial = { text: string; timestamp: number; relativeTimestamp: number };

interface HandlesWrapperUIProps {
    showSearch: boolean;
    width: string;
    isResizing: boolean;
    startResize: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
    children: ReactNode;
    eventId?: string;
    transition?: string;
    transform: Transform | null;
    setNodeRef: (node: HTMLElement | null) => void;
}
const HandlesWrapperUI = React.memo(
    ({
        showSearch,
        width,
        children,
        startResize,
        isResizing,
        eventId = '',
        transition,
        transform,
        setNodeRef,
    }: HandlesWrapperUIProps) => {
        const startResizingEvent = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (eventId && startResize) startResize(e, eventId);
            },
            [eventId]
        );

        return (
            <div
                className={classNames(
                    'relative flex flex-col h-full flex-shrink-0 border-r-2 active:z-20',
                    'border-r-slate-200/60 dark:border-r-bluegray-8',
                    {
                        handles__transcriptHeader: !showSearch,
                        'handles__transcriptHeader-showSearch': showSearch,
                    }
                )}
                style={{
                    width,
                    transform: CSS.Translate.toString(transform),
                    transition,
                }}
                ref={setNodeRef}
            >
                {children}
                <div
                    onMouseDown={startResizingEvent}
                    className={classNames(
                        'absolute top-0 bottom-0 w-1 -right-0.5',
                        'active:bg-blue-500 active:cursor-none',
                        'cursor-col-resize z-50',
                        {
                            'bg-blue-500': isResizing,
                        }
                    )}
                />
            </div>
        );
    }
);

HandlesWrapperUI.displayName = 'HandlesWrapperUI';

/** @notExported */
interface TranscriptSharedProps {
    eventId?: string;
    onBack?: MouseEventHandler;
    onEdit?: MouseEventHandler;
    onClose?: MouseEventHandler;
    showHeaderControls?: boolean;
    showHeaderPlayButton?: boolean;
    hidePlaybar?: boolean;
    hideSearch?: boolean;
    handlesEnabled?: boolean;
    headerHandleAttributes?: DraggableAttributes;
    headerHandleListeners?: DraggableSyntheticListeners;
}

/** @notExported */
interface TranscriptUIProps extends TranscriptSharedProps {
    containerHeight: number;
    containerRef: Ref<HTMLDivElement>;
    currentMatch?: string | null;
    currentMatchRef: Ref<HTMLDivElement>;
    currentParagraph?: string | null;
    currentParagraphRef: Ref<HTMLDivElement>;
    currentParagraphTimestamp?: string | null;
    darkMode?: boolean;
    endTime?: string | null;
    eventId?: string;
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>;
    matches: Chunk[];
    matchIndex: number;
    nextMatch: () => void;
    onBack?: MouseEventHandler;
    onBackHeader: string;
    onChangeSearchTerm: ChangeHandler<string>;
    onClickTranscript?: (paragraph: Paragraph) => void;
    onSeekAudioByDate?: (date: string) => void;
    partial?: Partial;
    prevMatch: () => void;
    relativeTimestampsOffset: number;
    scrollContainerRef: Ref<HTMLDivElement>;
    searchTerm: string;
    showSpeakers: boolean;
    speakerTurns: SpeakerTurnsWithMatches[];
    startTime?: string | null;
    useConfigOptions: boolean;
}

function findSummary(summarizations: EventSummarization[]) {
    const noNulls = summarizations.filter((s) => s);
    const constrained = noNulls.filter(
        (s: EventSummarization) => s?.modelType === EventSummarizationModelType.Constrained
    );
    const summaries =
        constrained.length > 0
            ? constrained
            : noNulls.filter((s: EventSummarization) => s?.modelType === EventSummarizationModelType.Zeroshot);
    const everything = summaries.find(
        (s: EventSummarization) => s?.summaryType === EventSummarizationSummaryType.Everything
    );
    const pres = summaries.find(
        (s: EventSummarization) => s?.summaryType === EventSummarizationSummaryType.Presentation
    );
    const qa = summaries.find((s: EventSummarization) => s?.summaryType === EventSummarizationSummaryType.QAndA);
    return everything || pres || qa;
}

function NoEventFound() {
    return (
        <div className={classNames('h-full flex flex-col flex-1 justify-center items-center')}>
            <p className="text-sm text-slate-500 dark:text-slate-300">Transcript Failed to Load</p>
        </div>
    );
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const {
        containerHeight,
        containerRef,
        currentMatch,
        currentMatchRef,
        currentParagraph,
        currentParagraphRef,
        currentParagraphTimestamp,
        darkMode = false,
        endTime,
        eventId = '',
        eventQuery,
        handlesEnabled,
        headerHandleAttributes,
        headerHandleListeners,
        hidePlaybar,
        hideSearch = false,
        matchIndex,
        matches,
        nextMatch,
        onBack,
        onBackHeader,
        onChangeSearchTerm,
        onClose,
        onClickTranscript,
        onEdit,
        onSeekAudioByDate,
        partial,
        prevMatch,
        relativeTimestampsOffset,
        scrollContainerRef,
        searchTerm,
        showHeaderControls,
        showHeaderPlayButton,
        showSpeakers,
        speakerTurns,
        startTime,
        useConfigOptions,
    } = props;

    const [showSummary, setShowSummary] = useState(false);
    const toggleSummary = useCallback(() => {
        setShowSummary((pv) => !pv);
    }, []);
    // Show the player when it's not useConfigOptions, or if it is enabled with useConfigOptions
    const config = useConfig();
    let theme = darkMode;
    let showPlayer = true;
    let showTitleInfo = true;
    let showSearch = !hideSearch;
    let showSentiment = true;
    let showPartials = true;
    let showSummaryByConfig = true;
    let relativeTimestamps = false;
    if (useConfigOptions && config.options) {
        if (config.options.darkMode !== undefined) {
            theme = config.options.darkMode;
        }
        if (config.options.showAudioPlayer !== undefined) {
            showPlayer = config.options.showAudioPlayer;
        }
        if (config.options.showTitleInfo !== undefined) {
            showTitleInfo = config.options.showTitleInfo;
        }
        if (config.options.showSearch !== undefined) {
            showSearch = config.options.showSearch;
        }
        if (config.options.relativeTimestamps !== undefined) {
            relativeTimestamps = config.options.relativeTimestamps;
        }
        if (config.options.showPartials !== undefined) {
            showPartials = config.options.showPartials;
        }
        if (config.options.showSentiment !== undefined) {
            showSentiment = config.options.showSentiment;
        }
        if (config.options.showSummary !== undefined) {
            showSummaryByConfig = config.options.showSummary;
        }
    }

    return (
        <div className={classNames('h-full flex flex-col transcript bg-gray-50', { dark: theme })} ref={containerRef}>
            {match(eventQuery)
                .with({ status: 'loading' }, { status: 'success' }, { status: 'empty' }, () => (
                    <div className="dark:bg-bluegray-7">
                        {(showTitleInfo || showSearch) && (
                            <Header
                                headerHandleAttributes={handlesEnabled ? headerHandleAttributes : undefined}
                                headerHandleListeners={handlesEnabled ? headerHandleListeners : undefined}
                                useConfigOptions={useConfigOptions}
                                containerHeight={containerHeight}
                                currentParagraphTimestamp={currentParagraphTimestamp}
                                endTime={endTime}
                                eventId={eventId}
                                eventQuery={eventQuery}
                                hideSearch={hideSearch}
                                onBack={onBack}
                                onBackHeader={onBackHeader}
                                onClose={onClose}
                                onEdit={onEdit}
                                searchTerm={searchTerm}
                                showHeaderControls={showHeaderControls}
                                showHeaderPlayButton={showHeaderPlayButton}
                                onChangeSearchTerm={onChangeSearchTerm}
                                onSeekAudioByDate={onSeekAudioByDate}
                                startTime={startTime}
                            />
                        )}
                        {searchTerm && (
                            <div
                                className={classNames(
                                    'flex items-center h-10 bg-gray-100 text-gray-500 text-sm p-3 shadow',
                                    'dark:bg-bluegray-6 dark:bg-opacity-40 dark:text-bluegray-4',
                                    'transcript__search-navigator'
                                )}
                            >
                                <div className="text-sm truncate">
                                    Showing {matches.length} result{matches.length === 1 ? '' : 's'} for &quot;
                                    <span className="font-semibold">{searchTerm}</span>
                                    &quot;
                                </div>
                                <div className="flex-1" />
                                <button
                                    tabIndex={0}
                                    className="w-2.5 mr-2 cursor-pointer rotate-180 hover:text-gray-600"
                                    onClick={prevMatch}
                                >
                                    <Chevron />
                                </button>
                                <div className="min-w-[35px] mr-2 text-center">
                                    {matchIndex + 1} / {matches.length}
                                </div>
                                <button
                                    tabIndex={0}
                                    className="w-2.5 mr-2 cursor-pointer hover:text-gray-600"
                                    onClick={nextMatch}
                                >
                                    <Chevron />
                                </button>
                                <button
                                    tabIndex={0}
                                    className="w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={(e) => onChangeSearchTerm(e, { value: '' })}
                                >
                                    <Close />
                                </button>
                            </div>
                        )}
                    </div>
                ))
                .otherwise(() => null)}
            <div
                id="transcriptContainer"
                className="overflow-y-scroll flex-1 bg-gray-50 dark:bg-bluegray-7"
                ref={scrollContainerRef}
            >
                {showSummaryByConfig &&
                    match(eventQuery)
                        .with({ status: 'success' }, ({ data }) => {
                            const event = data?.events[0];
                            if (event && event.summaries && event.summaries.length > 0) {
                                const summaryObj = findSummary(event.summaries);
                                let summaryTexts =
                                    summaryObj?.summary && summaryObj.summary.length > 0 ? summaryObj.summary : [];
                                if (!showSummary) {
                                    // We're only showing the first line to truncate
                                    // when the UI is collapsed
                                    summaryTexts = summaryTexts.slice(0, 1);
                                }
                                return (
                                    <div
                                        onClick={toggleSummary}
                                        className="mb-2 group cursor-pointer hover:bg-slate-200/90 active:bg-slate-300 text-sm bg-slate-200/60 dark:bg-bluegray-6/50 rounded-b-lg px-3 py-2.5 summaryContainer"
                                    >
                                        <p className="text-xs tracking-wide text-slate-400 dark:text-slate-100/20 font-bold mb-1 summaryLabel">
                                            AI SUMMARY
                                        </p>
                                        <h2 className="font-bold dark:text-slate-100 dark:antialiased leading-[1.1875rem] tracking-tight text-base summaryTitle">
                                            {summaryObj?.title}
                                        </h2>
                                        {summaryTexts.map((summaryText) => (
                                            <p
                                                key={summaryText.slice(0, 10)}
                                                className={classNames(
                                                    'text-sm mt-2 text-slate-700 dark:text-slate-200/30 group-hover:text-slate-900 dark:group-hover:text-slate-200/60 summaryText',
                                                    {
                                                        truncate: !showSummary,
                                                    }
                                                )}
                                            >
                                                {summaryText}
                                            </p>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        })
                        .otherwise(() => null)}
                {match(eventQuery)
                    .with({ status: 'loading' }, () =>
                        new Array(5).fill(0).map((_, idx) => (
                            <div key={idx} className="animate-pulse p-2">
                                <div className="rounded-md bg-gray-300 h-3 m-1 w-10 dark:bg-bluegray-5" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 ml-14 dark:bg-bluegray-5" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 dark:bg-bluegray-5" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 dark:bg-bluegray-6" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 mr-20 dark:bg-bluegray-6" />
                            </div>
                        ))
                    )
                    .with({ status: 'empty' }, ({ data }) => {
                        // We'll always have one event here, but to satisify the strict array index check
                        // we need to make sure it's not undefined still
                        return data.events[0] ? <EmptyMessage event={data.events[0]} /> : <NoEventFound />;
                    })
                    .with({ status: 'success' }, ({ data }) => {
                        return speakerTurns.map(({ id, speaker, paragraphsWithMatches: paragraphs }) => {
                            const speakerTime = paragraphs[0]?.paragraph?.timestamp;
                            const speakerTimeRelative =
                                (paragraphs[0]?.paragraph?.syncMs || 0) - relativeTimestampsOffset;
                            return (
                                <div key={`speaker-turn-${id}`}>
                                    {showSpeakers && speaker.identified && (
                                        <div
                                            className={classNames(
                                                'p-3 pb-2 text-sm -mb-3 sticky top-0 z-10 bg-gray-50 text-gray-800',
                                                'dark:bg-bluegray-7 dark:text-gray-400',
                                                'transcript__speaker'
                                            )}
                                        >
                                            {speaker.name && (
                                                <p className="truncate">
                                                    <span className="font-semibold dark:text-white">
                                                        {speaker.name}
                                                    </span>
                                                    {speaker.title && (
                                                        <span className="text-gray-500">, {speaker.title}</span>
                                                    )}
                                                </p>
                                            )}
                                            {speakerTime && speakerTimeRelative !== undefined && (
                                                <p
                                                    className={classNames(
                                                        'text-xs text-gray-500 dark:text-bluegray-4 dark:text-opacity-50 flex-shrink-0',
                                                        {
                                                            '-mt-[1px]': speaker.name,
                                                        }
                                                    )}
                                                >
                                                    {relativeTimestamps
                                                        ? Duration.fromMillis(speakerTimeRelative).toFormat('h:mm:ss')
                                                        : DateTime.fromISO(speakerTime).toFormat('h:mm:ss a')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {paragraphs.map(({ sentences, paragraph }) => {
                                        const { id, timestamp, syncMs } = paragraph;
                                        const syncMsRelative = (syncMs || 0) - relativeTimestampsOffset;
                                        return (
                                            <div
                                                key={id}
                                                id={`paragraph-${id}`}
                                                className="relative p-3 pb-4 transcript__paragraph"
                                                onClick={() => onClickTranscript?.(paragraph)}
                                                ref={id === currentParagraph ? currentParagraphRef : undefined}
                                            >
                                                {(!showSpeakers || !speaker.identified) && (
                                                    <>
                                                        {relativeTimestamps ? (
                                                            <div className="pb-2 font-semibold text-sm dark:text-bluegray-4 dark:text-opacity-50">
                                                                {Duration.fromMillis(syncMsRelative).toFormat(
                                                                    'h:mm:ss'
                                                                )}
                                                            </div>
                                                        ) : (
                                                            timestamp && (
                                                                <div className="pb-2 font-semibold text-sm dark:text-bluegray-4 dark:text-opacity-50">
                                                                    {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                                                                </div>
                                                            )
                                                        )}
                                                    </>
                                                )}
                                                <div className="text-sm dark:text-bluegray-4">
                                                    {sentences.map(({ chunks, id: sId }) => (
                                                        <Fragment key={sId}>
                                                            {chunks.map(
                                                                ({ highlight, id: sentenceId, text, textSentiment }) =>
                                                                    highlight ? (
                                                                        <mark
                                                                            ref={
                                                                                sentenceId === currentMatch
                                                                                    ? currentMatchRef
                                                                                    : undefined
                                                                            }
                                                                            className={classNames({
                                                                                'bg-yellow-300':
                                                                                    sentenceId === currentMatch,
                                                                            })}
                                                                            key={sentenceId}
                                                                        >
                                                                            {text}
                                                                        </mark>
                                                                    ) : (
                                                                        <span
                                                                            key={sentenceId}
                                                                            className={classNames({
                                                                                'text-green-600':
                                                                                    textSentiment === 'positive' &&
                                                                                    showSentiment,
                                                                                'text-red-600':
                                                                                    textSentiment === 'negative' &&
                                                                                    showSentiment,
                                                                            })}
                                                                        >
                                                                            {text}
                                                                        </span>
                                                                    )
                                                            )}
                                                            &nbsp;
                                                        </Fragment>
                                                    ))}
                                                </div>
                                                {id === currentParagraph && (
                                                    <div className="w-[3px] bg-blue-700 absolute top-0 bottom-0 left-0 rounded-r-sm" />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {data.events[0]?.isLive && partial?.text && showPartials && (
                                        <div className="relative p-3 pb-4 mb-4">
                                            {partial.timestamp && partial.relativeTimestamp !== undefined && (
                                                <div className="pb-2 font-semibold text-sm dark:text-bluegray-5">
                                                    {relativeTimestamps
                                                        ? Duration.fromMillis(
                                                              (partial.relativeTimestamp || 0) -
                                                                  relativeTimestampsOffset
                                                          ).toFormat('h:mm:ss')
                                                        : DateTime.fromMillis(partial.timestamp).toFormat('h:mm:ss a')}
                                                </div>
                                            )}
                                            <div
                                                ref={currentParagraph === 'partial' ? currentParagraphRef : undefined}
                                                key={`${hash(partial.text)}-${paragraphs.length}`}
                                                className="text-sm dark:text-bluegray-4"
                                            >
                                                {partial.text}
                                            </div>
                                            {currentParagraph === 'partial' && (
                                                <div className="w-[3px] bg-blue-700 absolute top-0 bottom-0 left-0 rounded-r-sm" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })
                    .with({ status: 'error' }, () => <NoEventFound />)
                    .with({ status: 'paused' }, () => <NoEventFound />)
                    .exhaustive()}
            </div>
            {match(eventQuery)
                .with({ status: 'success' }, { status: 'empty' }, ({ data: { events } }) => {
                    const event = events[0];
                    if (hidePlaybar) {
                        return null;
                    }
                    return (
                        (event?.audioProxy || event?.isLive) && (
                            <Playbar
                                hideEventDetails
                                hidePlayer={!showPlayer}
                                id={event?.id}
                                metaData={{
                                    createdBy: getEventCreatorName(event?.creator as User),
                                    eventStream: event?.audioStreamUri,
                                    eventType: event?.eventType,
                                    externalAudioStreamUrl: event.externalAudioStreamUrl,
                                    isLive: !!event?.isLive,
                                    quote: getPrimaryQuote(event?.primaryCompany),
                                    title: event?.title,
                                }}
                                offset={(event?.audioRecordingOffsetMs || 0) / 1000}
                                url={(event.isLive ? event.liveStreamUrl : event.audioProxy) || ''}
                            />
                        )
                    );
                })
                .otherwise(() => null)}
        </div>
    );
};

function useEventUpdates(eventId = '') {
    const eventUpdateQuery = useQuery<EventUpdatesQuery, EventUpdatesQueryVariables>({
        query: gql`
            query EventUpdates($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
                    audioProxy
                    audioRecordingOffsetMs
                    audioRecordingUrl
                    audioStreamUri
                    connectionStatus
                    creator {
                        id
                        firstName
                        lastName
                        primaryEmail
                        username
                    }
                    eventDate
                    externalAudioStreamUrl
                    hasConnectionDetails
                    hasPublishedTranscript
                    hasTranscript
                    isLive
                    liveStreamUrl
                    publishedTranscriptExpected
                }
            }
        `,
        pause: !eventId,
        requestPolicy: 'network-only',
        variables: {
            eventId,
        },
    });

    // From before the event to up to 1 hour after it starts, refresh the status/connection
    // details every 5 seconds
    useRealtimeEvent(
        `scheduled_audio_call_${eventId}_changes`,
        'modified',
        useCallback(() => eventUpdateQuery.refetch(), [eventUpdateQuery.refetch])
    );
    return eventUpdateQuery;
}

function useLatestEventForTicker(ticker = '') {
    return useQuery<LatestEventForTickerQuery, LatestEventForTickerQueryVariables>({
        query: gql`
            query LatestEventForTicker($filter: LatestEventFilter!) {
                latestEventForTicker(filter: $filter) {
                    id
                }
            }
        `,
        pause: !ticker,
        requestPolicy: 'cache-first',
        variables: {
            filter: {
                ticker,
                earningsOnly: true,
            },
        },
    });
}

function useEventData(eventId = '', eventUpdateQuery: QueryResult<EventUpdatesQuery, EventUpdatesQueryVariables>) {
    const eventQuery = useQuery<TranscriptQuery, TranscriptQueryVariables>({
        isEmpty: ({ events }) => !events[0]?.transcripts[0]?.sections?.length && !events[0]?.hasTranscript,
        query: gql`
            query Transcript($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
                    audioProxy
                    audioRecordingUrl
                    audioRecordingOffsetMs
                    audioStreamUri
                    attachments {
                        archivedUrl
                        mimeType
                        title
                        url
                    }
                    connectionStatus
                    creator {
                        id
                        firstName
                        lastName
                        primaryEmail
                        username
                    }
                    dialInPhoneNumbers
                    dialInPin
                    eventDate
                    eventType
                    externalAudioStreamUrl
                    hasConnectionDetails
                    hasPublishedTranscript
                    hasTranscript
                    isLive
                    liveStreamUrl
                    primaryCompany {
                        id
                        commonName
                        instruments {
                            id
                            isPrimary
                            quotes {
                                id
                                exchange {
                                    id
                                    country {
                                        id
                                        countryCode
                                    }
                                    shortName
                                }
                                isPrimary
                                localTicker
                            }
                        }
                    }
                    publishedTranscriptExpected
                    quotePrices {
                        currentDayClosePrice
                        currentDayOpenPrice
                        endPrice
                        previousDayClosePrice
                        quote {
                            id
                            exchange {
                                id
                                shortName
                            }
                            localTicker
                        }
                        realtimePrices {
                            id
                            date
                            price
                            priceChangeFromStartPercent
                            priceChangeFromStartValue
                            volume
                            volumeChangeFromLastPercent
                            volumeChangeFromLastValue
                            volumeChangeFromStartPercent
                            volumeChangeFromStartValue
                        }
                        startPrice
                    }
                    summaries {
                        id
                        audioClip
                        created
                        eventId
                        modelType
                        modified
                        priority
                        reviewed
                        summary
                        summaryType
                        title
                        transcriptVersion
                        videoClip
                    }
                    title
                    transcripts {
                        id
                        sections {
                            id
                            speakerTurns {
                                id
                                paragraphs {
                                    id
                                    displayTimestamp
                                    sentences {
                                        id
                                        sentiment {
                                            id
                                            textual {
                                                id
                                                basicSentiment
                                                overThreshold
                                            }
                                        }
                                        text
                                    }
                                    syncMs
                                    syncTimestamp
                                    timestamp
                                }
                                speaker {
                                    id
                                    identified
                                    name
                                    title
                                }
                            }
                        }
                    }
                    webcastUrls
                }
            }
        `,
        pause: !eventId,
        requestPolicy: 'cache-and-network',
        variables: {
            eventId,
        },
    });

    // When we go from no transcript -> has transcript, refetch to get the initial transcript data.
    useEffect(() => {
        if (eventUpdateQuery.state.data?.events[0]?.hasTranscript) {
            eventQuery.refetch();
        }
    }, [eventUpdateQuery.state.data?.events[0]?.hasTranscript]);

    return eventQuery;
}

function useLatestTranscripts(
    eventId = '',
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>
): SpeakerTurn[] {
    const latestParagraphsQuery = useQuery<LatestParagraphsQuery, LatestParagraphsQueryVariables>({
        query: gql`
            query LatestParagraphs($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
                    transcripts {
                        id
                        latestParagraphs {
                            id
                            timestamp
                            displayTimestamp
                            syncTimestamp
                            syncMs
                            sentences {
                                id
                                text
                            }
                        }
                    }
                }
            }
        `,
        requestPolicy: 'network-only',
        pause: true,
        variables: {
            eventId,
        },
    });

    // Each time the latestParagraphs get updated, set them in state
    const [latestParagraphs, setLatestParagraphs] = useState<Map<string, Paragraph>>(new Map());

    // When this is true, we do a refetch of the eventQuery
    const [refetchingTranscript, setRefetchingTranscript] = useState(false);

    useRealtimeEvent<void>(
        `scheduled_audio_call_${eventId}_events_changes`,
        'modified',
        useCallback(() => {
            latestParagraphsQuery.refetch();
        }, [latestParagraphsQuery.refetch])
    );

    useEffect(() => {
        if (latestParagraphsQuery.state.data) {
            setLatestParagraphs((prev) => {
                const next = new Map(prev);
                (latestParagraphsQuery.state.data?.events[0]?.transcripts[0]?.latestParagraphs || []).forEach((p) => {
                    next.set(p.id, p);
                });
                return next;
            });
        }
    }, [latestParagraphsQuery.state.data, latestParagraphsQuery.status]);

    // Watch the eventQuery and the lastestParagraphs
    // if we have no speakerTurns from the eventQuery
    // and we do have latestParagraphs
    // let's toggle on refetching mode
    useEffect(() => {
        if (!refetchingTranscript && latestParagraphs && latestParagraphs.size > 0) {
            const speakerTurns =
                eventQuery.state.data?.events[0]?.transcripts[0]?.sections.flatMap((section) => section.speakerTurns) ||
                [];
            if (!speakerTurns || speakerTurns.length === 0) {
                setRefetchingTranscript(true);
            }
        }
    }, [eventQuery, latestParagraphs, refetchingTranscript]);

    // Refetching mode is on
    // Time to refetch the transcript
    // Nothing turns this off, so it
    // should only run once
    useEffect(() => {
        if (refetchingTranscript) {
            eventQuery.refetch();
        }
    }, [refetchingTranscript]);

    // Loop through the speaker turns and paragraphs and update any of the original paragraphs
    // that have changed since the first download, then add any completely new paragraphs to the
    // end of the last speaker turn.
    //
    // Memoize to make sure we only do this as needed.
    return useMemo<SpeakerTurn[]>(() => {
        //
        // For past events, just using the mapping as is, which will be the server-returned
        // order of paragraphs.
        const speakerTurns =
            eventQuery.state.data?.events[0]?.transcripts[0]?.sections.flatMap((section) => section.speakerTurns) || [];
        const originalParagraphIds = new Set(speakerTurns.flatMap((s) => s.paragraphs.map((p) => p.id)));

        return speakerTurns.map((s, idx) => {
            // Update the paragraphs that we already pulled down if they have changed
            let updatedParagraphs = s.paragraphs.map((p) => ({
                ...p,
                ...(latestParagraphs.get(p.id) || {}),
            }));

            // If we are on the last speakerTurn, append any paragraphs from the latest that
            // we didn't pull in the original query
            if (idx === speakerTurns.length - 1) {
                updatedParagraphs = [
                    ...updatedParagraphs,
                    ...[...latestParagraphs.values()].filter((p) => !originalParagraphIds.has(p.id)),
                ];
            }

            // If live, loop over the values in the map and sort by timestamp since the server
            // may update older paragraphs.
            if (eventQuery.state.data?.events[0]?.isLive) {
                updatedParagraphs.sort((p1, p2) =>
                    p1.timestamp && p2.timestamp ? p1.timestamp.localeCompare(p2.timestamp) : p1.id.localeCompare(p2.id)
                );
            }

            return {
                ...s,
                paragraphs: updatedParagraphs,
            };
        });
    }, [eventQuery.state.data?.events[0]?.transcripts, latestParagraphs]);
}

function usePartials(eventId: string, lastParagraphId?: string) {
    const [partial, setPartial] = useState<{
        relativeTimestamp: number;
        timestamp: number;
        text: string;
        index: number;
    }>({
        relativeTimestamp: 0,
        timestamp: 0,
        text: '',
        index: -1,
    });
    const [lastCleared, setLastCleared] = useState<number>(-1);

    // Listen for incoming partials via realtime websocket
    useRealtimeEvent<{ start_ms: number; start_timestamp_ms: number; pretty_transcript: string; index: number }>(
        `scheduled_audio_call_${eventId}_events_changes`,
        'partial_transcript',
        useCallback(
            (data) => {
                const {
                    start_ms: relativeTimestamp = 0,
                    start_timestamp_ms: timestamp = 0,
                    pretty_transcript: text = '',
                    index = -1,
                } = data || {};
                setPartial((prevState) => {
                    // Partials come in via webhooks which means they can be out of order, make sure the one we are
                    // processing has a higher index than the last one we processed. Otherwise we should ignroe it.
                    if (index >= prevState.index) {
                        return {
                            index,
                            relativeTimestamp,
                            text,
                            timestamp,
                        };
                    }
                    return prevState;
                });
            },
            [setPartial]
        )
    );

    // Listen for when the partial is cleared out
    //
    // For this, we just set the index value that was cleared but we dont clear
    // the text yet. We only want to clear it when we actually get the new paragraph
    // from the server to avoid the text disappearing and reappearing.
    useRealtimeEvent<{ index: number }>(
        `scheduled_audio_call_${eventId}_events_changes`,
        'partial_transcript_clear',
        useCallback(
            (data) => {
                const { index = -1 } = data || {};
                // Only set if the current index is higher than the last one we processed
                setLastCleared((prevIndex) => (index > prevIndex ? index : prevIndex));
            },
            [setLastCleared]
        )
    );

    // When we get new paragraphs from the server, see if we need to clear the partial
    //
    // This way when a partial ends and turns into a real transcript item, we'll wait
    // until we load the transcript from the server to clear the partial which makes
    // the text transition smooth.
    useEffect(() => {
        if (lastCleared >= partial.index) {
            setPartial({
                index: lastCleared,
                relativeTimestamp: 0,
                timestamp: 0,
                text: '',
            });
        }
    }, [lastParagraphId]);

    return partial;
}

function useAudioSync(
    eventId = '',
    speakerTurns: SpeakerTurn[],
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>,
    audioPlayer: AudioPlayer
): [
    string | null,
    Dispatch<SetStateAction<string | null>>,
    RefCallback<HTMLDivElement>,
    RefCallback<HTMLDivElement>,
    Partial,
    string | null,
    string | null,
    string | null,
    () => void
] {
    const [currentParagraph, setCurrentParagraph] = useState<string | null>(null);
    const offset = { top: eventQuery.state.data?.events?.[0]?.hasPublishedTranscript ? 55 : 5, bottom: 15 };
    const {
        scrollContainerRef,
        scrollContainer,
        forceNextScroll,
        targetRef: currentParagraphRef,
    } = useAutoScroll<HTMLDivElement>({
        offset,
    });

    const paragraphs = useMemo(() => speakerTurns.flatMap((s) => s.paragraphs), [speakerTurns]);
    // It's not the most efficient thing to load the partial here, since each partial change will trigger a re-render.
    // However, we need to use the existence of partial text as a condition for deciding whether the partial text or
    // the last paragraph from the server should be selected. If this becomes a performance issue we may need to
    // revisit, but it will be ugly to fix to doing this the "cleaner" but less efficient way for now.
    const partial = usePartials(eventId, paragraphs.slice(-1)[0]?.id);

    useEffect(() => {
        const eventId = eventQuery.state.data?.events[0]?.id;

        // Find the _last_ paragraph with a timetamp <= the current audio time, that's the
        // one the should be currently playing,
        //
        // If the audio player is playing a different event, dont search through.
        const audioParagraph =
            eventId && audioPlayer.id && audioPlayer.id === eventId
                ? [...paragraphs].reverse().find((p) => p.syncMs && p.syncMs <= audioPlayer.rawCurrentTime * 1000)
                : null;

        const lastSyncMs = paragraphs.slice(-1)[0]?.syncMs || 0;
        const isListening = eventId ? audioPlayer.playing(eventId) : false;

        const listeningAtLiveEdge = audioParagraph && isListening && audioPlayer.rawCurrentTime * 1000 > lastSyncMs;
        const liveAndNotListening = !audioParagraph && eventQuery.state.data?.events[0]?.isLive;

        // If we are audio is past the recorded transcripts, we are at the "live edge"
        // and want to select the partials.
        //
        // If we aren't listening at all and the call is live, we also want to
        // default to the partials
        if (listeningAtLiveEdge || liveAndNotListening) {
            if (partial.text) {
                setCurrentParagraph('partial');
                // Not playing audio
                if (!isListening && !audioPlayer.playing(null)) {
                    audioPlayer.seekToEnd();
                }
            } else {
                const lastParagraph = paragraphs.slice(-1)[0];
                if (lastParagraph) {
                    setCurrentParagraph(lastParagraph.id);
                }
            }
        }
        // If we found a paragraph for the current audio, use it
        else if (audioParagraph) {
            const scrollHeight = scrollContainer?.scrollHeight;
            const offsetHeight = scrollContainer?.offsetHeight;
            const scrollTop = scrollContainer?.scrollTop;
            let isAtBottom = false;
            if (scrollHeight && offsetHeight && scrollTop) {
                // 180 gives us some buffer to decide they're close enough to the bottom
                isAtBottom = scrollHeight <= 180 + offsetHeight + scrollTop;
            }
            if (isAtBottom && partial.text && !isListening) {
                setCurrentParagraph('partial');
                if (!isListening) {
                    audioPlayer.seekToEnd();
                }
            } else {
                setCurrentParagraph(audioParagraph.id);
            }
        }
        // If we don't have any audio to sync to and aren't live, go to the first paragraph
        else if (paragraphs[0]) {
            setCurrentParagraph(paragraphs[0].id);
        }

        // As long as we found one, set it so we can scroll to it and show
        // an indicator in the UI
    }, [paragraphs.length, Math.floor(audioPlayer.rawCurrentTime), !!partial.text]);

    const currentParagraphTimestamp = useMemo(() => {
        const currentIndex = paragraphs.findIndex(({ id }) => currentParagraph === id);
        // Return first available time
        return paragraphs.slice(currentIndex).find(({ syncTimestamp }) => !!syncTimestamp)?.syncTimestamp || null;
    }, [currentParagraph, paragraphs]);

    const startTime = useMemo(
        () => paragraphs.find(({ syncTimestamp }) => !!syncTimestamp)?.syncTimestamp || null,
        [paragraphs]
    );
    const endTime = useMemo(() => {
        return [...paragraphs].reverse().find(({ syncTimestamp }) => !!syncTimestamp)?.syncTimestamp || null;
    }, [paragraphs]);

    return [
        currentParagraph,
        setCurrentParagraph,
        scrollContainerRef,
        currentParagraphRef,
        partial,
        currentParagraphTimestamp,
        startTime,
        endTime,
        forceNextScroll,
    ];
}

function useSearchState(speakerTurns: SpeakerTurn[], initialSearchTerm = '', controlledSearchTerm?: string) {
    const { state, handlers } = useChangeHandlers({
        searchTerm: initialSearchTerm || controlledSearchTerm || '',
    });

    // Track the current match id and use it to set the proper currentMatchRef for autoscrolling
    const [currentMatch, setCurrentMatch] = useState<string | null>(null);
    const { scrollContainerRef, targetRef: currentMatchRef } = useAutoScroll<HTMLDivElement>({
        pauseOnUserScroll: false,
        behavior: 'auto',
        offset: { top: 5, bottom: 5 },
    });
    const { settings } = useSettings();
    const config = useConfig();
    const relativeTimestampOffset = (speakerTurns[0]?.paragraphs[0]?.syncMs || 0) / 1000;
    let beginSec =
        config.options?.transcriptRelativeBeginSeconds !== undefined
            ? config.options.transcriptRelativeBeginSeconds + relativeTimestampOffset
            : undefined;
    let endSec =
        config.options?.transcriptRelativeEndSeconds !== undefined
            ? config.options.transcriptRelativeEndSeconds + relativeTimestampOffset
            : undefined;

    if (config.options?.transcriptRawBeginSeconds !== undefined) {
        beginSec = config.options.transcriptRawBeginSeconds;
    }

    if (config.options?.transcriptRawEndSeconds !== undefined) {
        endSec = config.options.transcriptRawEndSeconds;
    }

    // when paragraphs or search term are updated, loop over the paragraphs
    // adding the search highlights to each as a separate `chunks` field. Then
    // instead of using the paragraph directly, we can loop over the chunks
    // and render the highlight or not for each one.
    const speakerTurnsWithMatches: SpeakerTurnsWithMatches[] = useMemo(
        () =>
            speakerTurns.map((s) => ({
                ...s,
                paragraphsWithMatches: s.paragraphs
                    .filter((p) => {
                        if (typeof beginSec === 'number' && p.syncMs) {
                            const normalizedTime = p.syncMs / 1000;
                            if (typeof endSec === 'number') {
                                return normalizedTime >= beginSec && normalizedTime <= endSec;
                            } else {
                                return normalizedTime >= beginSec;
                            }
                        } else if (typeof endSec === 'number' && p.syncMs) {
                            const normalizedTime = p.syncMs / 1000;
                            return normalizedTime <= endSec;
                        }
                        return true;
                    })
                    .map((paragraph) => {
                        return {
                            sentences: paragraph.sentences.map((sentence, idx) => ({
                                id: `primary-sentence-${sentence.id}-${idx}`,
                                chunks: state.searchTerm
                                    ? findAll({
                                          autoEscape: true,
                                          caseSensitive: false,
                                          searchWords: [state.searchTerm],
                                          textToHighlight: sentence.text,
                                      }).map(({ highlight, start, end }, index) => ({
                                          highlight,
                                          id: `${paragraph.id}-${sentence.id}-search-term-chunk-${index}`,
                                          text: sentence.text.substr(start, end - start),
                                          textSentiment:
                                              settings.textSentiment &&
                                              sentence.sentiment?.textual?.overThreshold &&
                                              sentence.sentiment?.textual?.basicSentiment,
                                      }))
                                    : [
                                          {
                                              highlight: false,
                                              id: `${paragraph.id}-${sentence.id}-sentence-chunk-${idx}`,
                                              text: sentence.text,
                                              textSentiment:
                                                  settings.textSentiment &&
                                                  sentence.sentiment?.textual?.overThreshold &&
                                                  sentence.sentiment?.textual?.basicSentiment,
                                          },
                                      ],
                            })),
                            paragraph,
                        };
                    }),
            })),

        [settings, speakerTurns, state.searchTerm]
    );

    // Get just the paragraphs with search matches
    const matches = useMemo(
        () =>
            speakerTurnsWithMatches
                .flatMap((s) => s.paragraphsWithMatches)
                .flatMap((p) => p.sentences)
                .flatMap((s) => s.chunks.filter((h) => h.highlight)),
        [speakerTurnsWithMatches]
    );

    // When the search term changes, reset the current match to the first hit on the new term
    useEffect(() => {
        setCurrentMatch(matches[0]?.id || null);
    }, [state.searchTerm]);

    // Grab the current match index
    const matchIndex = useMemo(() => matches.findIndex((m) => m.id === currentMatch), [matches, currentMatch]);

    // Jump to the next match
    const nextMatch = useCallback(() => {
        const match = matches[(matchIndex + 1) % matches.length];
        if (match) setCurrentMatch(match.id);
    }, [matches, matchIndex]);

    // Jump to the previous match
    const prevMatch = useCallback(() => {
        const match = matches[matchIndex ? matchIndex - 1 : matches.length - 1];
        if (match) setCurrentMatch(match.id);
    }, [matches, matchIndex]);

    useEffect(() => {
        if (typeof controlledSearchTerm === 'string') {
            handlers.searchTerm(new KeyboardEvent('keydown'), { value: controlledSearchTerm });
        }
    }, [controlledSearchTerm]);

    return {
        searchTerm: state.searchTerm,
        onChangeSearchTerm: handlers.searchTerm,
        speakerTurnsWithMatches,
        matches,
        matchIndex,
        nextMatch,
        prevMatch,
        scrollContainerRef,
        currentMatch,
        currentMatchRef,
    };
}

/** @notExported */
export interface TranscriptProps extends TranscriptSharedProps {
    width?: string;
    isResizing?: boolean;
    startResize?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
    controlledSearchTerm?: string;
    initialSearchTerm?: string;
    onBackHeader?: string;
    useConfigOptions?: boolean;
}

/**
 * Renders Transcript
 */
export const Transcript = (props: TranscriptProps): ReactElement => {
    const {
        controlledSearchTerm,
        eventId: eventListEventId,
        handlesEnabled = false,
        hidePlaybar,
        hideSearch,
        onBack,
        onBackHeader = 'Events',
        onClose,
        onEdit,
        initialSearchTerm,
        isResizing = false,
        useConfigOptions = false,
        showHeaderControls = true,
        showHeaderPlayButton,
        startResize,
        width,
    } = props;
    const [eventId, setEventId] = useState(eventListEventId);
    const config = useConfig();
    const eventIdFromTicker = useLatestEventForTicker(config?.options?.ticker);

    useEffect(() => {
        if (!eventId && config?.options?.eventId) {
            setEventId(config.options.eventId);
        } else if (!eventId && eventIdFromTicker.status === 'success') {
            setEventId(eventIdFromTicker.state.data?.latestEventForTicker.id);
        }
    }, [setEventId, eventId, config, config?.options, eventIdFromTicker.status, eventIdFromTicker]);

    const { settings } = useSettings();
    const eventUpdateQuery = useEventUpdates(eventId);
    const eventQuery = useEventData(eventId, eventUpdateQuery);

    const audioPlayer = useAudioPlayer();

    const speakerTurns = useLatestTranscripts(eventId, eventQuery);
    const [
        currentParagraph,
        _setCurrentParagraph,
        autoscrollContainerRef,
        currentParagraphRef,
        partial,
        currentParagraphTimestamp,
        startTime,
        endTime,
        forceNextScroll,
    ] = useAudioSync(eventId, speakerTurns, eventQuery, audioPlayer);
    const searchState = useSearchState(speakerTurns, initialSearchTerm, controlledSearchTerm);
    // We need to set two separate refs to the scroll container, so this just wraps those 2 into 1 to pass to the
    // scrollContiainer ref. May make this a helper hook at some point
    const scrollContainerRef = useCallback(
        (ref: HTMLDivElement) => {
            autoscrollContainerRef(ref);
            searchState.scrollContainerRef(ref);
        },
        [autoscrollContainerRef, searchState.scrollContainerRef]
    );
    const onSeekAudioByDate = useCallback(
        (date: string) => {
            const p = searchState.speakerTurnsWithMatches.flatMap(({ paragraphsWithMatches: paragraphs }) =>
                paragraphs.flatMap(({ paragraph }) => paragraph)
            );
            const pastIndex = p.findIndex(({ syncTimestamp }) =>
                syncTimestamp ? new Date(syncTimestamp).getTime() > parseFloat(date) : false
            );
            if (pastIndex > 0) {
                const currentP = p[pastIndex - 1] || p[pastIndex];
                if (currentP) {
                    forceNextScroll();
                    onClickTranscript(currentP);
                }
            }
        },
        [searchState.speakerTurnsWithMatches, forceNextScroll]
    );
    const onSeekAudioSeconds = useCallback(
        (seconds: number, useOffset?: boolean) => {
            audioPlayer.rawSeek(seconds, useOffset);
        },
        [audioPlayer]
    );
    const onClickBack = useCallback(
        (event: MouseEvent) => {
            if (!audioPlayer.playing(null)) {
                audioPlayer.clear();
            }
            onBack?.(event);
        },
        [onBack]
    );

    const { height: containerHeight, ref: containerRef } = useElementSize();

    const bus = useMessageListener('seek-transcript-seconds', ({ data }) => void onSeekAudioSeconds(data, false), 'in');
    bus.on('seek-transcript-timestamp', ({ data }) => void onSeekAudioByDate(data), 'in');
    const onClickTranscript = useCallback(
        (paragraph: Paragraph) => {
            // We only seek if there is no id associated with the audio (unlikely)
            // or if the audioPlayer id is the same as our current eventId
            if (!audioPlayer.id || audioPlayer.id === eventId || (eventId && audioPlayer.playing(eventId))) {
                audioPlayer.rawSeek((paragraph.syncMs || 0) / 1000);
            }
            bus.emit('seek-audio-seconds', (paragraph.syncMs || 0) / 1000, 'out');
        },
        [audioPlayer, eventId]
    );
    useAutoTrack('View', 'Event', { eventId, widgetUserId: config.tracking?.userId }, [
        eventId,
        config.tracking?.userId,
    ]);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: eventId || '' });

    const transcriptComponent = (
        <TranscriptUI
            containerHeight={containerHeight}
            containerRef={containerRef}
            currentMatch={searchState.currentMatch}
            currentMatchRef={searchState.currentMatchRef}
            currentParagraph={currentParagraph}
            currentParagraphTimestamp={currentParagraphTimestamp}
            currentParagraphRef={currentParagraphRef}
            darkMode={settings.darkMode}
            endTime={endTime}
            eventId={eventId}
            eventQuery={eventQuery}
            handlesEnabled={handlesEnabled}
            headerHandleAttributes={attributes}
            headerHandleListeners={listeners}
            hidePlaybar={hidePlaybar}
            hideSearch={hideSearch}
            matchIndex={searchState.matchIndex}
            matches={searchState.matches}
            nextMatch={searchState.nextMatch}
            onBack={onBack ? onClickBack : undefined}
            onBackHeader={onBackHeader}
            onClose={onClose}
            onChangeSearchTerm={searchState.onChangeSearchTerm}
            onClickTranscript={onClickTranscript}
            onEdit={onEdit}
            onSeekAudioByDate={onSeekAudioByDate}
            partial={partial}
            prevMatch={searchState.prevMatch}
            relativeTimestampsOffset={
                searchState.speakerTurnsWithMatches[0]?.paragraphsWithMatches[0]?.paragraph?.syncMs || 0
            }
            scrollContainerRef={scrollContainerRef}
            searchTerm={searchState.searchTerm}
            showHeaderControls={showHeaderControls}
            showHeaderPlayButton={showHeaderPlayButton}
            showSpeakers={!!eventQuery.state.data?.events[0]?.hasPublishedTranscript}
            speakerTurns={searchState.speakerTurnsWithMatches}
            startTime={startTime}
            useConfigOptions={useConfigOptions}
        />
    );

    // This means we can resize and drag and drop
    if (handlesEnabled && width && startResize) {
        let showSearch = !hideSearch;
        if (useConfigOptions && config.options) {
            if (config.options.showSearch !== undefined) {
                showSearch = config.options.showSearch;
            }
        }
        return (
            <HandlesWrapperUI
                transform={transform}
                transition={transition}
                setNodeRef={setNodeRef}
                showSearch={showSearch}
                width={width}
                startResize={startResize}
                isResizing={isResizing}
                eventId={eventId}
            >
                {transcriptComponent}
            </HandlesWrapperUI>
        );
    }

    return transcriptComponent;
};
