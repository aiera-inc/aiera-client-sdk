import React, { FormEvent, ReactElement, useCallback, useState } from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import classNames from 'classnames';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { CompanyFilterQuery, CompanyFilterQueryVariables } from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Button } from '@aiera/client-sdk/components/Button';
import { Building } from '@aiera/client-sdk/components/Svg/Building';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import './styles.css';

export type CompanyFilterResult = CompanyFilterQuery['companies'][0];

/** @notExported */
interface CompanyFilterButtonSharedProps {
    onChange?: ChangeHandler<CompanyFilterResult>;
    value?: CompanyFilterResult;
}

/** @notExported */
interface CompanyFilterButtonUIProps extends CompanyFilterButtonSharedProps {
    companiesQuery: QueryResult<CompanyFilterQuery, CompanyFilterQueryVariables>;
    companiesLoading?: boolean;
    hideTooltip?: () => void;
    onSearchChange: (event: FormEvent<HTMLInputElement>) => void;
}

function TooltipContent(props: CompanyFilterButtonUIProps): ReactElement {
    const { companiesQuery, hideTooltip, onChange, onSearchChange } = props;
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    return (
        <div className="shadow-md bg-white rounded-lg w-72 overflow-hidden">
            <div className="p-3 w-full">
                <input
                    autoFocus
                    className="p-2 w-full text-sm rounded-md border border-gray-200"
                    placeholder="Search..."
                    onChange={onSearchChange}
                />
            </div>
            <div className="flex flex-col max-h-52 min-h-[80px] overflow-y-scroll">
                {match(companiesQuery)
                    .with({ status: 'loading' }, () => wrapMsg('Loading...'))
                    .with({ status: 'paused' }, () => wrapMsg('Type to search...'))
                    .with({ status: 'error' }, () => wrapMsg('There was an error searching.'))
                    .with({ status: 'empty' }, () => wrapMsg('No results.'))
                    .with({ status: 'success' }, ({ data: { companies } }) => (
                        <div className="flex-1">
                            {companies.map((company) => {
                                const primaryQuote = getPrimaryQuote(company);
                                return (
                                    <div
                                        className="flex items-center h-10 odd:bg-gray-100 text-gray-900 tracking-wide cursor-pointer"
                                        key={company.id}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onChange?.(event, { value: company });
                                            hideTooltip?.();
                                        }}
                                    >
                                        <div className="pl-4 truncate flex-1 text-md">{company.commonName}</div>
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
        </div>
    );
}

export function CompanyFilterButtonUI(props: CompanyFilterButtonUIProps): ReactElement {
    const { onChange, value } = props;
    return (
        <div>
            <Tooltip
                content={({ hideTooltip }) => <TooltipContent hideTooltip={hideTooltip} {...props} />}
                grow="down-left"
                modal
                openOn="click"
                position="bottom-right"
                yOffset={5}
            >
                <Button
                    className={classNames('max-w-[130px]')}
                    kind={value ? 'primary' : 'default'}
                    onClick={
                        value
                            ? (event) => {
                                  event.stopPropagation();
                                  onChange?.(event, { value: null });
                              }
                            : undefined
                    }
                >
                    {!value && (
                        <div className="flex items-center whitespace-nowrap text-base">
                            <Building alt="building" className="mr-2" />
                            By Company
                        </div>
                    )}
                    {value && (
                        <>
                            <div className="text-white font-bold">{getPrimaryQuote(value)?.localTicker}</div>
                            <div className="text-white font-light truncate mx-2">{value.commonName}</div>
                            <div className="w-4 text-white flex-shrink-0">
                                <Close />
                            </div>
                        </>
                    )}
                </Button>
            </Tooltip>
        </div>
    );
}

/** @notExported */
export interface CompanyFilterButtonProps extends CompanyFilterButtonSharedProps {}

/**
 * Renders CompanyFilterButton
 */
export function CompanyFilterButton(props: CompanyFilterButtonProps): ReactElement {
    const { onChange, value } = props;

    const [searchTerm, setSearchTerm] = useState<string>('');

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
        variables: {
            searchTerm,
        },
        pause: !searchTerm,
    });

    const onSearchChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        setSearchTerm(event.currentTarget.value);
    }, []);

    return (
        <CompanyFilterButtonUI
            companiesQuery={companiesQuery}
            onChange={onChange}
            onSearchChange={onSearchChange}
            value={value}
        />
    );
}
