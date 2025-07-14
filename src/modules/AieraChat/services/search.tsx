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
    matchIndexInBlock: number;
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
                        // Strip markdown to get plain text for accurate offset calculation
                        const plainText = stripMarkdown(block.content);
                        let match;
                        let matchIndexInBlock = 0;
                        while ((match = searchRegex.exec(plainText)) !== null) {
                            allMatches.push({
                                messageIndex,
                                blockIndex,
                                matchIndexInBlock,
                                matchOffset: match.index,
                            });
                            matchIndexInBlock++;
                        }
                        // Reset regex lastIndex to ensure proper matching in next iteration
                        searchRegex.lastIndex = 0;
                    });
                } else if (message.type === ChatMessageType.PROMPT) {
                    // For prompt messages, there's only one text content
                    const plainText = stripMarkdown(message.prompt);
                    let match;
                    let matchIndexInBlock = 0;
                    while ((match = searchRegex.exec(plainText)) !== null) {
                        allMatches.push({
                            messageIndex,
                            blockIndex: 0, // Prompt messages have only one block
                            matchIndexInBlock,
                            matchOffset: match.index,
                        });
                        matchIndexInBlock++;
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
        [setCurrentMatchIndex, setMatches, virtuosoRef]
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
            const fullBlockContent =
                message.type === ChatMessageType.RESPONSE ? message.blocks[blockIndex]?.content : message.prompt;
            if (!fullBlockContent) {
                return text;
            }

            const plainBlockContent = stripMarkdown(fullBlockContent);
            const plainCurrentText = stripMarkdown(text);

            // Find the offset of the current text within the full block content
            // Use a more robust approach by trying to find the text at multiple positions
            let textOffsetInBlock = -1;
            const searchStart = 0;

            // Try to find the text, handling potential duplicates by context
            while (searchStart < plainBlockContent.length) {
                const foundIndex = plainBlockContent.indexOf(plainCurrentText, searchStart);
                if (foundIndex === -1) break;

                // For now, use the first match found
                // In the future, we could add more sophisticated context matching
                textOffsetInBlock = foundIndex;
                break;
            }

            if (textOffsetInBlock === -1) {
                // Fallback if we can't find the text offset
                return text;
            }

            const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            const parts = text.split(regex);

            // Calculate which match(es) fall within this text node
            let currentTextOffset = textOffsetInBlock;

            return parts.map((part, partIndex) => {
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    // Check if this match offset corresponds to the current selected match
                    // Prompts don't have match offsets because only a single text node is rendered
                    const isCurrentMatch =
                        currentMatch?.messageIndex === messageIndex &&
                        currentMatch?.blockIndex === blockIndex &&
                        (message.type !== ChatMessageType.RESPONSE ||
                            (currentMatch?.matchOffset >= currentTextOffset &&
                                currentMatch?.matchOffset < currentTextOffset + part.length));

                    const element = (
                        <mark
                            key={`${partIndex}-${currentTextOffset}`}
                            className={isCurrentMatch ? 'bg-orange-400' : 'bg-yellow-400'}
                        >
                            {part}
                        </mark>
                    );
                    currentTextOffset += part.length;
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
