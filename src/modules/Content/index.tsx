import React, { MouseEventHandler, ReactElement, Ref, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { findAll } from 'highlight-words-core';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';
import { Button } from '@aiera/client-sdk/components/Button';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { titleize } from '@aiera/client-sdk/lib/strings';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { ContentQuery, ContentQueryVariables, ContentType } from '@aiera/client-sdk/types/generated';
import './styles.css';

export type ContentItem = ContentQuery['content'][0];

interface ContentBody {
    highlight: boolean;
    id: string;
    text: string;
}

interface ContentSharedProps {
    contentType: ContentType;
    onBack?: MouseEventHandler;
}

/** @notExported */
interface ContentUIProps extends ContentSharedProps {
    body?: ContentBody[];
    contentQuery: QueryResult<ContentQuery, ContentQueryVariables>;
    currentMatch?: string | null;
    currentMatchRef: Ref<HTMLDivElement>;
    matchIndex: number;
    matches: ContentBody[];
    nextMatch: () => void;
    onChangeSearch: ChangeHandler<string>;
    prevMatch: () => void;
    scrollContainerRef: Ref<HTMLDivElement>;
    searchTerm: string;
}

export function ContentUI(props: ContentUIProps): ReactElement {
    const {
        body,
        contentQuery,
        contentType,
        currentMatch,
        currentMatchRef,
        matches,
        matchIndex,
        nextMatch,
        onBack,
        onChangeSearch,
        prevMatch,
        scrollContainerRef,
        searchTerm,
    } = props;
    const backButton = (contentType: ContentType): ReactElement => (
        <Button className="mr-2" onClick={onBack}>
            <ArrowLeft className="fill-current text-black w-3.5 z-1 relative mr-2 group-active:fill-current group-active:text-white" />
            {titleize(contentType as string)}
        </Button>
    );
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    return (
        <div className="h-full flex flex-col content">
            <div className="flex flex-col pl-3 pr-3 pt-3 shadow-3xl content__header">
                <div className="flex items-center mb-3">
                    {match(contentType)
                        .with(ContentType.News, () => (
                            <>
                                {onBack && backButton(ContentType.News)}
                                <Input
                                    icon={<MagnifyingGlass />}
                                    name="search"
                                    placeholder="Search Article..."
                                    value={searchTerm}
                                    onChange={onChangeSearch}
                                />
                            </>
                        ))
                        .with(ContentType.Spotlight, () => onBack && backButton(ContentType.Spotlight))
                        .otherwise(() => null)}
                </div>
            </div>
            {searchTerm && (
                <div className="bg-gray-50 flex h-10 items-center p-3 shadow sticky text-gray-500 text-sm top-3 z-10">
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
                    <button tabIndex={0} className="w-2.5 mr-2 cursor-pointer hover:text-gray-600" onClick={nextMatch}>
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
            {match(contentQuery)
                .with({ status: 'loading' }, () =>
                    new Array(5).fill(0).map((_, idx) => (
                        <div key={idx} className="animate-pulse p-2">
                            <div className="rounded-md bg-gray-300 h-3 m-1 w-10" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 ml-14" />
                            <div className="rounded-md bg-gray-300 h-3 m-1" />
                            <div className="rounded-md bg-gray-300 h-3 m-1" />
                            <div className="rounded-md bg-gray-300 h-3 m-1 mr-20" />
                        </div>
                    ))
                )
                .with({ status: 'paused' }, () => wrapMsg("Content not found. We're sorry for any inconvenience."))
                .with({ status: 'error' }, () => wrapMsg('There was an error loading content.'))
                .with({ status: 'empty' }, () => wrapMsg("Content not found. We're sorry for any inconvenience."))
                .with({ status: 'success' }, ({ data: { content: contentData } }) => {
                    const content = contentData[0];
                    const primaryQuote = getPrimaryQuote(content?.primaryCompany);
                    const date = content?.publishedDate ? DateTime.fromISO(content.publishedDate) : DateTime.now();
                    return (
                        <>
                            {!!primaryQuote && (
                                <div className="flex items-center pl-5 pr-5 pt-5 text-sm">
                                    <span className="font-bold pr-1 text-blue-600">{primaryQuote.localTicker}</span>
                                    <span className="font-light text-gray-300">{primaryQuote.exchange?.shortName}</span>
                                </div>
                            )}
                            <div className="leading-4 pl-5 pr-5 pt-3">
                                <span className="font-bold text-base">{content?.title}</span>
                            </div>
                            <div className="flex items-center pl-5 pr-5 pt-2 text-sm">
                                <span className="text-indigo-300">{content?.source}</span>
                                <span className="pl-1 pr-1 text-gray-400">•</span>
                                {date && <span className="text-gray-400">{date.toFormat('MMM dd, yyyy')}</span>}
                            </div>
                            {body && (
                                <div className="overflow-y-scroll pb-3 pl-5 pr-5 pt-3 text-sm" ref={scrollContainerRef}>
                                    {body.map(({ highlight, id: chunkId, text }) =>
                                        highlight ? (
                                            <mark
                                                className={classNames({
                                                    'bg-yellow-300': chunkId === currentMatch,
                                                })}
                                                key={`content-body-chunk-${chunkId}-match`}
                                                ref={chunkId === currentMatch ? currentMatchRef : undefined}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: text }} />
                                            </mark>
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{ __html: text }}
                                                key={`content-body-chunk-${chunkId}`}
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </>
                    );
                })
                .otherwise(() => null)}
        </div>
    );
}

interface ContentState {
    searchTerm: string;
}

function useSearchState(contentQuery: QueryResult<ContentQuery, ContentQueryVariables>) {
    const { state, handlers } = useChangeHandlers<ContentState>({
        searchTerm: '',
    });
    // Track the current match id and use it to set the proper currentMatchRef for auto-scrolling
    const [currentMatch, setCurrentMatch] = useState<string | null>(null);
    const { scrollContainerRef, targetRef: currentMatchRef } = useAutoScroll<HTMLDivElement>({
        pauseOnUserScroll: false,
        block: 'center',
        inline: 'center',
        behavior: 'auto',
    });
    /**
     * When the body or search term are updated,
     * split the body into chunks with and without highlights,
     * depending on the search matches
     */
    const body = contentQuery.state.data?.content[0]?.body;
    const bodyWithMatches: ContentBody[] = useMemo(
        () =>
            state.searchTerm && body
                ? findAll({
                      autoEscape: true,
                      caseSensitive: false,
                      searchWords: [state.searchTerm],
                      textToHighlight: body,
                  }).map(({ highlight, start, end }, index) => ({
                      highlight,
                      id: `content-body-search-term-chunk-${index}`,
                      text: body.substr(start, end - start),
                  }))
                : [
                      {
                          highlight: false,
                          id: 'content-body',
                          text: body || '',
                      },
                  ],
        [body, state.searchTerm]
    );

    // Get the body chunks with search matches only
    const matches = useMemo(() => bodyWithMatches.filter((chunk) => chunk.highlight), [bodyWithMatches]);

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
export interface ContentProps extends ContentSharedProps {
    contentId: string;
}

/**
 * Renders Content
 */
export function Content(props: ContentProps): ReactElement {
    const { contentId, contentType, onBack } = props;
    const contentQuery = useQuery<ContentQuery, ContentQueryVariables>({
        isEmpty: ({ content }) => (content || []).length === 0,
        query: gql`
            query Content($filter: ContentFilter!) {
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
                    source
                    title
                }
            }
        `,
        requestPolicy: 'cache-first',
        variables: {
            filter: { contentIds: [contentId] },
        },
    });
    const searchState = useSearchState(contentQuery);
    return (
        <ContentUI
            body={searchState.bodyWithMatches}
            contentQuery={contentQuery}
            contentType={contentType}
            currentMatch={searchState.currentMatch}
            currentMatchRef={searchState.currentMatchRef}
            matches={searchState.matches}
            matchIndex={searchState.matchIndex}
            nextMatch={searchState.nextMatch}
            onBack={onBack}
            onChangeSearch={searchState.onChangeSearchTerm}
            prevMatch={searchState.prevMatch}
            scrollContainerRef={searchState.scrollContainerRef}
            searchTerm={searchState.searchTerm}
        />
    );
}
