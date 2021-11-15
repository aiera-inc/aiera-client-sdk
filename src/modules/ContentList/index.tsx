import React, { Fragment, ReactElement, ReactNode, useCallback } from 'react';
import { DateTime } from 'luxon';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { CompanyFilterButton, CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Tabs } from '@aiera/client-sdk/components/Tabs';
import { getPrimaryQuote, useCompanyResolver } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { Message, useMessageListener } from '@aiera/client-sdk/lib/msg';
import './styles.css';

enum ContentType {
    news,
    corporateActivity,
}

interface ContentListSharedProps {
    children?: ReactNode;
}

/** @notExported */
export interface ContentListUIProps extends ContentListSharedProps {
    company?: CompanyFilterResult;
    onChangeSearch?: ChangeHandler<string>;
    onSelectCompany?: ChangeHandler<CompanyFilterResult>;
    onSelectContentType?: ChangeHandler<ContentType>;
    searchTerm?: string;
    selectedContentType?: ContentType;
}

const mockData = [
    {
        id: 1,
        date: '2021-10-22',
        companyIdentifier: 'NFLX',
        exchangeName: 'NASDAQ',
        sourceName: 'Alliance',
        title: 'BBC and Netflix Form Partnership to Develop and Co-Produce Shows From Disabled Creatives',
    },
    {
        id: 2,
        date: '2021-10-22',
        companyIdentifier: 'TSLA',
        exchangeName: 'NYSE',
        sourceName: 'Lexus Nexus',
        title: 'Elon Musk Bets Entire Equity Position of Tesla Against Gourd Futures',
    },
    {
        id: 3,
        date: '2021-10-22',
        companyIdentifier: 'FB',
        exchangeName: 'NASDAQ',
        sourceName: 'Refinitiv',
        title: 'Zuckbot Caught eSurfing Off the Cost of Belize',
    },
    {
        id: 4,
        date: '2021-10-21',
        companyIdentifier: 'GME',
        exchangeName: 'NYSE',
        sourceName: 'Benzinga',
        title: 'Famous Stonk Stonking Again As Retail Investors (aka Ape) Stop Eyeing the Moon and Shoot for Andromeda',
    },
    {
        id: 5,
        date: '2021-10-21',
        companyIdentifier: 'AMC',
        exchangeName: 'NASDAQ',
        sourceName: 'Alliance',
        title: 'Aging Theater Chain Saved Again as Retail Investors Continue to Pour Millions of Dollars into Stock',
    },
    {
        id: 6,
        date: '2021-10-20',
        companyIdentifier: 'UBER',
        exchangeName: 'NASDAQ',
        sourceName: 'Reuters',
        title: 'Uber Bans Eating Inside Vehicles In Continued Effort to Minimize Vomiting Incidents',
    },
    {
        id: 7,
        date: '2021-10-20',
        companyIdentifier: 'BARK',
        exchangeName: 'NYSE',
        sourceName: 'Benzinga',
        title: 'Why does Barkbox stock continue to slide, despite strong earnings?',
    },
    {
        id: 8,
        date: '2021-10-18',
        companyIdentifier: 'TLRY',
        exchangeName: 'TORONTO',
        sourceName: 'Alliance',
        title:
            'Tilray Looking to Breakout Out of Sideways Trading as Cannabis Superstonk Beats Market for Second ' +
            'Straight Week',
    },
    {
        id: 9,
        date: '2021-10-18',
        companyIdentifier: 'NFLX',
        exchangeName: 'NASDAQ',
        sourceName: 'Alliance',
        title: 'Netflix Buys Rights to Ted Lasso from Apple',
    },
    {
        id: 10,
        date: '2021-10-18',
        companyIdentifier: 'AAPL',
        exchangeName: 'NASDAQ',
        sourceName: 'Alliance',
        title: 'How much wood could Tim Apple chuck if Tim Apple could chuck wood?',
    },
    {
        id: 11,
        date: '2021-10-15',
        companyIdentifier: 'DIS',
        exchangeName: 'NYSE',
        sourceName: 'Lexus Nexus',
        title: 'Disney Buys HBO Max to Release Streaming Megasite, Disney MAX',
    },
];

export function ContentListUI(props: ContentListUIProps): ReactElement {
    const { company, onChangeSearch, onSelectCompany, onSelectContentType, searchTerm, selectedContentType } = props;
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
                                        value: ContentType.news,
                                    },
                                    {
                                        label: 'Corp. Activity',
                                        value: ContentType.corporateActivity,
                                    },
                                ]}
                                value={selectedContentType}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <ul className="w-full">
                            {mockData.map((item) => {
                                const date = DateTime.fromISO(item.date);
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
                                        <li className="group text-xs text-gray-300 px-3 cursor-pointer hover:bg-blue-50 active:bg-blue-100">
                                            <div className="flex flex-1 flex-col justify-center min-w-0 p-2 pb-[2px] pr-4 text-sm">
                                                <span className="mr-1 text-black">{item.title}</span>
                                            </div>
                                            <div className="flex flex-1 items-center min-w-0 p-2 pr-4 pt-0">
                                                <span className="font-bold pr-1 text-blue-600 group-hover:text-yellow-600">
                                                    {item.companyIdentifier}
                                                </span>
                                                <span className="font-light text-gray-300 group-hover:text-gray-400">
                                                    {item.exchangeName}
                                                </span>
                                                <span className="pl-1 pr-1 text-gray-400">•</span>
                                                <span className="text-gray-400">{date.toFormat('MMM dd, yyyy')}</span>
                                                <span className="pl-1 pr-1 text-gray-400">•</span>
                                                <span className="text-indigo-300">{item.sourceName}</span>
                                            </div>
                                        </li>
                                    </Fragment>
                                );
                            })}
                        </ul>
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
    searchTerm: string;
    selectedContentType: ContentType;
}

/**
 * Renders ContentList
 */
export function ContentList(): ReactElement {
    const { state, handlers, setState } = useChangeHandlers<ContentListState>({
        company: undefined,
        searchTerm: '',
        selectedContentType: ContentType.news,
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

    const onSelectCompany = useCallback<ChangeHandler<CompanyFilterResult>>(
        (event, change) => {
            const primaryQuote = getPrimaryQuote(change.value);
            bus?.emit('instrument-selected', { ticker: primaryQuote?.localTicker }, 'out');
            handlers.company(event, change);
        },
        [state]
    );

    return (
        <ContentListUI
            company={state.company}
            onSelectCompany={onSelectCompany}
            onSelectContentType={handlers.selectedContentType}
            onChangeSearch={handlers.searchTerm}
            searchTerm={state.searchTerm}
            selectedContentType={state.selectedContentType}
        />
    );
}
