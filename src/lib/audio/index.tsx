import { DeepPartial, Maybe } from '@aiera/client-sdk/types';
import { EventConnectionStatus, EventType, Quote } from '@aiera/client-sdk/types/generated';
import { playerType, ShakaPlayer, shakaUI, shakaUIControls } from '@aiera/client-sdk/types/shaka';
import muxjs from 'mux.js';
import React, { createContext, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';

// shaka player package looks for window.muxjs
// i extended window.muxjs in the types index.ts
window.muxjs = muxjs;

/* eslint-disable @typescript-eslint/no-var-requires */
const shakaInstance: ShakaPlayer = require('shaka-player/dist/shaka-player.ui.js') as ShakaPlayer;

export interface EventMetaData {
    createdBy?: string;
    connectionStatus?: EventConnectionStatus;
    eventId?: string;
    eventStream?: string | null;
    eventDate?: string;
    eventType?: EventType;
    externalAudioStreamUrl?: string | null;
    firstTranscriptItemStartMs?: number;
    isLive?: boolean;
    localTicker?: string;
    quote?: Maybe<DeepPartial<Quote>>;
    title?: string;
}

export class AudioPlayer {
    audio: HTMLAudioElement;
    errorInfo: {
        error: boolean;
        lastPosition?: number;
        timeout?: number;
    };
    id?: string;
    liveCatchupThreshold = 5;
    loadNewAsset?: boolean;
    metaData?: EventMetaData;
    player?: playerType;
    playingStartTime = 0;
    url?: string;

    // Properties for time normalization
    private timeOffset = 0;
    private normalizeTime = false;

    constructor() {
        this.errorInfo = {
            lastPosition: 0,
            error: false,
        };
        this.audio = document.createElement('video');
        this.audio.setAttribute('preload', 'metadata');
        this.audio.setAttribute('playsinline', 'true');
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
        const found = stream.includes('storage.media') || stream.includes('storage-dev.media');
        if (found) {
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

    async init(opts?: { id: string; metaData?: EventMetaData; url: string }): Promise<void> {
        // Keep track if the player needs to be re-rendered
        let shouldTriggerUpdate = false;

        // Ignore query parameters when checking if the audio url changed
        const currentUrl = this.player?.getAssetUri()?.split('?')[0];
        const optsUrl = (opts?.url || '').split('?')[0];
        this.loadNewAsset = false;

        if (opts && (this.id !== opts.id || currentUrl !== optsUrl)) {
            let url = opts?.url;
            const { id } = opts;
            this.id = id;

            // Set up normalization if we have a firstTranscriptItemStartMs
            this.maybeSetTimeOffset(opts);
            const startTime = this.timeOffset;

            if (url !== this.url || !this.playing(this.id)) {
                // Different event - load new asset/manifest
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
                            url = `https://storage${
                                opts?.metaData?.eventType === 'test' ? '-dev' : ''
                            }.media.aiera.com${opts.metaData.eventStream}/index.m3u8`;
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

                // Load asset
                try {
                    if (this.player) {
                        await this.player.load(url, startTime, mimeType);
                        this.audio.playbackRate = 1;
                        this.url = url;
                        this.loadNewAsset = true;
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            shouldTriggerUpdate = true;
        }

        if (this.maybeSetTimeOffset(opts)) {
            shouldTriggerUpdate = true;
        }

        if (opts?.metaData) {
            this.metaData = opts.metaData;
            shouldTriggerUpdate = true;
        }

        if (shouldTriggerUpdate) {
            this.triggerUpdate();
        }
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
        this.timeOffset = 0;
        this.normalizeTime = false;
        this.triggerUpdate();
    }

    triggerUpdate = (): void => {
        this.audio.dispatchEvent(new Event('update'));
    };

    /**
     * Handle time normalization for non-live events.
     * By "normalization", we mean play the audio from the firstTranscriptItemStartMs position,
     * but show the starting position as 00:00:00 in the player,
     * and show the duration relative to the firstTranscriptItemStartMs offset.
     * Here's an example:
     * Event has firstTranscriptItemStartMs value of 120000 (2 minutes).
     * Full audio is 40 minutes long, but we're starting at the 2-minute mark.
     * The player should show the total duration as 00:38:00 and pressing play should start at 00:00:00.
     * Returns true/false based on whether the offset was applied.
     */
    maybeSetTimeOffset(opts?: { id: string; url: string; metaData?: EventMetaData }): boolean {
        let offsetApplied = false;

        if (
            !opts?.metaData?.isLive &&
            opts?.metaData?.firstTranscriptItemStartMs &&
            opts?.metaData?.firstTranscriptItemStartMs >= 500 &&
            this.rawCurrentTime === 0
        ) {
            this.timeOffset = Math.round((opts.metaData.firstTranscriptItemStartMs || 0) / 1000);
            this.normalizeTime = true;
            offsetApplied = true;
        }

        return offsetApplied;
    }

    async play(opts?: { id: string; url: string; metaData?: EventMetaData }): Promise<void> {
        await this.init(opts);

        // Set up normalization if we have a firstTranscriptItemStartMs
        this.maybeSetTimeOffset(opts);

        if (this.rawCurrentTime === 0) {
            this.rawSeek(this.timeOffset);
        }

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
            const currentTime = this.rawCurrentTime;
            if (this.loadNewAsset || currentTime === 0) {
                this.player.goToLive();
                this.player.trickPlay(1);
            } else {
                await this.audio.play();
            }
            return;
        } else {
            return await this.audio.play();
        }
    }

    pause(): void {
        window.clearTimeout(this.errorInfo.timeout);
        this.audio.pause();
    }

    // Updated displaySeek to handle normalization
    displaySeek(position: number): void {
        this.audio.currentTime = this.normalizeTime ? position + this.timeOffset : position;
    }

    seekToEnd(): void {
        this.audio.currentTime = this.rawDuration;
    }

    /**
     * We were originally using an Event's transcriptionAudioOffsetSeconds here,
     * but we have since deprecated that field - it was causing alignment issues when greater than 0,
     * particularly with published transcripts.
     * We want to load the full audio in the player, but when viewing a transcript, we need to
     * auto-seek to the first transcript segment's startMs.
     * This skips the opening mambo jumbo (e.g. conversing with the operator), and
     * helps keep the published transcripts aligned with audio.
     */
    seekToStart(): void {
        this.audio.currentTime = this.timeOffset;
    }

    rawSeek(position: number): void {
        this.audio.currentTime = position;

        // We want to re-render the audio player
        // on-seek if the audio isn't currently
        // playing. Important if the playhead
        // hasn't initialized yet.
        if (!this.playing(null)) {
            this.triggerUpdate();
        }
    }

    ff(distance: number): void {
        const newPosition = Math.min(this.displayCurrentTime + distance, this.displayDuration);
        this.displaySeek(newPosition);
    }

    rewind(distance: number): void {
        const newPosition = Math.max(this.displayCurrentTime - distance, 0);
        this.displaySeek(newPosition);
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

    setPlayingStartTime(time: number): void {
        this.playingStartTime = time;
    }

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
        return this.player ? this.player.seekRange().end : this.audio.duration || 0;
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

    /**
     * Updated getters to handle normalization
     */
    get displayDuration(): number {
        if (this.normalizeTime) {
            return Math.max(0, this.rawDuration - this.timeOffset);
        }
        return Math.max(0, this.rawDuration);
    }

    get displayCurrentTime(): number {
        if (this.normalizeTime) {
            return Math.max(0, this.rawCurrentTime - this.timeOffset);
        }
        return Math.max(0, this.rawCurrentTime);
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
