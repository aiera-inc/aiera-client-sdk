import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { AudioPlayer, AudioPlayerProvider } from '@aiera/client-sdk/lib/audio';
import { EventType, Quote } from '@aiera/client-sdk/types/generated';

import { PlayButton } from '.';

const quote = {
    isPrimary: true,
    localTicker: 'TICK',
    exchange: {
        country: { countryCode: 'US' },
        shortName: 'EXCH',
    },
};

describe('PlayButtonUI', () => {
    test('renders play button when there is a url and is not currently playing', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(false);
        const mockedPlay = jest.fn();
        player.play = mockedPlay;
        renderWithClient(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" url="mp3!" metaData={{ eventType: EventType.Earnings, quote: quote as Quote }} />
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
        renderWithClient(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" url="mp3!" metaData={{ eventType: EventType.Earnings, quote: quote as Quote }} />
            </AudioPlayerProvider>
        );
        userEvent.click(screen.getByTitle('Pause'));
        expect(mockedPause).toHaveBeenCalled();
    });

    test('renders calendar icon when there is no url', () => {
        const player = new AudioPlayer();
        player.playing = jest.fn().mockReturnValue(true);
        renderWithClient(
            <AudioPlayerProvider audioPlayer={player}>
                <PlayButton id="1" metaData={{ eventType: EventType.Earnings, quote: quote as Quote }} />
            </AudioPlayerProvider>
        );
        screen.getByTitle('Calendar');
    });
});
