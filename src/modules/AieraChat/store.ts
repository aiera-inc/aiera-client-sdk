import { create } from 'zustand';

export type SourceMode = 'suggest' | 'manual';
export interface Source {
    targetId: string;
    targetType: string;
    title: string;
}

export interface ChatState {
    chatId: string | null;
    chatTitle?: string;
    searchTerm?: string;
    selectChat: (chatId: string | null, chatTitle?: string) => void;
    selectedSource?: Source;
    sourceMode: SourceMode;
    sources: Source[];
    setSourceMode: (mode: SourceMode) => void;
    onNewChat: () => void;
    onSetSearchTerm: (searchTerm?: string) => void;
    onSetTitle: (title?: string) => void;
    onAddSource: (source: Source) => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectSource: (source?: Source) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chatId: null,
    chatTitle: undefined,
    searchTerm: undefined,
    selectedSource: undefined,
    sourceMode: 'suggest',
    sources: [
        { targetId: '2639849', targetType: 'event', title: 'TSLA Q3 2024 Earnings Call' },
        { targetId: '2611970', targetType: 'event', title: 'AAPL Q3 2024 Earnings Call' },
        { targetId: '2639939', targetType: 'event', title: 'META Q3 2024 Earnings Call' },
    ],
    selectChat: (chatId: string | null, chatTitle?: string) => set({ chatId, chatTitle, sourceMode: 'suggest' }),
    onNewChat: () => set({ chatId: null, chatTitle: undefined, sourceMode: 'suggest', searchTerm: undefined }),
    onSetSearchTerm: (searchTerm?: string) => set({ searchTerm }),
    onSetTitle: (chatTitle?: string) => set({ chatTitle }),
    onSelectSource: (selectedSource?: Source) => set({ selectedSource }),
    setSourceMode: (sourceMode: SourceMode) => set({ sourceMode }),
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
