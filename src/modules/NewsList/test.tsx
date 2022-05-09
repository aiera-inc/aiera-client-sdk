import React from 'react';
import { DocumentNode } from 'graphql';
import { fromValue } from 'wonka';
import { within } from '@testing-library/dom';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getQueryNames } from '@aiera/client-sdk/api/client';
import { MessageBus, Provider } from '@aiera/client-sdk/lib/msg';
import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ContentType } from '@aiera/client-sdk/types/generated';
import { NewsList } from '.';

const content = {
    __typename: 'NewsContent',
    id: '1',
    contentType: ContentType.News,
    newsSource: {
        id: '1',
        name: 'MSN',
    },
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

    test('handles loading state', async () => {
        const { rendered } = await actAndFlush(() => renderWithProvider(<NewsList />));
        expect(rendered.container.querySelector('.NewsList__loading')).not.toBeNull();
    });

    test('handles empty state', async () => {
        await actAndFlush(() =>
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
            })
        );
        screen.getByText('There is no news.');
    });

    test('handles news list', async () => {
        await actAndFlush(() =>
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
            })
        );
        screen.getByText('Article Title');
        screen.getByText('GME');
        screen.getByText('NYSE');
        const row = screen.getByText('GME').closest('li');
        expect(row).toBeTruthy();
        if (row) {
            within(row).getByText('Nov 30, 2021');
            within(row).getByText('MSN');
        }
    });

    test('handles company selection via message bus', async () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <NewsList />
                </Provider>
            );
        };
        const { client } = await actAndFlush(() => renderWithProvider(<TestComponent />));
        bus.emit('instrument-selected', { ticker: 'GME' }, 'in');
        expect(client.query).toHaveBeenCalled();
    });

    test('handles multiple instruments via message bus', async () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <NewsList />
                </Provider>
            );
        };
        const { client } = await actAndFlush(() => renderWithProvider(<TestComponent />));
        await actAndFlush(() => bus.emit('instruments-selected', [{ ticker: 'GME' }, { ticker: 'AAPL' }], 'in'));
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

    test('go back to list if company changes via message bus', async () => {
        const bus = new MessageBus();
        const TestComponent = () => {
            return (
                <Provider bus={bus}>
                    <NewsList />
                </Provider>
            );
        };
        await actAndFlush(() =>
            renderWithProvider(<TestComponent />, {
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
                query: () => ({
                    toPromise: () =>
                        Promise.resolve({
                            data: {
                                companies: [
                                    {
                                        id: '2',
                                        commonName: 'Apple, Inc.',
                                        instruments: [
                                            {
                                                id: '2',
                                                isPrimary: true,
                                                quotes: [
                                                    {
                                                        id: '2',
                                                        isPrimary: true,
                                                        localTicker: 'AAPL',
                                                        exchange: {
                                                            id: '2',
                                                            country: {
                                                                id: '2',
                                                                countryCode: 'US',
                                                            },
                                                            shortName: 'NYSE',
                                                        },
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        }),
                }),
            })
        );
        await actAndFlush(() => {
            userEvent.click(screen.getByText('GME'));
        });
        screen.getByText('Hello world');
        await actAndFlush(() => {
            bus.emit('instrument-selected', { ticker: 'AAPL' }, 'in');
        });
        expect(screen.queryByText('Hello world')).toBeNull();
    });

    test('renders refetch button after 5 minutes', async () => {
        await actAndFlush(() =>
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
            })
        );

        // Fast-forward 11 minutes
        await actAndFlush(() => {
            jest.advanceTimersByTime(660000);
        });
        const refetchButton = screen.getByText('Check for new articles')?.parentNode;
        expect(refetchButton).toBeInTheDocument(); // we animate the button transition so it's always rendered
        expect(refetchButton).not.toHaveClass('invisible');
        if (refetchButton) {
            await actAndFlush(() => {
                // Click on the parent div
                fireEvent.click(refetchButton);
                // Fast-forward 1 second
                jest.advanceTimersByTime(1000);
            });
            // Refetch button should now be invisible
            expect(refetchButton).toHaveClass('invisible');
        }
    });

    test('renders load more button when there are more results', async () => {
        await actAndFlush(() =>
            renderWithProvider(<NewsList />, {
                executeQuery: () =>
                    fromValue({
                        data: {
                            search: {
                                content: {
                                    hits: [{ id: '1', content }],
                                    numTotalHits: 2,
                                },
                            },
                        },
                    }),
            })
        );
        screen.getByText('load more');
    });

    test('does not render load more button when there are no more results', async () => {
        await actAndFlush(() =>
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
            })
        );
        expect(screen.queryByText('load more')).toBeNull();
    });
});
