import { create } from 'zustand';

export type SourceMode = 'suggest' | 'manual';
export interface Source {
    targetId: string;
    targetType: string;
    title: string;
}

interface SourceState {
    sourceMode: SourceMode;
    sources: Source[];
    setSourceMode: (mode: SourceMode) => void;
    onAddSource: (source: Source) => void;
    onRemoveSource: (targetId: string, targetType: string) => void;
}

export const useSourcesStore = create<SourceState>((set) => ({
    sourceMode: 'suggest',
    sources: [
        { targetId: '1', targetType: 'event', title: 'TSLA Q3 2024 Earnings Call' },
        { targetId: '2', targetType: 'event', title: 'AAPL Q3 2024 Earnings Call' },
        { targetId: '3', targetType: 'event', title: 'META Q3 2024 Earnings Call' },
    ],
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
