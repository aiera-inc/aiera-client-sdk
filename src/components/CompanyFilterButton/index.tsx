import React, { Dispatch, MouseEvent, ReactElement, SetStateAction, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@aiera/client-sdk/components/Button';
import { CompanySelect } from '@aiera/client-sdk/components/CompanySelect';
import { Building } from '@aiera/client-sdk/components/Svg/Building';
import { Close } from '@aiera/client-sdk/components/Svg/Close';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers, ChangeHandler } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { CompanyFilterQuery } from '@aiera/client-sdk/types/generated';
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
    hideTooltip?: (event?: MouseEvent) => void;
    onChangeSearchTerm: ChangeHandler<string>;
    searchTerm: string;
    selectedIndex: number;
    selectIndex: (index: number) => void;
    setState: Dispatch<SetStateAction<SearchTerm>>;
}

export function CompanyFilterButtonUI(props: CompanyFilterButtonUIProps): ReactElement {
    const { onChange, onChangeSearchTerm, searchTerm, selectIndex, setState, value } = props;
    return (
        <div className="button__company-filter">
            <Tooltip
                content={({ hideTooltip }) => (
                    <CompanySelect
                        autoFocus
                        onChange={onChange}
                        onChangeSearchTerm={onChangeSearchTerm}
                        onSelectCompany={hideTooltip}
                        searchTerm={searchTerm}
                    />
                )}
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
                            Company
                        </div>
                    )}
                    {value && (
                        <>
                            <div className="font-bold">{getPrimaryQuote(value)?.localTicker}</div>
                            <div className="font-light truncate mx-2">{value.commonName}</div>
                            <div className="w-4 flex-shrink-0">
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
    const [selectedIndex, selectIndex] = useState(0);
    const { state, handlers, setState } = useChangeHandlers({ searchTerm: '' });
    const { onChange, value } = props;
    return (
        <CompanyFilterButtonUI
            onChange={onChange}
            onChangeSearchTerm={handlers.searchTerm}
            value={value}
            searchTerm={state.searchTerm}
            selectedIndex={selectedIndex}
            selectIndex={selectIndex}
            setState={setState}
        />
    );
}
