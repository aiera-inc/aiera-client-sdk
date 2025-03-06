import { create } from 'zustand';

export interface Source {
    confirmed?: boolean;
    targetId: string;
    targetType: string;
    title: string;
}

export interface ChatState {
    hasChanges: boolean;
    onAddSource: (source: Source | Source[]) => void;
    onClearSources: () => void;
    onNewChat: () => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectChatSources: (sources?: Source[]) => void;
    onSelectSource: (source?: Source) => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    searchTerm?: string;
    selectedSource?: Source;
    setHasChanges: (hasChanges: boolean) => void;
    sources: Source[];
}

export const useChatStore = create<ChatState>((set) => ({
    hasChanges: false,
    onAddSource: (source: Source | Source[]) =>
        set((state) => ({
            hasChanges: true,
            sources: [...state.sources, ...(Array.isArray(source) ? source : [source])],
        })),
    onClearSources: () => set({ sources: [] }),
    onNewChat: () => set({ searchTerm: undefined, sources: [] }),
    onRemoveSource: (targetId: string, targetType: string) =>
        set((state) => ({
            hasChanges: true,
            sources: state.sources.filter(
                (source) => !(source.targetId === targetId && source.targetType === targetType)
            ),
        })),
    onSelectChatSources: (sources?: Source[]) => set({ sources }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm }),
    searchTerm: undefined,
    selectedSource: undefined,
    setHasChanges: (hasChanges: boolean) => set({ hasChanges }),
    sources: [],
}));
