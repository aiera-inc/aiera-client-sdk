import { create } from 'zustand';

export type SourceMode = 'suggest' | 'manual';
export interface Source {
    targetId: string;
    targetType: string;
    title: string;
}

export interface ChatState {
    chatId: string;
    chatTitle?: string;
    searchTerm?: string;
    selectedSource?: Source;
    sourceMode: SourceMode;
    sources: Source[];
    onSetSourceMode: (mode: SourceMode) => void;
    onSelectChat: (chatId: string, chatTitle?: string) => void;
    onNewChat: () => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    onSetTitle: (title?: string) => void;
    onAddSource: (source: Source) => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectSource: (source?: Source) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chatId: 'new',
    chatTitle: undefined,
    searchTerm: undefined,
    selectedSource: undefined,
    sourceMode: 'suggest',
    sources: [],
    onSelectChat: (chatId: string, chatTitle?: string) =>
        set({ chatId, chatTitle, sourceMode: 'suggest', sources: [] }),
    onNewChat: () =>
        set({ chatId: 'new', chatTitle: undefined, sourceMode: 'suggest', searchTerm: undefined, sources: [] }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetSourceMode: (sourceMode: SourceMode) => set({ sourceMode }),
    onAddSource: (source: Source) =>
        set((state) => ({
            sources: [...state.sources, source],
        })),
    onRemoveSource: (targetId: string, targetType: string) =>
        set((state) => ({
            sources: state.sources.filter(
                (source) => !(source.targetId === targetId && source.targetType === targetType)
            ),
        })),
}));