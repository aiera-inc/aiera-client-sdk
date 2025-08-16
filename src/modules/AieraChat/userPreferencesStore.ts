import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SourceConfirmationType = 'auto' | 'manual';

export interface UserPreferences {
    sourceConfirmations: SourceConfirmationType;
}

export interface UserPreferencesState extends UserPreferences {
    setSourceConfirmations: (type: SourceConfirmationType) => void;
    resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
    sourceConfirmations: 'manual',
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
    persist(
        (set) => ({
            ...defaultPreferences,
            setSourceConfirmations: (sourceConfirmations: SourceConfirmationType) => set({ sourceConfirmations }),
            resetPreferences: () => set(defaultPreferences),
        }),
        {
            name: 'aiera-chat-user-preferences',
        }
    )
);
