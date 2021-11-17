import React, { useCallback, useEffect, useRef, MouseEvent, ReactElement, RefObject } from 'react';
import classNames from 'classnames';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { AudioPlayer, EventMetaData, useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { OnDragStart, OnDragEnd, useDrag } from '@aiera/client-sdk/lib/hooks/useDrag';
import { useWindowSize } from '@aiera/client-sdk/lib/hooks/useWindowSize';
import { useTrack } from '@aiera/client-sdk/lib/data';
import { Back15 } from '@aiera/client-sdk/components/Svg/Back15';
import { Button } from '@aiera/client-sdk/components/Button';
import { Forward15 } from '@aiera/client-sdk/components/Svg/Forward15';
import { XMark } from '@aiera/client-sdk/components/Svg/XMark';
import { Swap } from '@aiera/client-sdk/components/Svg/Swap';
import { End } from '@aiera/client-sdk/components/Svg/End';
import { Speaker } from '@aiera/client-sdk/components/Svg/Speaker';
import { SpeakerLoud } from '@aiera/client-sdk/components/Svg/SpeakerLoud';
import { SpeakerMute } from '@aiera/client-sdk/components/Svg/SpeakerMute';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';

import './styles.css';

function toDurationString(totalSeconds: number) {
    if (!totalSeconds || isNaN(totalSeconds)) totalSeconds = 0;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

interface PlaybarSharedProps {}

/** @notExported */
interface PlaybarUIProps extends PlaybarSharedProps {
    clear: () => void;
    currentTime: number;
    duration: number;
    seekToEnd: () => void;
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
    setVolume: (vol: number) => void;
    seekToStart: () => void;
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
        seekToEnd,
        error,
        eventMetaData,
        fastForward,
        fixed,
        isPlaying,
        knobLeft = 0,
        knobRef,
        onClickCalendar,
        onClickTrack,
        percentPlayed = 0,
        playbackRate,
        rewind,
        setVolume,
        seekToStart,
        showSwap,
        swap,
        togglePlayback,
        toggleRate,
        volume,
    } = props;
    return (
        <div className="relative h-13 w-full flex flex-col justify-center mt-[-6px] z-20">
            <div className="bg-white absolute top-[9px] left-0 right-0 bottom-0" />
            <div
                className="bg-yellow-50 absolute top-[9px] left-0 bottom-0 bg-opacity-80"
                style={{ width: `${percentPlayed}%` }}
            />
            <div className="flex z-20 player_timeline">
                <div className="flex items-center justify-center px-2 text-xs select-none relative w-[65px]">
                    <div className="absolute left-0 right-0 top-0 bottom-0 bg-white backdrop-filter backdrop-blur-[2px] bg-opacity-60 rounded-r-md" />
                    <span className="z-10 relative font-mono text-yellow-800 opacity-60">
                        {toDurationString(currentTime)}
                    </span>
                </div>
                <div className="flex flex-1 relative items-center" onClick={onClickTrack}>
                    <div className="flex-1 h-[3px] bg-gray-200">
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
                    <span className="z-10 relative font-mono text-gray-500 opacity-60">
                        {toDurationString(duration)}
                    </span>
                </div>
            </div>
            <div className="z-20 flex h-[44px] pb-[6px] items-center justify-center ml-2.5">
                {!fixed && (
                    <Button onClick={clear} className="flex-shrink-0 h-[30px] w-[30px] text-gray-500 mr-1">
                        <XMark />
                    </Button>
                )}
                {showSwap && (
                    <Button onClick={swap} className="flex-shrink-0 h-[30px] w-[30px] text-gray-500 mr-1">
                        <Swap />
                    </Button>
                )}
                <div
                    className="flex flex-col h-[30px] justify-center flex-shrink-0 cursor-pointer w-[72px] ml-1 group"
                    onClick={onClickCalendar}
                >
                    <div className="flex items-end h-[12px] mt-[1px]">
                        <span className="select-none leading-none text-sm text-blue-600 font-bold uppercase group-hover:text-blue-800 group-active:text-blue-900">
                            {eventMetaData?.quote?.localTicker || 'Instrument'}
                        </span>
                        <span className="select-none truncate leading-none ml-1 mb-[1px] text-xxs uppercase tracking-widest text-gray-400 group-hover:text-gray-600 group-active:text-gray-800">
                            {eventMetaData?.quote?.exchange?.shortName || 'Exchange'}
                        </span>
                    </div>
                    <span className="select-none truncate capitalize text-xs text-gray-500 group-hover:text-gray-700 group-active:text-gray-900">
                        {eventMetaData?.eventType?.replace(/_/g, ' ') || 'No Type Found'}
                    </span>
                </div>
                <div className="flex items-center pr-1.5 flex-shrink-0 flex-1 justify-center">
                    <button
                        id="playbar-toggleRate"
                        tabIndex={0}
                        onClick={toggleRate}
                        className="select-none text-sm font-bold font-mono text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2"
                    >
                        {`${playbackRate.toFixed(2)}x`}
                    </button>
                    <button
                        id="playbar-seekToStart"
                        tabIndex={0}
                        onClick={seekToStart}
                        className="rotate-180 text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2"
                    >
                        <End className="w-[12px]" />
                    </button>
                    <button
                        id="playbar-back15"
                        tabIndex={0}
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2"
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
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2"
                        onClick={fastForward}
                    >
                        <Forward15 className="w-[16px]" />
                    </button>
                    <button
                        id="playbar-seekToEnd"
                        tabIndex={0}
                        onClick={seekToEnd}
                        className="text-bluegray-1 hover:text-blue-600 active:text-blue-700 cursor-pointer px-2"
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
            audioPlayer.init({ id, url: url || '', offset, metaData });
        }
    }, [id, url, offset, ...(Object.values(metaData || {}) as unknown[])]);

    const isActive = audioPlayer.id;
    const isPlaying = audioPlayer.playing(null);
    const isPlayingAnotherEvent = isPlaying && id && !audioPlayer.playing(id);
    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            void track('Click', 'Audio Pause', { eventId: id, url });
            audioPlayer.pause();
        } else {
            void track('Click', 'Audio Play', { eventId: id, url });
            void audioPlayer.play();
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
    id?: string;
    offset?: number;
    onClickCalendar?: ChangeHandler<string>;
    url?: string;
    metaData?: EventMetaData;
}

/**
 * Renders Playbar
 */
export function Playbar(props: PlaybarProps): ReactElement | null {
    const { id, url, offset = 0, metaData } = props;

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

    if (!isActive) return null;
    return (
        <PlaybarUI
            clear={clear}
            currentTime={audioPlayer.displayCurrentTime}
            duration={audioPlayer.displayDuration}
            seekToEnd={seekToEnd}
            error={audioPlayer.error}
            eventMetaData={audioPlayer.eventMetaData}
            fastForward={fastForward}
            fixed={!!(id && url)}
            isPlaying={isPlaying}
            knobLeft={knobLeft}
            knobRef={knobRef}
            onClickCalendar={onClickCalendar}
            onClickTrack={onClickTrack}
            percentPlayed={percentPlayed}
            playbackRate={audioPlayer.playbackRate}
            rewind={rewind}
            setVolume={audioPlayer.setVolume}
            seekToStart={seekToStart}
            showSwap={!!isPlayingAnotherEvent}
            swap={swap}
            togglePlayback={togglePlayback}
            toggleRate={toggleRate}
            volume={audioPlayer.volume}
        />
    );
}
