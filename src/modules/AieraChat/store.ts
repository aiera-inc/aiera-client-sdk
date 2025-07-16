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
    hasChanges: boolean;
    onAddSource: (source: Source | Source[]) => void;
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

export const useChatStore = create<ChatState>((set) => ({
    chatId: 'new',
    chatStatus: ChatSessionStatus.Active,
    chatTitle: undefined,
    chatUserId: undefined,
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
        set({ chatId, chatStatus, chatTitle, sources, hasChanges: false }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetStatus: (chatStatus: ChatSessionStatus) => set({ chatStatus }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSetUserId: (chatUserId?: string) => set({ chatUserId }),
    selectedSource: undefined,
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
    sources: [],
}));
