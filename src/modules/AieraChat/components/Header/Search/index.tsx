import classNames from 'classnames';
import debounce from 'lodash.debounce';
import React, { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useState } from 'react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { MicroSearch } from '@aiera/client-sdk/components/Svg/MicroSearch';
import { useChatStore } from '../../../store';
import { IconButton } from '../../IconButton';
import { ChatMessage, ChatMessageType } from '../../../services/messages';

interface SearchMatch {
    matchIndexInMessage: number;
    matchOffset: number;
    messageIndex: number;
}

export function Search({
    onChangeTitle,
    virtuosoRef,
}: {
    onChangeTitle: (title: string) => void;
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}) {
    const { chatId, chatTitle, onSetTitle, searchTerm, onSetSearchTerm, onSetCurrentSearchMatch } = useChatStore();
    const [showSearch, setShowSearch] = useState(false);
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const [matchIndex, setMatchIndex] = useState(0);

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
        onSetSearchTerm('');
        onSetCurrentSearchMatch(undefined);
    }, [onSetSearchTerm, onSetCurrentSearchMatch]);
    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape') {
                onCloseSearch();
            }
        },
        [onCloseSearch]
    );
    const onSearchMatches = useCallback(
        (override?: string) => {
            const term = override || searchTerm;
            const messages = virtuosoRef.current?.data.get();
            if (!messages || !term) {
                setMatches([]);
                setMatchIndex(0);
                return;
            }

            const allMatches: SearchMatch[] = [];
            const searchRegex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

            messages.forEach((message, messageIndex) => {
                let textContent = '';
                if (message.type === ChatMessageType.RESPONSE) {
                    textContent = message.blocks.map((b) => b.content).join(' ');
                } else if (message.type === ChatMessageType.PROMPT) {
                    textContent = message.prompt;
                }

                let match;
                let matchIndexInMessage = 0;
                while ((match = searchRegex.exec(textContent)) !== null) {
                    allMatches.push({
                        messageIndex,
                        matchOffset: match.index,
                        matchIndexInMessage: matchIndexInMessage++,
                    });
                }
                searchRegex.lastIndex = 0;
            });

            setMatchIndex(0);
            setMatches(allMatches);
            if (allMatches.length > 0 && allMatches[0]) {
                onSetCurrentSearchMatch({
                    messageIndex: allMatches[0].messageIndex,
                    matchIndex: allMatches[0].matchIndexInMessage,
                });
                virtuosoRef.current?.scrollIntoView({
                    index: allMatches[0].messageIndex,
                    behavior: 'smooth',
                    align: 'center',
                });
            } else {
                onSetCurrentSearchMatch(undefined);
            }
        },
        [virtuosoRef, searchTerm, onSetCurrentSearchMatch]
    );
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const term = e.target.value;
            onSetSearchTerm(term);
            onSearchMatches(term);
        },
        [onSetSearchTerm, onSearchMatches]
    );

    const onNextMatch = useCallback(() => {
        if (matches.length === 0) return;

        const nextIndex = (matchIndex + 1) % matches.length;
        setMatchIndex(nextIndex);

        const nextMatch = matches[nextIndex];
        if (nextMatch) {
            onSetCurrentSearchMatch({
                messageIndex: nextMatch.messageIndex,
                matchIndex: nextMatch.matchIndexInMessage,
            });
            virtuosoRef.current?.scrollIntoView({
                index: nextMatch.messageIndex,
                behavior: 'smooth',
                align: 'center',
            });
        }
    }, [matchIndex, matches, virtuosoRef, onSetCurrentSearchMatch]);

    const onPrevMatch = useCallback(() => {
        if (matches.length === 0) return;

        const prevIndex = matchIndex === 0 ? matches.length - 1 : matchIndex - 1;
        setMatchIndex(prevIndex);

        const prevMatch = matches[prevIndex];
        if (prevMatch) {
            onSetCurrentSearchMatch({
                messageIndex: prevMatch.messageIndex,
                matchIndex: prevMatch.matchIndexInMessage,
            });
            virtuosoRef.current?.scrollIntoView({
                index: prevMatch.messageIndex,
                behavior: 'smooth',
                align: 'center',
            });
        }
    }, [matchIndex, matches, virtuosoRef, onSetCurrentSearchMatch]);

    // Close search when starting new chat
    useEffect(() => {
        onSetSearchTerm(undefined);
        onSetCurrentSearchMatch(undefined);
        setShowSearch(false);
    }, [chatId, onSetSearchTerm, onSetCurrentSearchMatch]);

    return showSearch ? (
        <div className="bg-slate-200 relative rounded-lg h-[1.875rem] flex-1 flex items-center">
            <input
                value={searchTerm ?? ''}
                key="searchInput"
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
                        {matches.length > 0 ? (
                            <p className="mr-2 text-center font-mono flex items-center">
                                {matchIndex + 1} / {matches.length}
                            </p>
                        ) : (
                            <p className="mr-2.5 text-center font-mono flex items-center">0 / 0</p>
                        )}
                        <div
                            onClick={matches.length > 0 ? onNextMatch : undefined}
                            className={classNames('flex items-center px-1.5 hover:text-blue-600', {
                                'cursor-pointer': matches.length > 0,
                                'cursor-not-allowed opacity-40': matches.length === 0,
                            })}
                        >
                            <Chevron className="w-2" />
                        </div>
                        <div
                            onClick={matches.length > 0 ? onPrevMatch : undefined}
                            className={classNames('flex items-center px-1.5 mr-0.5 hover:text-blue-600', {
                                'cursor-pointer': matches.length > 0,
                                'cursor-not-allowed opacity-40': matches.length === 0,
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
