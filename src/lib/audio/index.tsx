import React, { createContext, useContext, useEffect, useState, ReactElement, ReactNode } from 'react';

export class AudioPlayer {
    id?: string;
    audio: HTMLAudioElement;

    constructor() {
        this.audio = new Audio();
    }

    async play(opts?: { id: string; url: string }): Promise<void> {
        if (opts) {
            const { id, url } = opts;
            this.id = id;
            if (url !== this.audio.src) {
                this.audio.src = url;
            }
        }
        return this.audio.play();
    }

    pause(): void {
        this.audio.pause();
    }

    seek(position: number): void {
        this.audio.currentTime = position;
    }

    ff(distance: number): void {
        this.seek(Math.min(this.audio.currentTime + distance, this.audio.duration));
    }

    rewind(distance: number): void {
        this.seek(Math.max(this.audio.currentTime - distance, 0));
    }

    playing(id: string | null): boolean {
        if (!id) {
            return !!(this.id && this.audio.duration > 0 && !this.audio.paused);
        }
        return id === this.id && this.audio.duration > 0 && !this.audio.paused;
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

export function useAudioPlayer(): AudioPlayer {
    const audioPlayer = useContext(AudioPlayerContext);

    const [_currentTime, setCurrentTime] = useState(0);
    useEffect(() => {
        function onTimeUpdate() {
            setCurrentTime(audioPlayer.audio.currentTime);
        }
        audioPlayer.audio.addEventListener('timeupdate', onTimeUpdate);
        return () => {
            audioPlayer.audio.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, []);

    return audioPlayer;
}
