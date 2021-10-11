import React, { createContext, useContext, useEffect, useState, ReactElement, ReactNode } from 'react';

export class AudioPlayer {
    id?: string;
    offset = 0;
    audio: HTMLAudioElement;

    constructor() {
        this.audio = new Audio();
    }

    init(opts?: { id: string; url: string; offset: number }): void {
        if (opts && (this.id !== opts.id || this.audio.src !== opts.url)) {
            const { id, url } = opts;
            this.id = id;
            if (url !== this.audio.src) {
                this.audio.src = url;
            }
            this.audio.dispatchEvent(new Event('update'));
        }
        this.offset = opts?.offset || 0;
    }

    clear(): void {
        delete this.id;
        this.audio.src = '';
        this.audio.dispatchEvent(new Event('update'));
    }

    async play(opts?: { id: string; url: string; offset: number }): Promise<void> {
        this.init(opts);
        if (this.rawDuration === 0) this.rawSeek(this.offset);
        return this.audio.play();
    }

    pause(): void {
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
        return this.audio.duration || 0;
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
