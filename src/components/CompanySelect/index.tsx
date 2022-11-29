import React, { MouseEvent, ReactElement, Ref, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { CompanyFilterQuery, CompanyFilterQueryVariables } from '@aiera/client-sdk/types/generated';
import './styles.css';

export type CompanyFilterResult = CompanyFilterQuery['companies'][0];

interface CompanySelectSharedProps {
    autoFocus?: boolean;
    className?: string;
    name?: string;
    onChange?: ChangeHandler<CompanyFilterResult>;
    onChangeSearchTerm: ChangeHandler<string>;
    onSelectCompany?: (event?: MouseEvent) => void;
    searchTerm?: string;
}

/** @notExported */
interface CompanySelectUIProps extends CompanySelectSharedProps {
    companiesLoading?: boolean;
    companiesQuery: QueryResult<CompanyFilterQuery, CompanyFilterQueryVariables>;
    scrollRef: Ref<HTMLDivElement>;
    searchTerm: string;
    selectedIndex: number;
    selectedOptionRef: Ref<HTMLDivElement>;
    selectIndex: (index: number) => void;
}

export function CompanySelectUI(props: CompanySelectUIProps): ReactElement {
    const {
        autoFocus = false,
        className = '',
        companiesQuery,
        name = 'company-select__search',
        onChange,
        onChangeSearchTerm,
        onSelectCompany,
        scrollRef,
        searchTerm,
        selectedIndex,
        selectedOptionRef,
        selectIndex,
    } = props;

    const wrapMsg = (msg: string) => (
        <div className="flex flex-1 items-center justify-center text-gray-600 mb-5">{msg}</div>
    );

    return (
        <div
            className={`shadow-md bg-white rounded-lg w-72 overflow-hidden dark:bg-bluegray-6 company-select ${className}`}
        >
            <div className="p-3 w-full company-select__search-container">
                <Input
                    autoFocus={autoFocus}
                    clearable
                    icon={<MagnifyingGlass />}
                    name={name}
                    onChange={onChangeSearchTerm}
                    placeholder="Search..."
                    value={searchTerm}
                />
            </div>
            {!!searchTerm && (
                <div
                    className="flex flex-col max-h-[270px] min-h-[80px] overflow-y-scroll company-select__results-container"
                    ref={scrollRef}
                >
                    {match(companiesQuery)
                        .with({ status: 'loading' }, () => wrapMsg('Loading...'))
                        .with({ status: 'paused' }, () => wrapMsg('Type to search...'))
                        .with({ status: 'error' }, () => wrapMsg('There was an error searching.'))
                        .with({ status: 'empty' }, () => wrapMsg('No results.'))
                        .with({ status: 'success' }, ({ data: { companies } }) => (
                            <div className="flex-1">
                                {companies.map((company, index) => {
                                    const primaryQuote = getPrimaryQuote(company);
                                    return (
                                        <div
                                            className={classNames(
                                                'flex items-center h-9 tracking-wide cursor-pointer focus:outline-none',
                                                {
                                                    'odd:bg-gray-100 dark:odd:bg-bluegray-5': selectedIndex !== index,
                                                    'bg-blue-500': selectedIndex === index,
                                                    'text-white': selectedIndex === index,
                                                    'text-gray-900 dark:text-white': selectedIndex !== index,
                                                }
                                            )}
                                            key={company.id}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onChange?.(event, { value: company });
                                                onSelectCompany?.();
                                            }}
                                            onMouseEnter={() => selectIndex(index)}
                                            tabIndex={0}
                                            onFocus={() => selectIndex(index)}
                                            ref={selectedIndex === index ? selectedOptionRef : undefined}
                                        >
                                            <div className="pl-4 truncate flex-1 text-base">{company.commonName}</div>
                                            <div className="w-20 pl-3 truncate font-semibold text-right text-sm">
                                                {primaryQuote?.localTicker}
                                            </div>
                                            <div className="w-20 pl-3 pr-4 truncate text-gray-300 text-sm">
                                                {primaryQuote?.exchange?.shortName}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                        .exhaustive()}
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface CompanySelectProps extends CompanySelectSharedProps {}

/**
 * Renders CompanySelect
 */
export function CompanySelect(props: CompanySelectProps): ReactElement {
    const { autoFocus, className, name, onChange, onChangeSearchTerm, onSelectCompany, searchTerm = '' } = props;
    const [selectedIndex, selectIndex] = useState(0);
    const companiesQuery = useQuery<CompanyFilterQuery, CompanyFilterQueryVariables>({
        isEmpty: ({ companies }) => companies.length === 0,
        query: gql`
            query CompanyFilter($searchTerm: String) {
                companies(filter: { searchTerm: $searchTerm }) {
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
            }
        `,
        variables: { searchTerm },
        pause: !searchTerm,
    });

    // Keyboard controls
    useWindowListener('keydown', (event) => {
        const key = event?.key;
        match(companiesQuery)
            .with({ status: 'success' }, ({ data: { companies } }) => {
                if (companies.length > 0) {
                    match(key)
                        .with('Tab', () => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (event.shiftKey) {
                                if (selectedIndex > 0) selectIndex(selectedIndex - 1);
                            } else {
                                if (selectedIndex < companies.length - 1) selectIndex(selectedIndex + 1);
                            }
                        })
                        .with('ArrowUp', () => {
                            if (selectedIndex > 0) selectIndex(selectedIndex - 1);
                        })
                        .with('ArrowDown', () => {
                            if (selectedIndex < companies.length - 1) selectIndex(selectedIndex + 1);
                        })
                        .with('Enter', () => {
                            if (companies.length && companies[selectedIndex]) {
                                selectIndex(0);
                                onChange?.(event, { value: companies[selectedIndex] });
                                onChangeSearchTerm(event, { value: '' });
                                onSelectCompany?.();
                            }
                        })
                        .otherwise(() => true);
                }
            })
            .otherwise(() => true);
    });

    // Auto-scrolling to keep results in view
    const selectedOptionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (selectedOptionRef.current && scrollContainerRef.current) {
            const containerPos = scrollContainerRef.current.getBoundingClientRect();
            const optionPos = selectedOptionRef.current.getBoundingClientRect();

            // Scroll into view if visibility is obstructed
            const optionTopObstructed = optionPos.top < containerPos.top;
            const optionBottomObstructed = containerPos.top + containerPos.height < optionPos.top + optionPos.height;

            if (optionTopObstructed || optionBottomObstructed) selectedOptionRef.current.scrollIntoView();
        }
    }, [selectedOptionRef?.current, scrollContainerRef?.current]);

    return (
        <CompanySelectUI
            autoFocus={autoFocus}
            className={className}
            companiesQuery={companiesQuery}
            name={name}
            onChange={onChange}
            onChangeSearchTerm={onChangeSearchTerm}
            onSelectCompany={onSelectCompany}
            scrollRef={scrollContainerRef}
            searchTerm={searchTerm}
            selectedIndex={selectedIndex}
            selectedOptionRef={selectedOptionRef}
            selectIndex={selectIndex}
        />
    );
}
