import React, {
    ReactElement,
    useRef,
    useState,
    Ref,
    RefObject,
    Dispatch,
    SetStateAction,
    useLayoutEffect,
    MouseEvent,
} from 'react';
import gql from 'graphql-tag';
import { match } from 'ts-pattern';
import classNames from 'classnames';

import { useElementListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { CompanyFilterQuery, CompanyFilterQueryVariables } from '@aiera/client-sdk/types/generated';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { useAutoScroll } from '@aiera/client-sdk/lib/hooks/useAutoScroll';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Input } from '@aiera/client-sdk/components/Input';
import { Button } from '@aiera/client-sdk/components/Button';
import { Building } from '@aiera/client-sdk/components/Svg/Building';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import './styles.css';

export type CompanyFilterResult = CompanyFilterQuery['companies'][0];

interface SearchTerm {
    searchTerm: string;
}

/** @notExported */
interface CompanyFilterButtonSharedProps {
    onChange?: ChangeHandler<CompanyFilterResult>;
    value?: CompanyFilterResult;
}

/** @notExported */
interface CompanyFilterButtonUIProps extends CompanyFilterButtonSharedProps {
    inputRef: RefObject<HTMLInputElement>;
    companiesQuery: QueryResult<CompanyFilterQuery, CompanyFilterQueryVariables>;
    companiesLoading?: boolean;
    hideTooltip?: (event?: MouseEvent) => void;
    onSearchChange: ChangeHandler<string>;
    scrollRef: Ref<HTMLDivElement>;
    searchTerm: string;
    selectedIndex: number;
    selectIndex: (index: number) => void;
    selectedOptionRef: Ref<HTMLDivElement>;
    setState: Dispatch<SetStateAction<SearchTerm>>;
}

function TooltipContentUI(props: CompanyFilterButtonUIProps): ReactElement {
    const {
        companiesQuery,
        hideTooltip,
        inputRef,
        onChange,
        onSearchChange,
        scrollRef,
        selectedIndex,
        selectIndex,
        searchTerm,
        selectedOptionRef,
    } = props;

    const wrapMsg = (msg: string) => (
        <div className="flex flex-1 items-center justify-center text-gray-600 mb-5">{msg}</div>
    );

    return (
        <div className="shadow-md bg-white rounded-lg w-72 overflow-hidden">
            <div className="p-3 w-full">
                <Input
                    clearable
                    inputRef={inputRef}
                    autoFocus
                    icon={<MagnifyingGlass />}
                    name="company-filter-button-search"
                    placeholder="Search..."
                    onChange={onSearchChange}
                    value={searchTerm}
                />
            </div>
            <div className="flex flex-col max-h-[270px] min-h-[80px] overflow-y-scroll" ref={scrollRef}>
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
                                            'flex items-center h-9 text-gray-900 tracking-wide cursor-pointer',
                                            {
                                                'odd:bg-gray-100': selectedIndex !== index,
                                                'bg-blue-500': selectedIndex === index,
                                                'text-white': selectedIndex === index,
                                            }
                                        )}
                                        key={company.id}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onChange?.(event, { value: company });
                                            hideTooltip?.();
                                        }}
                                        onMouseEnter={() => selectIndex(index)}
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
        </div>
    );
}

function TooltipContent(props: CompanyFilterButtonUIProps): ReactElement {
    const { hideTooltip, companiesQuery, selectedIndex, selectIndex, onChange, inputRef, setState } = props;

    // Need to be able to hide the tooltip on keypress.
    useElementListener(
        'keydown',
        (event) => {
            const key = event?.key;

            match(companiesQuery)
                .with({ status: 'success' }, ({ data: { companies } }) => {
                    match(key)
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
                                setState({ searchTerm: '' });
                                hideTooltip?.();
                            }
                        })
                        .otherwise(() => true);
                })
                .otherwise(() => true);
        },
        inputRef
    );

    return <TooltipContentUI {...props} />;
}

export function CompanyFilterButtonUI(props: CompanyFilterButtonUIProps): ReactElement {
    const { onChange, setState, selectIndex, value } = props;
    return (
        <div>
            <Tooltip
                content={({ hideTooltip }) => <TooltipContent hideTooltip={hideTooltip} {...props} />}
                grow="down-left"
                modal
                openOn="click"
                onClose={() => {
                    selectIndex(0);
                    setState({ searchTerm: '' });
                }}
                position="bottom-right"
                yOffset={5}
            >
                <Button
                    className={classNames('max-w-[130px]')}
                    kind={value ? 'default' : 'secondary'}
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
                        <div className="flex items-center whitespace-nowrap text-sm font-normal">
                            <Building alt="building" className="mr-2" />
                            By Company
                        </div>
                    )}
                    {value && (
                        <>
                            <div className="text-black font-bold">{getPrimaryQuote(value)?.localTicker}</div>
                            <div className="text-black font-light truncate mx-2">{value.commonName}</div>
                            <div className="w-4 text-black flex-shrink-0">
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

    const [selectedIndex, selectIndex] = useState(0);
    const { state, handlers, setState } = useChangeHandlers({ searchTerm: '' });
    const inputRef = useRef<HTMLInputElement>(null);
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
            searchTerm: state.searchTerm,
        },
        pause: !state.searchTerm,
    });

    // Keep option in view when scrolling by keyboard
    const { scrollContainerRef, target, targetRef: selectedOptionRef, scroll } = useAutoScroll<HTMLDivElement>({ skip: true });
        useLayoutEffect(() => {
            scroll({ onlyIfNeeded: true });
        }, [target]);
    // const selectedOptionRef = useRef<HTMLDivElement>(null);
    // const scrollContainerRef = useRef<HTMLDivElement>(null);
    // useLayoutEffect(() => {
    //     if (selectedOptionRef.current && scrollContainerRef.current) {
    //         const containerPos = scrollContainerRef.current.getBoundingClientRect();
    //         const optionPos = selectedOptionRef.current.getBoundingClientRect();

    //         // Scroll into view if visibility is obstructed
    //         const optionTopObstructed = optionPos.top < containerPos.top;
    //         const optionBottomObstructed = containerPos.top + containerPos.height < optionPos.top + optionPos.height;

    //         if (optionTopObstructed || optionBottomObstructed) selectedOptionRef.current.scrollIntoView();
    //     }
    // }, [selectedOptionRef?.current, scrollContainerRef?.current]);

    return (
        <CompanyFilterButtonUI
            companiesQuery={companiesQuery}
            inputRef={inputRef}
            onChange={onChange}
            onSearchChange={handlers.searchTerm}
            value={value}
            scrollRef={scrollContainerRef}
            searchTerm={state.searchTerm}
            selectIndex={selectIndex}
            selectedIndex={selectedIndex}
            selectedOptionRef={selectedOptionRef}
            setState={setState}
        />
    );
}
