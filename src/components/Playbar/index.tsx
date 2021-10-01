import React, { useCallback, ReactElement } from 'react';
import classNames from 'classnames';
import { useAudioPlayer } from '@aiera/client-sdk/lib/audio';
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
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    fastForward: () => void;
    togglePlayback: () => void;
    rewind: () => void;
}

export function PlaybarUI(props: PlaybarUIProps): ReactElement {
    const { currentTime, duration, isPlaying, fastForward, togglePlayback, rewind } = props;
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
            <div className="flex-1 h-px bg-black"></div>
            <div className="ml-2 mr-2 text-xs font-mono">{toDurationString(duration)}</div>
            <Calendar className="text-gray-800 bg-white w-5 mr-2" />
            <Close className="text-gray-800 w-4" />
        </div>
    );
}

/** @notExported */
export interface PlaybarProps extends PlaybarSharedProps {}

/**
 * Renders Playbar
 */
export function Playbar(_props: PlaybarProps): ReactElement {
    const audioPlayer = useAudioPlayer();
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
    return (
        <PlaybarUI
            currentTime={audioPlayer.audio.currentTime}
            duration={audioPlayer.audio.duration}
            isPlaying={isPlaying}
            fastForward={fastForward}
            togglePlayback={togglePlayback}
            rewind={rewind}
        />
    );
}
