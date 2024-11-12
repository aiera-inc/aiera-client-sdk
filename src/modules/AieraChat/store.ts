import { create } from 'zustand';

export type SourceMode = 'suggest' | 'manual';
export interface Source {
    targetId: string;
    targetType: string;
    title: string;
}

interface SourceState {
    selectedSource?: Source;
    sourceMode: SourceMode;
    sources: Source[];
    setSourceMode: (mode: SourceMode) => void;
    onAddSource: (source: Source) => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
    onSelectSource: (source?: Source) => void;
}

export const useSourcesStore = create<SourceState>((set) => ({
    selectedSource: undefined,
    sourceMode: 'suggest',
    sources: [
        { targetId: '2639849', targetType: 'event', title: 'TSLA Q3 2024 Earnings Call' },
        { targetId: '2611970', targetType: 'event', title: 'AAPL Q3 2024 Earnings Call' },
        { targetId: '2639939', targetType: 'event', title: 'META Q3 2024 Earnings Call' },
    ],
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
