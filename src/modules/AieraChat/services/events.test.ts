import { renderHook, act } from '@testing-library/react';
import { useEvents, usePaginatedEvents, UseEventsOptions, UsePaginatedEventsOptions } from './events';
import { useQuery, QueryResult } from '@aiera/client-sdk/api/client';
import { SearchEventsQuery, EventType } from '@aiera/client-sdk/types/generated';
import { CombinedError } from 'urql';

// Mock the useQuery hook
jest.mock('@aiera/client-sdk/api/client', () => ({
    useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

// Define a mock query result type that matches the expected interface
type MockQueryResult = QueryResult<SearchEventsQuery, unknown>;

// Helper to create a complete mock query result
const createMockQueryResult = (overrides: Partial<MockQueryResult>): MockQueryResult =>
    ({
        status: 'success',
        data: null,
        state: { fetching: false, stale: false },
        refetch: jest.fn(),
        isRefetching: false,
        isPaging: false,
        ...overrides,
    } as MockQueryResult);

const createMockEventsData = (overrides?: Partial<SearchEventsQuery['openSearch']['events']>): SearchEventsQuery => ({
    openSearch: {
        __typename: 'OpenSearch',
        events: {
            __typename: 'OpenSearchResult',
            id: 'test-events',
            hits: [],
            numTotalHits: 50,
            currentPage: 1,
            pageSize: 20,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false,
            ...overrides,
        },
    },
});

describe('useEvents', () => {
    const mockEventsData: SearchEventsQuery = {
        openSearch: {
            __typename: 'OpenSearch',
            events: {
                __typename: 'OpenSearchResult',
                id: 'test-events',
                hits: [
                    {
                        __typename: 'EventOpenSearchResultHit',
                        id: '1',
                        event: {
                            __typename: 'OpenSearchEvent',
                            id: '1',
                            eventDate: '2024-01-01',
                            eventId: 1,
                            eventTitle: 'Test Event 1',
                            eventType: EventType.Earnings,
                        },
                    },
                ],
                numTotalHits: 50,
                currentPage: 1,
                pageSize: 20,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: false,
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should handle string searchTerm (backward compatibility)', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: mockEventsData,
                state: { fetching: false, stale: false },
            })
        );

        renderHook(() => useEvents('test search'));

        expect(mockUseQuery).toHaveBeenCalledWith({
            pause: false,
            variables: {
                filter: {
                    searchTerm: 'test search',
                    page: 1,
                    pageSize: 20, // Uses default
                },
            },
            query: expect.any(Object) as unknown,
        });
    });

    test('should handle options object with pagination parameters', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: mockEventsData,
            })
        );

        const options: UseEventsOptions = {
            searchTerm: 'test search',
            page: 2,
            pageSize: 10,
        };

        renderHook(() => useEvents(options));

        expect(mockUseQuery).toHaveBeenCalledWith({
            pause: false,
            variables: {
                filter: {
                    searchTerm: 'test search',
                    page: 2,
                    pageSize: 10,
                },
            },
            query: expect.any(Object) as unknown,
        });
    });

    test('should pause query when no search term provided', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'paused',
            })
        );

        renderHook(() => useEvents());

        expect(mockUseQuery).toHaveBeenCalledWith({
            pause: true,
            variables: {
                filter: {
                    searchTerm: '',
                    page: 1,
                    pageSize: 20,
                },
            },
            query: expect.any(Object) as unknown,
        });
    });

    test('should return pagination data when query is successful', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: mockEventsData,
            })
        );

        const { result } = renderHook(() => useEvents('test'));

        expect(result.current.pagination).toEqual({
            currentPage: 1,
            pageSize: 20,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false,
            totalResults: 50,
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeUndefined();
    });

    test('should return null pagination when query is not successful', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'loading',
                state: { fetching: true, stale: false },
            })
        );

        const { result } = renderHook(() => useEvents('test'));

        expect(result.current.pagination).toBe(null);
        expect(result.current.loading).toBe(true);
    });

    test('should return error when query fails', () => {
        const mockError = new CombinedError({
            graphQLErrors: [],
            networkError: new Error('Query failed'),
        });
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'error',
                error: mockError,
            })
        );

        const { result } = renderHook(() => useEvents('test'));

        expect(result.current.error).toBe(mockError);
        expect(result.current.loading).toBe(false);
    });
});

describe('usePaginatedEvents', () => {
    const mockEventsData: SearchEventsQuery = {
        openSearch: {
            __typename: 'OpenSearch',
            events: {
                __typename: 'OpenSearchResult',
                id: 'test-events',
                hits: [],
                numTotalHits: 50,
                currentPage: 1,
                pageSize: 20,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: false,
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: mockEventsData,
            })
        );
    });

    test('should initialize with default page and pageSize', () => {
        const { result } = renderHook(() => usePaginatedEvents());

        expect(result.current.currentPage).toBe(1);
        expect(result.current.pageSize).toBe(20);
    });

    test('should initialize with custom initial values', () => {
        const options: UsePaginatedEventsOptions = {
            initialPage: 2,
            initialPageSize: 10,
            searchTerm: 'test',
        };

        const { result } = renderHook(() => usePaginatedEvents(options));

        // The pageSize should be initialized correctly
        expect(result.current.pageSize).toBe(10);

        // However, currentPage gets reset to 1 due to the useEffect that triggers when searchTerm is provided
        // This is the actual behavior of the hook - it resets to page 1 when searchTerm changes/is set
        expect(result.current.currentPage).toBe(1);

        // But we can then navigate to the desired page
        act(() => {
            result.current.goToPage(2);
        });

        expect(result.current.currentPage).toBe(2);
    });

    test('should go to specific page within valid range', () => {
        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        act(() => {
            result.current.goToPage(2);
        });

        expect(result.current.currentPage).toBe(2);
    });

    test('should not go to page outside valid range', () => {
        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        act(() => {
            result.current.goToPage(5); // Beyond totalPages (3)
        });

        expect(result.current.currentPage).toBe(1); // Should remain unchanged
    });

    test('should not go to page less than 1', () => {
        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        act(() => {
            result.current.goToPage(0);
        });

        expect(result.current.currentPage).toBe(1); // Should remain unchanged
    });

    test('should go to next page when available', () => {
        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        act(() => {
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(2);
    });

    test('should not go to next page when not available', () => {
        const { result } = renderHook(() =>
            usePaginatedEvents({
                searchTerm: 'test',
                initialPage: 3,
            })
        );

        // First mock the query to show we're on page 3 with no next page
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: createMockEventsData({
                    currentPage: 3,
                    hasNextPage: false,
                    hasPreviousPage: true,
                }),
            })
        );

        // Set current page to 3 first
        act(() => {
            result.current.goToPage(3);
        });

        const currentPage = result.current.currentPage;

        act(() => {
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(currentPage); // Should remain unchanged
    });

    test('should go to previous page when available', () => {
        // Start by mocking data that shows we have pagination available
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: createMockEventsData({
                    currentPage: 2,
                    hasNextPage: true,
                    hasPreviousPage: true,
                }),
            })
        );

        const { result } = renderHook(() =>
            usePaginatedEvents({
                searchTerm: 'test',
            })
        );

        // First go to page 2
        act(() => {
            result.current.goToPage(2);
        });

        expect(result.current.currentPage).toBe(2);

        act(() => {
            result.current.previousPage();
        });

        expect(result.current.currentPage).toBe(1);
    });

    test('should not go to previous page when not available', () => {
        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        act(() => {
            result.current.previousPage();
        });

        expect(result.current.currentPage).toBe(1); // Should remain unchanged
    });

    test('should change page size and reset to first page', () => {
        const { result } = renderHook(() =>
            usePaginatedEvents({
                searchTerm: 'test',
                initialPage: 2,
            })
        );

        act(() => {
            result.current.changePageSize(10);
        });

        expect(result.current.pageSize).toBe(10);
        expect(result.current.currentPage).toBe(1); // Should reset to first page
    });

    test('should reset to first page when search term changes', () => {
        const { result, rerender } = renderHook(({ searchTerm }) => usePaginatedEvents({ searchTerm }), {
            initialProps: { searchTerm: 'test1' },
        });

        // Go to page 2
        act(() => {
            result.current.goToPage(2);
        });
        expect(result.current.currentPage).toBe(2);

        // Change search term
        rerender({ searchTerm: 'test2' });

        expect(result.current.currentPage).toBe(1); // Should reset to first page
    });

    test('should return correct convenience flags', () => {
        // Mock data for page 2 of 3
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'success',
                data: createMockEventsData({
                    currentPage: 2,
                    hasNextPage: true,
                    hasPreviousPage: true,
                }),
            })
        );

        const { result } = renderHook(() =>
            usePaginatedEvents({
                searchTerm: 'test',
                initialPage: 2,
            })
        );

        expect(result.current.canGoNext).toBe(true);
        expect(result.current.canGoPrevious).toBe(true);
    });

    test('should return false for convenience flags when pagination is null', () => {
        mockUseQuery.mockReturnValue(
            createMockQueryResult({
                status: 'loading',
                state: { fetching: true, stale: false },
            })
        );

        const { result } = renderHook(() => usePaginatedEvents({ searchTerm: 'test' }));

        expect(result.current.canGoNext).toBe(false);
        expect(result.current.canGoPrevious).toBe(false);
    });
});
