import { create } from 'zustand';

import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

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
            citations.forEach((citation) => {
                // Create unique key from contentId and (sourceParentId or sourceId), in that order
                const uniqueKey = `${citation.contentId}-${citation.sourceParentId || citation.sourceId}`;
                // Only add if not already exists
                if (!newMarkers.has(uniqueKey)) {
                    const markerNumber = newMarkers.size + 1;
                    const marker = `C${markerNumber}`;
                    newMarkers.set(uniqueKey, {
                        citation,
                        marker,
                        uniqueKey,
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
        set({ chatId, chatStatus, chatTitle, sources, hasChanges: false, citationMarkers: new Map() }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
}));
