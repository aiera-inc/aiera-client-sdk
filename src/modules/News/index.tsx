import React, { MouseEventHandler, ReactElement, Ref, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { findAll } from 'highlight-words-core';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { Button } from '@aiera/client-sdk/components/Button';
import { Input } from '@aiera/client-sdk/components/Input';
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { getPrimaryQuote, useSettings } from '@aiera/client-sdk/lib/data';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { NewsQuery, NewsQueryVariables } from '@aiera/client-sdk/types/generated';
import './styles.css';

interface Body {
    highlight: boolean;
    id: string;
    text: string;
}

interface NewsSharedProps {
    onBack?: MouseEventHandler;
}

/** @notExported */
interface NewsUIProps extends NewsSharedProps {
    body?: Body[][] | null;
    currentMatch?: string | null;
    currentMatchRef: Ref<HTMLDivElement>;
    darkMode?: boolean;
    matchIndex: number;
    matches: Body[];
    newsQuery: QueryResult<NewsQuery, NewsQueryVariables>;
    nextMatch: () => void;
    onChangeSearch: ChangeHandler<string>;
    prevMatch: () => void;
    scrollContainerRef: Ref<HTMLDivElement>;
    searchTerm: string;
}

export function NewsUI(props: NewsUIProps): ReactElement {
    const {
        body,
        newsQuery,
        currentMatch,
        currentMatchRef,
        darkMode = false,
        matches,
        matchIndex,
        nextMatch,
        onBack,
        onChangeSearch,
        prevMatch,
        scrollContainerRef,
        searchTerm,
    } = props;
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    return (
        <div className={classNames('h-full flex flex-col news', { dark: darkMode })}>
            <div className="dark:bg-bluegray-7">
                <div className="flex flex-col pt-3 px-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 news__header">
                    <div className="flex group items-center mb-3">
                        <Button onClick={onBack}>
                            <ArrowLeft className="fill-current w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
                            News
                        </Button>
                        <Input
                            className="mx-2"
                            icon={<MagnifyingGlass />}
                            name="search"
                            placeholder="Search Article..."
                            value={searchTerm}
                            onChange={onChangeSearch}
                        />
                        <SettingsButton />
                    </div>
                </div>
                {searchTerm && (
                    <div className="flex items-center h-10 bg-gray-100 dark:bg-bluegray-6 dark:bg-opacity-40 text-gray-500 dark:text-bluegray-4 text-sm p-3 shadow">
                        <div className="text-sm">
                            Showing {matches.length} result{matches.length === 1 ? '' : 's'} for &quot;
                            <span className="font-semibold">{searchTerm}</span>
                            &quot;
                        </div>
                        <div className="flex-1" />
                        <button
                            tabIndex={0}
                            className="w-2.5 mr-2 cursor-pointer rotate-180 hover:text-gray-600"
                            onClick={prevMatch}
                        >
                            <Chevron />
                        </button>
                        <div className="min-w-[35px] mr-2 text-center">
                            {matchIndex + 1} / {matches.length}
                        </div>
                        <button
                            tabIndex={0}
                            className="w-2.5 mr-2 cursor-pointer hover:text-gray-600"
                            onClick={nextMatch}
                        >
                            <Chevron />
                        </button>
                        <button
                            tabIndex={0}
                            className="w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={(e) => onChangeSearch(e, { value: '' })}
                        >
                            <Close />
                        </button>
                    </div>
                )}
            </div>
            {match(newsQuery)
                .with({ status: 'loading' }, () =>
                    new Array(5).fill(0).map((_, idx) => (
                        <div key={idx} className="animate-pulse bg-gray-50 p-2 dark:bg-bluegray-7">
                            <div className="rounded-md bg-gray-300 h-3 m-1 w-10 dark:bg-bluegray-5" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 ml-14 dark:bg-bluegray-5" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 dark:bg-bluegray-5" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 dark:bg-bluegray-6" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 mr-20 dark:bg-bluegray-6" />
                        </div>
                    ))
                )
                .with({ status: 'paused' }, () => wrapMsg("News not found. We're sorry for any inconvenience."))
                .with({ status: 'error' }, () => wrapMsg('There was an error loading news.'))
                .with({ status: 'empty' }, () => wrapMsg("News not found. We're sorry for any inconvenience."))
                .with({ status: 'success' }, ({ data: { content: contentData } }) => {
                    const news = contentData[0];
                    const primaryQuote = getPrimaryQuote(news?.primaryCompany);
                    const date = news?.publishedDate ? DateTime.fromISO(news.publishedDate) : DateTime.now();
                    return news ? (
                        <>
                            {!!primaryQuote && (
                                <div className="flex items-center pl-5 pr-5 pt-5 text-sm dark:bg-bluegray-7">
                                    <span className="font-bold pr-1 text-blue-600">{primaryQuote.localTicker}</span>
                                    <span className="font-light text-gray-300">{primaryQuote.exchange?.shortName}</span>
                                </div>
                            )}
                            <div className="leading-4 pl-5 pr-5 pt-3 dark:text-white dark:bg-bluegray-7">
                                <span className="font-bold text-base">{news.title}</span>
                            </div>
                            <div className="flex items-center px-5 py-2 text-sm dark:bg-bluegray-7">
                                {news.__typename === 'NewsContent' && (
                                    <>
                                        <span className="text-indigo-300">{news.newsSource.name}</span>
                                        <span className="pl-1 pr-1 text-gray-400">•</span>
                                    </>
                                )}
                                {date && <span className="text-gray-400">{date.toFormat('MMM dd, yyyy')}</span>}
                            </div>
                            {body && (
                                <div
                                    className="overflow-y-scroll py-3 px-5 text-black text-sm dark:bg-bluegray-7 dark:text-bluegray-4 news__body"
                                    ref={scrollContainerRef}
                                >
                                    {body.map((paragraph, pIdx) => (
                                        <p className="leading-5 mb-4" key={`news-body-paragraph-${pIdx}`}>
                                            {paragraph.map(({ highlight, id: chunkId, text }) =>
                                                highlight ? (
                                                    <mark
                                                        className={classNames({
                                                            'bg-yellow-300': chunkId === currentMatch,
                                                        })}
                                                        key={`news-body-chunk-${chunkId}-match`}
                                                        ref={chunkId === currentMatch ? currentMatchRef : undefined}
                                                    >
                                                        {text}
                                                    </mark>
                                                ) : (
                                                    <span key={`news-body-chunk-${chunkId}`}>{text}</span>
                                                )
                                            )}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : null;
                })
                .otherwise(() => null)}
        </div>
    );
}

interface NewsState {
    searchTerm: string;
}

function useSearchState(newsQuery: QueryResult<NewsQuery, NewsQueryVariables>) {
    const { state, handlers } = useChangeHandlers<NewsState>({
        searchTerm: '',
    });
    // Track the current match id and use it to set the proper currentMatchRef for auto-scrolling
    const [currentMatch, setCurrentMatch] = useState<string | null>(null);
    const { scrollContainerRef, targetRef: currentMatchRef } = useAutoScroll<HTMLDivElement>({
        pauseOnUserScroll: false,
        behavior: 'auto',
    });
    /**
     * When the body or search term are updated,
     * split the body into chunks with and without highlights,
     * depending on the search matches
     */
    const body = newsQuery.state.data?.content[0]?.body;
    const bodyWithMatches: Body[][] | null = useMemo(() => {
        if (body) {
            // This may not be performant enough for content with large bodies (e.g. filings)
            // See https://github.com/aiera-inc/aiera-desktop/blob/master/src/floatingTabs/Filing/FilingSidebar/container.js#L90
            // for a possible alternate solution
            const nodes: NodeListOf<ChildNode> = new DOMParser().parseFromString(body, 'text/html').body.childNodes;
            // Each Body array inside this 2D array represents a paragraph
            const chunks: Body[][] = [];
            // Map and filter methods are not available for NodeListOf
            nodes.forEach((node, nodeIndex) => {
                if (node.textContent?.length) {
                    const text = node.textContent;
                    if (state.searchTerm) {
                        chunks.push(
                            findAll({
                                autoEscape: true,
                                caseSensitive: false,
                                searchWords: [state.searchTerm],
                                textToHighlight: text,
                            }).map(({ highlight, start, end }, index) => ({
                                highlight,
                                id: `news-body-chunk-${nodeIndex}-${index}`,
                                text: text.substr(start, end - start),
                            }))
                        );
                    } else {
                        chunks.push([
                            {
                                highlight: false,
                                id: `news-body-chunk-${nodeIndex}`,
                                text,
                            },
                        ]);
                    }
                }
            });
            return chunks;
        }
        return null;
    }, [body, state.searchTerm]);

    // Get the body chunks with search matches only
    const matches = useMemo(
        () => (bodyWithMatches || []).flatMap((part) => part).filter((chunk) => chunk.highlight),
        [bodyWithMatches]
    );

    // When the search term changes, reset the current match to the first hit on the new term
    useEffect(() => {
        setCurrentMatch(matches[0]?.id || null);
    }, [state.searchTerm]);

    // Grab the current match index
    const matchIndex = useMemo(() => matches.findIndex((m) => m.id === currentMatch), [matches, currentMatch]);

    // Jump to the next match
    const nextMatch = useCallback(() => {
        const match = matches[(matchIndex + 1) % matches.length];
        if (match) setCurrentMatch(match.id);
    }, [matches, matchIndex]);

    // Jump to the previous match
    const prevMatch = useCallback(() => {
        const match = matches[matchIndex ? matchIndex - 1 : matches.length - 1];
        if (match) setCurrentMatch(match.id);
    }, [matches, matchIndex]);

    return {
        bodyWithMatches,
        currentMatch,
        currentMatchRef,
        matches,
        matchIndex,
        nextMatch,
        onChangeSearchTerm: handlers.searchTerm,
        prevMatch,
        scrollContainerRef,
        searchTerm: state.searchTerm,
    };
}

/** @notExported */
export interface NewsProps extends NewsSharedProps {
    newsId: string;
}

/**
 * Renders News
 */
export function News(props: NewsProps): ReactElement {
    const { newsId, onBack } = props;
    const newsQuery = useQuery<NewsQuery, NewsQueryVariables>({
        isEmpty: ({ content }) => (content || []).length === 0,
        query: gql`
            query News($filter: ContentFilter!) {
                content(filter: $filter) {
                    id
                    body
                    contentType
                    primaryCompany {
                        id
                        commonName
                        instruments {
                            id
                            isPrimary
                            quotes {
                                id
                                isPrimary
                                localTicker
                                exchange {
                                    id
                                    shortName
                                    country {
                                        id
                                        countryCode
                                    }
                                }
                            }
                        }
                    }
                    publishedDate
                    title
                    ... on NewsContent {
                        newsSource {
                            id
                            name
                        }
                    }
                }
            }
        `,
        requestPolicy: 'cache-first',
        variables: {
            filter: { contentIds: [newsId] },
        },
    });
    const searchState = useSearchState(newsQuery);
    const { settings } = useSettings();
    return (
        <NewsUI
            body={searchState.bodyWithMatches}
            currentMatch={searchState.currentMatch}
            currentMatchRef={searchState.currentMatchRef}
            darkMode={settings.darkMode}
            matches={searchState.matches}
            matchIndex={searchState.matchIndex}
            newsQuery={newsQuery}
            nextMatch={searchState.nextMatch}
            onBack={onBack}
            onChangeSearch={searchState.onChangeSearchTerm}
            prevMatch={searchState.prevMatch}
            scrollContainerRef={searchState.scrollContainerRef}
            searchTerm={searchState.searchTerm}
        />
    );
}
