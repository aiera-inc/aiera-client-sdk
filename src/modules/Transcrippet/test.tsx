import React from 'react';
import { screen } from '@testing-library/react';

import { actAndFlush, renderWithProvider } from 'testUtils';
import { fromValue } from 'wonka';
import { Transcrippet } from '.';

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
                            },
                        },
                    }),
            })
        );
        screen.getByText('dummy text');
        screen.getByText('Aiera | stuff');
        screen.getByText('aira');
        screen.getByText('Ken Sena');
        screen.getByText('Big Cheese');
    });
});
