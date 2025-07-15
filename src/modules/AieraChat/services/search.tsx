import React, { useCallback, useMemo, useState, Fragment, ReactNode, RefObject } from 'react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { ChatMessage, ChatMessageType } from './messages';

/**
 * Strips markdown formatting from text to get plain text content
 * Used for accurate search offset calculations across markdown-rendered content
 */
const stripMarkdown = (markdown: string): string => {
    return (
        markdown
            // Remove citations [c1], [c2], etc.
            .replace(/\[c\d+\]/g, '')
            // Remove markdown bold **text**
            .replace(/\*\*(.*?)\*\*/g, '$1')
            // Remove markdown italic *text*
            .replace(/\*(.*?)\*/g, '$1')
            // Remove markdown headers
            .replace(/^#+\s+/gm, '')
            // Remove markdown links [text](url)
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove remaining markdown formatting
            .replace(/[`_~]/g, '')
    );
};

/**
 * Escapes special regex characters in a string for use in RegExp constructor
 */
const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export interface SearchMatch {
    blockIndex: number;
    matchIndex: number;
    matchOffset: number;
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

    // Helper function to find matches in text content
    const findMatchesInText = useCallback(
        (text: string, messageIndex: number, blockIndex: number, regex: RegExp): SearchMatch[] => {
            const matches: SearchMatch[] = [];
            const plainText = stripMarkdown(text);
            let match;
            let matchCounter = 0;
            while ((match = regex.exec(plainText)) !== null) {
                matches.push({
                    messageIndex,
                    blockIndex,
                    matchIndex: matchCounter,
                    matchOffset: match.index,
                });
                matchCounter++;
            }
            // Reset regex lastIndex to ensure proper matching in next iteration
            regex.lastIndex = 0;
            return matches;
        },
        []
    );

    // Helper function to scroll to a match
    const scrollToMatch = useCallback(
        (match: SearchMatch) => {
            if (match && virtuosoRef?.current) {
                virtuosoRef.current.scrollIntoView({
                    index: match.messageIndex,
                    behavior: 'smooth',
                    align: 'center',
                });
            }
        },
        [virtuosoRef]
    );

    const findMatches = useCallback(
        (term: string) => {
            const data: ChatMessage[] = virtuosoRef?.current?.data.get() || [];

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
                        allMatches.push(...findMatchesInText(block.content, messageIndex, blockIndex, searchRegex));
                    });
                } else if (message.type === ChatMessageType.PROMPT) {
                    // For prompt messages, there's only one text content
                    allMatches.push(...findMatchesInText(message.prompt, messageIndex, 0, searchRegex));
                }
            });

            setMatches(allMatches);
            setCurrentMatchIndex(0);

            // Auto-scroll to first match when search begins
            if (allMatches.length > 0 && allMatches[0]) {
                scrollToMatch(allMatches[0]);
            }
        },
        [findMatchesInText, scrollToMatch, setCurrentMatchIndex, setMatches, virtuosoRef]
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
        if (nextMatch) {
            scrollToMatch(nextMatch);
        }
    }, [currentMatchIndex, matches, scrollToMatch]);

    const onPrevMatch = useCallback(() => {
        if (matches.length === 0) return;

        // Wrap around to last match when going back from the first one
        const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
        setCurrentMatchIndex(prevIndex);

        const prevMatch = matches[prevIndex];
        if (prevMatch) {
            scrollToMatch(prevMatch);
        }
    }, [currentMatchIndex, matches, scrollToMatch]);

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

            const data: ChatMessage[] = virtuosoRef?.current?.data.get() || [];
            const message = data[messageIndex];

            if (
                !message ||
                ![ChatMessageType.PROMPT, ChatMessageType.RESPONSE].includes(message.type) ||
                (message.type === ChatMessageType.RESPONSE && !message.blocks?.[blockIndex])
            ) {
                return text;
            }

            // Get the full markdown content of the block
            const currentMessageContent =
                message.type === ChatMessageType.RESPONSE ? message.blocks[blockIndex]?.content : message.prompt;
            if (!currentMessageContent) {
                return text;
            }

            const plainBlockContent = stripMarkdown(currentMessageContent);
            const plainCurrentText = stripMarkdown(text);

            // Find the offset of the current text within the full block content
            const textOffsetInBlock = plainBlockContent.indexOf(plainCurrentText);
            if (textOffsetInBlock === -1) {
                // Fallback if we can't find the text offset
                return text;
            }

            const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            const parts = text.split(regex);

            // Calculate which match(es) fall within this text node
            let currentTextOffset = textOffsetInBlock;
            let matchIndexInBlock = 0;

            // Count how many matches occur before this text node in the block
            const beforeTextRegex = new RegExp(escapeRegex(searchTerm), 'gi');
            const textBeforeThisNode = plainBlockContent.substring(0, textOffsetInBlock);
            let matchBeforeCount = 0;
            while (beforeTextRegex.exec(textBeforeThisNode) !== null) {
                matchBeforeCount++;
            }
            matchIndexInBlock = matchBeforeCount;

            return parts.map((part, partIndex) => {
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    // Check if this match corresponds to the current selected match
                    const isCurrentMatch =
                        currentMatch?.messageIndex === messageIndex &&
                        currentMatch?.blockIndex === blockIndex &&
                        currentMatch?.matchIndex === matchIndexInBlock;

                    const element = (
                        <mark
                            key={`${partIndex}-${currentTextOffset}-${matchIndexInBlock}`}
                            className={isCurrentMatch ? 'bg-orange-400' : 'bg-yellow-400'}
                        >
                            {part}
                        </mark>
                    );
                    matchIndexInBlock++;
                    return element;
                }
                currentTextOffset += part.length;
                return <Fragment key={partIndex}>{part}</Fragment>;
            });
        },
        [searchTerm, currentMatch, virtuosoRef]
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
