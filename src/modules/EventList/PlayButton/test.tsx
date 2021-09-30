import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AudioPlayer, AudioPlayerProvider } from '@aiera/client-sdk/lib/audio';

import { PlayButton } from '.';

describe('PlayButtonUI', () => {
    test('renders play button when there is a url and is not currently playing', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        const mockedPlay = jest.fn();
        player.play = mockedPlay;
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" url="mp3!" />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Play'));
        expect(mockedPlay).toHaveBeenCalled();
    });

    test('renders pause button when there is a url and is not currently playing', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(true);
        const mockedPause = jest.fn();
        player.pause = mockedPause;
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" url="mp3!" />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Pause'));
        expect(mockedPause).toHaveBeenCalled();
    });

    test('renders calendar icon when there is no url', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(true);
        render(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" />
            </AudioPlayerProvider>
        );
        screen.getByTitle('Calendar');
    });
});
