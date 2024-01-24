import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { Logo } from '@aiera/client-sdk/components/Svg/Logo';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { TranscrippetQuery, TranscrippetQueryVariables } from '@aiera/client-sdk/types/generated';
import classNames from 'classnames';
import gql from 'graphql-tag';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import './styles.css';

interface TranscrippetSharedProps {}

/** @notExported */
interface TranscrippetUIProps extends TranscrippetSharedProps {
    transcrippetQuery: QueryResult<TranscrippetQuery, TranscrippetQueryVariables>;
}

export function TranscrippetUI(props: TranscrippetUIProps): ReactElement {
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlayback = useCallback(() => setIsPlaying((pv) => !pv), []);
    const { transcrippetQuery } = props;

    return match(transcrippetQuery)
        .with({ status: 'success' }, ({ data }) => {
            const transcrippet = data?.transcrippet;
            const { transcript, speakerName, speakerTitle, companyName, companyTicker, eventType } = transcrippet;
            return (
                <div id="aiera-transcrippet">
                    <div className="flex flex-col rounded-lg border border-slate-300/70 hover:border-slate-300 shadow-md shadow-slate-400/10 bg-white px-5 py-[18px] relative antialiased">
                        <div className="flex items-center">
                            <div className="flex flex-col justify-center flex-1">
                                <p className="text-base font-bold capitalize">
                                    {companyName} | {eventType}
                                </p>
                                <p className="text-sm text-slate-500 leading-3">7:30 PM, Jan 13, 2024</p>
                            </div>
                            <p className="text-xs tracking-wide text-orange-600 font-semibold mr-2 uppercase">
                                {companyTicker}
                            </p>
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
                        <div className="flex items-center relative z-10">
                            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                <p className="font-bold text-base">TS</p>
                            </div>
                            <div className="flex flex-col justify-center ml-2 flex-1">
                                <p className="text-base leading-[14px] font-bold">{speakerName}</p>
                                <p className="text-sm text-slate-500 leading-3 mt-1">{speakerTitle}</p>
                            </div>
                            <div
                                className={classNames(
                                    'group flex items-center justify-center w-9 h-9 rounded-full border cursor-pointer shadow-sm dark:border-blue-600',
                                    {
                                        'hover:border-blue-500 dark:hover:border-blue-500': !isPlaying,
                                        'active:border-blue-600 dark:hover:border-blue-700': !isPlaying,
                                        'border-blue-600': isPlaying,
                                        'text-blue-600 dark:text-white': !isPlaying,
                                        'text-white': isPlaying,
                                        'bg-blue-600': isPlaying,
                                        'bg-white dark:bg-blue-600': !isPlaying,
                                        'dark:hover:bg-blue-700': !isPlaying,
                                        'hover:bg-blue-700 dark:hover:bg-blue-700': isPlaying,
                                        'hover:border-blue-700': isPlaying,
                                        'active:bg-blue-800': isPlaying,
                                        'active:border-blue-800': isPlaying,
                                        'active:bg-blue-600': !isPlaying,
                                        'active:text-white': !isPlaying,
                                    },
                                    'button__play'
                                )}
                                onClick={togglePlayback}
                            >
                                {isPlaying ? (
                                    <Pause className="w-3" />
                                ) : (
                                    <Play className="ml-1 w-4 h-4 group-active:text-current" />
                                )}
                            </div>
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
    const config = useConfig();

    useEffect(() => {
        if (!transcrippetId && config?.options?.transcrippetGuid) {
            setTranscrippetId(config.options.transcrippetGuid);
        }
    }, [transcrippetId, config, config?.options]);

    const transcrippetQuery = useTranscrippetData(transcrippetId);

    return <TranscrippetUI transcrippetQuery={transcrippetQuery} />;
}
