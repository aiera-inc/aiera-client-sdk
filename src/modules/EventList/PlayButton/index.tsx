import React, { useCallback, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useAudioPlayer } from '@aiera/client-sdk/lib/audio';
import { Calendar } from '@aiera/client-sdk/components/Svg/Calendar';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import './styles.css';

interface PlayButtonSharedProps {
    children?: ReactNode;
}

/** @notExported */
interface PlayButtonUIProps extends PlayButtonSharedProps {
    hasAudio: boolean;
    isPlaying: boolean;
    togglePlayback: (event: MouseEvent) => void;
}

export function PlayButtonUI(props: PlayButtonUIProps): ReactElement {
    const { hasAudio, isPlaying, togglePlayback } = props;
    return hasAudio ? (
        <div
            className={classNames(
                'flex items-center justify-center w-full h-full rounded-full border border-blue-700 cursor-pointer',
                {
                    'text-blue-700': !isPlaying,
                    'text-white': isPlaying,
                    'bg-blue-700': isPlaying,
                }
            )}
            onClick={togglePlayback}
        >
            {isPlaying ? <Pause className="w-3" /> : <Play className="ml-1 w-4" />}
        </div>
    ) : (
        <div className="flex items-center justify-center w-full h-full rounded-full border border-gray-300 text-gray-300">
            <Calendar className="w-4" />
        </div>
    );
}

/** @notExported */
export interface PlayButtonProps extends PlayButtonSharedProps {
    id: string;
    url?: string | null;
    offset?: number;
}

/**
 * Renders PlayButton
 */
export function PlayButton(props: PlayButtonProps): ReactElement {
    const { id, url, offset = 0 } = props;
    const audioPlayer = useAudioPlayer();
    const isPlaying = audioPlayer.playing(id);
    const togglePlayback = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (audioPlayer.playing(id)) {
                audioPlayer.pause();
            } else if (url) {
                void audioPlayer.play({ id, url, offset });
            }
        },
        [isPlaying, id, url, offset]
    );
    return <PlayButtonUI hasAudio={!!url} isPlaying={audioPlayer.playing(id)} togglePlayback={togglePlayback} />;
}
