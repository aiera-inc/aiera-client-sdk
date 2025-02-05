import { create } from 'zustand';

export interface Source {
    confirmed?: boolean;
    targetId: string;
    targetType: string;
    title: string;
}

export interface ChatState {
    chatId: string;
    chatTitle?: string;
    searchTerm?: string;
    selectedSource?: Source;
    sources: Source[];
    onSelectChat: (chatId: string, chatTitle?: string, sources?: Source[]) => void;
    onNewChat: () => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    onSetTitle: (title?: string) => void;
    onAddSource: (source: Source | Source[]) => void;
    onClearSources: () => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectSource: (source?: Source) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chatId: 'new',
    chatTitle: undefined,
    searchTerm: undefined,
    selectedSource: undefined,
    sources: [],
    onSelectChat: (chatId: string, chatTitle?: string, sources?: Source[]) => set({ chatId, chatTitle, sources }),
    onNewChat: () => set({ chatId: 'new', chatTitle: undefined, searchTerm: undefined, sources: [] }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onAddSource: (source: Source | Source[]) =>
        set((state) => ({
            sources: [...state.sources, ...(Array.isArray(source) ? source : [source])],
        })),
    onClearSources: () => set({ sources: [] }),
    onRemoveSource: (targetId: string, targetType: string) =>
        set((state) => ({
            sources: state.sources.filter(
                (source) => !(source.targetId === targetId && source.targetType === targetType)
            ),
        })),
}));
