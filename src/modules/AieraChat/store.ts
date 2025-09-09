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
    confirmed?: boolean;
    contentId?: string;
    date?: string;
    targetId: string;
    targetType: string;
    title: string;
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
    chatUserId?: string;
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
    onSetUserId: (chatUserId?: string) => void;
    selectedSource?: Source;
    setHasChanges: (hasChanges: boolean) => void;
    sources: Source[];
    // Internal state for tracking citation numbering
    sourceTypeCounters: Map<string, number>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chatId: 'new',
    chatStatus: ChatSessionStatus.Active,
    chatTitle: undefined,
    chatUserId: undefined,
    citationMarkers: new Map(),
    hasChanges: false,
    selectedSource: undefined,
    sources: [],
    sourceTypeCounters: new Map(),
    addCitationMarkers: (citations: Citation[]) =>
        set((state) => {
            // Early return if no citations to process
            if (!citations.length) return state;

            const newMarkers = new Map(state.citationMarkers);
            const sourceTypeCounters = new Map(state.sourceTypeCounters);

            // Track source numbers by groupKey - preserve existing mappings
            const groupSourceNumbers = new Map<string, number>();

            // Build groups and preserve existing source numbers
            // Using array to preserve order of contentIds
            const sourceGroups = new Map<string, string[]>();

            // We need to preserve the order of existing citations
            // So we'll collect them in order based on their current numbering
            const orderedMarkers = Array.from(state.citationMarkers.values()).sort((a, b) => {
                // Extract numbers from markers like T1.1, T1.2, T2.1
                const aMatch = a.marker.match(/[A-Za-z]+(\d+)(?:\.(\d+))?/);
                const bMatch = b.marker.match(/[A-Za-z]+(\d+)(?:\.(\d+))?/);

                if (!aMatch || !bMatch) return 0;

                const aSourceNum = parseInt(aMatch[1] || '0', 10);
                const bSourceNum = parseInt(bMatch[1] || '0', 10);
                const aSubNum = aMatch[2] ? parseInt(aMatch[2], 10) : 0;
                const bSubNum = bMatch[2] ? parseInt(bMatch[2], 10) : 0;

                // First sort by source type
                if (a.citation.sourceType !== b.citation.sourceType) {
                    return a.citation.sourceType.localeCompare(b.citation.sourceType);
                }

                // Then by source number
                if (aSourceNum !== bSourceNum) {
                    return aSourceNum - bSourceNum;
                }

                // Finally by sub number
                return aSubNum - bSubNum;
            });

            orderedMarkers.forEach((marker) => {
                const { sourceType, sourceParentId, sourceId, contentId } = marker.citation;
                const groupKey = `${sourceType}_${sourceParentId || sourceId}`;

                if (!sourceGroups.has(groupKey)) {
                    sourceGroups.set(groupKey, []);
                }
                const contentIds = sourceGroups.get(groupKey)!;
                if (!contentIds.includes(contentId)) {
                    contentIds.push(contentId);
                }

                // Extract and preserve the source number from existing markers
                const match = marker.marker.match(/[A-Za-z]+(\d+)(?:\.\d+)?/);
                if (match && match[1]) {
                    const sourceNum = parseInt(match[1], 10);
                    groupSourceNumbers.set(groupKey, sourceNum);
                    // Update sourceTypeCounters to track the highest number used
                    const currentMax = sourceTypeCounters.get(sourceType) || 0;
                    sourceTypeCounters.set(sourceType, Math.max(currentMax, sourceNum));
                }
            });

            // Process only new citations
            const newCitations = citations.filter((c) => {
                const key = `${c.sourceType}_${c.sourceParentId || c.sourceId}_${c.contentId}`;
                return !newMarkers.has(key);
            });

            // Group new citations and assign source numbers
            newCitations.forEach((citation) => {
                const groupKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}`;

                if (!sourceGroups.has(groupKey)) {
                    sourceGroups.set(groupKey, []);
                    // This is a new group - assign a new source number
                    const currentMax = sourceTypeCounters.get(citation.sourceType) || 0;
                    const nextNumber = currentMax + 1;
                    sourceTypeCounters.set(citation.sourceType, nextNumber);
                    groupSourceNumbers.set(groupKey, nextNumber);
                }

                const contentIds = sourceGroups.get(groupKey)!;
                if (!contentIds.includes(citation.contentId)) {
                    contentIds.push(citation.contentId);
                }
            });

            // Add markers for new citations
            newCitations.forEach((citation) => {
                const groupKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}`;
                const uniqueKey = `${groupKey}_${citation.contentId}`;

                const sourceNumber = groupSourceNumbers.get(groupKey)!;
                const contentIds = sourceGroups.get(groupKey)!;
                const hasMultipleContent = contentIds.length > 1;
                const prefix = SOURCE_TYPE_PREFIXES[citation.sourceType] || citation.sourceType.toUpperCase();

                let marker: string;
                if (hasMultipleContent) {
                    const contentIndex = contentIds.indexOf(citation.contentId) + 1;
                    marker = `${prefix}${sourceNumber}.${contentIndex}`;
                } else {
                    marker = `${prefix}${sourceNumber}`;
                }

                newMarkers.set(uniqueKey, {
                    citation,
                    marker,
                    uniqueKey,
                });
            });

            // Update existing markers if their group now has multiple content IDs
            const groupsToUpdate = new Set<string>();
            newCitations.forEach((citation) => {
                const groupKey = `${citation.sourceType}_${citation.sourceParentId || citation.sourceId}`;
                const contentIds = sourceGroups.get(groupKey)!;
                if (contentIds.length > 1) {
                    groupsToUpdate.add(groupKey);
                }
            });

            // Update markers for groups that now have multiple content IDs
            groupsToUpdate.forEach((groupKey) => {
                const contentIds = sourceGroups.get(groupKey)!;
                const sourceNumber = groupSourceNumbers.get(groupKey)!;
                const [sourceType] = groupKey.split('_');
                const prefix = SOURCE_TYPE_PREFIXES[sourceType as string] || (sourceType as string).toUpperCase();

                // Update all citations in this group
                newMarkers.forEach((marker, key) => {
                    if (key.startsWith(`${groupKey}_`)) {
                        const contentIndex = contentIds.indexOf(marker.citation.contentId) + 1;
                        marker.marker = `${prefix}${sourceNumber}.${contentIndex}`;
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
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
}));
