import { create } from 'zustand';

import { ChatSessionStatus } from '@aiera/client-sdk/types';

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
    currentSearchMatch?: { messageIndex: number; matchIndex: number };
    hasChanges: boolean;
    onAddSource: (source: Source | Source[]) => void;
    onClearSources: () => void;
    onNewChat: () => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectChat: (chatId: string, chatStatus: ChatSessionStatus, chatTitle?: string, sources?: Source[]) => void;
    onSelectSource: (source?: Source) => void;
    onSetCurrentSearchMatch: (match?: { messageIndex: number; matchIndex: number }) => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    onSetStatus: (chatStatus: ChatSessionStatus) => void;
    onSetTitle: (title?: string) => void;
    onSetUserId: (chatUserId?: string) => void;
    searchTerm?: string;
    selectedSource?: Source;
    setHasChanges: (hasChanges: boolean) => void;
    sources: Source[];
}

export const useChatStore = create<ChatState>((set) => ({
    chatId: 'new',
    chatStatus: ChatSessionStatus.Active,
    chatTitle: undefined,
    chatUserId: undefined,
    currentSearchMatch: undefined,
    hasChanges: false,
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
            hasChanges: false,
            searchTerm: undefined,
            currentSearchMatch: undefined,
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
    onSetCurrentSearchMatch: (currentSearchMatch?: { messageIndex: number; matchIndex: number }) =>
        set({ currentSearchMatch }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm, currentSearchMatch: undefined }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    searchTerm: undefined,
    selectedSource: undefined,
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
    sources: [],
}));
