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
    sourceGroup: string; // e.g., "transcript_123"
    sourceNumber: number; // e.g., 1 for T1
    citationNumber: number; // e.g., 2 for T1.2
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
    addCitationMarkers: (citations: Citation[]) =>
        set((state) => {
            const newMarkers = new Map(state.citationMarkers);

            // Group citations by source (sourceType + sourceId/sourceParentId)
            const sourceGroups = new Map<string, Citation[]>();
            citations.forEach((citation) => {
                const sourceId = citation.sourceParentId || citation.sourceId;
                const sourceGroup = `${citation.sourceType}_${sourceId}`;
                if (!sourceGroups.has(sourceGroup)) {
                    sourceGroups.set(sourceGroup, []);
                }
                sourceGroups.get(sourceGroup)!.push(citation);
            });

            // Track source numbers per type (T1, T2, F1, F2, etc.)
            const sourceTypeCounters = new Map<string, number>();
            const sourceGroupNumbers = new Map<string, number>();

            // Assign source numbers to each group
            sourceGroups.forEach((_, sourceGroup) => {
                const sourceType = sourceGroup.split('_')[0] || 'unknown';
                if (!sourceTypeCounters.has(sourceType)) {
                    sourceTypeCounters.set(sourceType, 1);
                } else {
                    const currentCount = sourceTypeCounters.get(sourceType) || 0;
                    sourceTypeCounters.set(sourceType, currentCount + 1);
                }
                const sourceNumber = sourceTypeCounters.get(sourceType) || 1;
                sourceGroupNumbers.set(sourceGroup, sourceNumber);
            });

            // Process each citation and assign markers
            citations.forEach((citation) => {
                const uniqueKey = `${citation.contentId}-${citation.sourceParentId || citation.sourceId}`;
                if (!newMarkers.has(uniqueKey)) {
                    const sourceId = citation.sourceParentId || citation.sourceId;
                    const sourceGroup = `${citation.sourceType}_${sourceId}`;
                    const sourceNumber = sourceGroupNumbers.get(sourceGroup) || 1;
                    const groupCitations = sourceGroups.get(sourceGroup) || [];

                    // Find this citation's position within its source group
                    const citationIndex = groupCitations.findIndex(
                        (c) => `${c.contentId}-${c.sourceParentId || c.sourceId}` === uniqueKey
                    );
                    const citationNumber = citationIndex + 1;

                    // Generate marker using new format
                    const prefix = SOURCE_TYPE_PREFIXES[citation.sourceType] || citation.sourceType.toUpperCase();
                    let marker: string;

                    if (groupCitations.length === 1) {
                        // Single citation from this source: T1
                        marker = `${prefix}${sourceNumber}`;
                    } else {
                        // Multiple citations: T1.1, T1.2 or T1(+3) format
                        // For now, use x.y format - could be enhanced later for (+n) logic
                        marker = `${prefix}${sourceNumber}.${citationNumber}`;
                    }

                    newMarkers.set(uniqueKey, {
                        citation,
                        marker,
                        uniqueKey,
                        sourceGroup,
                        sourceNumber,
                        citationNumber,
                    });
                }
            });

            return { citationMarkers: newMarkers };
        }),
    clearCitationMarkers: () => set({ citationMarkers: new Map() }),
    getCitationMarker: (citation: Citation) => {
        const uniqueKey = `${citation.contentId}-${citation.sourceParentId || citation.sourceId}`;
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
        }),
    onRemoveSource: (source: Source) =>
        set((state) => ({
            hasChanges: true,
            sources: state.sources.filter(
                (s) => !(s.targetId === source.targetId && s.targetType === source.targetType)
            ),
        })),
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) =>
        set({ chatId, chatStatus, chatTitle, citationMarkers: new Map(), hasChanges: false, sources }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
}));
