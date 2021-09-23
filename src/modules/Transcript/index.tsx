import React, { MouseEventHandler, ReactElement } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { DateTime } from 'luxon';

import { TranscriptQuery, TranscriptQueryVariables } from '@aiera/client-sdk/types/generated';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import './styles.css';

/**
 * @notExported
 */
type Event = TranscriptQuery['events'][0];
type Paragraph = TranscriptQuery['events'][0]['transcripts'][0]['sections'][0]['speakerTurns'][0]['paragraphs'][0];
interface TranscriptUIProps {
    event?: Event;
    onBack?: MouseEventHandler;
    paragraphs: Paragraph[];
}

export const TranscriptUI = (props: TranscriptUIProps): ReactElement => {
    const { event, onBack, paragraphs } = props;
    const primaryQuote = getPrimaryQuote(event?.primaryCompany);
    const eventDate = DateTime.fromISO(event?.eventDate);
    return (
        <div className="h-full pb-16 transcript">
            <div className="relative p-3 shadow-header rounded-b-lg transcript__header">
                <div className="flex items-center">
                    {onBack && (
                        <button className="p-2 mr-2 font-semibold bg-gray-200 rounded-lg" onClick={onBack}>
                            <span className="text-xs">{'< '}</span> Events
                        </button>
                    )}
                    <input
                        className="w-3/4 p-2 text-sm border border-gray-200 rounded-lg"
                        placeholder="Search transcripts"
                    />
                </div>
                <div className="flex flex-row mt-3">
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
                        <div className="text-sm truncate whitespace-normal line-clamp-1">{event?.title}</div>
                    </div>
                </div>
            </div>

            <div className="h-full overflow-y-scroll bg-gray-50">
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
    return <TranscriptUI event={event} onBack={onBack} paragraphs={paragraphs} />;
};
