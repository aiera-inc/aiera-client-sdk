import React, { MouseEventHandler, ReactElement, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { DateTime } from 'luxon';
import classNames from 'classnames';

import { TranscriptQuery, TranscriptQueryVariables } from '@aiera/client-sdk/types/generated';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Gear } from '@aiera/client-sdk/components/Svg/Gear';
import './styles.css';

/**
 * @notExported
 */
type Event = TranscriptQuery['events'][0];
type Paragraph = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0]['paragraphs'][0];
interface TranscriptUIProps {
    headerExpanded: boolean;
    toggleHeader: () => void;
    event?: Event;
    onBack?: MouseEventHandler;
    paragraphs: Paragraph[];
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const { event, onBack, paragraphs, toggleHeader, headerExpanded } = props;
    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
    const eventDate = DateTime.fromISO(event?.eventDate);
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
                                <span className="text-gray-300"> • {eventDate.toFormat('h:mma M/dd/yyyy')}</span>
                            )}
                        </div>
                        <div className={headerExpanded ? 'text-sm' : 'text-sm truncate whitespace-normal line-clamp-1'}>
                            {event?.title}
                        </div>
                    </div>
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
                </div>
                {headerExpanded && 'Event Extras'}
            </div>
            <div className="overflow-y-scroll bg-gray-50">
                {paragraphs.map(({ id, sentences, timestamp }) => (
                    <div key={id} className="p-3 pb-4">
                        {timestamp && (
                            <div className="pb-2 font-semibold text-sm">
                                {DateTime.fromISO(timestamp).toFormat('h:mm:ss a')}
                            </div>
                        )}
                        <div className="text-sm">{sentences.map(({ text }) => text).join(' ')}</div>
                    </div>
                ))}
            </div>
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
    const [result] = useQuery<TranscriptQuery, TranscriptQueryVariables>({
        query: gql`
            query Transcript($eventId: ID!) {
                events(filter: { eventIds: [$eventId] }) {
                    id
                    id
                    title
                    eventDate
                    eventType
                    isLive
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
    const event = result.data?.events[0];
    const paragraphs =
        event?.transcripts[0]?.sections.flatMap((section) => section.speakerTurns).flatMap((turn) => turn.paragraphs) ||
        [];
    return (
        <TranscriptUI
            event={event}
            headerExpanded={headerExpanded}
            toggleHeader={toggleHeader}
            onBack={onBack}
            paragraphs={paragraphs}
        />
    );
};
