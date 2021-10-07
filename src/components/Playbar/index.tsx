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
    isPlaying: boolean;
    fastForward: () => void;
    fixed?: boolean;
    knobLeft?: number;
    knobRef: RefObject<HTMLDivElement>;
    onClickCalendar: (event: MouseEvent) => void;
    togglePlayback: () => void;
    rewind: () => void;
}

export function PlaybarUI(props: PlaybarUIProps): ReactElement {
    const {
        clear,
        currentTime,
        duration,
        fixed,
        isPlaying,
        fastForward,
        knobLeft = 0,
        knobRef,
        onClickCalendar,
        togglePlayback,
        rewind,
    } = props;
    return (
        <div className="h-13 w-full flex items-center shadow p-3">
            <div
                className={classNames(
                    'flex items-center justify-center w-9 h-9 rounded-full border border-blue-700 cursor-pointer',
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
            <div className="ml-2 w-5 text-gray-800 cursor-pointer" onClick={rewind}>
                <Back15 />
            </div>
            <div className="ml-2 w-5 text-gray-800 cursor-pointer" onClick={fastForward}>
                <Forward15 />
            </div>
            <div className="ml-2 mr-2 text-xs font-mono">{toDurationString(currentTime)}</div>
            <div className="flex flex-1 relative items-center">
                <div className="flex-1 h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-yellow-500 rounded-full" style={{ width: knobLeft }} />
                </div>
                <div
                    className="absolute rounded-md h-4 w-2 bg-white border border-gray-200"
                    style={{ left: knobLeft }}
                    ref={knobRef}
                />
            </div>
            <div className="ml-2 mr-2 text-xs font-mono">{toDurationString(duration)}</div>
            {!fixed && (
                <>
                    <div className="text-gray-800 bg-white cursor-pointer w-5 mr-2" onClick={onClickCalendar}>
                        <Calendar />
                    </div>
                    <div className="text-gray-800 cursor-pointer w-4" onClick={clear}>
                        <Close />
                    </div>
                </>
            )}
        </div>
    );
}

/** @notExported */
export interface PlaybarProps extends PlaybarSharedProps {
    id?: string;
    onClickCalendar?: ChangeHandler<string>;
    url?: string;
}

function usePlaybarDrag(audioPlayer: AudioPlayer): [RefObject<HTMLDivElement>, number] {
    const knobRef = useRef<HTMLDivElement>(null);
    // Rerender on resize to make sure the knob stays positioned correctly
    useWindowSize();
    const knobTrackWidth = knobRef.current?.parentElement?.getBoundingClientRect().width || 0;
    const [isDragging, dragXOffset] = useDrag({
        dragTarget: knobRef,
        onDragStart: useCallback<OnDragStart>(
            (_event, setPosition) => {
                setPosition({ x: knobRef.current?.offsetLeft || 0, y: 0 });
            },
            [knobRef.current]
        ),
        onDragEnd: useCallback<OnDragEnd>(() => {
            audioPlayer.seek(((knobRef.current?.offsetLeft || 0) / knobTrackWidth) * audioPlayer.audio.duration);
        }, [knobRef.current, knobTrackWidth]),
    });

    const audioOffset = (audioPlayer.audio.currentTime / audioPlayer.audio.duration) * knobTrackWidth || 0;
    const knobLeft = Math.min(knobTrackWidth, Math.max(0, isDragging ? dragXOffset : audioOffset));
    return [knobRef, knobLeft];
}

function usePlayer(id?: string, url?: string) {
    const audioPlayer = useAudioPlayer();
    useEffect(() => {
        if (id) {
            audioPlayer.init({ id, url: url || '' });
        }
    }, [id, url]);

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

/**
 * Renders Playbar
 */
export function Playbar(props: PlaybarProps): ReactElement | null {
    const { id, url } = props;

    const { audioPlayer, isActive, isPlaying, togglePlayback, fastForward, rewind, clear } = usePlayer(id, url);
    const [knobRef, knobLeft] = usePlaybarDrag(audioPlayer);

    const onClickCalendar = useCallback(
        (event: MouseEvent) => props.onClickCalendar?.(event, { value: audioPlayer.id }),
        [audioPlayer.id]
    );

    if (!isActive) return null;
    return (
        <PlaybarUI
            clear={clear}
            currentTime={audioPlayer.audio.currentTime}
            duration={audioPlayer.audio.duration}
            isPlaying={isPlaying}
            fastForward={fastForward}
            fixed={!!(id && url)}
            knobLeft={knobLeft}
            knobRef={knobRef}
            onClickCalendar={onClickCalendar}
            togglePlayback={togglePlayback}
            rewind={rewind}
        />
    );
}
