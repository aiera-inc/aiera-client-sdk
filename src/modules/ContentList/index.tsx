import React, { Fragment, MouseEventHandler, ReactElement, SyntheticEvent, useCallback } from 'react';
import gql from 'graphql-tag';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { getPrimaryQuote, useAutoTrack, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useInterval } from '@aiera/client-sdk/lib/hooks/useInterval';
import { Message, useMessageListener } from '@aiera/client-sdk/lib/msg';
import { Content } from '@aiera/client-sdk/modules/Content';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { ContentListQuery, ContentListQueryVariables, ContentType } from '@aiera/client-sdk/types/generated';
import './styles.css';

export type ContentListContent = ContentListQuery['content'][0];

interface ContentListSharedProps {}

/** @notExported */
export interface ContentListUIProps extends ContentListSharedProps {
    company?: CompanyFilterResult;
    content?: ContentListContent;
    contentListQuery: QueryResult<ContentListQuery, ContentListQueryVariables>;
    onBackFromContent?: MouseEventHandler;
    onChangeSearch?: ChangeHandler<string>;
    onSelectCompany?: ChangeHandler<CompanyFilterResult>;
    onSelectContent?: ChangeHandler<ContentListContent>;
    onSelectContentType?: ChangeHandler<ContentType>;
    searchTerm?: string;
    selectedContentType: ContentType;
}

export function ContentListUI(props: ContentListUIProps): ReactElement {
    const {
        company,
        content,
        contentListQuery,
        onBackFromContent,
        onChangeSearch,
        onSelectCompany,
        onSelectContent,
        onSelectContentType,
        searchTerm,
        selectedContentType,
    } = props;

    if (content) {
        return <Content contentId={content.id} contentType={selectedContentType} onBack={onBackFromContent} />;
    }

    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate: DateTime | null = null;
    return (
        <div className="h-full flex flex-col content-list">
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl content-list__header">
                <div className="flex items-center mb-3">
                    <Input
                        icon={<MagnifyingGlass />}
                        name="search"
                        onChange={onChangeSearch}
                        placeholder="Search News & Corp. Activity..."
                        value={searchTerm}
                    />
                    <div className="ml-2">
                        <CompanyFilterButton onChange={onSelectCompany} value={company} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll">
                <div className="flex flex-col flex-grow">
                    <div className="sticky top-0 px-3 pt-3 pb-2 z-10 content-list__tabs">
                        <div className="flex items-center pl-3 pr-1.5 h-9 bg-white rounded-lg shadow">
                            <Tabs<ContentType>
                                className="ml-1"
                                kind="line"
                                onChange={onSelectContentType}
                                options={[
                                    {
                                        label: 'News',
                                        value: ContentType.News,
                                    },
                                    {
                                        label: 'Corp. Activity',
                                        value: ContentType.Spotlight,
                                    },
                                ]}
                                value={selectedContentType}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        {match(contentListQuery)
                            .with({ status: 'loading' }, () => (
                                <ul className="w-full ContentList__loading">
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
                            .with({ status: 'paused' }, () => wrapMsg('There is no content.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading content.'))
                            .with({ status: 'empty' }, () => wrapMsg('There is no content.'))
                            .with({ status: 'success' }, ({ data: { content } }) => (
                                <ul className="w-full">
                                    {content.map((item) => {
                                        const primaryQuote = getPrimaryQuote(item.primaryCompany);
                                        const date = DateTime.fromISO(item.publishedDate);
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
                                            <Fragment key={item.id}>
                                                {divider}
                                                <li
                                                    className="group text-xs text-gray-300 px-3 cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                                                    onClick={(e) => onSelectContent?.(e, { value: item })}
                                                >
                                                    <div className="flex flex-1 flex-col justify-center min-w-0 p-2 pb-[2px] pr-4 text-sm">
                                                        <span className="mr-1 text-black">{item.title}</span>
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
                                                            </>
                                                        )}
                                                        <span className="pl-1 pr-1 text-gray-400">•</span>
                                                        <span className="text-gray-400">
                                                            {date.toFormat('MMM dd, yyyy')}
                                                        </span>
                                                        <span className="pl-1 pr-1 text-gray-400">•</span>
                                                        <span className="text-indigo-300">{item.source}</span>
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
export interface ContentListProps extends ContentListSharedProps {}

interface ContentListState {
    company?: CompanyFilterResult;
    content?: ContentListContent;
    searchTerm: string;
    selectedContentType: ContentType;
}

/**
 * Renders ContentList
 */
export function ContentList(_props: ContentListProps): ReactElement {
    const { state, handlers, setState } = useChangeHandlers<ContentListState>({
        company: undefined,
        content: undefined,
        searchTerm: '',
        selectedContentType: ContentType.News,
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

    const contentListQuery = useQuery<ContentListQuery, ContentListQueryVariables>({
        isEmpty: ({ content }) => (content || []).length === 0,
        query: gql`
            query ContentList($filter: ContentFilter!) {
                content(filter: $filter) {
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
        `,
        requestPolicy: 'cache-and-network',
        variables: {
            filter: {
                contentIds: [
                    '10486627',
                    '10486626',
                    '10486625',
                    '10486624',
                    '10486623',
                    '10486622',
                    '10486621',
                    '10486620',
                    '10486619',
                    '10486618',
                    '10486617',
                    '10486616',
                    '10486615',
                    '10486614',
                    '10486613',
                    '10486612',
                    '10486611',
                    '10486610',
                    '10486609',
                    '10486608',
                    '10486607',
                    '10486606',
                    '10486605',
                    '10486604',
                    '10486603',
                    '10486602',
                    '10486601',
                    '10486600',
                    '10486599',
                    '10486598',
                ],
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

    const onSelectContent = useCallback<ChangeHandler<ContentListContent>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value?.primaryCompany);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.content(event, change);
            // If we are going back to the content list, refresh immediately
            if (!change.value) {
                contentListQuery.refetch();
            }
        },
        [state]
    );

    useAutoTrack('Submit', 'Content Search', { searchTerm: state.searchTerm }, [state.searchTerm], !state.searchTerm);
    useInterval(
        useCallback(() => contentListQuery.refetch({ requestPolicy: 'cache-and-network' }), [contentListQuery.refetch]),
        15000
    );

    return (
        <ContentListUI
            company={state.company}
            content={state.content}
            contentListQuery={contentListQuery}
            onBackFromContent={useCallback(
                (event: SyntheticEvent<Element, Event>) => onSelectContent(event, { value: null }),
                [onSelectContent]
            )}
            onSelectCompany={onSelectCompany}
            onSelectContent={onSelectContent}
            onSelectContentType={handlers.selectedContentType}
            onChangeSearch={handlers.searchTerm}
            searchTerm={state.searchTerm}
            selectedContentType={state.selectedContentType}
        />
    );
}
