import { create } from 'zustand';

import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

// Mapping of source types to their display prefixes
const SOURCE_TYPE_PREFIXES: Record<string, string> = {
    attachment: 'A',
    company: 'Co',
    event: 'E',
    filing: 'F',
    market_index: 'M',
    news: 'N',
    research: 'R',
    sector: 'S',
    subsector: 'Su',
    transcript: 'T',
    watchlist: 'W',
};

export interface Source {
    contentId?: string;
    date?: string;
    targetId: string;
    targetType: string;
    title: string;
    url?: string | null;
}

export interface CitationMarker {
    citation: Citation;
    marker: string;
    uniqueKey: string;
}

export interface ChatState {
    addCitationMarkers: (citations: Citation[]) => void;
    chatId: string;
    chatStatus: ChatSessionStatus;
    chatTitle?: string;
    citationMarkers: Map<string, CitationMarker>;
    clearCitationMarkers: () => void;
    getCitationMarker: (citation: Citation) => string | null;
    hasChanges: boolean;
    onAddSource: (source: Source | Source[], hasChanges?: boolean) => void;
    onClearSources: () => void;
    onNewChat: () => void;
    onRemoveSource: (source: Source) => void;
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) => void;
    onSelectSource: (source?: Source) => void;
    onSetStatus: (chatStatus: ChatSessionStatus) => void;
    onSetTitle: (title?: string) => void;
    onToggleWebSearch: (webSearch?: boolean) => void;
    selectedSource?: Source;
    setHasChanges: (hasChanges: boolean) => void;
    sources: Source[];
    // Internal state for tracking citation numbering
    sourceTypeCounters: Map<string, number>;
    webSearchEnabled: boolean;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chatId: 'new',
    chatStatus: ChatSessionStatus.Active,
    chatTitle: undefined,
    citationMarkers: new Map(),
    hasChanges: false,
    selectedSource: undefined,
    sources: [],
    sourceTypeCounters: new Map(),
    webSearchEnabled: false,
    onToggleWebSearch: (enabled) => {
        const { webSearchEnabled } = get();
        set({
            webSearchEnabled: enabled !== undefined ? enabled : !webSearchEnabled,
        });
    },
    addCitationMarkers: (citations: Citation[]) =>
        set((state) => {
            // Early return if no citations to process
            if (!citations.length) return state;

            const newMarkers = new Map(state.citationMarkers);
            // Track counters per source type (not per individual group)
            const sourceTypeCounters = new Map(state.sourceTypeCounters);

            // Single data structure to track all group information
            interface GroupInfo {
                sourceNumber: number;
                contentIds: string[];
                sourceType: string;
                hasEventCitation?: boolean;
                transcriptCitations?: string[];
            }

            const groups = new Map<string, GroupInfo>();

            // Helper function to get unified group key for event/transcript pairs
            const getUnifiedGroupKey = (citation: Citation): string => {
                if (citation.sourceType === 'event') {
                    return `unified_${citation.sourceId}`;
                } else if (citation.sourceType === 'transcript' && citation.sourceParentId) {
                    return `unified_${citation.sourceParentId}`;
                }
                // For other types, use standard grouping
                return `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}`;
            };

            // Build complete group picture from existing markers
            Array.from(state.citationMarkers.values())
                .sort((a, b) => {
                    // Extract numbers from markers like T1.1, T1.2, T2.1
                    const aMatch = a.marker.match(/[A-Za-z]+(\d+)(?:\.(\d+))?/);
                    const bMatch = b.marker.match(/[A-Za-z]+(\d+)(?:\.(\d+))?/);

                    if (!aMatch || !bMatch) return 0;

                    const aSourceNum = parseInt(aMatch[1] || '0', 10);
                    const bSourceNum = parseInt(bMatch[1] || '0', 10);
                    const aSubNum = parseInt(aMatch[2] || '0', 10);
                    const bSubNum = parseInt(bMatch[2] || '0', 10);

                    // Sort by unified group, then number, then sub-number
                    const aUnifiedKey = getUnifiedGroupKey(a.citation);
                    const bUnifiedKey = getUnifiedGroupKey(b.citation);

                    if (aUnifiedKey !== bUnifiedKey) {
                        return aUnifiedKey.localeCompare(bUnifiedKey);
                    }
                    if (aSourceNum !== bSourceNum) {
                        return aSourceNum - bSourceNum;
                    }
                    return aSubNum - bSubNum;
                })
                .forEach((marker) => {
                    const { sourceType, sourceParentId, sourceId, contentId } = marker.citation;
                    const groupKey = `${sourceType}_${sourceParentId || sourceId}`;

                    // Extract source number from existing marker
                    const match = marker.marker.match(/[A-Za-z]+(\d+)/);
                    if (match) {
                        const sourceNum = parseInt(match[1] || '0', 10);

                        if (!groups.has(groupKey)) {
                            groups.set(groupKey, {
                                sourceNumber: sourceNum,
                                contentIds: [],
                                sourceType,
                                hasEventCitation: sourceType === 'event',
                                transcriptCitations: sourceType === 'transcript' ? [contentId] : [],
                            });
                            // Track highest number per source type
                            sourceTypeCounters.set(
                                sourceType,
                                Math.max(sourceTypeCounters.get(sourceType) || 0, sourceNum)
                            );
                        }

                        const group = groups.get(groupKey);
                        if (group) {
                            if (!group.contentIds.includes(contentId)) {
                                group.contentIds.push(contentId);
                            }
                            if (sourceType === 'event') {
                                group.hasEventCitation = true;
                            } else if (sourceType === 'transcript' && !group.transcriptCitations?.includes(contentId)) {
                                group.transcriptCitations = group.transcriptCitations || [];
                                group.transcriptCitations.push(contentId);
                            }
                        }
                    }
                });

            // Process all citations in a single pass
            const groupsNeedingUpdate = new Set<string>();

            citations.forEach((citation) => {
                const uniqueKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}_${
                    citation.contentId
                }`;

                // Skip if already exists
                if (newMarkers.has(uniqueKey)) return;

                const groupKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}`;

                // Create or update group
                if (!groups.has(groupKey)) {
                    const currentMax = sourceTypeCounters.get(citation.sourceType) || 0;
                    const sourceNumber = currentMax + 1;
                    sourceTypeCounters.set(citation.sourceType, sourceNumber);

                    groups.set(groupKey, {
                        sourceNumber,
                        contentIds: [citation.contentId],
                        sourceType: citation.sourceType,
                        hasEventCitation: citation.sourceType === 'event',
                        transcriptCitations: citation.sourceType === 'transcript' ? [citation.contentId] : [],
                    });
                } else {
                    const group = groups.get(groupKey);
                    if (group) {
                        if (!group.contentIds.includes(citation.contentId)) {
                            group.contentIds.push(citation.contentId);
                            // Mark for update if this makes it a multi-content group
                            if (group.contentIds.length > 1) {
                                groupsNeedingUpdate.add(groupKey);
                            }
                        }
                        if (citation.sourceType === 'event') {
                            group.hasEventCitation = true;
                        } else if (citation.sourceType === 'transcript') {
                            group.transcriptCitations = group.transcriptCitations || [];
                            if (!group.transcriptCitations.includes(citation.contentId)) {
                                group.transcriptCitations.push(citation.contentId);
                            }
                        }
                    }
                }

                // Create marker for new citation
                const group = groups.get(groupKey);
                if (!group) return;
                const prefix = SOURCE_TYPE_PREFIXES[citation.sourceType] || citation.sourceType.toUpperCase();

                // Check if this is a transcript with a related event
                const eventGroupKey =
                    citation.sourceType === 'transcript' && citation.sourceParentId
                        ? `event_${citation.sourceParentId}`
                        : null;
                const hasRelatedEvent = eventGroupKey && groups.has(eventGroupKey);

                let marker: string;
                if (citation.sourceType === 'event') {
                    // Event citations: use simple numbering or sub-numbering based on content count
                    const hasMultiple = group.contentIds.length > 1;
                    marker = hasMultiple
                        ? `${prefix}${group.sourceNumber}.${group.contentIds.indexOf(citation.contentId) + 1}`
                        : `${prefix}${group.sourceNumber}`;
                } else if (citation.sourceType === 'transcript' && hasRelatedEvent && eventGroupKey) {
                    // Transcript with related event: use event's number with sub-number
                    const eventGroup = groups.get(eventGroupKey);
                    if (eventGroup) {
                        const transcriptIndex = group.contentIds.indexOf(citation.contentId) + 1;
                        marker = `${prefix}${eventGroup.sourceNumber}.${transcriptIndex}`;
                    } else {
                        // Fallback to standard behavior
                        const hasMultiple = group.contentIds.length > 1;
                        marker = hasMultiple
                            ? `${prefix}${group.sourceNumber}.${group.contentIds.indexOf(citation.contentId) + 1}`
                            : `${prefix}${group.sourceNumber}`;
                    }
                } else {
                    // Standard behavior for other source types
                    const hasMultiple = group.contentIds.length > 1;
                    marker = hasMultiple
                        ? `${prefix}${group.sourceNumber}.${group.contentIds.indexOf(citation.contentId) + 1}`
                        : `${prefix}${group.sourceNumber}`;
                }

                newMarkers.set(uniqueKey, {
                    citation,
                    marker,
                    uniqueKey,
                });
            });

            // Update existing markers in groups that now have multiple content IDs
            groupsNeedingUpdate.forEach((groupKey) => {
                const group = groups.get(groupKey);
                if (!group) return;

                const prefix = SOURCE_TYPE_PREFIXES[group.sourceType] || group.sourceType.toUpperCase();

                // Check if this is a transcript group with a related event
                const isTranscriptGroup = group.sourceType === 'transcript';
                const sourceParentId = groupKey.split('_')[1];
                const eventGroupKey = isTranscriptGroup && sourceParentId ? `event_${sourceParentId}` : null;
                const hasRelatedEvent = eventGroupKey && groups.has(eventGroupKey);

                newMarkers.forEach((markerObj) => {
                    if (markerObj.uniqueKey.startsWith(`${groupKey}_`)) {
                        const contentIndex = group.contentIds.indexOf(markerObj.citation.contentId) + 1;

                        if (isTranscriptGroup && hasRelatedEvent && eventGroupKey) {
                            // Use event's source number for transcript sub-numbers
                            const eventGroup = groups.get(eventGroupKey);
                            if (eventGroup) {
                                markerObj.marker = `${prefix}${eventGroup.sourceNumber}.${contentIndex}`;
                            } else {
                                markerObj.marker = `${prefix}${group.sourceNumber}.${contentIndex}`;
                            }
                        } else {
                            markerObj.marker = `${prefix}${group.sourceNumber}.${contentIndex}`;
                        }
                    }
                });
            });

            return {
                citationMarkers: newMarkers,
                sourceTypeCounters,
            };
        }),
    clearCitationMarkers: () =>
        set({
            citationMarkers: new Map(),
            sourceTypeCounters: new Map(),
        }),
    getCitationMarker: (citation: Citation) => {
        const uniqueKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}_${
            citation.contentId
        }`;
        const citationMarker = get().citationMarkers.get(uniqueKey);
        return citationMarker?.marker || null;
    },
    onAddSource: (source: Source | Source[], hasChanges = true) =>
        set((state) => ({
            hasChanges,
            sources: [...state.sources, ...(Array.isArray(source) ? source : [source])],
        })),
    onClearSources: () => set({ sources: [] }),
    onNewChat: () =>
        set({
            chatId: 'new',
            chatStatus: ChatSessionStatus.Active,
            chatTitle: undefined,
            citationMarkers: new Map(),
            hasChanges: false,
            sources: [],
            sourceTypeCounters: new Map(),
        }),
    onRemoveSource: (source: Source) =>
        set((state) => ({
            hasChanges: true,
            sources: state.sources.filter(
                (s) => !(s.targetId === source.targetId && s.targetType === source.targetType)
            ),
        })),
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) =>
        set({
            chatId,
            chatStatus,
            chatTitle,
            citationMarkers: new Map(),
            hasChanges: false,
            sources,
            sourceTypeCounters: new Map(),
        }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
}));
