import React, { createContext, useContext, useEffect, useState, ReactElement, ReactNode } from 'react';
import { MediaPlayer, MediaPlayerClass } from 'dashjs';
import { EventType, Quote } from '@aiera/client-sdk/types/generated';
import { DeepPartial, Maybe } from '@aiera/client-sdk/types';

export interface EventMetaData {
    quote?: Maybe<DeepPartial<Quote>>;
    eventType?: EventType;
    eventDate?: string;
}

export class AudioPlayer {
    id?: string;
    url?: string;
    errorInfo: {
        timeout?: number;
        lastPosition?: number;
        error: boolean;
    };
    metaData?: EventMetaData;
    offset = 0;
    audio: HTMLAudioElement;
    dash: MediaPlayerClass;
    usingDash = false;
    liveCatchupThreshold = 30;

    constructor() {
        this.errorInfo = {
            lastPosition: 0,
            error: false,
        };
        this.audio = new Audio();
        this.dash = MediaPlayer().create();
        this.dash.updateSettings({
            streaming: {
                lowLatencyEnabled: true,
                delay: {
                    liveDelay: 1.5,
                },
                liveCatchup: {
                    enabled: true,
                    playbackBufferMin: 0.5,
                    mode: 'liveCatchupModeLoLP',
                    minDrift: 0.05,
                    playbackRate: 0.2,
                    latencyThreshold: this.liveCatchupThreshold,
                },
            },
        });
        this.dash.on(MediaPlayer.events.FRAGMENT_LOADING_PROGRESS, this.triggerUpdate);
        this.dash.on(window.dashjs.MediaPlayer.events.BUFFER_EMPTY, this.updateTargetLatency);
        this.dash.on(window.dashjs.MediaPlayer.events.PLAYBACK_WAITING, this.updateTargetLatency);
        this.audio.addEventListener('timeupdate', this.adjustPlayback);
    }

    // The dash player automatically overwrits the playback rate on each tick
    // when liveCatchup is on so we need toi adjust those settings as the current time
    // changes.
    //
    // If we are > threshold seconds back from the live edge, turn catchup mode
    // off so we can set a cusotm playback rate.
    // If we are within threshold seconds of the live edge, turn liveCatchup back on
    // and let dashjs control the playback speed.
    adjustPlayback = (): void => {
        if (this.usingDash) {
            const settings = this.dash.getSettings();
            const lowLatencyEnabled = settings.streaming?.lowLatencyEnabled;
            const playbackRate = settings.streaming?.liveCatchup?.playbackRate || 0;
            const fromLiveEdge = this.dash.duration() - this.dash.time();
            if (fromLiveEdge + 1 < this.liveCatchupThreshold) {
                if (!lowLatencyEnabled) {
                    this.dash.updateSettings({
                        streaming: { lowLatencyEnabled: true, liveCatchup: { enabled: true } },
                    });
                }
                if (fromLiveEdge < 6 && playbackRate > 0.2) {
                    this.dash.updateSettings({ streaming: { liveCatchup: { playbackRate: 0.2 } } });
                }
            } else if (lowLatencyEnabled) {
                this.dash.updateSettings({ streaming: { lowLatencyEnabled: false, liveCatchup: { enabled: false } } });
            }
        }
    };

    updateTargetLatency = (): void => {
        const settings = this.dash.getSettings();
        const currentDelay = settings.streaming?.delay?.liveDelay || 1.5;
        if (this.playing(null)) {
            // Aggressively back off the target latency for now, but max out at 6 seconds
            // behind.
            const newTarget = Math.min(currentDelay * 1.5, 6);
            this.dash.updateSettings({
                streaming: {
                    delay: { liveDelay: newTarget },
                },
            });
        }
    };

    init(opts?: { id: string; url: string; offset: number; metaData?: EventMetaData }): void {
        if (opts && (this.id !== opts.id || this.audio.src !== opts.url)) {
            const { id, url } = opts;
            this.id = id;
            if (url !== this.url) {
                if (this.usingDash) {
                    this.dash.reset();
                    this.usingDash = false;
                }
                this.url = url;
                this.audio.src = url;
            }
            this.offset = opts.offset;
            this.triggerUpdate();
        }

        // TODO Make sure these trigger an update when they change
        if (opts && opts.offset !== this.offset) {
            this.offset = opts.offset;
        }

        // TODO Make sure these trigger an update when they change
        if (opts?.metaData) this.metaData = opts?.metaData;
    }

    clear(): void {
        delete this.id;
        delete this.url;
        window.clearTimeout(this.errorInfo.timeout);
        delete this.errorInfo.timeout;
        this.metaData = {};
        this.errorInfo.error = false;
        this.errorInfo.lastPosition = 0;
        if (this.usingDash) {
            this.dash.reset();
            this.usingDash = false;
        }
        this.audio.src = '';
        this.triggerUpdate();
    }

    triggerUpdate = (): void => {
        this.audio.dispatchEvent(new Event('update'));
    };

    async play(opts?: { id: string; url: string; offset: number; metaData?: EventMetaData }): Promise<void> {
        this.init(opts);
        if (this.rawCurrentTime === 0) this.rawSeek(this.offset);

        // If after 2 seconds we still haven't started actually playing, set an error state.
        // Using this instead of audio.on('error') because errors do happen that don't affect
        // playback, so instead we just check if playback is actually happening;
        this.errorInfo.error = false;
        this.errorInfo.lastPosition = this.rawCurrentTime;
        this.errorInfo.timeout = window.setTimeout(() => {
            if (this.rawCurrentTime === this.errorInfo.lastPosition) {
                this.errorInfo.error = true;
                this.triggerUpdate();
            }
        }, 2000);

        try {
            return await this.audio.play();
        } catch {
            this.dash.initialize(this.audio, this.url);
            this.dash.updateSettings({
                streaming: {
                    delay: { liveDelay: 1.5 },
                },
            });
            this.usingDash = true;
            this.dash.play();
        }
    }

    pause(): void {
        window.clearTimeout(this.errorInfo.timeout);
        this.audio.pause();
    }

    displaySeek(position: number): void {
        this.audio.currentTime = position + this.offset;
    }

    seekToEnd(): void {
        this.audio.currentTime = this.rawDuration;
    }

    seekToStart(): void {
        this.audio.currentTime = this.offset;
    }

    rawSeek(position: number): void {
        this.audio.currentTime = position;
    }

    ff(distance: number): void {
        this.rawSeek(Math.min(this.rawCurrentTime + distance, this.rawDuration));
    }

    rewind(distance: number): void {
        this.rawSeek(Math.max(this.rawCurrentTime - distance, this.offset));
    }

    setRate(rate: number): void {
        this.audio.playbackRate = rate;
        if (this.usingDash) {
            this.dash.setPlaybackRate(rate);
            this.dash.updateSettings({ streaming: { liveCatchup: { playbackRate: Math.max(rate - 1, 0.2) } } });
        }
        this.triggerUpdate();
    }

    setVolume = (volume: number): void => {
        if (volume >= 0 && volume <= 1) {
            this.audio.volume = volume;
        }
    };

    togglePlaybackRate(): void {
        if (this.audio.playbackRate < 1) {
            this.setRate(1);
        } else if (this.audio.playbackRate >= 1 && this.audio.playbackRate < 1.25) {
            this.setRate(1.25);
        } else if (this.audio.playbackRate >= 1.25 && this.audio.playbackRate < 1.5) {
            this.setRate(1.5);
        } else if (this.audio.playbackRate >= 1.5 && this.audio.playbackRate < 1.75) {
            this.setRate(1.75);
        } else if (this.audio.playbackRate >= 1.75 && this.audio.playbackRate < 2) {
            this.setRate(2);
        } else {
            this.setRate(1);
        }
    }

    playing(id: string | null): boolean {
        if (!id) {
            return !!(this.id && this.audio.duration > 0 && !this.audio.paused);
        }
        return id === this.id && this.audio.duration > 0 && !this.audio.paused;
    }

    get rawDuration(): number {
        return (this.usingDash ? this.dash.duration() : this.audio.duration) || 0;
    }

    get rawCurrentTime(): number {
        return this.audio.currentTime || 0;
    }

    get playbackRate(): number {
        return this.audio.playbackRate;
    }

    get volume(): number {
        return this.audio.volume;
    }

    get eventMetaData(): EventMetaData {
        return this.metaData || {};
    }

    get displayDuration(): number {
        return Math.max(0, this.rawDuration - this.offset);
    }

    get displayCurrentTime(): number {
        return Math.max(0, this.rawCurrentTime - this.offset);
    }

    get error(): boolean {
        return this.errorInfo.error;
    }
}

const AudioPlayerContext = createContext<AudioPlayer>(new AudioPlayer());

export function AudioPlayerProvider({
    audioPlayer,
    children,
}: {
    audioPlayer: AudioPlayer;
    children: ReactNode;
}): ReactElement {
    return <AudioPlayerContext.Provider value={audioPlayer}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer(withUpdates = true): AudioPlayer {
    const audioPlayer = useContext(AudioPlayerContext);

    const [_, update] = useState<Record<string, never> | null>(null);
    useEffect(() => {
        function onUpdate() {
            update({});
        }
        if (withUpdates) {
            audioPlayer.audio.addEventListener('timeupdate', onUpdate);
            // Custom event we fire to trigger re-renders when something changes
            audioPlayer.audio.addEventListener('update', onUpdate);
            return () => {
                audioPlayer.audio.removeEventListener('timeupdate', onUpdate);
                audioPlayer.audio.removeEventListener('update', onUpdate);
            };
        }
        return;
    }, [withUpdates]);

    return audioPlayer;
}
