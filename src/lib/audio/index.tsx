import React, { createContext, useContext, useEffect, useState, ReactElement, ReactNode } from 'react';
import { MediaPlayer, MediaPlayerClass } from 'dashjs';

export class AudioPlayer {
    id?: string;
    url?: string;
    errorInfo: {
        timeout?: number;
        lastPosition?: number;
        error: boolean;
    };
    offset = 0;
    audio: HTMLAudioElement;
    dash: MediaPlayerClass;
    usingDash = false;

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
                    latencyThreshold: 30,
                },
            },
        });
        this.dash.on(MediaPlayer.events.FRAGMENT_LOADING_PROGRESS, this.triggerUpdate);
        this.dash.on(window.dashjs.MediaPlayer.events.BUFFER_EMPTY, this.updateTargetLatency);
        this.dash.on(window.dashjs.MediaPlayer.events.PLAYBACK_WAITING, this.updateTargetLatency);
    }

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

    init(opts?: { id: string; url: string; offset: number }): void {
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

        if (opts && opts.offset !== this.offset) {
            this.offset = opts.offset;
        }
    }

    clear(): void {
        delete this.id;
        delete this.url;
        window.clearTimeout(this.errorInfo.timeout);
        delete this.errorInfo.timeout;
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

    async play(opts?: { id: string; url: string; offset: number }): Promise<void> {
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

    rawSeek(position: number): void {
        this.audio.currentTime = position;
    }

    ff(distance: number): void {
        this.rawSeek(Math.min(this.rawCurrentTime + distance, this.rawDuration));
    }

    rewind(distance: number): void {
        this.rawSeek(Math.max(this.rawCurrentTime - distance, this.offset));
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
