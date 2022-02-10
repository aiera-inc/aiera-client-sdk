import React from 'react';
import { DocumentNode } from 'graphql';
import { fromValue } from 'wonka';
import { within } from '@testing-library/dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getQueryNames } from '@aiera/client-sdk/api/client';
import { MessageBus, Provider } from '@aiera/client-sdk/lib/msg';
import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ContentSource, ContentType } from '@aiera/client-sdk/types/generated';
import { NewsList } from '.';
import { CONTENT_SOURCE_LABELS } from '@aiera/client-sdk/lib/data';

const content = {
    id: '1',
    contentType: ContentType.News,
    primaryCompany: {
        instruments: [
            {
                isPrimary: true,
                quotes: [
                    {
                        isPrimary: true,
                        localTicker: 'GME',
                        exchange: {
                            country: { countryCode: 'US' },
                            shortName: 'NYSE',
                        },
                    },
                ],
            },
        ],
    },
    publishedDate: '2021-11-30T09:00:00+00:00',
    source: ContentSource.Lexisnexis,
    title: 'Article Title',
};
const contentWithBody = {
    ...content,
    body: '<p>Hello world</p>',
};

describe('NewsList', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllTimers();
    });

    test('handles loading state', () => {
        const { rendered } = renderWithProvider(<NewsList />);
        expect(rendered.container.querySelector('.NewsList__loading')).not.toBeNull();
    });

    test('handles empty state', () => {
        renderWithProvider(<NewsList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        search: {
                            content: {
                                hits: [],
                                numTotalHits: 0,
                            },
                        },
                    },
                }),
        });
        screen.getByText('There is no news.');
    });

    test('handles news list', () => {
        renderWithProvider(<NewsList />, {
            executeQuery: () =>
                fromValue({
                    data: {
                        search: {
                            content: {
                                hits: [{ id: '1', content }],
                                numTotalHits: 1,
                            },
                        },
                    },
                }),
        });
        screen.getByText('Article Title');
        screen.getByText('GME');
        screen.getByText('NYSE');
        const row = screen.getByText('GME').closest('li');
        expect(row).toBeTruthy();
        if (row) {
            within(row).getByText('Nov 30, 2021');
            within(row).getByText(CONTENT_SOURCE_LABELS[ContentSource.Lexisnexis]);
        }
    });

    test('handles company selection via message bus', () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <NewsList />
                </Provider>
            );
        };
        const { client } = renderWithProvider(<TestComponent />);
        bus.emit('instrument-selected', { ticker: 'GME' }, 'in');
        expect(client.query).toHaveBeenCalled();
    });

    test('handles selecting news', async () => {
        await actAndFlush(() =>
            renderWithProvider(<NewsList />, {
                executeQuery: ({ query }: { query: DocumentNode }) => {
                    return getQueryNames(query)[0] === 'NewsList'
                        ? fromValue({
                              data: {
                                  search: {
                                      content: {
                                          hits: [{ id: '1', content }],
                                          numTotalHits: 1,
                                      },
                                  },
                              },
                          })
                        : fromValue({
                              data: {
                                  content: [contentWithBody],
                              },
                          });
                },
            })
        );
        await actAndFlush(() => {
            userEvent.click(screen.getByText('GME'));
        });
        screen.getByText('Hello world');
    });
});