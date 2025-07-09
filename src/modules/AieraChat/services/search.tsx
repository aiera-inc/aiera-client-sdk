import React, { useCallback, useMemo, useState, ReactNode, Fragment } from 'react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { ChatMessage, ChatMessageType } from './messages';

export interface SearchMatch {
    matchIndexInMessage: number;
    matchOffset: number;
    messageIndex: number;
}

export interface UseSearchProps {
    data?: ChatMessage[];
    virtuosoRef?: React.RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}

export interface UseSearchReturn {
    clearSearch: () => void;
    currentMatch: SearchMatch | undefined;
    currentMatchIndex: number;
    highlightText: (text: string, messageIndex: number) => ReactNode;
    isSearchActive: boolean;
    onNextMatch: () => void;
    onPrevMatch: () => void;
    onSearchTermChange: (term: string) => void;
    searchTerm: string;
    totalMatches: number;
}

export function useSearch({ data = [], virtuosoRef }: UseSearchProps): UseSearchReturn {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
    const [matches, setMatches] = useState<SearchMatch[]>([]);

    const escapeRegex = useCallback((str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }, []);

    const findMatches = useCallback(
        (term: string) => {
            if (!term || !data.length) {
                setMatches([]);
                setCurrentMatchIndex(0);
                return;
            }

            const allMatches: SearchMatch[] = [];
            const searchRegex = new RegExp(escapeRegex(term), 'gi');

            data.forEach((message, messageIndex) => {
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
                        matchIndexInMessage: matchIndexInMessage++,
                        matchOffset: match.index,
                    });
                }
                searchRegex.lastIndex = 0;
            });

            setMatches(allMatches);
            setCurrentMatchIndex(0);

            if (allMatches.length > 0 && allMatches[0] && virtuosoRef?.current) {
                virtuosoRef.current.scrollIntoView({
                    index: allMatches[0].messageIndex,
                    behavior: 'smooth',
                    align: 'center',
                });
            }
        },
        [data, escapeRegex, virtuosoRef]
    );

    const onSearchTermChange = useCallback(
        (term: string) => {
            setSearchTerm(term);
            findMatches(term);
        },
        [findMatches]
    );

    const onNextMatch = useCallback(() => {
        if (matches.length === 0) return;

        const nextIndex = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(nextIndex);

        const nextMatch = matches[nextIndex];
        if (nextMatch && virtuosoRef?.current) {
            virtuosoRef.current.scrollIntoView({
                index: nextMatch.messageIndex,
                behavior: 'smooth',
                align: 'center',
            });
        }
    }, [currentMatchIndex, matches, virtuosoRef]);

    const onPrevMatch = useCallback(() => {
        if (matches.length === 0) return;

        const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
        setCurrentMatchIndex(prevIndex);

        const prevMatch = matches[prevIndex];
        if (prevMatch && virtuosoRef?.current) {
            virtuosoRef.current.scrollIntoView({
                index: prevMatch.messageIndex,
                behavior: 'smooth',
                align: 'center',
            });
        }
    }, [currentMatchIndex, matches, virtuosoRef]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setMatches([]);
        setCurrentMatchIndex(0);
    }, []);

    const currentMatch = useMemo(() => {
        return matches[currentMatchIndex];
    }, [matches, currentMatchIndex]);

    const highlightText = useCallback(
        (text: string, messageIndex: number): ReactNode => {
            if (!searchTerm || !searchTerm.trim() || !text) return text;

            const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            const parts = text.split(regex);

            let matchCounter = 0;
            return parts.map((part, partIndex) => {
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    const isCurrentMatch =
                        currentMatch?.messageIndex === messageIndex &&
                        currentMatch?.matchIndexInMessage === matchCounter;

                    const element = (
                        <mark
                            key={`${partIndex}-${matchCounter}`}
                            className={isCurrentMatch ? 'bg-orange-400' : 'bg-yellow-400'}
                        >
                            {part}
                        </mark>
                    );
                    matchCounter++;
                    return element;
                }
                return <Fragment key={partIndex}>{part}</Fragment>;
            });
        },
        [searchTerm, currentMatch, escapeRegex]
    );

    const isSearchActive = searchTerm.length > 0;
    const totalMatches = matches.length;

    return {
        clearSearch,
        currentMatch,
        currentMatchIndex: totalMatches > 0 ? currentMatchIndex + 1 : 0,
        highlightText,
        isSearchActive,
        onNextMatch,
        onPrevMatch,
        onSearchTermChange,
        searchTerm,
        totalMatches,
    };
}
