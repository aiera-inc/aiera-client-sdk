import { act, renderHook } from '@testing-library/react';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { useChatStore, Source } from './store';

describe('useChatStore', () => {
    beforeEach(() => {
        // Reset store to initial state
        useChatStore.setState({
            chatId: 'new',
            chatStatus: ChatSessionStatus.Active,
            chatTitle: undefined,
            citationMarkers: new Map(),
            hasChanges: false,
            selectedSource: undefined,
            sources: [],
            sourceTypeCounters: new Map(),
        });
    });

    describe('initial state', () => {
        test('has correct default values', () => {
            const { result } = renderHook(() => useChatStore());

            expect(result.current.chatId).toBe('new');
            expect(result.current.chatStatus).toBe(ChatSessionStatus.Active);
            expect(result.current.chatTitle).toBeUndefined();
            expect(result.current.citationMarkers).toEqual(new Map());
            expect(result.current.hasChanges).toBe(false);
            expect(result.current.selectedSource).toBeUndefined();
            expect(result.current.sources).toEqual([]);
            expect(result.current.sourceTypeCounters).toEqual(new Map());
        });
    });

    describe('onSetTitle', () => {
        test('updates chat title', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.onSetTitle('New Chat Title');
            });

            expect(result.current.chatTitle).toBe('New Chat Title');
        });

        test('can clear title', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.onSetTitle('Title');
                result.current.onSetTitle(undefined);
            });

            expect(result.current.chatTitle).toBeUndefined();
        });
    });

    describe('onSetStatus', () => {
        test('updates chat status', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.onSetStatus(ChatSessionStatus.GeneratingResponse);
            });

            expect(result.current.chatStatus).toBe(ChatSessionStatus.GeneratingResponse);
        });
    });

    describe('onNewChat', () => {
        test('resets to new chat state', () => {
            const { result } = renderHook(() => useChatStore());

            // Set some state first
            act(() => {
                result.current.onSelectChat('existing-chat', ChatSessionStatus.Active, 'Existing Title', []);
                result.current.addCitationMarkers([
                    {
                        sourceId: 'source-1',
                        sourceType: 'event',
                        contentId: 'content-1',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test citation text',
                    },
                ]);
            });

            // Create new chat
            act(() => {
                result.current.onNewChat();
            });

            expect(result.current.chatId).toBe('new');
            expect(result.current.chatStatus).toBe(ChatSessionStatus.Active);
            expect(result.current.chatTitle).toBeUndefined();
            expect(result.current.citationMarkers).toEqual(new Map());
            expect(result.current.hasChanges).toBe(false);
            expect(result.current.sources).toEqual([]);
            expect(result.current.sourceTypeCounters).toEqual(new Map());
        });
    });

    describe('onSelectChat', () => {
        test('updates chat selection with all parameters', () => {
            const { result } = renderHook(() => useChatStore());
            const sources: Source[] = [
                { targetId: 'source-1', targetType: 'event', title: 'Event 1' },
                { targetId: 'source-2', targetType: 'news', title: 'News 1' },
            ];

            act(() => {
                result.current.onSelectChat('chat-123', ChatSessionStatus.FindingSources, 'Chat Title', sources);
            });

            expect(result.current.chatId).toBe('chat-123');
            expect(result.current.chatStatus).toBe(ChatSessionStatus.FindingSources);
            expect(result.current.chatTitle).toBe('Chat Title');
            expect(result.current.sources).toEqual(sources);
            expect(result.current.hasChanges).toBe(false);
            expect(result.current.citationMarkers).toEqual(new Map());
            expect(result.current.sourceTypeCounters).toEqual(new Map());
        });

        test('handles optional parameters', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.onSelectChat('chat-456', ChatSessionStatus.Active);
            });

            expect(result.current.chatId).toBe('chat-456');
            expect(result.current.chatStatus).toBe(ChatSessionStatus.Active);
            expect(result.current.chatTitle).toBeUndefined();
            expect(result.current.sources).toBeUndefined();
        });
    });

    describe('source management', () => {
        test('adds single source', () => {
            const { result } = renderHook(() => useChatStore());
            const source: Source = { targetId: 'source-1', targetType: 'event', title: 'Event 1' };

            act(() => {
                result.current.onAddSource(source);
            });

            expect(result.current.sources).toEqual([source]);
            expect(result.current.hasChanges).toBe(true);
        });

        test('adds multiple sources', () => {
            const { result } = renderHook(() => useChatStore());
            const sources: Source[] = [
                { targetId: 'source-1', targetType: 'event', title: 'Event 1' },
                { targetId: 'source-2', targetType: 'news', title: 'News 1' },
            ];

            act(() => {
                result.current.onAddSource(sources);
            });

            expect(result.current.sources).toEqual(sources);
            expect(result.current.hasChanges).toBe(true);
        });

        test('adds source without marking changes', () => {
            const { result } = renderHook(() => useChatStore());
            const source: Source = { targetId: 'source-1', targetType: 'event', title: 'Event 1' };

            act(() => {
                result.current.onAddSource(source, false);
            });

            expect(result.current.sources).toEqual([source]);
            expect(result.current.hasChanges).toBe(false);
        });

        test('removes source', () => {
            const { result } = renderHook(() => useChatStore());
            const source1: Source = { targetId: 'source-1', targetType: 'event', title: 'Event 1' };
            const source2: Source = { targetId: 'source-2', targetType: 'news', title: 'News 1' };

            act(() => {
                result.current.onAddSource([source1, source2], false);
            });

            act(() => {
                result.current.onRemoveSource(source1);
            });

            expect(result.current.sources).toEqual([source2]);
            expect(result.current.hasChanges).toBe(true);
        });

        test('clears all sources', () => {
            const { result } = renderHook(() => useChatStore());
            const sources: Source[] = [
                { targetId: 'source-1', targetType: 'event', title: 'Event 1' },
                { targetId: 'source-2', targetType: 'news', title: 'News 1' },
            ];

            act(() => {
                result.current.onAddSource(sources, false);
            });

            act(() => {
                result.current.onClearSources();
            });

            expect(result.current.sources).toEqual([]);
        });

        test('selects source', () => {
            const { result } = renderHook(() => useChatStore());
            const source: Source = {
                targetId: 'source-1',
                targetType: 'event',
                title: 'Event 1',
                contentId: 'content-123',
            };

            act(() => {
                result.current.onSelectSource(source);
            });

            expect(result.current.selectedSource).toEqual(source);
        });

        test('clears selected source', () => {
            const { result } = renderHook(() => useChatStore());
            const source: Source = { targetId: 'source-1', targetType: 'event', title: 'Event 1' };

            act(() => {
                result.current.onSelectSource(source);
                result.current.onSelectSource(undefined);
            });

            expect(result.current.selectedSource).toBeUndefined();
        });
    });

    describe('citation markers', () => {
        test('adds single citation with simple numbering', () => {
            const { result } = renderHook(() => useChatStore());
            const citation: Citation = {
                sourceId: 'event-1',
                sourceType: 'event',
                contentId: 'content-1',
                source: 'Event Title',
                marker: '[1]',
                text: 'Test text',
            };

            act(() => {
                result.current.addCitationMarkers([citation]);
            });

            const marker = result.current.getCitationMarker(citation);
            expect(marker).toBe('E1');

            const citationMarker = result.current.citationMarkers.get('event_event-1_content-1');
            expect(citationMarker).toEqual({
                citation,
                marker: 'E1',
                uniqueKey: 'event_event-1_content-1',
            });
        });

        test('adds multiple citations of same type with incremental numbering', () => {
            const { result } = renderHook(() => useChatStore());
            const citations: Citation[] = [
                {
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'content-1',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: 'event-2',
                    sourceType: 'event',
                    contentId: 'content-2',
                    source: 'Event 2',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: 'event-3',
                    sourceType: 'event',
                    contentId: 'content-3',
                    source: 'Event 3',
                    marker: '[1]',
                    text: 'Test text',
                },
            ];

            act(() => {
                result.current.addCitationMarkers(citations);
            });

            // With unified grouping, each different event gets its own number
            citations.forEach((citation, index) => {
                expect(result.current.getCitationMarker(citation)).toBe(`E${index + 1}`);
            });
        });

        test('handles multiple content IDs for same source with sub-numbering', () => {
            const { result } = renderHook(() => useChatStore());
            const citations: Citation[] = [
                {
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'content-1',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'content-2',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'content-3',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                },
            ];

            act(() => {
                result.current.addCitationMarkers(citations);
            });

            const expectedMarkers = ['E1.1', 'E1.2', 'E1.3'];
            citations.forEach((citation, index) => {
                expect(result.current.getCitationMarker(citation)).toBe(expectedMarkers[index]);
            });
        });

        test('uses sourceParentId for grouping when available', () => {
            const { result } = renderHook(() => useChatStore());
            const citations: Citation[] = [
                {
                    sourceId: 'sub-1',
                    sourceParentId: 'parent-1',
                    sourceType: 'transcript',
                    contentId: 'content-1',
                    source: 'Transcript',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: 'sub-2',
                    sourceParentId: 'parent-1',
                    sourceType: 'transcript',
                    contentId: 'content-2',
                    source: 'Transcript',
                    marker: '[1]',
                    text: 'Test text',
                },
            ];

            act(() => {
                result.current.addCitationMarkers(citations);
            });

            const expectedMarkers = ['T1.1', 'T1.2'];
            citations.forEach((citation, index) => {
                expect(result.current.getCitationMarker(citation)).toBe(expectedMarkers[index]);
            });
        });

        test('handles different source types with correct prefixes', () => {
            const { result } = renderHook(() => useChatStore());
            const citations: Citation[] = [
                {
                    sourceId: '1',
                    sourceType: 'attachment',
                    contentId: 'c1',
                    source: 'Attachment',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '2',
                    sourceType: 'company',
                    contentId: 'c2',
                    source: 'Company',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '3',
                    sourceType: 'event',
                    contentId: 'c3',
                    source: 'Event',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '4',
                    sourceType: 'filing',
                    contentId: 'c4',
                    source: 'Filing',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '5',
                    sourceType: 'market_index',
                    contentId: 'c5',
                    source: 'Market Index',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '6',
                    sourceType: 'news',
                    contentId: 'c6',
                    source: 'News',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '7',
                    sourceType: 'research',
                    contentId: 'c7',
                    source: 'Research',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '8',
                    sourceType: 'sector',
                    contentId: 'c8',
                    source: 'Sector',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '9',
                    sourceType: 'subsector',
                    contentId: 'c9',
                    source: 'Subsector',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '10',
                    sourceType: 'transcript',
                    contentId: 'c10',
                    source: 'Transcript',
                    marker: '[1]',
                    text: 'Test text',
                },
                {
                    sourceId: '11',
                    sourceType: 'watchlist',
                    contentId: 'c11',
                    source: 'Watchlist',
                    marker: '[1]',
                    text: 'Test text',
                },
            ];

            act(() => {
                result.current.addCitationMarkers(citations);
            });

            const expectedMarkers = ['A1', 'Co1', 'E1', 'F1', 'M1', 'N1', 'R1', 'S1', 'Su1', 'T1', 'W1'];
            citations.forEach((citation, index) => {
                expect(result.current.getCitationMarker(citation)).toBe(expectedMarkers[index]);
            });
        });

        test('handles unknown source type with uppercase fallback', () => {
            const { result } = renderHook(() => useChatStore());
            const citation: Citation = {
                sourceId: '1',
                sourceType: 'custom_type',
                contentId: 'c1',
                source: 'Custom',
                marker: '[1]',
                text: 'Test text',
            };

            act(() => {
                result.current.addCitationMarkers([citation]);
            });

            expect(result.current.getCitationMarker(citation)).toBe('CUSTOM_TYPE1');
        });

        test('updates existing single citation to multi-content format', () => {
            const { result } = renderHook(() => useChatStore());
            const citation1: Citation = {
                sourceId: 'event-1',
                sourceType: 'event',
                contentId: 'content-1',
                source: 'Event',
                marker: '[1]',
                text: 'Test text',
            };

            // Add first citation
            act(() => {
                result.current.addCitationMarkers([citation1]);
            });

            expect(result.current.getCitationMarker(citation1)).toBe('E1');

            // Add second citation for same source
            const citation2: Citation = {
                sourceId: 'event-1',
                sourceType: 'event',
                contentId: 'content-2',
                source: 'Event',
                marker: '[1]',
                text: 'Test text',
            };

            act(() => {
                result.current.addCitationMarkers([citation2]);
            });

            // Both should now have sub-numbering
            expect(result.current.getCitationMarker(citation1)).toBe('E1.1');
            expect(result.current.getCitationMarker(citation2)).toBe('E1.2');
        });

        test('skips duplicate citations', () => {
            const { result } = renderHook(() => useChatStore());
            const citation: Citation = {
                sourceId: 'event-1',
                sourceType: 'event',
                contentId: 'content-1',
                source: 'Event',
                marker: '[1]',
                text: 'Test text',
            };

            act(() => {
                result.current.addCitationMarkers([citation]);
            });

            const initialSize = result.current.citationMarkers.size;

            // Try to add same citation again
            act(() => {
                result.current.addCitationMarkers([citation]);
            });

            expect(result.current.citationMarkers.size).toBe(initialSize);
        });

        test('preserves numbering across multiple additions', () => {
            const { result } = renderHook(() => useChatStore());

            // First batch
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c1',
                        source: 'E1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'news-1',
                        sourceType: 'news',
                        contentId: 'c2',
                        source: 'N1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // Second batch
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-2',
                        sourceType: 'event',
                        contentId: 'c3',
                        source: 'E2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'news-2',
                        sourceType: 'news',
                        contentId: 'c4',
                        source: 'N2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c1',
                    source: 'E1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-2',
                    sourceType: 'event',
                    contentId: 'c3',
                    source: 'E2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E2');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'news-1',
                    sourceType: 'news',
                    contentId: 'c2',
                    source: 'N1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('N1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'news-2',
                    sourceType: 'news',
                    contentId: 'c4',
                    source: 'N2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('N2');
        });

        test('clears all citation markers', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: '1',
                        sourceType: 'event',
                        contentId: 'c1',
                        source: 'E1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: '2',
                        sourceType: 'news',
                        contentId: 'c2',
                        source: 'N1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            expect(result.current.citationMarkers.size).toBe(2);

            act(() => {
                result.current.clearCitationMarkers();
            });

            expect(result.current.citationMarkers.size).toBe(0);
            expect(result.current.sourceTypeCounters.size).toBe(0);
        });

        test('returns null for non-existent citation', () => {
            const { result } = renderHook(() => useChatStore());
            const citation: Citation = {
                sourceId: 'non-existent',
                sourceType: 'event',
                contentId: 'content-1',
                source: 'Event',
                marker: '[1]',
                text: 'Test text',
            };

            const marker = result.current.getCitationMarker(citation);
            expect(marker).toBeNull();
        });

        test('handles empty citations array', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.addCitationMarkers([]);
            });

            expect(result.current.citationMarkers.size).toBe(0);
        });

        test('groups event and transcript citations with same sourceId', () => {
            const { result } = renderHook(() => useChatStore());

            // Add event citation and transcript citations that reference it
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c1',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'transcript-1',
                        sourceParentId: 'event-1',
                        sourceType: 'transcript',
                        contentId: 'c2',
                        source: 'Transcript 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'transcript-2',
                        sourceParentId: 'event-1',
                        sourceType: 'transcript',
                        contentId: 'c3',
                        source: 'Transcript 2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // Event should be E1, transcripts should be T1.1, T1.2
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c1',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-1',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c2',
                    source: 'Transcript 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1.1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-2',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c3',
                    source: 'Transcript 2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1.2');
        });

        test('handles transcripts without related event citation', () => {
            const { result } = renderHook(() => useChatStore());

            // Add transcript citations without a corresponding event citation
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'transcript-1',
                        sourceParentId: 'event-1',
                        sourceType: 'transcript',
                        contentId: 'c1',
                        source: 'Transcript 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // Single transcript without event should just be T1
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-1',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c1',
                    source: 'Transcript 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1');

            // Add more transcripts for the same parent
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'transcript-2',
                        sourceParentId: 'event-1',
                        sourceType: 'transcript',
                        contentId: 'c2',
                        source: 'Transcript 2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // Multiple transcripts without event should use sub-numbering
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-1',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c1',
                    source: 'Transcript 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1.1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-2',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c2',
                    source: 'Transcript 2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1.2');
        });

        test('groups multiple events with their respective transcripts', () => {
            const { result } = renderHook(() => useChatStore());

            // Add multiple events and their transcripts
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c1',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'transcript-1',
                        sourceParentId: 'event-1',
                        sourceType: 'transcript',
                        contentId: 'c2',
                        source: 'Transcript 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'event-2',
                        sourceType: 'event',
                        contentId: 'c3',
                        source: 'Event 2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'transcript-2',
                        sourceParentId: 'event-2',
                        sourceType: 'transcript',
                        contentId: 'c4',
                        source: 'Transcript 2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'transcript-3',
                        sourceParentId: 'event-2',
                        sourceType: 'transcript',
                        contentId: 'c5',
                        source: 'Transcript 3',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // First event and its transcript
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c1',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-1',
                    sourceParentId: 'event-1',
                    sourceType: 'transcript',
                    contentId: 'c2',
                    source: 'Transcript 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T1.1');

            // Second event and its transcripts
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-2',
                    sourceType: 'event',
                    contentId: 'c3',
                    source: 'Event 2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E2');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-2',
                    sourceParentId: 'event-2',
                    sourceType: 'transcript',
                    contentId: 'c4',
                    source: 'Transcript 2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T2.1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'transcript-3',
                    sourceParentId: 'event-2',
                    sourceType: 'transcript',
                    contentId: 'c5',
                    source: 'Transcript 3',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('T2.2');
        });

        test('maintains correct order when processing complex citation groups', () => {
            const { result } = renderHook(() => useChatStore());

            // Add initial citations
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c1',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'event-2',
                        sourceType: 'event',
                        contentId: 'c2',
                        source: 'Event 2',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            // Add more content to first event
            act(() => {
                result.current.addCitationMarkers([
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c3',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                    {
                        sourceId: 'event-1',
                        sourceType: 'event',
                        contentId: 'c4',
                        source: 'Event 1',
                        marker: '[1]',
                        text: 'Test text',
                    },
                ]);
            });

            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c1',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1.1');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c3',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1.2');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-1',
                    sourceType: 'event',
                    contentId: 'c4',
                    source: 'Event 1',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E1.3');
            expect(
                result.current.getCitationMarker({
                    sourceId: 'event-2',
                    sourceType: 'event',
                    contentId: 'c2',
                    source: 'Event 2',
                    marker: '[1]',
                    text: 'Test text',
                })
            ).toBe('E2');
        });
    });

    describe('setHasChanges', () => {
        test('sets hasChanges flag', () => {
            const { result } = renderHook(() => useChatStore());

            act(() => {
                result.current.setHasChanges(true);
            });

            expect(result.current.hasChanges).toBe(true);

            act(() => {
                result.current.setHasChanges(false);
            });

            expect(result.current.hasChanges).toBe(false);
        });
    });
});
