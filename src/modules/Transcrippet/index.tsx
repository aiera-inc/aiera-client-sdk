import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { PlayButton } from '@aiera/client-sdk/components/PlayButton';
import { Logo } from '@aiera/client-sdk/components/Svg/Logo';
import { useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { TranscrippetQuery, TranscrippetQueryVariables } from '@aiera/client-sdk/types/generated';
import gql from 'graphql-tag';
import React, { ReactElement, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import './styles.css';

interface TranscrippetSharedProps {}

/** @notExported */
interface TranscrippetUIProps extends TranscrippetSharedProps {
    transcrippetQuery: QueryResult<TranscrippetQuery, TranscrippetQueryVariables>;
}

function getSpeakerInitials(fullName?: string | null) {
    if (!fullName) return 'N/A';
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

export function TranscrippetUI(props: TranscrippetUIProps): ReactElement {
    const { transcrippetQuery } = props;

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
            } = transcrippet;
            const startTime = startMs ? startMs / 1000 : 0;
            return (
                <div id="aiera-transcrippet">
                    <div className="flex flex-col rounded-lg border border-slate-300/70 hover:border-slate-300 shadow-md shadow-slate-400/10 bg-white px-5 py-[18px] relative antialiased">
                        <div className="flex items-center relative z-10">
                            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                <p className="font-bold text-base">{getSpeakerInitials(speakerName)}</p>
                            </div>
                            <div className="flex flex-col justify-center ml-2 flex-1">
                                <p className="text-base leading-[14px] font-bold">{speakerName}</p>
                                <p className="text-sm text-slate-500 leading-3 mt-1">
                                    {companyTicker && (
                                        <span className="text-slate-600 mr-1 uppercase font-semibold">
                                            {companyTicker}
                                        </span>
                                    )}
                                    {speakerTitle}
                                </p>
                            </div>
                            <div className="h-8 w-8">
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
                            <p className="text-[200px] leading-[200px] font-serif absolute top-14 left-2 text-slate-100">
                                “
                            </p>
                            <p className="text-[200px] leading-[100px] font-serif absolute bottom-0 right-2 text-slate-100">
                                ”
                            </p>
                            <p className="text-base py-10 px-6 relative z-10">{transcript}</p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex flex-col justify-center flex-1">
                                <p className="text-base font-bold capitalize">
                                    {companyName} | {eventType}
                                </p>
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
            <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[5rem]">
                <div className="w-24 mt-6">
                    <Logo />
                </div>
                <div className="flex mt-6">
                    <div className="w-2 h-2 bg-[#FE590C] rounded-full animate-bounce animation" />
                    <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-100" />
                    <div className="w-2 h-2 ml-1 bg-[#FE590C] rounded-full animate-bounce animation-delay-200" />
                </div>
            </div>
        ));
}

function useTranscrippetData(id = '') {
    const transcrippetQuery = useQuery<TranscrippetQuery, TranscrippetQueryVariables>({
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

    return transcrippetQuery;
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
    const [endMs, setEndMs] = useState<number | null>(null);
    const [startMs, setStartMs] = useState<number>(0);
    const audioPlayer = useAudioPlayer();
    const config = useConfig();

    useEffect(() => {
        if (!transcrippetId && config?.options?.transcrippetGuid) {
            setTranscrippetId(config.options.transcrippetGuid);
        }
    }, [transcrippetId, config, config?.options]);

    // Pause when reaching endMs or end of audio
    // Seek back to startMs
    useEffect(() => {
        if (
            (endMs && endMs !== startMs && audioPlayer.rawCurrentTime > endMs / 1000) ||
            audioPlayer.rawCurrentTime >= audioPlayer.rawDuration
        ) {
            audioPlayer.rawSeek(startMs / 1000);
            audioPlayer.pause();
        }
    }, [audioPlayer.rawCurrentTime, endMs, startMs]);

    const transcrippetQuery = useTranscrippetData(transcrippetId);

    useEffect(() => {
        if (transcrippetQuery.status === 'success') {
            const transcrippetData = transcrippetQuery.data.transcrippet;
            setStartMs(transcrippetData.startMs || 0);
            setEndMs(transcrippetData.endMs || null);
        }
    }, [transcrippetQuery]);

    return <TranscrippetUI transcrippetQuery={transcrippetQuery} />;
}
