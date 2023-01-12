import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { AudioPlayer, AudioPlayerProvider, EventMetaData } from '@aiera/client-sdk/lib/audio';
import { EventType } from '@aiera/client-sdk/types';

import { Playbar } from '.';

describe('PlaybarUI', () => {
    test('renders nothing when it is not currently playing and no id is set', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        player.play = jest.fn();
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
        player.pause = jest.fn();
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

    test('renders event metadata', async () => {
        const eventMetadata: EventMetaData = {
            createdBy: 'Tester McTest',
            eventDate: new Date(new Date().getTime() + 3000).toISOString(),
            eventType: EventType.Earnings,
            quote: {
                exchange: {
                    shortName: 'NYSE',
                },
                localTicker: 'AAPL',
            },
            title: 'Apple Q2 Earnings Call',
        };
        const player = new AudioPlayer();
        player.metaData = eventMetadata;
        player.playing = jest.fn().mockReturnValue(false);
        player.play = jest.fn();
        player.id = '1';
        await actAndFlush(() =>
            renderWithProvider(
                <AudioPlayerProvider audioPlayer={player}>
                    <Playbar metaData={eventMetadata} />
                </AudioPlayerProvider>
            )
        );
        screen.getByText('AAPL');
        screen.getByText('NYSE');
    });

    test('when event type is custom, renders event title and creator name', async () => {
        const eventMetadata: EventMetaData = {
            createdBy: 'Tester M.',
            eventDate: new Date(new Date().getTime() + 3000).toISOString(),
            eventType: EventType.Custom,
            title: 'Apple Q2 Earnings Call',
        };
        const player = new AudioPlayer();
        player.metaData = eventMetadata;
        player.playing = jest.fn().mockReturnValue(false);
        player.play = jest.fn();
        player.id = '1';
        await actAndFlush(() =>
            renderWithProvider(
                <AudioPlayerProvider audioPlayer={player}>
                    <Playbar metaData={eventMetadata} />
                </AudioPlayerProvider>
            )
        );
        screen.getByText('Apple Q2 Earnings Call');
        screen.getByText('Tester M.');
    });
});
