import React, { useCallback, useMemo, useState, Fragment, ReactNode, RefObject } from 'react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { ChatMessage, ChatMessageType } from './messages';

export interface SearchMatch {
    blockIndex: number;
    matchIndexInMessage: number;
    messageIndex: number;
}

export interface UseSearchProps {
    virtuosoRef?: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}

export interface UseSearchResponse {
    clearSearch: () => void;
    currentMatch: SearchMatch | undefined;
    currentMatchIndex: number;
    highlightText: (text: string, messageIndex: number, blockIndex?: number) => ReactNode;
    isSearchActive: boolean;
    onNextMatch: () => void;
    onPrevMatch: () => void;
    onSearchTermChange: (term: string) => void;
    searchTerm: string;
    totalMatches: number;
}

/**
 * useSearch - A hook for implementing browser-like search functionality in chat messages
 *
 * This hook provides all the necessary state and functions to implement a search feature
 * similar to browser's Cmd+F functionality, with yellow highlighting for matches and
 * orange highlighting for the currently selected match.
 *
 * @example
 * ```tsx
 * // In your chat component
 * const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);
 * const messages = useChatMessages();
 *
 * const {
 *   searchTerm,
 *   onSearchTermChange,
 *   onNextMatch,
 *   onPrevMatch,
 *   currentMatchIndex,
 *   totalMatches,
 *   highlightText,
 *   clearSearch
 * } = useSearch({ virtuosoRef });
 *
 * // In your search input
 * <input
 *   value={searchTerm}
 *   onChange={(e) => onSearchTermChange(e.target.value)}
 *   placeholder="Search messages..."
 * />
 *
 * // Navigation controls
 * <span>{currentMatchIndex} / {totalMatches}</span>
 * <button onClick={onPrevMatch}>Previous</button>
 * <button onClick={onNextMatch}>Next</button>
 *
 * // In your message rendering
 * <div>{highlightText(message.content, messageIndex)}</div>
 * ```
 */
export function useSearch({ virtuosoRef }: UseSearchProps): UseSearchResponse {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const data: ChatMessage[] = (virtuosoRef?.current?.data || []) as ChatMessage[];

    // Escape special regex characters to ensure safe search
    const escapeRegex = (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

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
                if (message.type === ChatMessageType.RESPONSE) {
                    // Search each block individually to maintain correct match indexing
                    message.blocks.forEach((block, blockIndex) => {
                        let match;
                        while ((match = searchRegex.exec(block.content)) !== null) {
                            allMatches.push({
                                messageIndex,
                                blockIndex,
                                matchIndexInMessage: match.index,
                            });
                        }
                        // Reset regex lastIndex to ensure proper matching in next iteration
                        searchRegex.lastIndex = 0;
                    });
                } else if (message.type === ChatMessageType.PROMPT) {
                    // For prompt messages, there's only one text content
                    let match;
                    while ((match = searchRegex.exec(message.prompt)) !== null) {
                        allMatches.push({
                            messageIndex,
                            blockIndex: 0, // Prompt messages have only one block
                            matchIndexInMessage: match.index,
                        });
                    }
                    // Reset regex lastIndex to ensure proper matching in next iteration
                    searchRegex.lastIndex = 0;
                }
            });

            setMatches(allMatches);
            setCurrentMatchIndex(0);

            // Auto-scroll to first match when search begins
            if (allMatches.length > 0 && allMatches[0] && virtuosoRef?.current) {
                virtuosoRef.current.scrollIntoView({
                    index: allMatches[0].messageIndex,
                    behavior: 'smooth',
                    align: 'center',
                });
            }
        },
        [escapeRegex, setCurrentMatchIndex, setMatches, virtuosoRef]
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

        // Wrap around to first match after reaching the last one
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

        // Wrap around to last match when going back from the first one
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

    /**
     * Highlights search matches in text with appropriate colors
     * @param text - The text to search and highlight
     * @param messageIndex - The index of the message containing this text
     * @param blockIndex - The index of the block within the message (optional, defaults to 0)
     * @returns React nodes with highlighted matches
     */
    const highlightText = useCallback(
        (text: string, messageIndex: number, blockIndex = 0): ReactNode => {
            if (!searchTerm || !searchTerm.trim() || !text) return text;

            // const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            const regex = new RegExp(escapeRegex(searchTerm), 'gi');
            const parts = text.split(regex);

            // Track which match within this text block we're processing
            let matchCounter = 0;
            return parts.map((part, partIndex) => {
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    // Check if this is the currently selected match
                    const isCurrentMatch =
                        currentMatch?.messageIndex === messageIndex &&
                        currentMatch?.blockIndex === blockIndex &&
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
        currentMatchIndex: totalMatches > 0 ? currentMatchIndex + 1 : 0, // 1-based index for display
        highlightText,
        isSearchActive,
        onNextMatch,
        onPrevMatch,
        onSearchTermChange,
        searchTerm,
        totalMatches,
    };
}
