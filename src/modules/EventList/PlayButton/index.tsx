import React, { useCallback, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useAudioPlayer, EventMetaData } from '@aiera/client-sdk/lib/audio';
import { useTrack } from '@aiera/client-sdk/lib/data';
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
                'group flex items-center justify-center w-full h-full rounded-full border cursor-pointer shadow-sm',
                {
                    'hover:border-blue-500': !isPlaying,
                    'active:border-blue-600': !isPlaying,
                    'border-blue-600': isPlaying,
                    'text-blue-600': !isPlaying,
                    'text-white': isPlaying,
                    'bg-blue-600': isPlaying,
                    'bg-white': !isPlaying,
                    'hover:bg-blue-700': isPlaying,
                    'hover:border-blue-700': isPlaying,
                    'active:bg-blue-800': isPlaying,
                    'active:border-blue-800': isPlaying,
                    'active:bg-blue-600': !isPlaying,
                    'active:text-white': !isPlaying,
                }
            )}
            onClick={togglePlayback}
        >
            {isPlaying ? <Pause className="w-3" /> : <Play className="ml-1 w-4 h-4 group-active:text-current" />}
        </div>
    ) : (
        <div className="flex items-center justify-center w-full h-full text-blue-100 group-hover:text-blue-300">
            <Calendar className="w-4" />
        </div>
    );
}

/** @notExported */
export interface PlayButtonProps extends PlayButtonSharedProps {
    id: string;
    url?: string | null;
    offset?: number;
    metaData: EventMetaData;
}

/**
 * Renders PlayButton
 */
export function PlayButton(props: PlayButtonProps): ReactElement {
    const { id, url, offset = 0, metaData } = props;
    const audioPlayer = useAudioPlayer();
    const track = useTrack();
    const isPlaying = audioPlayer.playing(id);
    const togglePlayback = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (audioPlayer.playing(id)) {
                void track('Click', 'Audio Pause', { eventId: id, url });
                audioPlayer.pause();
            } else if (url) {
                void track('Click', 'Audio Play', { eventId: id, url });
                void audioPlayer.play({ id, url, offset, metaData });
            }
        },
        [isPlaying, id, url, offset]
    );
    return <PlayButtonUI hasAudio={!!url} isPlaying={audioPlayer.playing(id)} togglePlayback={togglePlayback} />;
}
