import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AudioPlayer, AudioPlayerProvider } from '@aiera/client-sdk/lib/audio';

import { Playbar } from '.';

describe('PlaybarUI', () => {
    test('renders nothing when it is not currently playing and no id is set', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        const mockedPlay = jest.fn();
        player.play = mockedPlay;
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <Playbar />
            </AudioPlayerProvider>
        );
        expect(screen.queryByTitle('Play')).toBeNull();
    });
    test('renders play button when it is not currently playing', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        const mockedPlay = jest.fn();
        player.play = mockedPlay;
        player.id = '1';
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <Playbar />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Play'));
        expect(mockedPlay).toHaveBeenCalled();
    });

    test('renders pause button when it is currently playing', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(true);
        const mockedPause = jest.fn();
        player.pause = mockedPause;
        player.id = '1';
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <Playbar />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Pause'));
        expect(mockedPause).toHaveBeenCalled();
    });
});
