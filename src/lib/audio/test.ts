/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AudioPlayer } from '.';

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

    test('duration', () => {
        const player = getPlayer();
        player.init({ id: '1', url: 'url', offset: 10 });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(5);
        expect(player.rawDuration).toBe(100);
        expect(player.displayDuration).toBe(90);
    });

    test('play()', () => {
        const player = getPlayer();
        expect(player.playing(null)).toBeFalsy();
        expect(player.playing('1')).toBeFalsy();
        void player.play({ id: '1', url: srcUrl, offset: 0 });
        expect(player.audio.src).toBe(srcUrl);
        expect(play).toHaveBeenCalled();

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

    test('seek()', () => {
        const player = getPlayer();
        player.init({ id: '1', url: 'url', offset: 10 });
        player.rawSeek(5);
        expect(player.audio.currentTime).toBe(5);
        expect(player.rawCurrentTime).toBe(5);
        expect(player.displayCurrentTime).toBe(0);
        player.displaySeek(5);
        expect(player.audio.currentTime).toBe(15);
        expect(player.rawCurrentTime).toBe(15);
        expect(player.displayCurrentTime).toBe(5);
        player.rawSeek(15);
        expect(player.audio.currentTime).toBe(15);
        expect(player.rawCurrentTime).toBe(15);
        expect(player.displayCurrentTime).toBe(5);
    });

    test('ff()', () => {
        const player = getPlayer();
        player.init({ id: '1', url: 'url', offset: 10 });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(15);
        player.ff(15);
        expect(player.rawCurrentTime).toBe(30);
        expect(player.displayCurrentTime).toBe(20);
        player.ff(100);
        expect(player.rawCurrentTime).toBe(100);
        expect(player.displayCurrentTime).toBe(90);
    });

    test('rewind()', () => {
        const player = getPlayer();
        player.init({ id: '1', url: 'url', offset: 10 });
        // @ts-ignore
        player.audio.duration = 100;
        player.rawSeek(30);
        player.rewind(15);
        expect(player.rawCurrentTime).toBe(15);
        expect(player.displayCurrentTime).toBe(5);
        player.rewind(100);
        expect(player.displayCurrentTime).toBe(0);
        expect(player.rawCurrentTime).toBe(10);
    });
});
