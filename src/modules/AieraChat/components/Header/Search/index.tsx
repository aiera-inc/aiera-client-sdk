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
import { TextBlock } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block/Text';

/**
 * Extracts searchable text content from an array of content blocks
 * @param blocks Array of content blocks to extract text from
 * @returns A single string containing all searchable text content
 */
function getSearchableContent(blocks: TextBlock[]): string {
    // Process all blocks and join with spaces
    return blocks
        .map((block) => {
            // Get the main content
            let content = block.content;

            // Add citation text if available
            if (block.citations) {
                const citationText = block.citations
                    .map((citation) => `${citation.text} ${citation.author || ''}`)
                    .join(' ');
                content += ' ' + citationText;
            }

            return content;
        })
        .join(' ')
        .trim();
}

export function Search({
    onChangeTitle,
    virtuosoRef,
}: {
    onChangeTitle: (title: string) => void;
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}) {
    const { chatId, chatTitle, onSetTitle, searchTerm, onSetSearchTerm } = useChatStore();
    const [showSearch, setShowSearch] = useState(false);
    const [matches, setMatches] = useState<number[]>([]);
    const [matchIndex, setMatchIndex] = useState(1);
    const [_, setInFocus] = useState(false);

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
    }, [onSetSearchTerm]);
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
    const onSearchMatches = useCallback(
        (override?: string) => {
            const term = override || searchTerm;
            const messages = virtuosoRef.current?.data.get();
            if (!messages) return;
            const matchingIndexes = messages.reduce<number[]>((acc, message, index) => {
                let textContent = '';
                if (message.type === ChatMessageType.RESPONSE) {
                    textContent = getSearchableContent(message.blocks).toLowerCase();
                } else if (message.type === ChatMessageType.PROMPT) {
                    textContent = message.prompt;
                }
                if (term && textContent.includes(term)) {
                    acc.push(index);
                }
                return acc;
            }, []);

            setMatchIndex(0);
            setMatches(matchingIndexes);
            if (matchingIndexes.length > 0 && matchingIndexes[0]) {
                virtuosoRef.current?.scrollIntoView({ index: matchingIndexes[0], behavior: 'smooth', align: 'center' });
            }
        },
        [virtuosoRef, searchTerm]
    );
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const term = e.target.value;
            onSetSearchTerm(term);
            onSearchMatches(term);
        },
        [onSetSearchTerm]
    );

    const onNextMatch = useCallback(() => {
        if (matchIndex + 1 < matches.length) {
            setMatchIndex((pv) => pv + 1);
            const nextIndex = matches[matchIndex + 1];
            if (nextIndex) {
                virtuosoRef.current?.scrollIntoView({ index: nextIndex, behavior: 'smooth', align: 'center' });
            }
        } else {
            setMatchIndex(0);
            if (matches[0]) {
                virtuosoRef.current?.scrollIntoView({ index: matches[0], behavior: 'smooth', align: 'center' });
            }
        }
    }, [matchIndex, matches]);

    const onPrevMatch = useCallback(() => {
        if (matchIndex - 1 >= 0) {
            setMatchIndex((pv) => pv - 1);
            const nextIndex = matches[matchIndex - 1];
            if (nextIndex) {
                virtuosoRef.current?.scrollIntoView({ index: nextIndex, behavior: 'smooth', align: 'center' });
            }
        } else {
            setMatchIndex(matches.length - 1);
            const prevIndex = matches[matches.length - 1];
            if (prevIndex) {
                virtuosoRef.current?.scrollIntoView({ index: prevIndex, behavior: 'smooth', align: 'center' });
            }
        }
    }, [matchIndex, matches]);

    // Close search when starting new chat
    useEffect(() => {
        onSetSearchTerm(undefined);
        setShowSearch(false);
    }, [chatId, onSetSearchTerm]);

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
