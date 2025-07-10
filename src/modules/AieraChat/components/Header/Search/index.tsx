import classNames from 'classnames';
import debounce from 'lodash.debounce';
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { MicroSearch } from '@aiera/client-sdk/components/Svg/MicroSearch';
import { useChatStore } from '../../../store';
import { IconButton } from '../../IconButton';
import { UseSearchReturn } from '../../../services/search';

export function Search({
    onChangeTitle,
    searchHook,
}: {
    onChangeTitle: (title: string) => void;
    searchHook: UseSearchReturn;
}) {
    const { chatId, chatTitle, onSetTitle } = useChatStore();
    const [showSearch, setShowSearch] = useState(false);
    const [_, setInFocus] = useState(false);

    // Destructure search hook
    const { searchTerm, onSearchTermChange, onNextMatch, onPrevMatch, currentMatchIndex, totalMatches, clearSearch } =
        searchHook;

    // Debounce calling the mutation with each change
    const debouncedTitleChange = useCallback(
        debounce((title: string) => {
            onChangeTitle(title);
        }, 300),
        [onChangeTitle]
    );

    // Cleanup the debounced function on component unmount
    useEffect(() => {
        return () => {
            debouncedTitleChange.cancel();
        };
    }, [debouncedTitleChange]);

    const onCloseSearch = useCallback(() => {
        setShowSearch(false);
        clearSearch();
    }, [clearSearch]);

    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape') {
                onCloseSearch();
            }
        },
        [onCloseSearch]
    );

    const onFocus = useCallback(() => setInFocus(true), []);
    const onBlur = useCallback(() => setInFocus(false), []);

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const term = e.target.value;
            onSearchTermChange(term);
        },
        [onSearchTermChange]
    );

    // Close search when starting new chat
    useEffect(() => {
        clearSearch();
        setShowSearch(false);
    }, [chatId, clearSearch]);

    return showSearch ? (
        <div className="bg-slate-200 relative rounded-lg h-[1.875rem] flex-1 flex items-center">
            <input
                value={searchTerm ?? ''}
                key="searchInput"
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                onChange={onChange}
                type="text"
                autoFocus
                placeholder="Search Chat..."
                className="bg-transparent z-10 antialiased text-base font-medium outline-none absolute inset-0 leading-[1.875rem] pl-2.5"
            />
            {searchTerm && searchTerm.length > 0 && (
                <>
                    <p
                        className={classNames(
                            'absolute pointer-events-none left-1.5 antialiased',
                            'px-1 top-1.5 font-medium bottom-1.5 leading-[1.125rem]',
                            'text-base bg-yellow-400 text-transparent rounded-md'
                        )}
                    >
                        {searchTerm}
                    </p>
                    <div className="absolute z-20 top-0 bottom-0 right-8 flex text-sm text-slate-600">
                        {totalMatches > 0 ? (
                            <p className="mr-2 text-center font-mono flex items-center">
                                {currentMatchIndex} / {totalMatches}
                            </p>
                        ) : (
                            <p className="mr-2.5 text-center font-mono flex items-center">0 / 0</p>
                        )}
                        <div
                            onClick={totalMatches > 0 ? onNextMatch : undefined}
                            className={classNames('flex items-center px-1.5 hover:text-blue-600', {
                                'cursor-pointer': totalMatches > 0,
                                'cursor-not-allowed opacity-40': totalMatches === 0,
                            })}
                        >
                            <Chevron className="w-2" />
                        </div>
                        <div
                            onClick={totalMatches > 0 ? onPrevMatch : undefined}
                            className={classNames('flex items-center px-1.5 mr-0.5 hover:text-blue-600', {
                                'cursor-pointer': totalMatches > 0,
                                'cursor-not-allowed opacity-40': totalMatches === 0,
                            })}
                        >
                            <Chevron className="w-2 rotate-180" />
                        </div>
                    </div>
                </>
            )}
            <button
                name="close"
                onClick={onCloseSearch}
                className={classNames(
                    'absolute right-2 top-0 bottom-0 z-20 flex items-center justify-center',
                    'cursor-pointer text-slate-400 hover:text-slate-600'
                )}
            >
                <MicroCloseCircle className="w-4" />
            </button>
        </div>
    ) : (
        <>
            <div className="flex-1 flex items-center text-base font-bold">
                <input
                    onChange={(e) => {
                        const title = e.target.value;
                        onSetTitle(title);
                        debouncedTitleChange(title);
                    }}
                    key="titleInput"
                    className="text-center antialiased flex-1 outline-none bg-transparent truncate"
                    value={chatTitle ?? ''}
                    placeholder="Untitled Chat"
                />
            </div>
            <IconButton
                hintText="Search Messages"
                hintAnchor="bottom-right"
                hintGrow="down-left"
                onClick={() => setShowSearch(true)}
                className="ml-2.5"
                Icon={MicroSearch}
            />
        </>
    );
}
