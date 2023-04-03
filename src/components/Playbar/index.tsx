import React, { useCallback, useEffect, useRef, MouseEvent, ReactElement, RefObject } from 'react';
import classNames from 'classnames';

import { Button } from '@aiera/client-sdk/components/Button';
import { Back15 } from '@aiera/client-sdk/components/Svg/Back15';
import { End } from '@aiera/client-sdk/components/Svg/End';
import { Forward15 } from '@aiera/client-sdk/components/Svg/Forward15';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { Speaker } from '@aiera/client-sdk/components/Svg/Speaker';
import { SpeakerLoud } from '@aiera/client-sdk/components/Svg/SpeakerLoud';
import { SpeakerMute } from '@aiera/client-sdk/components/Svg/SpeakerMute';
import { Swap } from '@aiera/client-sdk/components/Svg/Swap';
import { XMark } from '@aiera/client-sdk/components/Svg/XMark';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { AudioPlayer, EventMetaData, useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { useTrack } from '@aiera/client-sdk/lib/data';
import { OnDragStart, OnDragEnd, useDrag } from '@aiera/client-sdk/lib/hooks/useDrag';
import { useWindowSize } from '@aiera/client-sdk/lib/hooks/useWindowSize';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { ChangeHandler } from '@aiera/client-sdk/types';

import './styles.css';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';

function toDurationString(totalSeconds: number) {
    if (!totalSeconds || isNaN(totalSeconds) || Math.abs(totalSeconds) === Infinity) totalSeconds = 0;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

interface PlaybarSharedProps {
    hideEventDetails?: boolean;
    showFullDetails?: boolean;
}

/** @notExported */
interface PlaybarUIProps extends PlaybarSharedProps {
    clear: () => void;
    currentTime: number;
    duration: number;
    error: boolean;
    eventMetaData: EventMetaData;
    fastForward: () => void;
    fixed?: boolean;
    isPlaying: boolean;
    knobLeft?: number;
    knobRef: RefObject<HTMLDivElement>;
    onClickCalendar: (event: MouseEvent) => void;
    onClickTrack: (event: MouseEvent) => void;
    percentPlayed?: number;
    playbackRate: number;
    rewind: () => void;
    seekToEnd: () => void;
    seekToStart: () => void;
    setVolume: (vol: number) => void;
    showSwap: boolean;
    swap: () => void;
    togglePlayback: () => void;
    toggleRate: () => void;
    volume: number;
}

export function PlaybarUI(props: PlaybarUIProps): ReactElement {
    const {
        clear,
        currentTime,
        duration,
        error,
        eventMetaData,
        fastForward,
        fixed,
        isPlaying,
        hideEventDetails,
        knobLeft = 0,
        knobRef,
        onClickCalendar,
        onClickTrack,
        percentPlayed = 0,
        playbackRate,
        rewind,
        seekToEnd,
        seekToStart,
        setVolume,
        showFullDetails,
        showSwap,
        swap,
        togglePlayback,
        toggleRate,
        volume,
    } = props;
    const isCustom = eventMetaData?.eventType === 'custom';
    return (
        <div className="relative h-13 w-full flex flex-col justify-center mt-[-6px] z-20 playbar">
            <div className="bg-white absolute top-[9px] left-0 right-0 bottom-0 dark:bg-bluegray-7 dark:top-[6px]" />
            <div
                className="bg-yellow-50 absolute top-[9px] left-0 bottom-0 bg-opacity-80 dark:bg-opacity-50 dark:bg-bluegray-5"
                style={{ width: `${percentPlayed}%` }}
            />
            <div className="flex z-20 player_timeline">
                <div className="flex items-center justify-center px-2 text-xs select-none relative w-[65px]">
                    <div className="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] bg-opacity-60 rounded-r-md" />
                    <span className="z-10 relative font-mono text-yellow-800 opacity-60 dark:text-yellow-500">
                        {toDurationString(currentTime)}
                    </span>
                </div>
                <div className="flex flex-1 relative items-center" onClick={onClickTrack}>
                    <div className="flex-1 h-[3px] bg-gray-200 dark:bg-bluegray-5">
                        <div className="h-[3px] bg-yellow-400" style={{ width: knobLeft }} />
                    </div>
                    <div
                        className="absolute rounded-lg mb-[1px] h-[16px] w-[16px] bg-blue-600 border-[3px] border-white cursor-grab active:cursor-grabbing hover:bg-blue-400 active:bg-blue-800 player_timeline__timeline_knob"
                        style={{ left: knobLeft }}
                        ref={knobRef}
                    />
                </div>
                <div className="px-2 text-xs select-none relative flex items-center justify-center w-[65px]">
                    <div className="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] bg-opacity-60 rounded-l-md" />
                    <span className="z-10 relative font-mono text-gray-500 opacity-60 dark:text-bluegray-4">
                        {toDurationString(duration)}
                    </span>
                </div>
            </div>
            <div
                className={classNames('z-20 flex h-[44px] pb-[6px] items-center justify-center player_controls', {
                    'ml-2.5': !hideEventDetails,
                })}
            >
                {!fixed && (
                    <Button iconButton onClick={clear} className="flex-shrink-0 h-[30px] w-[30px] text-gray-500 mr-1">
                        <XMark className="w-2.5" />
                    </Button>
                )}
                {showSwap && (
                    <Button iconButton onClick={swap} className="flex-shrink-0 h-[30px] w-[30px] text-gray-500 mr-1">
                        <Swap className="w-3" />
                    </Button>
                )}
                {(!hideEventDetails || showSwap) && (
                    <div
                        className={classNames(
                            'flex flex-col h-[30px] justify-center flex-shrink-0 cursor-pointer ml-1 group relative',
                            {
                                'w-[72px]': !showFullDetails,
                                'flex-1': showFullDetails,
                            }
                        )}
                        onClick={onClickCalendar}
                    >
                        <div className="flex flex-col absolute inset-0">
                            {isCustom && eventMetaData?.title ? (
                                <Tooltip
                                    className="flex items-end h-[12px] mt-[1px]"
                                    content={
                                        <div className="bg-black bg-opacity-80 max-w-[300px] px-1.5 py-0.5 rounded text-sm text-white dark:bg-bluegray-4 dark:text-bluegray-7">
                                            {prettyLineBreak(eventMetaData.title)}
                                        </div>
                                    }
                                    grow="up-right"
                                    hideOnDocumentScroll
                                    openOn="hover"
                                    position="top-left"
                                    yOffset={30}
                                >
                                    <span className="font-bold leading-none overflow-hidden select-none text-blue-600 text-ellipsis text-sm whitespace-nowrap group-active:text-blue-900 group-hover:text-blue-800">
                                        {eventMetaData?.quote?.localTicker || eventMetaData.title}
                                    </span>
                                </Tooltip>
                            ) : (
                                <div className="flex items-end h-[12px] mt-[1px]">
                                    <span className="select-none leading-none text-sm text-blue-600 font-bold overflow-hidden text-ellipsis whitespace-nowrap uppercase group-hover:text-blue-800 group-active:text-blue-900">
                                        {eventMetaData?.quote?.localTicker || eventMetaData?.title || 'Instrument'}
                                    </span>
                                    <span className="select-none truncate leading-none ml-1 mb-[1px] text-xxs uppercase tracking-widest text-gray-400 group-hover:text-gray-600 group-active:text-gray-800">
                                        {eventMetaData?.quote?.exchange?.shortName || 'Exchange'}
                                    </span>
                                </div>
                            )}
                            <span className="select-none truncate capitalize text-xs text-gray-500 group-hover:text-gray-700 group-active:text-gray-900">
                                {(isCustom
                                    ? eventMetaData?.createdBy || eventMetaData?.eventType?.replace(/_/g, ' ')
                                    : eventMetaData?.eventType?.replace(/_/g, ' ')) || 'No Type Found'}
                                {showFullDetails && eventMetaData.title ? ` — ${eventMetaData.title}` : ''}
                            </span>
                        </div>
                    </div>
                )}
                <div
                    className={classNames('flex items-center flex-shrink-0 flex-1 justify-center', {
                        'pr-1.5': !hideEventDetails,
                    })}
                >
                    <button
                        id="playbar-toggleRate"
                        tabIndex={0}
                        onClick={toggleRate}
                        className="select-none text-sm font-bold font-mono text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2 dark:text-bluegray-4"
                    >
                        {`${playbackRate.toFixed(2)}x`}
                    </button>
                    <button
                        id="playbar-seekToStart"
                        tabIndex={0}
                        onClick={seekToStart}
                        className="rotate-180 text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2 dark:text-bluegray-4"
                    >
                        <End className="w-[12px]" />
                    </button>
                    <button
                        id="playbar-back15"
                        tabIndex={0}
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2 dark:text-bluegray-4"
                        onClick={rewind}
                    >
                        <Back15 className="w-[16px]" />
                    </button>
                    <Button
                        kind="primary"
                        className={classNames('flex items-center justify-center w-[30px] h-[30px] rounded-full mx-0.5')}
                        onClick={togglePlayback}
                    >
                        <div>{isPlaying ? <Pause className="w-2.5" /> : <Play className="ml-0.5 w-3" />}</div>
                    </Button>
                    <button
                        id="playbar-forward15"
                        tabIndex={0}
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2 dark:text-bluegray-4"
                        onClick={fastForward}
                    >
                        <Forward15 className="w-[16px]" />
                    </button>
                    <button
                        id="playbar-seekToEnd"
                        tabIndex={0}
                        onClick={seekToEnd}
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2 dark:text-bluegray-4"
                    >
                        <End className="w-[12px]" />
                    </button>
                    <Tooltip
                        yOffset={66}
                        xOffset={-53}
                        content={
                            <div className="flex items-center justify-center p-2 rounded-xl bg-white -rotate-90 player_timeline__volume_slider">
                                <input
                                    tabIndex={0}
                                    defaultValue={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    type="range"
                                    id="volume"
                                    name="volume"
                                    min="0"
                                    max="1"
                                    step={0.01}
                                />
                            </div>
                        }
                        grow="up-left"
                        openOn="click"
                        position="top-right"
                    >
                        <button className="text-yellow-500 px-2 hover:text-yellow-600 active:text-yellow-800 cursor-pointer">
                            {volume > 0.6 ? (
                                <SpeakerLoud className="w-[18px]" />
                            ) : volume === 0 ? (
                                <SpeakerMute className="w-[18px]" />
                            ) : (
                                <Speaker className="w-[14px] mr-[4px]" />
                            )}
                        </button>
                    </Tooltip>
                </div>
                {/* This is for center spacing the player controls when 
                we are showing the full details in the playbar */}
                {showFullDetails && <div className="flex-1" />}
                {error && !isPlaying && (
                    <div className="absolute py-2 px-2.5 backdrop-filter backdrop-blur-md rounded-lg bg-red-200 bg-opacity-30">
                        <div className="text-center text-red-700 text-xs">There was an error playing audio.</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function usePlaybarDrag(
    audioPlayer: AudioPlayer
): [RefObject<HTMLDivElement>, number, (event: MouseEvent) => void, number] {
    const knobRef = useRef<HTMLDivElement>(null);
    // Rerender on resize to make sure the knob stays positioned correctly
    useWindowSize();
    const knobTrackWidth = knobRef.current?.parentElement?.getBoundingClientRect().width || 0;
    const knobWidth = knobRef.current?.getBoundingClientRect().width || 0;
    const trackWidth = Math.max(0, knobTrackWidth - knobWidth);
    const [isDragging, dragXOffset] = useDrag({
        dragTarget: knobRef,
        onDragStart: useCallback<OnDragStart>(
            (_event, setPosition) => {
                setPosition({ x: knobRef.current?.offsetLeft || 0, y: 0 });
            },
            [knobRef.current]
        ),
        onDragEnd: useCallback<OnDragEnd>(() => {
            const leftOffset = Math.max(0, knobRef.current?.offsetLeft || 0);
            audioPlayer.displaySeek((leftOffset / trackWidth) * audioPlayer.displayDuration);
        }, [knobRef.current, trackWidth]),
    });

    const onClickTrack = useCallback(
        (event: MouseEvent) => {
            const trackElem = knobRef.current?.parentElement;
            const trackXOffset = trackElem?.getBoundingClientRect().left || 0;
            const leftOffset = Math.max(0, event.clientX - trackXOffset) - knobWidth / 2;
            audioPlayer.displaySeek((leftOffset / trackWidth) * audioPlayer.displayDuration);
        },
        [knobRef.current, trackWidth]
    );

    const audioOffset = (audioPlayer.displayCurrentTime / audioPlayer.displayDuration) * trackWidth || 0;
    const knobLeft = Math.min(trackWidth, Math.max(0, isDragging ? dragXOffset : audioOffset));
    const percentPlayed = (knobLeft * 100) / trackWidth;
    return [knobRef, knobLeft, onClickTrack, percentPlayed];
}

function usePlayer(id?: string, url?: string, offset = 0, metaData?: EventMetaData) {
    const audioPlayer = useAudioPlayer();
    const track = useTrack();
    useEffect(() => {
        if (id && !audioPlayer.playing(null)) {
            /* eslint-disable @typescript-eslint/no-floating-promises */
            (async (): Promise<void> => {
                await audioPlayer.init({ id, url: url || '', offset, metaData });
            })();
        }
    }, [id, url, offset, ...(Object.values(metaData || {}) as unknown[])]);

    const isActive = audioPlayer.id;
    const isPlaying = audioPlayer.playing(null);
    const isPlayingAnotherEvent = isPlaying && id && !audioPlayer.playing(id);
    const bus = useMessageBus();
    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            void track('Click', 'Audio Pause', { eventId: id, url });
            audioPlayer.pause();
            bus?.emit(
                'event-audio',
                {
                    action: 'pause',
                    origin: 'playBar',
                    event: {
                        eventDate: metaData?.eventDate,
                        ticker: metaData?.localTicker,
                        title: metaData?.title,
                        eventType: metaData?.eventType,
                    },
                },
                'out'
            );
        } else {
            void track('Click', 'Audio Play', { eventId: id, url });
            if (id) {
                void audioPlayer.play({ id, url: url || '', offset, metaData });
            } else {
                void audioPlayer.play();
            }

            bus?.emit(
                'event-audio',
                {
                    action: 'play',
                    origin: 'playBar',
                    event: {
                        eventDate: metaData?.eventDate,
                        ticker: metaData?.localTicker,
                        title: metaData?.title,
                        eventType: metaData?.eventType,
                    },
                },
                'out'
            );
        }
    }, [isPlaying]);
    const fastForward = useCallback(() => {
        void track('Click', 'Audio Fast Forward', { eventId: id, url });
        audioPlayer.ff(15);
    }, []);
    const rewind = useCallback(() => {
        void track('Click', 'Audio Rewind', { eventId: id, url });
        audioPlayer.rewind(15);
    }, []);
    const seekToStart = useCallback(() => {
        void track('Click', 'Audio Start', { eventId: id, url });
        audioPlayer.seekToStart();
    }, []);
    const seekToEnd = useCallback(() => {
        void track('Click', 'Audio Over', { eventId: id, url });
        audioPlayer.seekToEnd();
    }, []);
    const toggleRate = useCallback(() => {
        void track('Click', 'Audio Playback Rate', { eventId: id, url });
        audioPlayer.togglePlaybackRate();
    }, []);
    const clear = useCallback(() => {
        void track('Click', 'Audio Stop', { eventId: id, url });
        audioPlayer.clear();
    }, []);
    const swap = useCallback(() => {
        if (id) {
            audioPlayer.clear();
            void audioPlayer.play({ id, url: url || '', offset, metaData });
        }
    }, [id, url, offset, ...(Object.values(metaData || {}) as unknown[])]);

    return {
        audioPlayer,
        seekToEnd,
        isActive,
        isPlaying,
        isPlayingAnotherEvent,
        togglePlayback,
        fastForward,
        rewind,
        seekToStart,
        toggleRate,
        clear,
        swap,
    };
}

/** @notExported */
export interface PlaybarProps extends PlaybarSharedProps {
    hidePlayer?: boolean;
    id?: string;
    metaData?: EventMetaData;
    offset?: number;
    onClickCalendar?: ChangeHandler<string>;
    url?: string;
}

/**
 * Renders Playbar
 */
export function Playbar(props: PlaybarProps): ReactElement | null {
    const { hideEventDetails, hidePlayer, id, url, offset = 0, metaData, showFullDetails } = props;
    const {
        audioPlayer,
        isActive,
        isPlaying,
        isPlayingAnotherEvent,
        togglePlayback,
        fastForward,
        rewind,
        seekToStart,
        seekToEnd,
        clear,
        swap,
        toggleRate,
    } = usePlayer(id, url, offset, metaData);
    const [knobRef, knobLeft, onClickTrack, percentPlayed] = usePlaybarDrag(audioPlayer);

    const onClickCalendar = useCallback(
        (event: MouseEvent) => props.onClickCalendar?.(event, { value: audioPlayer.id }),
        [audioPlayer.id]
    );

    // We need control hiding the player in here
    // because we're still initiating it, which lets
    // the transcript receive audio seek events
    // to scroll the text
    if (!isActive || hidePlayer) return null;

    return (
        <PlaybarUI
            clear={clear}
            currentTime={audioPlayer.displayCurrentTime}
            duration={audioPlayer.displayDuration}
            error={audioPlayer.error}
            eventMetaData={audioPlayer.eventMetaData}
            fastForward={fastForward}
            fixed={!!(id && url)}
            hideEventDetails={hideEventDetails}
            isPlaying={isPlaying}
            knobLeft={knobLeft}
            knobRef={knobRef}
            onClickCalendar={onClickCalendar}
            onClickTrack={onClickTrack}
            percentPlayed={percentPlayed}
            playbackRate={audioPlayer.playbackRate}
            rewind={rewind}
            seekToEnd={seekToEnd}
            seekToStart={seekToStart}
            setVolume={audioPlayer.setVolume}
            showFullDetails={showFullDetails}
            showSwap={!!isPlayingAnotherEvent}
            swap={swap}
            togglePlayback={togglePlayback}
            toggleRate={toggleRate}
            volume={audioPlayer.volume}
        />
    );
}
