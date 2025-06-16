import { create } from 'zustand';

import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Citation } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

export interface Source {
    confirmed?: boolean;
    contentId?: string;
    targetId: string;
    targetType: string;
    title: string;
    date?: string;
}

export interface ChatState {
    chatId: string;
    chatStatus: ChatSessionStatus;
    chatTitle?: string;
    chatUserId?: string;
    citations?: Citation[];
    hasChanges: boolean;
    onAddCitations: (citations: Citation[]) => void;
    onAddSource: (source: Source | Source[]) => void;
    onClearSources: () => void;
    onNewChat: () => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) => void;
    onSelectSource: (source?: Source) => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    onSetStatus: (chatStatus: ChatSessionStatus) => void;
    onSetTitle: (title?: string) => void;
    onSetUserId: (chatUserId?: string) => void;
    searchTerm?: string;
    selectedSource?: Source;
    setCitations: (citations: Citation[]) => void;
    setHasChanges: (hasChanges: boolean) => void;
    sources: Source[];
}

export const useChatStore = create<ChatState>((set) => ({
    chatId: 'new',
    chatStatus: ChatSessionStatus.Active,
    chatTitle: undefined,
    chatUserId: undefined,
    citations: undefined,
    hasChanges: false,
    onAddCitations: (citations: Citation[]) =>
        set((state) => {
            const existingCitations = state.citations || [];
            const existingIds = new Set(existingCitations.map((c) => `${c.marker}${c.contentId || c.sourceId}`));
            return {
                citations: [
                    ...existingCitations,
                    ...citations.filter((c) => !existingIds.has(`${c.marker}${c.contentId || c.sourceId}`)),
                ],
            };
        }),
    onAddSource: (source: Source | Source[]) =>
        set((state) => ({
            hasChanges: true,
            sources: [...state.sources, ...(Array.isArray(source) ? source : [source])],
        })),
    onClearSources: () => set({ sources: [] }),
    onNewChat: () =>
        set({
            chatId: 'new',
            chatStatus: ChatSessionStatus.Active,
            chatTitle: undefined,
            citations: undefined,
            hasChanges: false,
            searchTerm: undefined,
            sources: [],
        }),
    onRemoveSource: (targetId: string, targetType: string) =>
        set((state) => ({
            hasChanges: true,
            sources: state.sources.filter(
                (source) => !(source.targetId === targetId && source.targetType === targetType)
            ),
        })),
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) =>
        set({ chatId, chatStatus, chatTitle, sources, hasChanges: false }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    searchTerm: undefined,
    selectedSource: undefined,
    setCitations: (citations: Citation[]) => set({ citations }),
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
    sources: [],
}));
