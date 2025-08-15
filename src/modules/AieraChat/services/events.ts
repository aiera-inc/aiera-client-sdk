import { useCallback, useEffect, useState } from 'react';
import { gql } from 'urql';
import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { SearchEventsQuery, SearchEventsQueryVariables } from '@aiera/client-sdk/types/generated';

const eventsGQL = (type = '') => gql`
        query SearchEvents${type}($filter: OpenSearchEventFilter!) {
            openSearch {
                events(filter: $filter) {
                    id
                    hits {
                        id
                        event {
                            id
                            eventDate
                            eventId
                            eventTitle
                            eventType
                        }
                    }
                    numTotalHits
                    currentPage
                    pageSize
                    totalPages
                    hasNextPage
                    hasPreviousPage
                }
            }
        }
    `;

export interface UseEventsOptions {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
}

export function useEvents(options?: UseEventsOptions | string) {
    // Support backward compatibility: if string is passed, treat as searchTerm
    const {
        searchTerm,
        page = 1,
        pageSize = 20,
    } = typeof options === 'string' ? { searchTerm: options, page: 1, pageSize: 20 } : options || {};

    const eventsQuery: QueryResult<SearchEventsQuery, SearchEventsQueryVariables> = useQuery<
        SearchEventsQuery,
        SearchEventsQueryVariables
    >({
        pause: !searchTerm,
        variables: {
            filter: {
                searchTerm: searchTerm || '',
                page: page > 1 ? page : undefined,
                pageSize: pageSize !== 20 ? pageSize : undefined,
            },
        },
        query: eventsGQL(),
    });

    return {
        eventsQuery,
        // Expose pagination helpers using real API fields
        pagination:
            eventsQuery.status === 'success'
                ? {
                      currentPage: eventsQuery.data.openSearch.events.currentPage,
                      pageSize: eventsQuery.data.openSearch.events.pageSize,
                      totalPages: eventsQuery.data.openSearch.events.totalPages,
                      hasNextPage: eventsQuery.data.openSearch.events.hasNextPage,
                      hasPreviousPage: eventsQuery.data.openSearch.events.hasPreviousPage,
                      totalResults: eventsQuery.data.openSearch.events.numTotalHits,
                  }
                : null,
    };
}

export interface UsePaginatedEventsOptions extends UseEventsOptions {
    initialPage?: number;
    initialPageSize?: number;
}

export function usePaginatedEvents(options?: UsePaginatedEventsOptions) {
    const { searchTerm, initialPage = 1, initialPageSize = 20 } = options || {};
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const result = useEvents({
        searchTerm,
        page: currentPage,
        pageSize,
    });

    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && (!result.pagination || page <= result.pagination.totalPages)) {
                setCurrentPage(page);
            }
        },
        [result.pagination]
    );

    const nextPage = useCallback(() => {
        if (result.pagination?.hasNextPage) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [result.pagination]);

    const previousPage = useCallback(() => {
        if (result.pagination?.hasPreviousPage) {
            setCurrentPage((prev) => prev - 1);
        }
    }, [result.pagination]);

    const changePageSize = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    }, []);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return {
        ...result,
        // Pagination controls
        currentPage,
        pageSize,
        goToPage,
        nextPage,
        previousPage,
        changePageSize,
        // Convenience flags
        canGoNext: result.pagination?.hasNextPage ?? false,
        canGoPrevious: result.pagination?.hasPreviousPage ?? false,
    };
}
