import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { useSearch } from './search';
import { ChatMessage, ChatMessageType, ChatMessageStatus } from './messages';
import { BlockType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

// Mock VirtuosoMessageListMethods
const mockScrollIntoView = jest.fn();
const mockVirtuosoRef = {
    current: {
        scrollIntoView: mockScrollIntoView,
        data: [],
        scrollToItem: jest.fn(),
        scrollerElement: null,
        getScrollLocation: jest.fn(),
        autoscrollToBottom: jest.fn(),
        followOutput: jest.fn(),
        cancelSmoothScroll: jest.fn(),
        height: 0,
    } as unknown as VirtuosoMessageListMethods<ChatMessage>,
};

// Test data helpers
const createPromptMessage = (id: string, prompt: string): ChatMessage => ({
    id,
    timestamp: '2023-01-01T00:00:00Z',
    status: ChatMessageStatus.COMPLETED,
    prompt,
    type: ChatMessageType.PROMPT,
});

const createResponseMessage = (id: string, content: string, prompt: string): ChatMessage => ({
    id,
    timestamp: '2023-01-01T00:00:00Z',
    status: ChatMessageStatus.COMPLETED,
    prompt,
    type: ChatMessageType.RESPONSE,
    blocks: [
        {
            id: `block-${id}`,
            type: BlockType.TEXT,
            content,
        },
    ],
    sources: [],
});

const createSourcesMessage = (id: string, prompt: string): ChatMessage => ({
    id,
    timestamp: '2023-01-01T00:00:00Z',
    status: ChatMessageStatus.COMPLETED,
    prompt,
    type: ChatMessageType.SOURCES,
    confirmed: false,
    sources: [],
});

describe('useSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('basic search functionality', () => {
        it('should initialize with empty state', () => {
            const { result } = renderHook(() => useSearch({ data: [] }));

            expect(result.current.searchTerm).toBe('');
            expect(result.current.currentMatchIndex).toBe(0);
            expect(result.current.totalMatches).toBe(0);
            expect(result.current.isSearchActive).toBe(false);
            expect(result.current.currentMatch).toBeUndefined();
        });

        it('should find matches in prompt messages', () => {
            const messages = [createPromptMessage('1', 'Hello world'), createPromptMessage('2', 'Goodbye world')];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('world');
            });

            expect(result.current.searchTerm).toBe('world');
            expect(result.current.totalMatches).toBe(2);
            expect(result.current.currentMatchIndex).toBe(1); // 1-based index
            expect(result.current.isSearchActive).toBe(true);
            expect(result.current.currentMatch).toEqual({
                messageIndex: 0,
                matchIndexInMessage: 0,
                matchOffset: 6,
            });
        });

        it('should find matches in response message blocks', () => {
            const messages = [
                createResponseMessage('1', 'This is a test message', 'test prompt'),
                createResponseMessage('2', 'Another test case', 'test prompt'),
            ];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.totalMatches).toBe(2); // 'test' appears 2 times in the block content
            expect(result.current.currentMatchIndex).toBe(1);
        });

        it('should handle case-insensitive search', () => {
            const messages = [createPromptMessage('1', 'Hello WORLD'), createPromptMessage('2', 'world hello')];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('world');
            });

            expect(result.current.totalMatches).toBe(2);
        });

        it('should escape special regex characters', () => {
            const messages = [createPromptMessage('1', 'Price is $100.50'), createPromptMessage('2', 'Cost: $50.25')];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('$');
            });

            expect(result.current.totalMatches).toBe(2);
        });
    });

    describe('match navigation', () => {
        const messages = [
            createPromptMessage('1', 'test message one'), // 1 match: 'test'
            createResponseMessage('2', 'test response two test', 'prompt'), // 2 matches: 'test' appears twice
            createPromptMessage('3', 'final test'), // 1 match: 'test'
        ];

        it('should navigate to next match', () => {
            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.currentMatchIndex).toBe(1);
            expect(result.current.currentMatch?.messageIndex).toBe(0);

            act(() => {
                result.current.onNextMatch();
            });

            expect(result.current.currentMatchIndex).toBe(2);
            expect(result.current.currentMatch?.messageIndex).toBe(1);
            expect(mockScrollIntoView).toHaveBeenCalledWith({
                index: 1,
                behavior: 'smooth',
                align: 'center',
            });
        });

        it('should navigate to previous match', () => {
            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            // Move to second match first
            act(() => {
                result.current.onNextMatch();
            });

            expect(result.current.currentMatchIndex).toBe(2);

            // Go back to first match
            act(() => {
                result.current.onPrevMatch();
            });

            expect(result.current.currentMatchIndex).toBe(1);
            expect(result.current.currentMatch?.messageIndex).toBe(0);
        });

        it('should wrap around when navigating past last match', () => {
            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            // First, check how many total matches we have
            const totalMatches = result.current.totalMatches;
            expect(totalMatches).toBeGreaterThan(0);

            // Navigate to what should be the last match
            for (let i = 1; i < totalMatches; i++) {
                act(() => {
                    result.current.onNextMatch();
                });
            }

            expect(result.current.currentMatchIndex).toBe(totalMatches);

            // Should wrap around to first match
            act(() => {
                result.current.onNextMatch();
            });

            expect(result.current.currentMatchIndex).toBe(1);
            expect(result.current.currentMatch?.messageIndex).toBe(0);
        });

        it('should wrap around when navigating before first match', () => {
            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.currentMatchIndex).toBe(1);

            // Should wrap around to last match
            act(() => {
                result.current.onPrevMatch();
            });

            const totalMatches = result.current.totalMatches;
            expect(result.current.currentMatchIndex).toBe(totalMatches);
            expect(result.current.currentMatch?.messageIndex).toBe(2); // last message
        });
    });

    describe('highlighting logic', () => {
        it('should highlight text with yellow background for non-current matches', () => {
            const messages = [createPromptMessage('1', 'test message test')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            const highlighted = result.current.highlightText('test message test', 0);
            const { container } = render(<div>{highlighted}</div>);

            const marks = container.querySelectorAll('mark');
            expect(marks).toHaveLength(2);

            // First match should be orange (current match)
            expect(marks[0]).toHaveClass('bg-orange-400');
            // Second match should be yellow
            expect(marks[1]).toHaveClass('bg-yellow-400');
        });

        it('should highlight current match with orange background', () => {
            const messages = [createPromptMessage('1', 'test message test')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            // Move to second match
            act(() => {
                result.current.onNextMatch();
            });

            const highlighted = result.current.highlightText('test message test', 0);
            const { container } = render(<div>{highlighted}</div>);

            const marks = container.querySelectorAll('mark');
            expect(marks).toHaveLength(2);

            // First match should be yellow now
            expect(marks[0]).toHaveClass('bg-yellow-400');
            // Second match should be orange (current match)
            expect(marks[1]).toHaveClass('bg-orange-400');
        });

        it('should return original text when no search term', () => {
            const { result } = renderHook(() => useSearch({ data: [] }));

            const text = 'test message';
            const highlighted = result.current.highlightText(text, 0);

            expect(highlighted).toBe(text);
        });

        it('should return original text when no matches', () => {
            const messages = [createPromptMessage('1', 'no matches here')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('xyz');
            });

            const highlighted = result.current.highlightText('no matches here', 0);
            const { container } = render(<div>{highlighted}</div>);
            expect(container.textContent).toBe('no matches here');
            expect(container.querySelectorAll('mark')).toHaveLength(0);
        });

        it('should handle empty or whitespace-only search terms', () => {
            const messages = [createPromptMessage('1', 'test message')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('   ');
            });

            const highlighted = result.current.highlightText('test message', 0);
            expect(highlighted).toBe('test message');
            expect(result.current.totalMatches).toBe(0);
        });
    });

    describe('edge cases', () => {
        it('should handle empty message list', () => {
            const { result } = renderHook(() => useSearch({ data: [] }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.totalMatches).toBe(0);
            expect(result.current.currentMatchIndex).toBe(0);
            expect(result.current.currentMatch).toBeUndefined();
        });

        it('should handle single match', () => {
            const messages = [createPromptMessage('1', 'unique word')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('unique');
            });

            expect(result.current.totalMatches).toBe(1);
            expect(result.current.currentMatchIndex).toBe(1);

            // Navigation should stay on the same match
            act(() => {
                result.current.onNextMatch();
            });

            expect(result.current.currentMatchIndex).toBe(1);

            act(() => {
                result.current.onPrevMatch();
            });

            expect(result.current.currentMatchIndex).toBe(1);
        });

        it('should handle navigation with no matches', () => {
            const messages = [createPromptMessage('1', 'no matches')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('xyz');
            });

            expect(result.current.totalMatches).toBe(0);

            // Navigation should not crash
            act(() => {
                result.current.onNextMatch();
                result.current.onPrevMatch();
            });

            expect(result.current.currentMatchIndex).toBe(0);
            expect(mockScrollIntoView).not.toHaveBeenCalled();
        });

        it('should clear search properly', () => {
            const messages = [createPromptMessage('1', 'test message')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.totalMatches).toBe(1);
            expect(result.current.isSearchActive).toBe(true);

            act(() => {
                result.current.clearSearch();
            });

            expect(result.current.searchTerm).toBe('');
            expect(result.current.totalMatches).toBe(0);
            expect(result.current.currentMatchIndex).toBe(0);
            expect(result.current.isSearchActive).toBe(false);
            expect(result.current.currentMatch).toBeUndefined();
        });

        it('should handle different message types correctly', () => {
            const messages = [
                createPromptMessage('1', 'prompt with search'),
                createResponseMessage('2', 'response with search', 'prompt'),
                createSourcesMessage('3', 'sources with search'),
            ];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('search');
            });

            // Should find matches in prompt and response messages, but not sources
            // (sources messages don't have searchable content in the implementation)
            expect(result.current.totalMatches).toBe(2);
        });
    });

    describe('virtuoso integration', () => {
        it('should scroll to first match when search begins', () => {
            const messages = [createPromptMessage('1', 'no search'), createPromptMessage('2', 'has match')];

            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('match');
            });

            expect(mockScrollIntoView).toHaveBeenCalledWith({
                index: 1, // Second message (index 1)
                behavior: 'smooth',
                align: 'center',
            });
        });

        it('should not scroll when virtuosoRef is not provided', () => {
            const messages = [createPromptMessage('1', 'test message')];
            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(mockScrollIntoView).not.toHaveBeenCalled();
        });

        it('should not scroll when no matches found', () => {
            const messages = [createPromptMessage('1', 'no matches')];
            const { result } = renderHook(() => useSearch({ data: messages, virtuosoRef: mockVirtuosoRef }));

            act(() => {
                result.current.onSearchTermChange('xyz');
            });

            expect(mockScrollIntoView).not.toHaveBeenCalled();
        });
    });

    describe('match counting and indexing', () => {
        it('should correctly count multiple matches within same message', () => {
            const messages = [createResponseMessage('1', 'test test test', 'prompt')];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.totalMatches).toBe(3);

            // Navigate through all matches in the same message
            expect(result.current.currentMatch?.matchIndexInMessage).toBe(0);

            act(() => {
                result.current.onNextMatch();
            });
            expect(result.current.currentMatch?.matchIndexInMessage).toBe(1);

            act(() => {
                result.current.onNextMatch();
            });
            expect(result.current.currentMatch?.matchIndexInMessage).toBe(2);
        });

        it('should maintain correct match indices across multiple messages', () => {
            const messages = [
                createPromptMessage('1', 'first test'),
                createResponseMessage('2', 'second test block', 'prompt'),
                createPromptMessage('3', 'third test'),
            ];

            const { result } = renderHook(() => useSearch({ data: messages }));

            act(() => {
                result.current.onSearchTermChange('test');
            });

            expect(result.current.totalMatches).toBe(3);

            // First match
            expect(result.current.currentMatch).toEqual({
                messageIndex: 0,
                matchIndexInMessage: 0,
                matchOffset: 6,
            });

            // Second match
            act(() => {
                result.current.onNextMatch();
            });
            expect(result.current.currentMatch).toEqual({
                messageIndex: 1,
                matchIndexInMessage: 0,
                matchOffset: 7,
            });

            // Third match
            act(() => {
                result.current.onNextMatch();
            });
            expect(result.current.currentMatch).toEqual({
                messageIndex: 2,
                matchIndexInMessage: 0,
                matchOffset: 6,
            });
        });
    });
});
