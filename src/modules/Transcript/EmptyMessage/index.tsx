import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';
import { TranscriptQuery } from '@aiera/client-sdk/types/generated';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { Check } from '@aiera/client-sdk/components/Svg/Check';
import './styles.css';

export type Event = TranscriptQuery['events'][0];
export type EventStatus =
    | 'connection_expected'
    | 'connection_not_expected'
    | 'waiting_to_connect'
    | 'connected'
    | 'transcribing'
    | 'transcribed'
    | 'missed';

interface EmptyMessageSharedProps {
    event: Event;
}

/** @notExported */
interface EmptyMessageUIProps extends EmptyMessageSharedProps {
    eventStatus: EventStatus;
}

export function EmptyMessageUI(props: EmptyMessageUIProps): ReactElement {
    const { event, eventStatus } = props;

    const { pillBgColor, pillTextColor, pillText, message } = match(eventStatus)
        .with('connection_not_expected', () => ({
            pillBgColor: 'bg-gray-200',
            pillTextColor: 'text-gray-700',
            pillText: 'no connection details',
            message: (
                <div className="text-base text-gray-500">
                    This event will be transcribed if we receive
                    <br />
                    connection details before the event start time.
                </div>
            ),
        }))
        .with('connection_expected', () => ({
            pillBgColor: 'bg-green-300',
            pillTextColor: 'text-green-700',
            pillText: 'connection expected',
            message: (
                <div className="text-base text-gray-500">
                    The transcript will appear here
                    <br />
                    after the event begins.
                </div>
            ),
        }))
        .with('waiting_to_connect', () => ({
            pillBgColor: 'bg-yellow-200',
            pillTextColor: 'text-yellow-700',
            pillText: 'waiting for connection',
            message: (
                <div className="text-base text-gray-500">
                    We are attempting to connect, <br />
                    this may take up to 3 minutes,
                    <br /> please wait.
                </div>
            ),
        }))
        .with('connected', () => ({
            pillBgColor: 'bg-yellow-300',
            pillTextColor: 'text-yellow-900',
            pillText: 'connected',
            message: (
                <div className="text-base text-gray-500">
                    Transcription will start automatically
                    <br />
                    when the conference speaker begins.
                </div>
            ),
        }))
        .with('missed', () => ({
            pillBgColor: 'bg-gray-200',
            pillTextColor: 'text-gray-700',
            pillText: 'missed',
            message: (
                <div className="text-base text-gray-500">
                    {event?.hasConnectionDetails
                        ? prettyLineBreak('Sorry, we were unable to connect to the live audio for this event.')
                        : 'Apologies, no connection details were found for this event'}
                </div>
            ),
        }))
        .with('transcribing', () => ({
            pillBgColor: 'bg-green-300',
            pillTextColor: 'text-green-700',
            pillText: 'Transcribing event',
            message: <div className="text-base text-gray-500">This message should not appear</div>,
        }))
        .with('transcribed', () => ({
            pillBgColor: 'bg-green-300',
            pillTextColor: 'text-green-700',
            pillText: 'Event Transcribed',
            message: <div className="text-base text-gray-500">This message should not appear</div>,
        }))
        .exhaustive();

    return (
        <div className="w-full px-6 h-full flex flex-col text-center items-center justify-center">
            <span className="text-xl font-semibold text-gray-600 line-clamp-2">{prettyLineBreak(event?.title)}</span>
            <div
                className={`overflow-hidden relative text-xxs ${pillTextColor} uppercase tracking-widest px-1.5 py-0.5 rounded-xl mt-2 mb-8`}
            >
                <span className="z-10 relative">{pillText}</span>
                <span className={`animate-pulse ${pillBgColor} absolute top-0 bottom-0 left-0 right-0`}></span>
            </div>
            {message}
            {event?.publishedTranscriptExpected && (
                <div className="flex mt-4 items-center justify-start text-left bg-green-50 rounded-2xl py-1.5 pr-2 pl-3 border-[1px] border-green-100">
                    <div className="text-sm leading-tight text-green-600">
                        We expect to receive a<br />
                        published transcript for this event.
                    </div>
                    <div className="text-white bg-green-400 h-6 w-6 rounded-2xl flex items-center justify-center ml-4">
                        <Check className="w-2.5" />
                    </div>
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface EmptyMessageProps extends EmptyMessageSharedProps {}

/**
 * Renders EmptyMessage
 */
export function EmptyMessage(props: EmptyMessageProps): ReactElement {
    const { event } = props;
    //TODO REMOVE MOCKS
    const eventDate = DateTime.fromISO(event?.eventDate);
    const diffSeconds = eventDate?.diffNow('seconds').seconds;
    const missed = false;
    const pastEventTime = diffSeconds < 0;
    const hasNoTranscript = !event?.hasTranscript && !event?.hasPublishedTranscript;

    // Cases
    const waitingForTranscription = event?.isLive && !missed && hasNoTranscript;
    const waitingForConnection =
        pastEventTime &&
        diffSeconds > -300 &&
        !missed &&
        !event?.isLive &&
        event?.hasConnectionDetails &&
        hasNoTranscript;
    const missedConnection = pastEventTime && missed && hasNoTranscript;
    const connectionExpected = event?.hasConnectionDetails && !event?.isLive && !pastEventTime && hasNoTranscript;
    const connectionNotExpected = !pastEventTime && !event?.hasConnectionDetails && hasNoTranscript && !event?.isLive;
    const eventInProgress = event?.isLive && (event.hasTranscript || event.hasPublishedTranscript);
    const eventFinished = !event?.isLive && (event?.hasTranscript || event?.hasPublishedTranscript);

    let eventStatus = 'connection_not_expected';

    if (connectionNotExpected) {
        eventStatus = 'connection_not_expected';
    } else if (connectionExpected) {
        eventStatus = 'connection_expected';
    } else if (waitingForConnection) {
        eventStatus = 'waiting_to_connect';
    } else if (waitingForTranscription) {
        eventStatus = 'connected';
    } else if (missedConnection) {
        eventStatus = 'missed';
    } else if (eventInProgress) {
        eventStatus = 'transcribing';
    } else if (eventFinished) {
        eventStatus = 'transcribed';
    }

    return <EmptyMessageUI event={event} eventStatus={eventStatus as EventStatus} />;
}
