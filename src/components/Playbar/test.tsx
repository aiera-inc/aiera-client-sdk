import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { AudioPlayer, AudioPlayerProvider } from '@aiera/client-sdk/lib/audio';

import { Playbar } from '.';

describe('PlaybarUI', () => {
    test('renders nothing when it is not currently playing and no id is set', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        const mockedPlay = jest.fn();
        player.play = mockedPlay;
        renderWithProvider(
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
        renderWithProvider(
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
        renderWithProvider(
            <AudioPlayerProvider audioPlayer={player}>
                <Playbar />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Pause'));
        expect(mockedPause).toHaveBeenCalled();
    });

    test('selected buttons on tab', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(true);
        const mockedPause = jest.fn();
        player.pause = mockedPause;
        player.id = '1';
        const { rendered } = renderWithProvider(
            <AudioPlayerProvider audioPlayer={player}>
                <Playbar />
            </AudioPlayerProvider>
        );
        const toggleRate = rendered.container.querySelector('#playbar-toggleRate');
        const seekStart = rendered.container.querySelector('#playbar-seekToStart');
        const back15 = rendered.container.querySelector('#playbar-back15');
        userEvent.tab();
        // Selects X button
        userEvent.tab();
        expect(toggleRate).toHaveFocus();
        userEvent.tab();
        expect(seekStart).toHaveFocus();
        userEvent.tab();
        expect(back15).toHaveFocus();
    });
});
