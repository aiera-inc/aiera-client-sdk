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

    test('play()', () => {
        const player = getPlayer();
        void player.play({ id: '1', url: srcUrl });
        expect(player.audio.src).toBe(srcUrl);
        expect(play).toHaveBeenCalled();

        // mock the playing situation
        // @ts-ignore
        player.audio.duration = 1;
        // @ts-ignore
        player.audio.paused = false;
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
        player.seek(5);
        expect(player.audio.currentTime).toBe(5);
    });

    test('ff()', () => {
        const player = getPlayer();
        // @ts-ignore
        player.audio.duration = 100;
        player.seek(5);
        player.ff(15);
        expect(player.audio.currentTime).toBe(20);
        player.ff(100);
        expect(player.audio.currentTime).toBe(100);
    });

    test('rewind()', () => {
        const player = getPlayer();
        // @ts-ignore
        player.audio.duration = 100;
        player.seek(20);
        player.rewind(15);
        expect(player.audio.currentTime).toBe(5);
        player.rewind(100);
        expect(player.audio.currentTime).toBe(0);
    });
});
