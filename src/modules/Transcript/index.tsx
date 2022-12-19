import React, {
    Dispatch,
    SetStateAction,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    Ref,
    RefCallback,
    useCallback,
    useMemo,
    useEffect,
    useState,
    Fragment,
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';
import { findAll } from 'highlight-words-core';

import {
    BasicTextualSentiment,
    EventUpdatesQuery,
    EventUpdatesQueryVariables,
    LatestEventForTickerQuery,
    LatestEventForTickerQueryVariables,
    LatestParagraphsQuery,
    LatestParagraphsQueryVariables,
    TranscriptQuery,
    TranscriptQueryVariables,
} from '@aiera/client-sdk/types/generated';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { hash } from '@aiera/client-sdk/lib/strings';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useRealtimeEvent } from '@aiera/client-sdk/lib/realtime';
import { useAudioPlayer, AudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useAutoTrack, useSettings } from '@aiera/client-sdk/lib/data';
import { useElementSize } from '@aiera/client-sdk/lib/hooks/useElementSize';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { EmptyMessage } from './EmptyMessage';
import { Header } from './Header';
import './styles.css';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';

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
type Partial = { text: string; timestamp: number };

/** @notExported */
interface TranscriptSharedProps {
    eventId?: string;
    onBack?: MouseEventHandler;
}

/** @notExported */
interface TranscriptUIProps extends TranscriptSharedProps {
    containerHeight: number;
    containerRef: Ref<HTMLDivElement>;
    currentMatch?: string | null;
    currentMatchRef: Ref<HTMLDivElement>;
    currentParagraph?: string | null;
    currentParagraphTimestamp?: string | null;
    currentParagraphRef: Ref<HTMLDivElement>;
    darkMode?: boolean;
    endTime?: string | null;
    eventId?: string;
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>;
    matchIndex: number;
    matches: Chunk[];
    nextMatch: () => void;
    onBack?: MouseEventHandler;
    onBackHeader: string;
    onChangeSearchTerm: ChangeHandler<string>;
    onClickTranscript?: (paragraph: Paragraph) => void;
    onSeekAudioByDate?: (date: string) => void;
    partial?: Partial;
    prevMatch: () => void;
    scrollContainerRef: Ref<HTMLDivElement>;
    searchTerm: string;
    showSpeakers: boolean;
    speakerTurns: SpeakerTurnsWithMatches[];
    startTime?: string | null;
    useConfigOptions: boolean;
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
        matchIndex,
        matches,
        nextMatch,
        onBack,
        onBackHeader,
        onChangeSearchTerm,
        onClickTranscript,
        onSeekAudioByDate,
        partial,
        prevMatch,
        scrollContainerRef,
        searchTerm,
        showSpeakers,
        speakerTurns,
        startTime,
        useConfigOptions,
    } = props;

    // Show the player when its not useConfigOptions, or if it is enabled with useConfigOptions
    const config = useConfig();
    const showPlayer = !useConfigOptions || (useConfigOptions && config.options?.showAudioPlayer);
    const showTitleInfo = !useConfigOptions || (useConfigOptions && config.options?.showTitleInfo);
    const showSearch = !useConfigOptions || (useConfigOptions && config.options?.showSearch);
    const theme = !useConfigOptions ? darkMode : (useConfigOptions && config.options?.darkMode) || false;

    return (
        <div className={classNames('h-full flex flex-col transcript bg-gray-50', { dark: theme })} ref={containerRef}>
            {match(eventQuery)
                .with({ status: 'loading' }, { status: 'success' }, { status: 'empty' }, () => (
                    <div className="dark:bg-bluegray-7">
                        {(showTitleInfo || showSearch) && (
                            <Header
                                useConfigOptions={useConfigOptions}
                                containerHeight={containerHeight}
                                currentParagraphTimestamp={currentParagraphTimestamp}
                                endTime={endTime}
                                eventId={eventId}
                                eventQuery={eventQuery}
                                onBack={onBack}
                                onBackHeader={onBackHeader}
                                searchTerm={searchTerm}
                                onChangeSearchTerm={onChangeSearchTerm}
                                onSeekAudioByDate={onSeekAudioByDate}
                                startTime={startTime}
                            />
                        )}
                        {searchTerm && (
                            <div className="flex items-center h-10 bg-gray-100 dark:bg-bluegray-6 dark:bg-opacity-40 text-gray-500 dark:text-bluegray-4 text-sm p-3 shadow">
                                <div className="text-sm">
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
            <div className="overflow-y-scroll flex-1 bg-gray-50 dark:bg-bluegray-7" ref={scrollContainerRef}>
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
                            return (
                                <div key={`speaker-turn-${id}`}>
                                    {showSpeakers && speaker.identified && (
                                        <div className="p-3 pb-2 truncate text-sm -mb-3 sticky top-0 z-10 bg-gray-50 dark:bg-bluegray-7 dark:text-gray-400">
                                            <div>
                                                <span className="font-semibold dark:text-white">{speaker.name}</span>
                                                {speaker.title && (
                                                    <span className="text-gray-400">, {speaker.title}</span>
                                                )}
                                            </div>
                                            {speakerTime && (
                                                <div className="text-xs dark:text-bluegray-4 dark:text-opacity-50">
                                                    {DateTime.fromISO(speakerTime).toFormat('h:mm:ss a')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {paragraphs.map(({ sentences, paragraph }) => {
                                        const { id, timestamp } = paragraph;
                                        return (
                                            <div
                                                key={id}
                                                id={`paragraph-${id}`}
                                                className="relative p-3 pb-4"
                                                onClick={() => onClickTranscript?.(paragraph)}
                                                ref={id === currentParagraph ? currentParagraphRef : undefined}
                                            >
                                                {(!showSpeakers || !speaker.identified) && timestamp && (
                                                    <div className="pb-2 font-semibold text-sm dark:text-bluegray-4 dark:text-opacity-50">
                                                        {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                                                    </div>
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
                                                                                    textSentiment === 'positive',
                                                                                'text-red-600':
                                                                                    textSentiment === 'negative',
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
                                    {data.events[0]?.isLive && partial?.text && (
                                        <div className="relative p-3 pb-4 mb-4">
                                            {partial.timestamp && (
                                                <div className="pb-2 font-semibold text-sm dark:text-bluegray-5">
                                                    {DateTime.fromMillis(partial.timestamp).toFormat('h:mm:ss a')}
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
                    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
                    return (
                        (event?.audioRecordingUrl || event?.isLive) && (
                            <Playbar
                                hidePlayer={!showPlayer}
                                hideEventDetails={useConfigOptions}
                                id={event?.id}
                                url={
                                    event.isLive
                                        ? `https://storage.media.aiera.com/${event.id}`
                                        : event.audioRecordingUrl || ''
                                }
                                offset={(event?.audioRecordingOffsetMs || 0) / 1000}
                                metaData={{
                                    quote: primaryQuote,
                                    eventType: event?.eventType,
                                }}
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
                    eventDate
                    hasConnectionDetails
                    isLive
                    audioRecordingUrl
                    audioRecordingOffsetMs
                    publishedTranscriptExpected
                    hasTranscript
                    hasPublishedTranscript
                    connectionStatus
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
    const latestEventForTickerQuery = useQuery<LatestEventForTickerQuery, LatestEventForTickerQueryVariables>({
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

    return latestEventForTickerQuery;
}

function useEventData(eventId = '', eventUpdateQuery: QueryResult<EventUpdatesQuery, EventUpdatesQueryVariables>) {
    const eventQuery = useQuery<TranscriptQuery, TranscriptQueryVariables>({
        isEmpty: ({ events }) => !events[0]?.transcripts[0]?.sections?.length && !events[0]?.hasTranscript,
        query: gql`
            query Transcript($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
                    title
                    eventDate
                    eventType
                    hasConnectionDetails
                    isLive
                    audioRecordingUrl
                    audioRecordingOffsetMs
                    publishedTranscriptExpected
                    hasTranscript
                    hasPublishedTranscript
                    webcastUrls
                    dialInPhoneNumbers
                    dialInPin
                    connectionStatus
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
                    quotePrices {
                        currentDayClosePrice
                        currentDayOpenPrice
                        endPrice
                        previousDayClosePrice
                        quote {
                            id
                            localTicker
                            exchange {
                                id
                                shortName
                            }
                        }
                        realtimePrices {
                            id
                            date
                            price
                            volume
                            priceChangeFromStartValue
                            priceChangeFromStartPercent
                            volumeChangeFromStartValue
                            volumeChangeFromStartPercent
                            volumeChangeFromLastValue
                            volumeChangeFromLastPercent
                        }
                        startPrice
                    }
                    transcripts {
                        id
                        sections {
                            id
                            speakerTurns {
                                id
                                speaker {
                                    id
                                    name
                                    title
                                    identified
                                }
                                paragraphs {
                                    id
                                    timestamp
                                    displayTimestamp
                                    syncTimestamp
                                    syncMs
                                    sentences {
                                        id
                                        text
                                        sentiment {
                                            id
                                            textual {
                                                id
                                                overThreshold
                                                basicSentiment
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

    useRealtimeEvent<void>(
        `scheduled_audio_call_${eventId}_events_changes`,
        'modified',
        useCallback(() => {
            latestParagraphsQuery.refetch();
        }, [latestParagraphsQuery.refetch])
    );

    // Each time the latestParagraphs get updated, set them in state
    const [latestParagraphs, setLatestParagraphs] = useState<Map<string, Paragraph>>(new Map());
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
    }, [latestParagraphsQuery.state.data]);

    // Loop throught he speaker turns and paragraphs and update any of the original paragraphs
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
    const [partial, setPartial] = useState<{ timestamp: number; text: string; index: number }>({
        timestamp: 0,
        text: '',
        index: -1,
    });
    const [lastCleared, setLastCleared] = useState<number>(-1);

    // Listen for incoming partials via realtime websocket
    useRealtimeEvent<{ start_timestamp_ms: number; pretty_transcript: string; index: number }>(
        `scheduled_audio_call_${eventId}_events_changes`,
        'partial_transcript',
        useCallback(
            (data) => {
                const { start_timestamp_ms: timestamp = 0, pretty_transcript: text = '', index = -1 } = data || {};
                setPartial((prevState) => {
                    // Partials come in via webhooks which means they can be out of order, make sure the one we are
                    // processing has a higher index than the last one we processed. Otherwise we should ignroe it.
                    if (index >= prevState.index) {
                        return {
                            index,
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
    string | null
] {
    const [currentParagraph, setCurrentParagraph] = useState<string | null>(null);
    const offset = { top: eventQuery.state.data?.events?.[0]?.hasPublishedTranscript ? 55 : 5, bottom: 15 };
    const { scrollContainerRef, targetRef: currentParagraphRef } = useAutoScroll<HTMLDivElement>({ offset });

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
        const listeningAtLiveEdge = audioParagraph && audioPlayer.rawCurrentTime * 1000 > lastSyncMs;
        const liveAndNotListening = !audioParagraph && eventQuery.state.data?.events[0]?.isLive;

        // If we are audio is past the recorded transcripts, we are at the "live edge"
        // and want to select the partials.
        //
        // If we aren't listening at all and the call is live, we also want to
        // default to the partials
        if (listeningAtLiveEdge || liveAndNotListening) {
            if (partial.text) setCurrentParagraph('partial');
            else {
                const lastParagraph = paragraphs.slice(-1)[0];
                if (lastParagraph) {
                    setCurrentParagraph(lastParagraph.id);
                }
            }
        }
        // If we found a paragraph for the current audio, use it
        else if (audioParagraph) {
            setCurrentParagraph(audioParagraph.id);
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
    ];
}

function useSearchState(speakerTurns: SpeakerTurn[], initialSearchTerm = '') {
    const { state, handlers } = useChangeHandlers({
        searchTerm: initialSearchTerm,
    });

    // Track the current match id and use it to set the proper currentMatchRef for autoscrolling
    const [currentMatch, setCurrentMatch] = useState<string | null>(null);
    const { scrollContainerRef, targetRef: currentMatchRef } = useAutoScroll<HTMLDivElement>({
        pauseOnUserScroll: false,
        behavior: 'auto',
        offset: { top: 5, bottom: 5 },
    });
    const { settings } = useSettings();

    // when paragraphs or search term are updated, loop over the paragraphs
    // adding the search highlights to each as a separate `chunks` field. Then
    // instead of using the paragraph directly, we can loop over the chunks
    // and render the highlight or not for each one.
    const speakerTurnsWithMatches: SpeakerTurnsWithMatches[] = useMemo(
        () =>
            speakerTurns.map((s) => ({
                ...s,
                paragraphsWithMatches: s.paragraphs.map((paragraph) => {
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
    initialSearchTerm?: string;
    onBackHeader?: string;
    useConfigOptions?: boolean;
}

/**
 * Renders Transcript
 */
export const Transcript = (props: TranscriptProps): ReactElement => {
    const {
        eventId: eventListEventId,
        onBack,
        onBackHeader = 'Events',
        initialSearchTerm,
        useConfigOptions = false,
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
    ] = useAudioSync(eventId, speakerTurns, eventQuery, audioPlayer);
    const searchState = useSearchState(speakerTurns, initialSearchTerm);
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
                    onClickTranscript(currentP);
                }
            }
        },
        [searchState.speakerTurnsWithMatches]
    );
    const onSeekAudioSeconds = useCallback((seconds: number) => audioPlayer.rawSeek(seconds), [audioPlayer]);
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

    const bus = useMessageListener('seek-transcript-seconds', ({ data }) => void onSeekAudioSeconds(data), 'in');
    bus.on('seek-transcript-timestamp', ({ data }) => void onSeekAudioByDate(data), 'in');
    const onClickTranscript = useCallback(
        (paragraph: Paragraph) => {
            audioPlayer.rawSeek((paragraph.syncMs || 0) / 1000);
            bus.emit('seek-audio-seconds', (paragraph.syncMs || 0) / 1000, 'out');
        },
        [audioPlayer]
    );
    useAutoTrack('View', 'Event', { eventId }, [eventId]);

    return (
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
            matchIndex={searchState.matchIndex}
            matches={searchState.matches}
            nextMatch={searchState.nextMatch}
            onBack={onBack ? onClickBack : undefined}
            onBackHeader={onBackHeader}
            onChangeSearchTerm={searchState.onChangeSearchTerm}
            onClickTranscript={onClickTranscript}
            onSeekAudioByDate={onSeekAudioByDate}
            partial={partial}
            prevMatch={searchState.prevMatch}
            scrollContainerRef={scrollContainerRef}
            searchTerm={searchState.searchTerm}
            showSpeakers={!!eventQuery.state.data?.events[0]?.hasPublishedTranscript}
            speakerTurns={searchState.speakerTurnsWithMatches}
            startTime={startTime}
            useConfigOptions={useConfigOptions}
        />
    );
};
