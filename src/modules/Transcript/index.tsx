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
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';
import { findAll } from 'highlight-words-core';

import {
    EventUpdatesQuery,
    EventUpdatesQueryVariables,
    LatestParagraphsQuery,
    LatestParagraphsQueryVariables,
    TranscriptQuery,
    TranscriptQueryVariables,
} from '@aiera/client-sdk/types/generated';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useAudioPlayer, AudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useAutoTrack } from '@aiera/client-sdk/lib/data';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { EmptyMessage } from './EmptyMessage';
import { Header } from './Header';
import './styles.css';

type SpeakerTurn = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0];
type Paragraph = SpeakerTurn['paragraphs'][0];
type Chunk = { text: string; id: string; highlight: boolean };
interface ParagraphWithMatches {
    paragraph: Paragraph;
    chunks: Chunk[];
}
type SpeakerTurnsWithMatches = SpeakerTurn & { paragraphsWithMatches: ParagraphWithMatches[] };

/** @notExported */
interface TranscriptUIProps {
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>;
    currentParagraph?: string | null;
    currentParagraphRef: Ref<HTMLDivElement>;
    speakerTurns: SpeakerTurnsWithMatches[];
    showSpeakers: boolean;
    onBack?: MouseEventHandler;
    onClickTranscript?: (paragraph: Paragraph) => void;
    scrollRef: Ref<HTMLDivElement>;
    searchTerm: string;
    onChangeSearchTerm: ChangeHandler<string>;
    matches: Chunk[];
    matchIndex: number;
    nextMatch: () => void;
    prevMatch: () => void;
    currentMatch?: string | null;
    currentMatchRef: Ref<HTMLDivElement>;
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const {
        currentParagraph,
        currentParagraphRef,
        eventQuery,
        onBack,
        onClickTranscript,
        speakerTurns,
        showSpeakers,
        scrollRef,
        searchTerm,
        onChangeSearchTerm,
        matches,
        currentMatch,
        currentMatchRef,
        nextMatch,
        prevMatch,
        matchIndex,
    } = props;

    return (
        <div className="h-full flex flex-col transcript bg-gray-50">
            <div>
                <Header
                    eventQuery={eventQuery}
                    onBack={onBack}
                    searchTerm={searchTerm}
                    onChangeSearchTerm={onChangeSearchTerm}
                />
                {searchTerm && (
                    <div className="flex items-center h-10 bg-gray-100 text-gray-500 text-sm p-3 shadow">
                        <div className="text-sm">
                            Showing {matches.length} result{matches.length === 1 ? '' : 's'} for &quot;
                            <span className="font-semibold">{searchTerm}</span>
                            &quot;
                        </div>
                        <div className="flex-1" />
                        <div className="w-2.5 mr-2 cursor-pointer hover:text-gray-600" onClick={nextMatch}>
                            <Chevron />
                        </div>
                        <div className="min-w-[35px] mr-2 text-center">
                            {matchIndex + 1} / {matches.length}
                        </div>
                        <div className="w-2.5 cursor-pointer rotate-180 hover:text-gray-600" onClick={prevMatch}>
                            <Chevron />
                        </div>
                    </div>
                )}
            </div>
            <div className="overflow-y-scroll flex-1 bg-gray-50" ref={scrollRef}>
                {match(eventQuery)
                    .with({ status: 'loading' }, () =>
                        new Array(5).fill(0).map((_, idx) => (
                            <div key={idx} className="animate-pulse p-2">
                                <div className="rounded-md bg-gray-300 h-3 m-1 w-10" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 ml-14" />
                                <div className="rounded-md bg-gray-300 h-3 m-1" />
                                <div className="rounded-md bg-gray-300 h-3 m-1" />
                                <div className="rounded-md bg-gray-300 h-3 m-1 mr-20" />
                            </div>
                        ))
                    )
                    .with({ status: 'empty' }, ({ data }) => {
                        // We'll always have one event here, but to satisify the strict array index check
                        // we need to make sure it's not undefined still
                        return data.events[0] && <EmptyMessage event={data.events[0]} />;
                    })
                    .with({ status: 'success' }, () => {
                        return speakerTurns.map(({ id, speaker, paragraphsWithMatches: paragraphs }) => {
                            return (
                                <div key={`speaker-turn-${id}`}>
                                    {showSpeakers && (
                                        <div className="p-3 pb-1 truncate text-sm -mb-3 sticky top-0 z-10 bg-gray-50">
                                            <span className="font-semibold">{speaker.name}</span>
                                            {speaker.title && <span className="text-gray-400">, {speaker.title}</span>}
                                        </div>
                                    )}
                                    {paragraphs.map(({ chunks, paragraph }) => {
                                        const { id, timestamp } = paragraph;
                                        return (
                                            <div
                                                key={id}
                                                id={`paragraph-${id}`}
                                                className="relative p-3 pb-4"
                                                onClick={() => onClickTranscript?.(paragraph)}
                                                ref={id === currentParagraph ? currentParagraphRef : undefined}
                                            >
                                                {timestamp && (
                                                    <div className="pb-2 font-semibold text-sm">
                                                        {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                                                    </div>
                                                )}
                                                <div className="text-sm">
                                                    {chunks.map(({ highlight, id, text }) =>
                                                        highlight ? (
                                                            <mark
                                                                ref={id === currentMatch ? currentMatchRef : undefined}
                                                                className={classNames({
                                                                    'bg-yellow-300': id === currentMatch,
                                                                })}
                                                                key={id}
                                                            >
                                                                {text}
                                                            </mark>
                                                        ) : (
                                                            <span key={id}>{text}</span>
                                                        )
                                                    )}
                                                </div>
                                                {id === currentParagraph && (
                                                    <div className="w-[3px] bg-blue-700 absolute top-0 bottom-0 left-0 rounded-r-sm" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        });
                    })
                    .otherwise(() => null)}
            </div>
            {match(eventQuery)
                .with({ status: 'success' }, ({ data: { events } }) => {
                    const event = events[0];
                    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
                    return (
                        (event?.audioRecordingUrl || event?.isLive) && (
                            <Playbar
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

function useEventUpdates(eventId: string) {
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
        requestPolicy: 'network-only',
        variables: {
            eventId,
        },
    });

    function isLiveOrBefore(event?: EventUpdatesQuery['events'][0], hoursAfterEvent = 0): boolean {
        if (!event) return false;
        if (event.isLive) return true;
        const eventDate = DateTime.fromISO(event.eventDate);
        return (eventDate.diffNow('hours').toObject().hours || 0) > 0 - hoursAfterEvent;
    }

    // From before the event to up to 1 hour after it starts, refresh the status/connection
    // details every 5 seconds
    useInterval(
        () => eventUpdateQuery.refetch(),
        isLiveOrBefore(eventUpdateQuery.state.data?.events[0], 1) ? 5000 : null
    );
    return eventUpdateQuery;
}

function useEventData(eventId: string, eventUpdateQuery: QueryResult<EventUpdatesQuery, EventUpdatesQueryVariables>) {
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
                                }
                                paragraphs {
                                    id
                                    timestamp
                                    syncMs
                                    sentences {
                                        id
                                        text
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
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
    eventId: string,
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

    // Request the latest paragraphs every 2 seconds
    useInterval(() => latestParagraphsQuery.refetch(), eventQuery.state.data?.events[0]?.isLive ? 2000 : null);

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

function useAudioSync(
    speakerTurns: SpeakerTurn[],
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>,
    audioPlayer: AudioPlayer
): [string | null, Dispatch<SetStateAction<string | null>>, RefCallback<HTMLDivElement>, RefCallback<HTMLDivElement>] {
    const [currentParagraph, setCurrentParagraph] = useState<string | null>(null);
    const [scrollRef, currentParagraphRef] = useAutoScroll<HTMLDivElement>();

    const paragraphs = useMemo(() => speakerTurns.flatMap((s) => s.paragraphs), [speakerTurns]);
    useEffect(() => {
        // Find the _last_ paragraph with a timetamp <= the current audio time, that's the
        // one the should be currently playing
        let paragraph = [...paragraphs]
            .reverse()
            .find((p) => p.syncMs && p.syncMs <= audioPlayer.rawCurrentTime * 1000);

        // If we couldn't find one:
        // - if the event is live default to the last paragraph
        // - other default to the first paragraph
        if (!paragraph) {
            paragraph = eventQuery.state.data?.events[0]?.isLive ? paragraphs.slice(-1)[0] : paragraphs[0];
        }

        // As long as we found one, set it so we can scroll to it and show
        // an indicator in the UI
        if (paragraph) {
            setCurrentParagraph(paragraph.id);
        }
    }, [paragraphs, Math.floor(audioPlayer.rawCurrentTime)]);

    return [currentParagraph, setCurrentParagraph, scrollRef, currentParagraphRef];
}

function useSearchState(speakerTurns: SpeakerTurn[]) {
    const { state, handlers } = useChangeHandlers({
        searchTerm: '',
    });

    // Track the current match id and use it to set the proper currentMatchRef for autoscrolling
    const [currentMatch, setCurrentMatch] = useState<string | null>(null);
    const [scrollRef, currentMatchRef] = useAutoScroll<HTMLDivElement>({
        pauseOnUserScroll: false,
        block: 'center',
        inline: 'center',
        behavior: 'auto',
    });

    // when paragraphs or search term are updated, loop over the paragraphs
    // adding the search highlights to each as a separate `chunks` field. Then
    // instead of using the paragraph directly, we can loop over the chunks
    // and render the highlight or not for each one.
    const speakerTurnsWithMatches: SpeakerTurnsWithMatches[] = useMemo(
        () =>
            speakerTurns.map((s) => ({
                ...s,
                paragraphsWithMatches: s.paragraphs.map((paragraph) => {
                    if (!state.searchTerm) {
                        return {
                            chunks: paragraph.sentences.map(({ text }, idx) => ({
                                highlight: false,
                                id: `${paragraph.id}-chunk-${idx}`,
                                text,
                            })),
                            paragraph,
                        };
                    }

                    const text = paragraph.sentences.map((s) => s.text).join(' ');

                    const chunks = findAll({
                        autoEscape: true,
                        caseSensitive: false,
                        searchWords: [state.searchTerm],
                        textToHighlight: text,
                    }).map(({ highlight, start, end }, idx) => ({
                        highlight,
                        id: `${paragraph.id}-chunk-${idx}`,
                        text: text.substr(start, end - start),
                    }));

                    return {
                        chunks,
                        paragraph,
                    };
                }),
            })),

        [speakerTurns, state.searchTerm]
    );

    // Get just the paragraphs with search matches
    const matches = useMemo(
        () =>
            speakerTurnsWithMatches
                .flatMap((s) => s.paragraphsWithMatches)
                .flatMap((p) => p.chunks.filter((h) => h.highlight)),
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
        scrollRef,
        currentMatch,
        currentMatchRef,
    };
}

/** @notExported */
export interface TranscriptProps {
    eventId: string;
    onBack?: MouseEventHandler;
}

/**
 * Renders Transcript
 */
export const Transcript = (props: TranscriptProps): ReactElement => {
    const { eventId, onBack } = props;
    const eventUpdateQuery = useEventUpdates(eventId);
    const eventQuery = useEventData(eventId, eventUpdateQuery);

    const audioPlayer = useAudioPlayer();

    const speakerTurns = useLatestTranscripts(eventId, eventQuery);
    const [currentParagraph, _setCurrentParagraph, autoScrollRef, currentParagraphRef] = useAudioSync(
        speakerTurns,
        eventQuery,
        audioPlayer
    );
    const searchState = useSearchState(speakerTurns);
    // We need to set two separate refs to the scroll container, so this just wraps those 2 into 1 to pass to the
    // scrollContiainer ref. May make this a helper hook at some point
    const scrollRef = useCallback(
        (ref) => {
            autoScrollRef(ref);
            searchState.scrollRef(ref);
        },
        [autoScrollRef, searchState.scrollRef]
    );
    const onClickTranscript = (paragraph: Paragraph) => {
        audioPlayer.rawSeek((paragraph.syncMs || 0) / 1000);
    };
    const onClickBack = useCallback(
        (event: MouseEvent) => {
            if (!audioPlayer.playing(null)) {
                audioPlayer.clear();
            }
            onBack?.(event);
        },
        [onBack]
    );

    useAutoTrack('View', 'Event', { eventId }, [eventId]);

    return (
        <TranscriptUI
            eventQuery={eventQuery}
            currentParagraph={currentParagraph}
            currentParagraphRef={currentParagraphRef}
            speakerTurns={searchState.speakerTurnsWithMatches}
            showSpeakers={!eventQuery.state.data?.events[0]?.isLive}
            onBack={onClickBack}
            onClickTranscript={onClickTranscript}
            scrollRef={scrollRef}
            searchTerm={searchState.searchTerm}
            onChangeSearchTerm={searchState.onChangeSearchTerm}
            matches={searchState.matches}
            matchIndex={searchState.matchIndex}
            nextMatch={searchState.nextMatch}
            prevMatch={searchState.prevMatch}
            currentMatch={searchState.currentMatch}
            currentMatchRef={searchState.currentMatchRef}
        />
    );
};
