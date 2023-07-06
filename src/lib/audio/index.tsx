import React, { createContext, useContext, useEffect, useState, ReactElement, ReactNode } from 'react';
import { EventType, Quote } from '@aiera/client-sdk/types/generated';
import { DeepPartial, Maybe } from '@aiera/client-sdk/types';
import muxjs from 'mux.js';
import { ShakaPlayer, playerType, shakaUI, shakaUIControls } from '@aiera/client-sdk/types/shaka';

// shaka player package looks for window.muxjs
// i extended window.muxjs in the types index.ts
window.muxjs = muxjs;

/* eslint-disable @typescript-eslint/no-var-requires */
const shakaInstance: ShakaPlayer = require('shaka-player/dist/shaka-player.ui.js') as ShakaPlayer;

export interface EventMetaData {
    createdBy?: string;
    eventStream?: string | null;
    eventDate?: string;
    eventType?: EventType;
    externalAudioStreamUrl?: string | null;
    isLive?: boolean;
    localTicker?: string;
    quote?: Maybe<DeepPartial<Quote>>;
    title?: string;
    loading?: boolean;
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
    liveCatchupThreshold = 5;
    player?: playerType;

    constructor() {
        this.errorInfo = {
            lastPosition: 0,
            error: false,
        };
        this.audio = document.createElement('video');
        this.audio.setAttribute('preload', 'metadata');
        this.audio.controls = false;
        this.audio.addEventListener('timeupdate', this.adjustPlayback);
        this.initShaka(this.audio);
    }

    initShaka(audioElem: HTMLAudioElement) {
        shakaInstance?.polyfill?.installAll();
        if (!shakaInstance?.Player?.isBrowserSupported()) {
            console.log('Browser not supported.');
            return;
        }
        const localPlayer = new shakaInstance.Player(audioElem);
        const audioContainer = document.createElement('div');
        /* eslint-disable @typescript-eslint/unbound-method */
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        const ui: shakaUI = new (shakaInstance.ui.Overlay as any)(localPlayer, audioContainer, audioElem) as shakaUI;
        const controls: shakaUIControls = ui.getControls();
        const player: playerType = controls.getPlayer();
        const media: HTMLAudioElement = player.getMediaElement();

        player.configure({
            streaming: {
                rebufferingGoal: 1,
                bufferingGoal: 2,
                lowLatencyMode: true,
                useNativeHlsOnSafari: true,
                stallEnabled: true,
                retryParameters: {
                    maxAttempts: 2, // the maximum number of requests before we fail
                    baseDelay: 1000, // the base delay in ms between retries
                    backoffFactor: 2, // the multiplicative backoff factor between retries
                    fuzzFactor: 0.5, // the fuzz factor to apply to each retry delay
                },
            },
            manifest: {
                availabilityWindowOverride: 600000,
                defaultPresentationDelay: 10,
                retryParameters: {
                    timeout: 30000, // timeout in ms, after which we abort
                    stallTimeout: 5000, // stall timeout in ms, after which we abort
                    connectionTimeout: 10000, // connection timeout in ms, after which we abort
                    maxAttempts: 3, // the maximum number of requests before we fail
                    baseDelay: 1000, // the base delay in ms between retries
                    backoffFactor: 2, // the multiplicative backoff factor between retries
                    fuzzFactor: 0.5, // the fuzz factor to apply to each retry delay
                },
            },
        });
        this.player = player;
        this.audio = media;
        this.audio.autoplay = false;
    }

    adjustPlayback = (): void => {
        const fromLiveEdge = this.rawDuration - this.rawCurrentTime;
        if (fromLiveEdge < 6 && this.playbackRate > 1) {
            this.audio.playbackRate = 1;
        }
    };

    getMimeType(stream: string) {
        const found = stream.search('storage.media');
        if (found > 0) {
            return 'application/dash+xml';
        }
        // get the extension of the stream url to determine the mimetype
        const streamExt = this.getStreamExtension(stream);
        if (streamExt === 'm3u8') {
            return 'application/vnd.apple.mpegurl';
        } else if (streamExt === 'mpd') {
            return 'application/dash+xml';
        }

        return '';
    }

    getStreamExtension(stream: string) {
        return stream.split(/[#?]/)[0]?.split('.').pop()?.trim();
    }

    async init(opts?: { id: string; url: string; offset: number; metaData?: EventMetaData }): Promise<void> {
        if (opts && (this.id !== opts.id || this.audio.src !== opts.url)) {
            let url = opts?.url;
            const { id } = opts;
            const startTime = 0;
            this.id = id;
            this.offset = opts.offset;
            if (url !== this.url || !this.playing(this.id)) {
                // different event - load new asset/manifest
                let mimeType: string | null = null;
                const userAgent = window.navigator.userAgent.toLowerCase();
                const ios = /iphone|ipod|ipad/.test(userAgent);
                const isLive = opts?.metaData?.isLive || null;

                if (isLive && ios) {
                    mimeType = 'application/vnd.apple.mpegurl';
                    if (opts && (opts?.metaData?.eventStream || opts?.metaData?.externalAudioStreamUrl)) {
                        if (opts?.metaData?.externalAudioStreamUrl) {
                            url = opts.metaData.externalAudioStreamUrl;
                        } else if (opts?.metaData?.eventStream) {
                            url = `https://storage.media.aiera.com${opts.metaData.eventStream}/index.m3u8`;
                        }
                    }
                } else if (isLive && !ios) {
                    mimeType = this.getMimeType(url);
                } else {
                    mimeType = 'audio/mpeg';
                    if (url.includes('audio-dev.aiera') || url.includes('audio.aiera')) {
                        url = url + '&no_trim=true'; // add no_trim as the event is completed.
                    }
                }
                // load asset
                try {
                    if (this.player) {
                        await this.player.load(url, startTime, mimeType);
                        this.audio.playbackRate = 1;
                        this.url = url;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
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
        this.audio.src = '';
        this.triggerUpdate();
    }

    triggerUpdate = (): void => {
        this.audio.dispatchEvent(new Event('update'));
    };

    async play(opts?: { id: string; url: string; offset: number; metaData?: EventMetaData }): Promise<void> {
        await this.init(opts);
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
        }, 5000);

        const isLive = opts?.metaData?.isLive;
        if (isLive && this.player) {
            this.player.goToLive();
            this.player.trickPlay(1);
            return;
        } else {
            return await this.audio.play();
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

    // The offset is generally not used, as its included in the
    // data for paragraphMs etc. however, when getting an external
    // value for a seek position (such as seekTranscriptSeconds),
    // that value has no knowledge of an offset, so we should apply it
    rawSeek(position: number, useOffset = false): void {
        const newTime = useOffset ? position + this.offset : position;
        this.audio.currentTime = newTime;

        // We want to re-render the audio player
        // on-seek if the audio isn't currently
        // playing. Important if the playhead
        // hasn't initialized yet.
        if (!this.playing(null)) {
            this.triggerUpdate();
        }
    }

    ff(distance: number): void {
        this.rawSeek(Math.min(this.rawCurrentTime + distance, this.rawDuration));
    }

    rewind(distance: number): void {
        this.rawSeek(Math.max(this.rawCurrentTime - distance, this.offset));
    }

    setRate(rate: number): void {
        this.audio.playbackRate = rate;
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
        const dur = this.player ? this.player.seekRange().end : this.audio.duration || 0;
        return dur;
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
