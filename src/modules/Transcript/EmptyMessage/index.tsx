import React, { ReactElement } from 'react';
import { match } from 'ts-pattern';
import { TranscriptQuery, EventConnectionStatus } from '@aiera/client-sdk/types/generated';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { Check } from '@aiera/client-sdk/components/Svg/Check';
import './styles.css';

export type Event = TranscriptQuery['events'][0];

interface EmptyMessageSharedProps {
    event: Event;
}

/** @notExported */
interface EmptyMessageUIProps extends EmptyMessageSharedProps {}

export function EmptyMessageUI(props: EmptyMessageUIProps): ReactElement {
    const { event } = props;

    const { pillBgColor, pillTextColor, pillText, message } = match(event.connectionStatus)
        .with(EventConnectionStatus.ConnectionNotExpected, () => ({
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
        .with(EventConnectionStatus.ConnectionExpected, () => ({
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
        .with(EventConnectionStatus.WaitingToConnect, () => ({
            pillBgColor: 'bg-yellow-200',
            pillTextColor: 'text-yellow-700',
            pillText: 'waiting for connection',
            message: (
                <div className="text-base text-gray-500">
                    We are attempting to connect,
                    <br /> please wait.
                </div>
            ),
        }))
        .with(EventConnectionStatus.Connected, () => ({
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
        .with(EventConnectionStatus.Missed, () => ({
            pillBgColor: 'bg-gray-200',
            pillTextColor: 'text-gray-700',
            pillText: 'missed',
            message: (
                <div className="text-base text-gray-500">
                    {event?.hasConnectionDetails
                        ? prettyLineBreak('Sorry, we were unable to connect to the live audio for this event.')
                        : prettyLineBreak('Apologies, no connection details were found for this event')}
                </div>
            ),
        }))
        .with(EventConnectionStatus.Transcribing, () => ({
            pillBgColor: 'bg-green-300',
            pillTextColor: 'text-green-700',
            pillText: 'Transcribing event',
            message: <div className="text-base text-gray-500">This message should not appear</div>,
        }))
        .with(EventConnectionStatus.Transcribed, () => ({
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

    return <EmptyMessageUI event={event} />;
}
