import React, { useMemo, useRef } from 'react';
import { useChatStore } from '../../../../store';
import { useSearchContext } from '../SearchContext';

export function SearchableText({ text }: { text: string }) {
    const { searchTerm, currentSearchMatch } = useChatStore();
    const searchContext = useSearchContext();
    const matchIndicesRef = useRef<number[]>([]);
    const lastTextRef = useRef(text);
    const lastSearchTermRef = useRef(searchTerm);

    const processedText = useMemo(() => {
        if (!searchTerm || !searchContext) return text;

        // Reset match indices if text or search term changed
        if (lastTextRef.current !== text || lastSearchTermRef.current !== searchTerm) {
            matchIndicesRef.current = [];
            lastTextRef.current = text;
            lastSearchTermRef.current = searchTerm;
        }

        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        let localMatchIndex = 0;

        return parts.map((part, index) => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                // Get or generate the match index for this part
                if (matchIndicesRef.current[localMatchIndex] === undefined) {
                    matchIndicesRef.current[localMatchIndex] = searchContext.getNextMatchIndex();
                }

                const matchIndex = matchIndicesRef.current[localMatchIndex];
                const isCurrentMatch =
                    currentSearchMatch?.messageIndex === searchContext.messageIndex &&
                    currentSearchMatch?.matchIndex === matchIndex;

                localMatchIndex++;
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
