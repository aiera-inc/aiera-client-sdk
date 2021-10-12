import React, { MouseEventHandler, ReactElement, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { DateTime } from 'luxon';
import classNames from 'classnames';

import { TranscriptQuery, TranscriptQueryVariables } from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import './styles.css';

type Paragraph = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0]['paragraphs'][0];
/** @notExported */
interface TranscriptUIProps {
    headerExpanded: boolean;
    toggleHeader: () => void;
    eventQuery: QueryResult<TranscriptQuery, TranscriptQueryVariables>;
    onBack?: MouseEventHandler;
    onClickTranscript?: (paragraph: Paragraph) => void;
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const { eventQuery, onBack, onClickTranscript, toggleHeader, headerExpanded } = props;

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

    return (
        <div className="h-full flex flex-col transcript">
            <div
                className={classNames(
                    'relative p-3 shadow-header rounded-b-lg transition-all',
                    headerExpanded ? 'max-h-80' : 'max-h-28',
                    'transcript__header'
                )}
            >
                <div className="flex items-center">
                    {onBack && (
                        <button
                            className="group flex h-8 items-center px-3 mr-3 font-semibold bg-gray-200 rounded-lg leading-3 hover:bg-gray-300 active:bg-gray-400 active:text-white text-base"
                            onClick={onBack}
                        >
                            <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                            Events
                        </button>
                    )}
                    <div className="group h-8 items-center w-full relative mr-3 input__search">
                        <input
                            className="w-full inset-0 absolute pl-8 text-sm border border-gray-200 rounded-lg focus:shadow-input focus:border-1 focus:outline-none focus:border-blue-600"
                            placeholder="Search transcripts"
                        />
                        <div className="pointer-events-none h-8 w-8 justify-center items-center flex">
                            <MagnifyingGlass className="group-focus-within:stroke-current group-focus-within:text-blue-600 z-1 relative w-4" />
                        </div>
                    </div>
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
                        const primaryQuote = getPrimaryQuote(event.primaryCompany);
                        const eventDate = DateTime.fromISO(data.events[0].eventDate);
                        return (
                            <>
                                <div className="flex flex-row mt-3 items-center">
                                    <div className="flex flex-col justify-center flex-1 min-w-0">
                                        <div className="text-xs">
                                            {primaryQuote?.localTicker && (
                                                <span className="pr-1 font-semibold">{primaryQuote?.localTicker}</span>
                                            )}
                                            {primaryQuote?.exchange?.shortName && (
                                                <span className="text-gray-400">
                                                    {primaryQuote?.exchange?.shortName}
                                                </span>
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
            <div className="overflow-y-scroll flex-1 bg-gray-50">
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
                    .with({ status: 'success' }, ({ data: { events } }) =>
                        events[0]?.transcripts[0]?.sections
                            .flatMap((section) => section.speakerTurns)
                            .flatMap((turn) => turn.paragraphs)
                            .map((paragraph) => {
                                const { id, sentences, timestamp } = paragraph;
                                return (
                                    <div key={id} className="p-3 pb-4" onClick={() => onClickTranscript?.(paragraph)}>
                                        {timestamp && (
                                            <div className="pb-2 font-semibold text-sm">
                                                {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                                            </div>
                                        )}
                                        <div className="text-sm">{sentences.map(({ text }) => text).join(' ')}</div>
                                    </div>
                                );
                            })
                    )
                    .otherwise(() => null)}
            </div>
            {match(eventQuery)
                .with({ status: 'success' }, ({ data: { events } }) => {
                    const event = events[0];
                    return (
                        event?.audioRecordingUrl && (
                            <Playbar
                                id={event?.id}
                                url={event?.audioRecordingUrl || ''}
                                offset={(event?.audioRecordingOffsetMs || 0) / 1000}
                            />
                        )
                    );
                })
                .otherwise(() => null)}
        </div>
    );
};

/**
 * @notExported
 */
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
        query: gql`
            query Transcript($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
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
        variables: {
            eventId,
        },
    });

    const audioPlayer = useAudioPlayer(false);
    const onClickTranscript = (paragraph: Paragraph) => {
        audioPlayer.rawSeek((paragraph.syncMs || 0) / 1000);
    };

    return (
        <TranscriptUI
            eventQuery={eventQuery}
            headerExpanded={headerExpanded}
            toggleHeader={toggleHeader}
            onBack={onBack}
            onClickTranscript={onClickTranscript}
        />
    );
};
