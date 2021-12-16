import React, { useCallback, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useAudioPlayer, EventMetaData } from '@aiera/client-sdk/lib/audio';
import { useTrack, useAlertList } from '@aiera/client-sdk/lib/data';
import { Bell } from '@aiera/client-sdk/components/Svg/Bell';
import { Calendar } from '@aiera/client-sdk/components/Svg/Calendar';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import './styles.css';

interface PlayButtonSharedProps {
    children?: ReactNode;
}

/** @notExported */
interface PlayButtonUIProps extends PlayButtonSharedProps {
    alertOnLive: boolean;
    eventStarted: boolean;
    hasAudio: boolean;
    isPlaying: boolean;
    toggleAlert: (event: MouseEvent) => void;
    togglePlayback: (event: MouseEvent) => void;
}

export function PlayButtonUI(props: PlayButtonUIProps): ReactElement {
    const { alertOnLive, eventStarted, hasAudio, isPlaying, toggleAlert, togglePlayback } = props;
    return hasAudio ? (
        <div
            className={classNames(
                'group flex items-center justify-center w-full h-full rounded-full border cursor-pointer shadow-sm dark:border-blue-600',
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
                }
            )}
            onClick={togglePlayback}
        >
            {isPlaying ? <Pause className="w-3" /> : <Play className="ml-1 w-4 h-4 group-active:text-current" />}
        </div>
    ) : eventStarted ? (
        <div className="flex items-center justify-center w-full h-full text-blue-100 dark:text-bluegray-6 group-hover:text-blue-300 dark:group-hover:text-bluegray-4">
            <Calendar className="w-4" />
        </div>
    ) : (
        <Tooltip
            content={
                <div className="bg-black bg-opacity-80 dark:bg-bluegray-4 px-1.5 py-0.5 rounded text-white dark:text-bluegray-7">
                    {alertOnLive
                        ? 'A chime will ring after the audio is connected'
                        : 'Play a chime when the event is about to begin'}
                </div>
            }
            grow="up-right"
            openOn="hover"
            position="bottom-right"
            yOffset={6}
            xOffset={4}
            hideOnDocumentScroll
            className={classNames('border flex items-center justify-center w-full h-full rounded-full', {
                'dark:bg-yellow-400 dark:text-yellow-800': alertOnLive,
                'dark:hover:bg-yellow-800 dark:hover:border-yellow-600 dark:hover:text-yellow-200 dark:hover:bg-opacity-20':
                    alertOnLive || !alertOnLive,
                'dark:active:bg-bluegray-5 dark:active:text-bluegray-4': alertOnLive,
                'bg-yellow-400 border-yellow-400 text-yellow-800': alertOnLive,
                'hover:bg-yellow-200 hover:border-yellow-400 hover:text-yellow-800': alertOnLive || !alertOnLive,
                'active:bg-yellow-50 active:border-yellow-400 active:text-yellow-600': alertOnLive,
                'bg-white border-gray-200 text-gray-400': !alertOnLive,
                'active:bg-yellow-400 active:border-yellow-400 active:text-yellow-800': !alertOnLive,
                'dark:bg-bluegray-7 dark:border-bluegray-6 dark:text-bluegray-4': !alertOnLive,
                'dark:active:bg-yellow-400 dark:active:border-yellow-400 dark:active:text-yellow-800': !alertOnLive,
            })}
        >
            <div onClick={toggleAlert} className="w-full h-full rounded-full flex items-center justify-center">
                <Bell className="w-3.5" />
            </div>
        </Tooltip>
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
    const { addAlert, removeAlert, alertList } = useAlertList();
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
    const eventDate = metaData.eventDate;
    const alertDateIds = eventDate ? alertList[eventDate] : null;
    const alertOnLive = alertDateIds ? alertDateIds.indexOf(id) >= 0 : false;
    const toggleAlert = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (metaData.eventDate && id) {
                if (!alertOnLive) {
                    addAlert(metaData.eventDate, id);
                } else {
                    removeAlert(metaData.eventDate, id);
                }
            }
        },
        [id, alertOnLive]
    );
    const eventStarted = metaData.eventDate ? new Date(metaData.eventDate).getTime() < new Date().getTime() : false;
    return (
        <PlayButtonUI
            alertOnLive={alertOnLive}
            eventStarted={eventStarted}
            hasAudio={!!url}
            isPlaying={audioPlayer.playing(id)}
            toggleAlert={toggleAlert}
            togglePlayback={togglePlayback}
        />
    );
}
