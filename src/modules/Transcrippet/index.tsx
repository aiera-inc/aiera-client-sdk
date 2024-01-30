import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { PlayButton } from '@aiera/client-sdk/components/PlayButton';
import { useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { TranscrippetQuery, TranscrippetQueryVariables } from '@aiera/client-sdk/types/generated';
import gql from 'graphql-tag';
import React, { Fragment, ReactElement, Ref, useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import './styles.css';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';

const PUBLIC_TRANSCRIPPET_URL = 'https://public.aiera.com/shared/transcrippet.html?id=';

interface TranscrippetSharedProps {}

/** @notExported */
interface TranscrippetUIProps extends TranscrippetSharedProps {
    id?: string;
    transcrippetQuery: QueryResult<TranscrippetQuery, TranscrippetQueryVariables>;
    transcrippetRef: Ref<HTMLDivElement>;
}

function getSpeakerInitials(fullName?: string | null) {
    if (!fullName) return '??';
    const parts = fullName.split(' ');
    if (parts.length > 0) {
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        if (firstName?.charAt(0) && lastName?.charAt(0)) {
            return `${firstName?.charAt(0)}${lastName?.charAt(0)}`;
        }
    }

    return `${fullName.charAt(0)}`;
}

function sumUpToIndex(array: number[], index: number) {
    return array.reduce((accumulator, currentValue, currentIndex) => {
        if (currentIndex <= index) {
            return accumulator + currentValue;
        }
        return accumulator;
    }, 0);
}

async function downloadImage(id?: string) {
    const download = (blob: string) => {
        const fakeLink = window.document.createElement('a');
        fakeLink.classList.add('hidden');
        fakeLink.download = `aiera-transcrippet-${id || new Date().getTime()}`;
        fakeLink.href = blob;
        document.body.appendChild(fakeLink);
        fakeLink.click();
        document.body.removeChild(fakeLink);
        fakeLink.remove();
    };
    const element = document.getElementById('aiera-transcrippet');
    if (element) {
        const canvas = await html2canvas(element);
        const image = canvas.toDataURL('image/png', 1.0);
        download(image);
    }
}

export function TranscrippetUI(props: TranscrippetUIProps): ReactElement {
    const { transcrippetQuery, transcrippetRef, id } = props;
    const audioPlayer = useAudioPlayer();

    return match(transcrippetQuery)
        .with({ status: 'success' }, ({ data }) => {
            const transcrippet = data?.transcrippet;
            const {
                transcript,
                speakerName,
                speakerTitle,
                companyName,
                companyTicker,
                eventType,
                eventDate,
                eventId,
                audioUrl,
                startMs,
                wordDurationsMs,
            } = transcrippet;
            const startTime = startMs ? startMs / 1000 : 0;

            let content: string | string[] = transcript;
            let durations: number[] = [];

            if (wordDurationsMs && Array.isArray(wordDurationsMs) && wordDurationsMs.length > 0) {
                content = transcript.split(' ');
                durations = wordDurationsMs as number[];
            }

            const wordHighlightEnabled = Array.isArray(content) && startMs && durations.length > 0;

            return (
                <div ref={transcrippetRef} id="aiera-transcrippet">
                    <div className="flex flex-col rounded-lg border border-slate-300/70 hover:border-slate-300 shadow-md shadow-slate-400/10 bg-white px-5 py-[18px] relative antialiased">
                        <div className="flex items-center relative z-10">
                            {speakerName ? (
                                <Fragment>
                                    <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                        <p className="font-bold text-base">{getSpeakerInitials(speakerName)}</p>
                                    </div>
                                    <div className="flex flex-col justify-center ml-2 flex-1">
                                        {id ? (
                                            <a
                                                href={`${PUBLIC_TRANSCRIPPET_URL}${id}`}
                                                target="_blank"
                                                className="text-base font-bold leading-[14px] hover:text-indigo-700 hover:underline"
                                                title="Open Shareable Link"
                                                rel="noreferrer"
                                            >
                                                {speakerName || 'No Speaker Assigned'}
                                            </a>
                                        ) : (
                                            <p className="text-base leading-[14px] font-bold">
                                                {speakerName || 'No Speaker Assigned'}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-500 leading-3 mt-1">
                                            {companyTicker && (
                                                <span className="text-slate-600 mr-1 uppercase font-semibold">
                                                    {companyTicker}
                                                </span>
                                            )}
                                            {speakerTitle || 'Unidentified'}
                                        </p>
                                    </div>
                                </Fragment>
                            ) : (
                                <Fragment>
                                    {companyTicker && (
                                        <div className="h-9 mr-2 px-2 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                            <p className="font-bold text-xs">{companyTicker}</p>
                                        </div>
                                    )}
                                    <div className="flex flex-col justify-center flex-1">
                                        <p className="text-base leading-[14px] font-bold">Event Participant</p>
                                    </div>
                                </Fragment>
                            )}
                            <div data-html2canvas-ignore="true" className="h-8 w-8">
                                <PlayButton
                                    metaData={{
                                        localTicker: typeof companyTicker === 'string' ? companyTicker : undefined,
                                        eventDate: eventDate,
                                        eventType: eventType,
                                        externalAudioStreamUrl: audioUrl,
                                    }}
                                    origin="transcrippet"
                                    id={`${eventId}`}
                                    url={audioUrl}
                                    offset={startTime}
                                />
                            </div>
                        </div>
                        <div>
                            <p
                                data-html2canvas-ignore="true"
                                className="text-[200px] leading-[200px] font-serif absolute top-14 left-2 text-slate-100"
                            >
                                “
                            </p>
                            <p
                                data-html2canvas-ignore="true"
                                className="text-[200px] leading-[100px] font-serif absolute bottom-0 right-2 text-slate-100"
                            >
                                ”
                            </p>
                            <p
                                className={classNames('text-base py-10 px-6 relative z-10 transition-all', {
                                    'text-slate-400': wordHighlightEnabled && !!audioPlayer.playing(eventId),
                                })}
                            >
                                {Array.isArray(content) && startMs && durations.length > 0
                                    ? content.map((text, index) => (
                                          <Fragment key={`${text}-${index}`}>
                                              <span
                                                  className={classNames('transition-all', {
                                                      'text-slate-900':
                                                          audioPlayer.rawCurrentTime >=
                                                          (startMs + sumUpToIndex(durations, index)) / 1000,
                                                  })}
                                              >
                                                  {text}
                                              </span>{' '}
                                          </Fragment>
                                      ))
                                    : content}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex flex-col justify-center flex-1">
                                {id ? (
                                    <a
                                        href={`${PUBLIC_TRANSCRIPPET_URL}${id}`}
                                        target="_blank"
                                        className="text-base font-bold capitalize hover:text-indigo-700 hover:underline"
                                        title="Open Shareable Link"
                                        rel="noreferrer"
                                    >
                                        {companyName} | {eventType.replace(/_/g, ' ')}
                                    </a>
                                ) : (
                                    <p className="text-base font-bold capitalize">
                                        {companyName} | {eventType.replace(/_/g, ' ')}
                                    </p>
                                )}
                                {eventDate && (
                                    <p className="text-sm text-slate-500 leading-3">
                                        {new Date(eventDate).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true,
                                        })}
                                    </p>
                                )}
                            </div>
                            <p className="text-xs tracking-wide text-orange-600 font-semibold mr-2 uppercase">
                                {companyTicker}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })
        .otherwise(() => (
            <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[4rem]">
                <div className="flex">
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce animation" />
                    <div className="w-2 h-2 ml-1 bg-slate-400 rounded-full animate-bounce animation-delay-100" />
                    <div className="w-2 h-2 ml-1 bg-slate-200 rounded-full animate-bounce animation-delay-200" />
                </div>
            </div>
        ));
}

function useTranscrippetData(id = '') {
    return useQuery<TranscrippetQuery, TranscrippetQueryVariables>({
        query: gql`
            query Transcrippet($transcrippetGuid: String!) {
                transcrippet(transcrippetGuid: $transcrippetGuid) {
                    audioUrl
                    companyId
                    companyLogoUrl
                    companyName
                    companyTicker
                    endMs
                    eventDate
                    eventId
                    eventType
                    id
                    speakerId
                    speakerName
                    speakerTitle
                    startMs
                    status
                    transcript
                    transcriptionAudioOffsetSeconds
                    wordDurationsMs
                }
            }
        `,
        pause: !id,
        requestPolicy: 'cache-and-network',
        variables: {
            transcrippetGuid: id,
        },
    });
}

/** @notExported */
export interface TranscrippetProps extends TranscrippetSharedProps {
    transcrippetGuid?: string;
}

/**
 * Renders EventSnippet
 */
export function Transcrippet(props: TranscrippetProps): ReactElement {
    const { transcrippetGuid: transcrippetGuidProp = '' } = props;
    const [transcrippetId, setTranscrippetId] = useState(transcrippetGuidProp);
    const [eventId, setEventId] = useState<string | undefined>(undefined);
    const [endMs, setEndMs] = useState<number | null>(null);
    const [startMs, setStartMs] = useState<number>(0);
    const audioPlayer = useAudioPlayer();
    const config = useConfig();
    const transcrippetRef = useRef<HTMLDivElement>(null);

    // Listen for download-screenshot
    const bus = useMessageListener('download-screenshot', () => downloadImage(transcrippetId), 'in');

    // Send up height
    useEffect(() => {
        const container = document.getElementById('root');
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach(() => {
                const height = transcrippetRef.current?.offsetHeight;
                if (height) {
                    bus.emit('transcrippet-height', height, 'out');
                }
            });
        });
        if (container) {
            resizeObserver.observe(container);
        }
    }, []);

    useEffect(() => {
        if (!transcrippetId && config?.options?.transcrippetGuid) {
            setTranscrippetId(config.options.transcrippetGuid);
        }
    }, [transcrippetId, config, config?.options]);

    const transcrippetQuery = useTranscrippetData(transcrippetId);

    // Pause when reaching endMs or end of audio
    // Seek back to startMs
    useEffect(() => {
        if (
            (endMs && endMs !== startMs && audioPlayer.rawCurrentTime > endMs / 1000) ||
            audioPlayer.rawCurrentTime >= audioPlayer.rawDuration
        ) {
            audioPlayer.rawSeek(startMs / 1000);
            if (eventId && audioPlayer.playing(eventId)) {
                audioPlayer.pause();
            }
        }
    }, [audioPlayer.rawCurrentTime, eventId, endMs, startMs]);

    useEffect(() => {
        if (transcrippetQuery.status === 'success') {
            const transcrippetData = transcrippetQuery.state.data?.transcrippet;
            if (transcrippetData) {
                setEventId(transcrippetData.eventId);
                setStartMs(transcrippetData.startMs || 0);
                setEndMs(transcrippetData.endMs || null);
            }
        }
    }, [transcrippetQuery]);

    return (
        <TranscrippetUI id={transcrippetId} transcrippetRef={transcrippetRef} transcrippetQuery={transcrippetQuery} />
    );
}
