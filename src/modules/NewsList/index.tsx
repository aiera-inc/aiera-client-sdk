import React, {
    Fragment,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    SyntheticEvent,
    useCallback,
    useEffect,
} from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import get from 'lodash/get';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { PaginatedQueryResult, usePaginatedQuery } from '@aiera/client-sdk/api/client';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { getPrimaryQuote, useAutoTrack, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { areDatesSameDay } from '@aiera/client-sdk/lib/datetimes';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { Message, useMessageListener } from '@aiera/client-sdk/lib/msg';
import { News } from '@aiera/client-sdk/modules/News';
import { ChangeHandler, ContentSearchResultHit } from '@aiera/client-sdk/types';
import { NewsListQuery, NewsListQueryVariables, ContentType, NewsContent } from '@aiera/client-sdk/types/generated';
import './styles.css';

export type NewsListNews = NewsListQuery['search']['content']['hits'][0]['content'];

interface NewsListSharedProps {}

const DEFAULT_LIST_SIZE = 20;

/** @notExported */
export interface NewsListUIProps extends NewsListSharedProps {
    canRefetch: boolean;
    company?: CompanyFilterResult;
    loadMore: (event: MouseEvent) => void;
    newsListQuery: PaginatedQueryResult<NewsListQuery, NewsListQueryVariables>;
    onBackFromNews?: MouseEventHandler;
    onChangeSearch?: ChangeHandler<string>;
    onRefetch: MouseEventHandler;
    onSelectCompany?: ChangeHandler<CompanyFilterResult>;
    onSelectNews?: ChangeHandler<NewsListNews>;
    searchTerm?: string;
    selectedNews?: NewsListNews;
}

export function NewsListUI(props: NewsListUIProps): ReactElement {
    const {
        canRefetch,
        company,
        loadMore,
        newsListQuery,
        onBackFromNews,
        onChangeSearch,
        onRefetch,
        onSelectCompany,
        onSelectNews,
        searchTerm,
        selectedNews,
    } = props;

    if (selectedNews) {
        return <News newsId={selectedNews.id} onBack={onBackFromNews} />;
    }

    const loader = (numHits: number) =>
        new Array(numHits).fill(0).map((_, idx) => (
            <li key={idx} className="p-2 animate-pulse mx-2">
                <div className="flex items-center">
                    <div className="rounded-full bg-gray-300 w-9 h-9" />
                    <div className="flex flex-col flex-1 min-w-0 p-2 pr-4">
                        <div className="flex">
                            <div className="rounded-full bg-gray-500 h-[10px] mr-2 w-7" />
                            <div className="rounded-full bg-gray-400 h-[10px] mr-2 w-12" />
                        </div>
                        <div className="flex">
                            <div className="rounded-full bg-gray-300 h-[10px] mr-2 w-28 mt-2" />
                            <div className="rounded-full bg-gray-200 h-[10px] mr-2 w-16 mt-2" />
                            <div className="rounded-full bg-gray-200 h-[10px] mr-2 w-10 mt-2" />
                        </div>
                    </div>
                </div>
            </li>
        ));
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate = DateTime.now();
    return (
        <div className="h-full flex flex-col news-list">
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl news-list__header">
                <div className="flex items-center mb-3">
                    <Input
                        icon={<MagnifyingGlass />}
                        name="search"
                        onChange={onChangeSearch}
                        placeholder="Search News..."
                        value={searchTerm}
                    />
                    <div className="ml-2">
                        <CompanyFilterButton onChange={onSelectCompany} value={company} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll">
                <div className="flex flex-col flex-grow">
                    <div className="flex flex-col items-center justify-center flex-1">
                        {match(newsListQuery)
                            .with({ status: 'loading' }, () => (
                                <ul className="w-full NewsList__loading">{loader(15)}</ul>
                            ))
                            .with({ status: 'paused' }, () => wrapMsg('There is no news.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading news.'))
                            .with({ status: 'empty' }, () => wrapMsg('There is no news.'))
                            .with({ status: 'success' }, { status: 'refetching' }, ({ data, status }) => (
                                <ul className="py-1.5 w-full">
                                    <div
                                        className={classNames(
                                            'animate-pulse cursor-pointer duration-200 ease-in-out flex group items-center justify-center transition-h hover:animate-none',
                                            {
                                                invisible: !canRefetch,
                                                'h-0': !canRefetch,
                                                'pb-3': canRefetch,
                                                'pt-2': canRefetch,
                                            }
                                        )}
                                        onClick={onRefetch}
                                    >
                                        <div className="ml-2 w-full flex h-[1px] bg-gradient-to-l from-gray-200 group-hover:from-gray-300" />
                                        <p className="px-3 text-gray-500 text-sm whitespace-nowrap group-hover:text-gray-700">
                                            Check for new articles
                                        </p>
                                        <div className="mr-2 w-full flex h-[1px] bg-gradient-to-r from-gray-200 group-hover:from-gray-300" />
                                    </div>
                                    {data.search.content.hits.map((hit) => {
                                        const content = hit.content as NewsContent;
                                        const primaryQuote = getPrimaryQuote(content.primaryCompany);
                                        const date = DateTime.fromISO(content.publishedDate);
                                        let divider = null;
                                        if (!areDatesSameDay(prevEventDate.toJSDate(), date.toJSDate())) {
                                            prevEventDate = date;
                                            divider = (
                                                <li className="sticky top-[12px] backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 px-1 py-2 font-semibold mx-3">
                                                    {date.toFormat('DDDD')}
                                                    <div className="ml-2 w-full flex h-[1px] bg-gradient-to-r from-gray-200" />
                                                </li>
                                            );
                                        }
                                        return (
                                            <Fragment key={hit.id}>
                                                {divider}
                                                <li
                                                    className="group text-xs text-gray-300 px-3 cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                                                    onClick={(e) => onSelectNews?.(e, { value: content })}
                                                >
                                                    <div className="flex flex-1 flex-col justify-center min-w-0 p-2 pb-[2px] pr-4 text-sm">
                                                        <span className="mr-1 text-black">{content.title}</span>
                                                    </div>
                                                    <div className="flex flex-1 items-center min-w-0 p-2 pr-4 pt-0">
                                                        {!!primaryQuote && (
                                                            <>
                                                                <span className="font-bold pr-1 text-blue-600 group-hover:text-yellow-600">
                                                                    {primaryQuote.localTicker}
                                                                </span>
                                                                <span className="font-light text-gray-300 group-hover:text-gray-400">
                                                                    {primaryQuote.exchange?.shortName}
                                                                </span>
                                                                <span className="pl-1 pr-1 text-gray-400">•</span>
                                                            </>
                                                        )}
                                                        <span className="text-gray-400">
                                                            {date.toFormat('MMM dd, yyyy')}
                                                        </span>
                                                        {!!content.newsSource?.name && (
                                                            <>
                                                                <span className="pl-1 pr-1 text-gray-400">•</span>
                                                                <span className="text-indigo-300">
                                                                    {content.newsSource.name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                    {status === 'refetching' && loader(3)}
                                </ul>
                            ))
                            .exhaustive()}
                        <div className="flex-1" />
                        <div
                            className="bg-white border-gray-200 border-opacity-80 border-t cursor-pointer flex flex-col items-center pb-1 pt-3 shadow-inner text-gray-500 w-full hover:text-black"
                            onClick={loadMore}
                        >
                            <p className="text-sm tracking-wider uppercase">load more</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface NewsListProps extends NewsListSharedProps {
    listSize?: number;
}

interface NewsListState {
    canRefetch: boolean;
    company?: CompanyFilterResult;
    fromIndex: number;
    lastRefetch?: DateTime;
    searchTerm: string;
    selectedNews?: NewsListNews;
}

/**
 * Renders NewsList
 */
export function NewsList(props: NewsListProps): ReactElement {
    const { state, handlers, mergeState, setState } = useChangeHandlers<NewsListState>({
        canRefetch: false,
        company: undefined,
        fromIndex: 0,
        lastRefetch: DateTime.now(),
        searchTerm: '',
        selectedNews: undefined,
    });
    const listSize: number = props.listSize || DEFAULT_LIST_SIZE;
    const resolveCompany = useCompanyResolver();
    const bus = useMessageListener(
        'instrument-selected',
        async (msg: Message<'instrument-selected'>) => {
            if (msg.data.ticker) {
                const companies = await resolveCompany(msg.data.ticker);
                if (companies?.[0]) {
                    const company = companies[0];
                    // Set the selected company and reset fromIndex in state
                    setState((s) => ({ ...s, company, fromIndex: 0 }));
                }
            }
        },
        'in'
    );

    /**
     * Takes two NewsList queries, merges the hits together,
     * removes duplicates, and returns the new query with the combined hits
     *
     * @param prevQuery - a NewsListQuery result
     * @param newQuery  - another NewsListQuery result
     * @returns         - the second NewsListQuery with the hits merged in from previous query
     */
    const mergeResults = (prevQuery: NewsListQuery, newQuery: NewsListQuery): NewsListQuery => {
        const prevHits = get(prevQuery, 'search.content.hits', []) as ContentSearchResultHit[];
        const newHits = get(newQuery, 'search.content.hits', []) as ContentSearchResultHit[];
        const prevIds = new Set(prevHits.map((hit) => hit.id));
        return {
            search: {
                content: {
                    ...newQuery.search.content,
                    hits: [...prevHits, ...newHits.filter((h) => !prevIds.has(h.id))],
                },
            },
        };
    };

    const newsListQuery = usePaginatedQuery<NewsListQuery, NewsListQueryVariables>({
        isEmpty: (data) => (get(data, 'search.content.hits', []) as NewsListNews[]).length === 0,
        query: gql`
            query NewsList($filter: ContentSearchFilter!, $fromIndex: Int, $size: Int) {
                search {
                    content(filter: $filter, fromIndex: $fromIndex, size: $size) {
                        id
                        numTotalHits
                        hits {
                            id
                            content {
                                id
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
                    }
                }
            }
        `,
        mergeResults,
        requestPolicy: 'cache-and-network',
        variables: {
            filter: {
                companyIds: state.company ? [state.company.id] : undefined,
                contentTypes: [ContentType.News],
                searchTerm: state.searchTerm,
            },
            fromIndex: state.fromIndex,
            size: listSize,
        },
    });

    const onRefetch = useCallback(() => {
        const isPaginating = state.fromIndex > 0;
        setState((s) => ({
            ...s,
            canRefetch: false,
            fromIndex: 0, // if the user paginated, resetting to 0 will fire a new query
            lastRefetch: DateTime.now(),
        }));
        // Refetch if not paginating
        if (!isPaginating) {
            newsListQuery.refetch({ requestPolicy: 'cache-and-network' });
        }
    }, [state.fromIndex]);

    const onSelectCompany = useCallback<ChangeHandler<CompanyFilterResult>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.company(event, change);
            // If we are unselecting a company, refresh immediately
            if (!change.value) {
                newsListQuery.refetch();
            }
        },
        [state]
    );

    const onSelectNews = useCallback<ChangeHandler<NewsListNews>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value?.primaryCompany);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.selectedNews(event, change);
            // If we are going back to the news list, refresh immediately
            if (!change.value) {
                newsListQuery.refetch();
            }
        },
        [state]
    );

    useEffect(() => {
        mergeState({
            canRefetch: false,
            fromIndex: 0,
            lastRefetch: DateTime.now(),
        });
    }, [state.company, state.searchTerm]);

    useAutoTrack('Submit', 'News Search', { searchTerm: state.searchTerm }, [state.searchTerm], !state.searchTerm);
    // Every 30 seconds, check if it's been 5 minutes since last refetch
    useInterval(() => {
        if (!state.canRefetch && state.lastRefetch && DateTime.now().diff(state.lastRefetch, ['minutes']).minutes > 5) {
            setState((s) => ({
                ...s,
                canRefetch: true,
            }));
        }
    }, 30000);

    return (
        <NewsListUI
            canRefetch={state.canRefetch}
            company={state.company}
            loadMore={useCallback(
                (event: SyntheticEvent<Element, Event>) =>
                    handlers.fromIndex(event, { value: state.fromIndex + listSize }),
                [handlers.fromIndex, state.fromIndex]
            )}
            newsListQuery={newsListQuery}
            onBackFromNews={useCallback(
                (event: SyntheticEvent<Element, Event>) => onSelectNews(event, { value: null }),
                [onSelectNews]
            )}
            onRefetch={onRefetch}
            onSelectCompany={onSelectCompany}
            onSelectNews={onSelectNews}
            onChangeSearch={handlers.searchTerm}
            searchTerm={state.searchTerm}
            selectedNews={state.selectedNews}
        />
    );
}
