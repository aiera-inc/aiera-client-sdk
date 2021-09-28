import React, { FormEvent, ReactElement, useCallback, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import classNames from 'classnames';

import { ChangeHandler } from '@aiera/client-sdk/types';
import { CompanyFilterQuery, CompanyFilterQueryVariables } from '@aiera/client-sdk/types/generated';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Building } from '@aiera/client-sdk/components/Svg/Building';
import './styles.css';

export type CompanyFilterResult = CompanyFilterQuery['companies'][0];

/** @notExported */
interface CompanyFilterButtonSharedProps {
    onChange?: ChangeHandler<CompanyFilterResult>;
    value?: CompanyFilterResult;
}

/** @notExported */
interface CompanyFilterButtonUIProps extends CompanyFilterButtonSharedProps {
    companies: CompanyFilterQuery['companies'];
    companiesLoading?: boolean;
    hideTooltip?: () => void;
    onSearchChange: (event: FormEvent<HTMLInputElement>) => void;
}

function TooltipContent(props: CompanyFilterButtonUIProps): ReactElement {
    const { companies, companiesLoading, hideTooltip, onChange, onSearchChange } = props;
    return (
        <div className="shadow-md bg-white rounded-lg w-80">
            <div className="p-3 w-full">
                <input
                    className="p-2 w-full text-sm rounded-md border border-gray-200"
                    placeholder="Search..."
                    onChange={onSearchChange}
                />
            </div>
            <div className="max-h-52 overflow-y-scroll">
                {companiesLoading && 'Loading...'}
                {!companiesLoading &&
                    !!companies.length &&
                    companies.map((company) => {
                        const primaryQuote = getPrimaryQuote(company);
                        return (
                            <div
                                className="flex items-center odd:bg-gray-100 h-12 text-gray-900 tracking-wide"
                                key={company.id}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChange?.(event, { value: company });
                                    hideTooltip?.();
                                }}
                            >
                                <div className="pl-4 truncate flex-1">{company.commonName}</div>
                                <div className="w-20 pl-3 truncate font-semibold text-right text-sm">
                                    {primaryQuote?.localTicker}
                                </div>
                                <div className="w-20 pl-3 pr-4 truncate text-gray-300 text-sm">
                                    {primaryQuote?.exchange?.shortName}
                                </div>
                            </div>
                        );
                    })}
                {!companiesLoading && !companies.length && 'No results.'}
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
                xOffset={5}
                yOffset={5}
            >
                <button
                    className={classNames('p-2 rounded-lg', {
                        'bg-gray-200': !value,
                        'bg-blue-800': !!value,
                    })}
                >
                    {!value && (
                        <div className="flex whitespace-nowrap">
                            <Building alt="building" className="mr-2" />
                            By Company
                        </div>
                    )}
                    {value && (
                        <div
                            className="flex text-sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                onChange?.(event, { value: null });
                            }}
                        >
                            <div className="text-white font-bold mr-2">{getPrimaryQuote(value)?.localTicker}</div>
                            <div className="text-white truncate">{value.commonName}</div>
                            <div className="font-bold rounded-full bg-white">X</div>
                        </div>
                    )}
                </button>
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

    const [companyResults] = useQuery<CompanyFilterQuery, CompanyFilterQueryVariables>({
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

    const companies = companyResults.data?.companies || [];

    return (
        <CompanyFilterButtonUI
            companies={companies}
            companiesLoading={companyResults.fetching}
            onChange={onChange}
            onSearchChange={onSearchChange}
            value={value}
        />
    );
}
