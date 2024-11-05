/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventType, Quote } from '@aiera/client-sdk/types/generated';
import { AudioPlayer } from '.';

const quote = {
    isPrimary: true,
    localTicker: 'TICK',
    exchange: {
        country: { countryCode: 'US' },
        shortName: 'EXCH',
    },
};

describe('audio library', () => {
    const srcUrl = 'https://whatever.com/song.mp3';
    const play = jest.fn();
    const load = jest.fn();
    const pause = jest.fn();

    function getPlayer() {
        const player = new AudioPlayer();
        Object.defineProperty(player.audio, 'duration', { writable: true, value: true });
        Object.defineProperty(player.audio, 'paused', { writable: true, value: true });
        return player;
    }

    beforeEach(() => {
        load.mockReset();
        play.mockReset();
        pause.mockReset();
        window.HTMLMediaElement.prototype.load = load;
        window.HTMLMediaElement.prototype.play = play;
        window.HTMLMediaElement.prototype.pause = pause;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('duration', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 0 } });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(5);
        expect(player.rawDuration).toBe(100);
        expect(player.displayDuration).toBe(100);
    });

    test('play()', () => {
        const player = getPlayer();
        expect(player.playing(null)).toBeFalsy();
        expect(player.playing('1')).toBeFalsy();
        void player.play({
            id: '1',
            url: srcUrl,
            metaData: { firstTranscriptItemStartMs: 0, quote: quote as Quote, eventType: EventType.Earnings },
        });

        // mock the playing situation
        // @ts-ignore
        player.audio.duration = 1;
        // @ts-ignore
        player.audio.paused = false;
        expect(player.playing(null)).toBeTruthy();
        expect(player.playing('1')).toBeTruthy();
        expect(player.playing('2')).toBeFalsy();
    });

    test('pause()', () => {
        const player = getPlayer();
        player.pause();
        expect(pause).toHaveBeenCalled();
    });

    /**
     * We were originally using an Event's transcriptionAudioOffsetSeconds here,
     * but we have since deprecated that field - it was causing alignment issues when greater than 0,
     * particularly with published transcripts.
     * We want to load the full audio in the player, but when viewing a transcript, we need to
     * auto-seek to the first transcript segment's startMs.
     * This skips the opening mambo jumbo (e.g. conversing with the operator), and
     * helps keep the published transcripts aligned with audio.
     */
    test('seek()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 1000 } });
        player.rawSeek(5);
        expect(player.audio.currentTime).toBe(5);
        expect(player.rawCurrentTime).toBe(5);
        expect(player.displayCurrentTime).toBe(4);
        player.displaySeek(5);
        expect(player.audio.currentTime).toBe(6);
        expect(player.rawCurrentTime).toBe(6);
        expect(player.displayCurrentTime).toBe(5);
        player.rawSeek(15);
        expect(player.audio.currentTime).toBe(15);
        expect(player.rawCurrentTime).toBe(15);
        expect(player.displayCurrentTime).toBe(14);
    });

    test('ff()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 10 } });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(15);
        player.ff(15);
        expect(player.rawCurrentTime).toBe(30);
        expect(player.displayCurrentTime).toBe(30);
        player.ff(100);
        expect(player.rawCurrentTime).toBe(100);
        expect(player.displayCurrentTime).toBe(100);
    });

    test('rewind()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 1000 } });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(30);
        player.rewind(15);
        expect(player.rawCurrentTime).toBe(15);
        expect(player.displayCurrentTime).toBe(14);
        player.rewind(100);
        expect(player.displayCurrentTime).toBe(0);
        expect(player.rawCurrentTime).toBe(1);
    });

    test('seekToEnd()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 10 } });
        // @ts-ignore
        player.audio.duration = 100;
        player.seekToEnd();
        expect(player.rawCurrentTime).toBe(100);
    });

    test('seekToStart()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 2000 } });
        // @ts-ignore
        player.seekToStart();
        expect(player.rawCurrentTime).toBe(2);
    });

    test('setRate()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 10 } });
        // @ts-ignore
        player.setRate(1.3);
        expect(player.playbackRate).toBe(1.3);
    });

    test('setVolume()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 10 } });
        // @ts-ignore
        player.setVolume(0.3);
        expect(player.volume).toBe(0.3);
    });

    test('togglePlaybackRate()', async () => {
        const player = getPlayer();
        await player.init({ id: '1', url: 'url', metaData: { firstTranscriptItemStartMs: 10 } });
        // @ts-ignore
        player.setRate(1.3);
        player.togglePlaybackRate();
        expect(player.playbackRate).toBe(1.5);
    });

    describe('handle errors', () => {
        test('handles errors', async () => {
            function reset(player: AudioPlayer) {
                // @ts-ignore
                player.audio.duration = 100;
                player.audio.currentTime = 0;
                player.clear();
                expect(player.errorInfo.error).toBeFalsy();
                expect(player.errorInfo.timeout).toBeFalsy();
                expect(player.errorInfo.lastPosition).toBe(0);
            }

            jest.useFakeTimers();
            const player = getPlayer();

            reset(player);
            await player.play({
                id: '1',
                url: srcUrl,
                metaData: {
                    eventType: EventType.Earnings,
                    firstTranscriptItemStartMs: 0,
                    isLive: false,
                    quote: quote as Quote,
                },
            });

            expect(player.errorInfo.timeout).toBeTruthy();

            // Go forward more than 2s without adjusting currentTime
            // and make sure it has an error
            jest.advanceTimersByTime(5500);
            expect(player.errorInfo.error).toBeTruthy();

            // Make sure it goes back to clean slate on playing
            await player.play({
                id: '2',
                url: 'other url',
                metaData: { firstTranscriptItemStartMs: 0, quote: quote as Quote, eventType: EventType.Earnings },
            });
            expect(player.errorInfo.error).toBeFalsy();
            expect(player.errorInfo.timeout).toBeTruthy();
            expect(player.errorInfo.lastPosition).toBe(0);

            reset(player);
            await player.play({
                id: '2',
                url: 'other url',
                metaData: { firstTranscriptItemStartMs: 0, quote: quote as Quote, eventType: EventType.Earnings },
            });
            expect(player.errorInfo.timeout).toBeTruthy();

            // Pause should clear the timeout and not set the error,
            // even if we never actually incremented currentTime (no audio played)
            jest.advanceTimersByTime(1500);
            player.pause();
            jest.advanceTimersByTime(1000);
            expect(player.errorInfo.error).toBeFalsy();

            reset(player);
            await player.play({
                id: '3',
                url: 'other url 2',
                metaData: { firstTranscriptItemStartMs: 0, quote: quote as Quote, eventType: EventType.Earnings },
            });

            // Go forward more than 2s with an adjusted currentTime
            // and make sure it doesn't have an error
            player.audio.currentTime = 2.5;
            jest.advanceTimersByTime(2500);
            expect(player.errorInfo.error).toBeFalsy();
        });
    });
});
