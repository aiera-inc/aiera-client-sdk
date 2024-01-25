import React from 'react';
import { screen } from '@testing-library/react';

import { actAndFlush, renderWithProvider } from 'testUtils';
import { fromValue } from 'wonka';
import { Transcrippet } from '.';

class ResizeObserverMock {
    observe() {
        // Mock the observe method
    }
    unobserve() {
        // Mock the unobserve method
    }
    disconnect() {
        // Mock the disconnect method
    }
}

global.ResizeObserver = ResizeObserverMock;

describe('Transcrippet', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('renders', async () => {
        await actAndFlush(() =>
            renderWithProvider(<Transcrippet transcrippetGuid={'1'} />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            transcrippet: {
                                transcript: 'dummy text',
                                companyName: 'Aiera',
                                companyTicker: 'aira',
                                speakerName: 'Ken Sena',
                                speakerTitle: 'Big Cheese',
                                eventType: 'stuff',
                                eventDate: new Date().getTime(),
                            },
                        },
                    }),
            })
        );
        screen.getByText('dummy text');
        screen.getByText('Aiera | stuff');
        screen.getByText('Ken Sena');
        screen.getByText('Big Cheese');
    });
});
