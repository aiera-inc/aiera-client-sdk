import React, { Fragment, MouseEventHandler, ReactElement, SyntheticEvent, useCallback } from 'react';
import gql from 'graphql-tag';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { CONTENT_SOURCE_LABELS, getPrimaryQuote, useAutoTrack, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { Message, useMessageListener } from '@aiera/client-sdk/lib/msg';
import { News } from '@aiera/client-sdk/modules/News';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { NewsListQuery, NewsListQueryVariables, ContentType } from '@aiera/client-sdk/types/generated';
import './styles.css';

export type NewsListNews = NewsListQuery['search']['content']['hits'][0]['content'];

interface NewsListSharedProps {}

/** @notExported */
export interface NewsListUIProps extends NewsListSharedProps {
    company?: CompanyFilterResult;
    newsListQuery: QueryResult<NewsListQuery, NewsListQueryVariables>;
    onBackFromNews?: MouseEventHandler;
    onChangeSearch?: ChangeHandler<string>;
    onSelectCompany?: ChangeHandler<CompanyFilterResult>;
    onSelectNews?: ChangeHandler<NewsListNews>;
    searchTerm?: string;
    selectedNews?: NewsListNews;
}

export function NewsListUI(props: NewsListUIProps): ReactElement {
    const {
        company,
        newsListQuery,
        onBackFromNews,
        onChangeSearch,
        onSelectCompany,
        onSelectNews,
        searchTerm,
        selectedNews,
    } = props;

    if (selectedNews) {
        return <News newsId={selectedNews.id} onBack={onBackFromNews} />;
    }

    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate: DateTime | null = null;
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
                                <ul className="w-full NewsList__loading">
                                    {new Array(15).fill(0).map((_, idx) => (
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
                                    ))}
                                </ul>
                            ))
                            .with({ status: 'paused' }, () => wrapMsg('There is no news.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading news.'))
                            .with({ status: 'empty' }, () => wrapMsg('There is no news.'))
                            .with({ status: 'success' }, ({ data }) => (
                                <ul className="w-full">
                                    {data.search.content.hits.map((hit) => {
                                        const { content, id: newsId } = hit;
                                        const primaryQuote = getPrimaryQuote(content.primaryCompany);
                                        const date = DateTime.fromISO(content.publishedDate);
                                        let divider = null;
                                        if (
                                            !prevEventDate ||
                                            prevEventDate.toFormat('MM/dd/yyyy') !== date.toFormat('MM/dd/yyyy')
                                        ) {
                                            prevEventDate = date;
                                            divider = (
                                                <li className="sticky top-[56px] backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 px-1 py-2 font-semibold mx-3">
                                                    {date.toFormat('DDDD')}
                                                    <div className="ml-2 w-full flex h-[1px] bg-gradient-to-r from-gray-200" />
                                                </li>
                                            );
                                        }
                                        return (
                                            <Fragment key={newsId}>
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
                                                        <span className="pl-1 pr-1 text-gray-400">•</span>
                                                        <span className="text-indigo-300">
                                                            {CONTENT_SOURCE_LABELS[content.source] || content.source}
                                                        </span>
                                                    </div>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                </ul>
                            ))
                            .exhaustive()}
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface NewsListProps extends NewsListSharedProps {}

interface NewsListState {
    company?: CompanyFilterResult;
    searchTerm: string;
    selectedNews?: NewsListNews;
}

/**
 * Renders NewsList
 */
export function NewsList(_props: NewsListProps): ReactElement {
    const { state, handlers, setState } = useChangeHandlers<NewsListState>({
        company: undefined,
        searchTerm: '',
        selectedNews: undefined,
    });
    const resolveCompany = useCompanyResolver();
    const bus = useMessageListener(
        'instrument-selected',
        async (msg: Message<'instrument-selected'>) => {
            if (msg.data.ticker) {
                const companies = await resolveCompany(msg.data.ticker);
                if (companies?.[0]) {
                    const company = companies[0];
                    setState((s) => ({ ...s, company }));
                }
            }
        },
        'in'
    );
    const newsListQuery = useQuery<NewsListQuery, NewsListQueryVariables>({
        isEmpty: ({ search }) => search.content.numTotalHits === 0,
        query: gql`
            query NewsList($filter: ContentSearchFilter!) {
                search {
                    content(filter: $filter) {
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
                                source
                                title
                            }
                        }
                    }
                }
            }
        `,
        requestPolicy: 'cache-and-network',
        variables: {
            filter: {
                companyIds: state.company ? [state.company.id] : undefined,
                contentTypes: [ContentType.News],
                searchTerm: state.searchTerm,
            },
        },
    });

    const onSelectCompany = useCallback<ChangeHandler<CompanyFilterResult>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.company(event, change);
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

    useAutoTrack('Submit', 'News Search', { searchTerm: state.searchTerm }, [state.searchTerm], !state.searchTerm);
    useInterval(
        useCallback(() => newsListQuery.refetch({ requestPolicy: 'cache-and-network' }), [newsListQuery.refetch]),
        15000
    );

    return (
        <NewsListUI
            company={state.company}
            newsListQuery={newsListQuery}
            onBackFromNews={useCallback(
                (event: SyntheticEvent<Element, Event>) => onSelectNews(event, { value: null }),
                [onSelectNews]
            )}
            onSelectCompany={onSelectCompany}
            onSelectNews={onSelectNews}
            onChangeSearch={handlers.searchTerm}
            searchTerm={state.searchTerm}
            selectedNews={state.selectedNews}
        />
    );
}
