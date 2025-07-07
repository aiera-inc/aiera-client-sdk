import React, { useMemo, useRef } from 'react';
import { useChatStore } from '../../../../store';
import { useSearchContext } from '../SearchContext';

export function SearchableText({ text }: { text: string }) {
    const { searchTerm, currentSearchMatch } = useChatStore();
    const searchContext = useSearchContext();
    const matchIndicesRef = useRef<number[]>([]);
    const lastTextRef = useRef<string>(text);
    const lastSearchTermRef = useRef<string | undefined>(searchTerm);

    const processedText = useMemo(() => {
        if (!searchTerm || !searchContext) return text;

        // Reset match indices if text or search term changed
        if (lastTextRef.current !== text || lastSearchTermRef.current !== searchTerm) {
            matchIndicesRef.current = [];
            lastTextRef.current = text;
            lastSearchTermRef.current = searchTerm;
        }

        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            // Check if this part matches the search term (case-insensitive)
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                // Get or generate the match index for this part
                if (matchIndicesRef.current[index] === undefined) {
                    matchIndicesRef.current[index] = searchContext.getNextMatchIndex();
                }

                const matchIndex = matchIndicesRef.current[index];
                const isCurrentMatch =
                    currentSearchMatch?.messageIndex === searchContext.messageIndex &&
                    currentSearchMatch?.matchIndex === matchIndex;

                return (
                    <mark key={index} className={isCurrentMatch ? 'bg-orange-400' : 'bg-yellow-400'}>
                        {part}
                    </mark>
                );
            }
            return part;
        });
    }, [text, searchTerm, currentSearchMatch, searchContext]);

    return <>{processedText}</>;
}
