import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useChatStore } from '../../../store';

interface SearchContextValue {
    messageIndex: number;
    getNextMatchIndex: () => number;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const useSearchContext = () => {
    return useContext(SearchContext);
};

export const SearchContextProvider: React.FC<{
    children: React.ReactNode;
    messageIndex: number;
}> = ({ children, messageIndex }) => {
    const { searchTerm } = useChatStore();
    const matchCounter = useRef(0);
    const lastSearchTerm = useRef(searchTerm);

    // Reset match counter when search term changes
    useEffect(() => {
        if (lastSearchTerm.current !== searchTerm) {
            matchCounter.current = 0;
            lastSearchTerm.current = searchTerm;
        }
    }, [searchTerm]);

    const getNextMatchIndex = () => {
        const current = matchCounter.current;
        matchCounter.current++;
        return current;
    };

    return <SearchContext.Provider value={{ messageIndex, getNextMatchIndex }}>{children}</SearchContext.Provider>;
};
