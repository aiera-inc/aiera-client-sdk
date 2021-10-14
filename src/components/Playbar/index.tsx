import React, { useCallback, useEffect, useRef, MouseEvent, ReactElement, RefObject } from 'react';
import classNames from 'classnames';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { AudioPlayer, useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { OnDragStart, OnDragEnd, useDrag, useWindowSize } from '@aiera/client-sdk/lib/hooks';
import { Back15 } from '@aiera/client-sdk/components/Svg/Back15';
import { Calendar } from '@aiera/client-sdk/components/Svg/Calendar';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { Forward15 } from '@aiera/client-sdk/components/Svg/Forward15';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
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
    error: boolean;
    isPlaying: boolean;
    fastForward: () => void;
    fixed?: boolean;
    knobLeft?: number;
    knobRef: RefObject<HTMLDivElement>;
    onClickCalendar: (event: MouseEvent) => void;
    onClickTrack: (event: MouseEvent) => void;
    togglePlayback: () => void;
    rewind: () => void;
}

export function PlaybarUI(props: PlaybarUIProps): ReactElement {
    const {
        clear,
        currentTime,
        duration,
        error,
        fixed,
        isPlaying,
        fastForward,
        knobLeft = 0,
        knobRef,
        onClickCalendar,
        onClickTrack,
        togglePlayback,
        rewind,
    } = props;
    return (
        <div className="relative h-13 w-full flex items-center shadow p-3">
            <div
                className={classNames(
                    'flex items-center justify-center w-[34px] h-[34px] rounded-full border border-blue-700 cursor-pointer',
                    {
                        'text-blue-700': !isPlaying,
                        'text-white': isPlaying,
                        'bg-blue-700': isPlaying,
                    }
                )}
                onClick={togglePlayback}
            >
                <div>{isPlaying ? <Pause className="w-3" /> : <Play className="ml-1 w-4" />}</div>
            </div>
            <div className="ml-2 w-[18px] text-gray-800 cursor-pointer" onClick={rewind}>
                <Back15 />
            </div>
            <div className="ml-2 w-[18px] text-gray-800 cursor-pointer" onClick={fastForward}>
                <Forward15 />
            </div>
            <div className="ml-2 w-12 text-xs select-none">{toDurationString(currentTime)}</div>
            <div className="flex flex-1 relative items-center">
                <div className="flex-1 h-[6px] bg-gray-200 rounded-full" onClick={onClickTrack}>
                    <div className="h-[6px] bg-yellow-500 rounded-l-full" style={{ width: knobLeft }} />
                </div>
                <div
                    className="absolute rounded-md h-5 w-2 bg-white border border-gray-200"
                    style={{ left: knobLeft }}
                    ref={knobRef}
                />
            </div>
            <div className="ml-2 w-12 text-xs select-none">{toDurationString(duration)}</div>
            {!fixed && (
                <>
                    <div className="text-gray-800 bg-white cursor-pointer w-[18px] ml-1 mr-2" onClick={onClickCalendar}>
                        <Calendar />
                    </div>
                    <div className="text-gray-800 cursor-pointer w-4" onClick={clear}>
                        <Close />
                    </div>
                </>
            )}
            {error && (
                <div className="absolute w-full left-0 bottom-0">
                    <div className="flex-1 text-center text-red-700 text-xs mb-1">
                        There was an error playing audio.
                    </div>
                </div>
            )}
        </div>
    );
}

function usePlaybarDrag(audioPlayer: AudioPlayer): [RefObject<HTMLDivElement>, number, (event: MouseEvent) => void] {
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
    return [knobRef, knobLeft, onClickTrack];
}

function usePlayer(id?: string, url?: string, offset = 0) {
    const audioPlayer = useAudioPlayer();
    useEffect(() => {
        if (id) {
            audioPlayer.init({ id, url: url || '', offset });
        }
    }, [id, url, offset]);

    const isActive = audioPlayer.id;
    const isPlaying = audioPlayer.playing(null);
    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            void audioPlayer.play();
        }
    }, [isPlaying]);

    const fastForward = useCallback(() => audioPlayer.ff(15), []);
    const rewind = useCallback(() => audioPlayer.rewind(15), []);
    const clear = useCallback(() => audioPlayer.clear(), []);

    return {
        audioPlayer,
        isActive,
        isPlaying,
        togglePlayback,
        fastForward,
        rewind,
        clear,
    };
}

/** @notExported */
export interface PlaybarProps extends PlaybarSharedProps {
    id?: string;
    offset?: number;
    onClickCalendar?: ChangeHandler<string>;
    url?: string;
}

/**
 * Renders Playbar
 */
export function Playbar(props: PlaybarProps): ReactElement | null {
    const { id, url, offset = 0 } = props;

    const { audioPlayer, isActive, isPlaying, togglePlayback, fastForward, rewind, clear } = usePlayer(id, url, offset);
    const [knobRef, knobLeft, onClickTrack] = usePlaybarDrag(audioPlayer);

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
            error={audioPlayer.error}
            isPlaying={isPlaying}
            fastForward={fastForward}
            fixed={!!(id && url)}
            knobLeft={knobLeft}
            knobRef={knobRef}
            onClickTrack={onClickTrack}
            onClickCalendar={onClickCalendar}
            togglePlayback={togglePlayback}
            rewind={rewind}
        />
    );
}
