import React, { MouseEventHandler, ReactElement, Ref, useMemo, useEffect, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';
import classNames from 'classnames';

import {
    LatestParagraphsQuery,
    LatestParagraphsQueryVariables,
    TranscriptQuery,
    TranscriptQueryVariables,
} from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useAudioPlayer, AudioPlayer } from '@aiera/client-sdk/lib/audio';
import { getPrimaryQuote, useAutoTrack } from '@aiera/client-sdk/lib/data';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Button } from '@aiera/client-sdk/components/Button';
import { Input } from '@aiera/client-sdk/components/Input';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import { EmptyMessage } from './EmptyMessage';
import './styles.css';

type Paragraph = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0]['paragraphs'][0];
/** @notExported */
interface TranscriptUIProps {
    headerExpanded: boolean;
    toggleHeader: () => void;
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>;
    currentParagraph?: string | null;
    currentParagraphRef: Ref<HTMLDivElement>;
    paragraphs: Paragraph[];
    onBack?: MouseEventHandler;
    onClickTranscript?: (paragraph: Paragraph) => void;
    scrollRef: Ref<HTMLDivElement>;
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const {
        eventQuery,
        onBack,
        onClickTranscript,
        currentParagraph,
        currentParagraphRef,
        paragraphs,
        toggleHeader,
        headerExpanded,
        scrollRef,
    } = props;

    const renderExpandButton = () => (
        <button
            onClick={toggleHeader}
            className={classNames(
                'transition-all ml-2 mt-2 self-start flex-shrink-0 h-5 w-5 rounded-xl flex items-center justify-center',
                headerExpanded ? 'bg-blue-600' : 'bg-gray-100'
            )}
        >
            <Chevron
                className={
                    headerExpanded
                        ? 'transition-all mb-0.5 rotate-180 w-2 fill-current text-white'
                        : 'transition-all w-2 opacity-30'
                }
            />
        </button>
    );

    const renderHeader = () => (
        <div
            className={classNames(
                'relative p-3 shadow-3xl rounded-b-lg transition-all',
                headerExpanded ? 'max-h-80' : 'max-h-28',
                'transcript__header'
            )}
        >
            <div className="flex items-center">
                {onBack && (
                    <Button className="mr-2" onClick={onBack}>
                        <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                        Events
                    </Button>
                )}
                <Input name="search" className="mr-3" placeholder="Search Transcripts...">
                    <MagnifyingGlass />
                </Input>
                <div className="items-center flex">
                    <Gear className="w-5" />
                </div>
            </div>
            {match(eventQuery)
                .with({ status: 'loading' }, () => {
                    return (
                        <div className="flex flex-row mt-3 items-center">
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
                            {renderExpandButton()}
                        </div>
                    );
                })
                .with({ status: 'success' }, ({ data }) => {
                    const event = data.events[0];
                    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
                    const eventDate = data.events[0]?.eventDate && DateTime.fromISO(data.events[0].eventDate);
                    return (
                        <>
                            <div className="flex flex-row mt-3 items-center">
                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                    <div className="text-xs">
                                        {primaryQuote?.localTicker && (
                                            <span className="pr-1 font-semibold">{primaryQuote?.localTicker}</span>
                                        )}
                                        {primaryQuote?.exchange?.shortName && (
                                            <span className="text-gray-400">{primaryQuote?.exchange?.shortName}</span>
                                        )}
                                        {event?.eventType && (
                                            <span className="text-gray-300 capitalize"> • {event?.eventType}</span>
                                        )}
                                        {eventDate && (
                                            <span className="text-gray-300">
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
                                {renderExpandButton()}
                            </div>
                            {headerExpanded && 'Event Extras'}
                        </>
                    );
                })
                .otherwise(() => null)}
        </div>
    );

    return (
        <div className="h-full flex flex-col transcript">
            {renderHeader()}
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
                        return data.events.map((e) => <EmptyMessage key={e.id} event={e} />)[0];
                    })
                    .with({ status: 'success' }, () => {
                        return paragraphs.map((paragraph) => {
                            const { id, sentences, timestamp } = paragraph;
                            return (
                                <div
                                    key={id}
                                    className="relative p-3 pb-4"
                                    onClick={() => onClickTranscript?.(paragraph)}
                                    ref={id === currentParagraph ? currentParagraphRef : undefined}
                                >
                                    {timestamp && (
                                        <div className="pb-2 font-semibold text-sm">
                                            {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                                        </div>
                                    )}
                                    <div className="text-sm">{sentences.map(({ text }) => text).join(' ')}</div>
                                    {id === currentParagraph && (
                                        <div className="w-[3px] bg-blue-700 absolute top-0 bottom-0 left-0 rounded-r-sm" />
                                    )}
                                </div>
                            );
                        });
                    })
                    .otherwise(() => null)}
            </div>
            {match(eventQuery)
                .with({ status: 'success' }, ({ data: { events } }) => {
                    const event = events[0];
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
                            />
                        )
                    );
                })
                .otherwise(() => null)}
        </div>
    );
};

function useLatestTranscripts(
    eventId: string,
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>
): Paragraph[] {
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

    // Loop through the initial paragraph array and the new latest paragraphs to generate
    // the final paragraph array to render in the UI. memoize so we only recalc when things
    // actaully change.
    return useMemo<Paragraph[]>(() => {
        const originalParagraphs = new Map<string, Paragraph>(
            eventQuery.state.data?.events[0]?.transcripts[0]?.sections
                .flatMap((section) => section.speakerTurns)
                .flatMap((turn) => turn.paragraphs)
                .map((p) => [p.id, p])
        );
        const paragraphs = new Map([...originalParagraphs, ...latestParagraphs]);

        // If live, loop over the values in the map and sort by timestamp since the server
        // may update older paragraphs.
        //
        // For past events, just using the mapping as is, which will be the server-returned
        // order of paragraphs.
        return eventQuery.state.data?.events[0]?.isLive
            ? [...paragraphs.values()].sort((p1, p2) =>
                  p1.timestamp && p2.timestamp ? p1.timestamp.localeCompare(p2.timestamp) : p1.id.localeCompare(p2.id)
              )
            : [...paragraphs.values()];
    }, [eventQuery.state.data?.events[0]?.transcripts, latestParagraphs]);
}

function useAudioSync(
    paragraphs: Paragraph[],
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>,
    audioPlayer: AudioPlayer
): [string | null, Ref<HTMLDivElement>, Ref<HTMLDivElement>] {
    const [currentParagraph, setCurrentParagraph] = useState<string | null>(null);
    const [scrollRef, currentParagraphRef] = useAutoScroll<HTMLDivElement>();

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

    return [currentParagraph, scrollRef, currentParagraphRef];
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
    const [headerExpanded, setHeaderState] = useState(false);
    const toggleHeader = useCallback(() => setHeaderState(!headerExpanded), [headerExpanded]);
    const eventQuery = useQuery<TranscriptQuery, TranscriptQueryVariables>({
        isEmpty: ({ events }) => !events[0]?.transcripts[0]?.sections?.length,
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
                    expectPublishedTranscript
                    hasTranscript
                    hasPublishedTranscript
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

    const audioPlayer = useAudioPlayer();
    const onClickTranscript = (paragraph: Paragraph) => {
        audioPlayer.rawSeek((paragraph.syncMs || 0) / 1000);
    };

    const paragraphs = useLatestTranscripts(eventId, eventQuery);
    const [currentParagraph, scrollRef, currentParagraphRef] = useAudioSync(paragraphs, eventQuery, audioPlayer);

    useAutoTrack('View', 'Event', { eventId }, [eventId]);

    return (
        <TranscriptUI
            eventQuery={eventQuery}
            currentParagraph={currentParagraph}
            currentParagraphRef={currentParagraphRef}
            paragraphs={paragraphs}
            headerExpanded={headerExpanded}
            toggleHeader={toggleHeader}
            onBack={onBack}
            onClickTranscript={onClickTranscript}
            scrollRef={scrollRef}
        />
    );
};
