import { create } from "zustand";

export type ActiveConfigurator = "wardrobe" | "bookcase" | null;

export interface AppUiState {
    showGrid: boolean;
    showHelpers: boolean;
}

export interface AppState {
    activeConfigurator: ActiveConfigurator;
    ui: AppUiState;
    isInteracting: boolean;
    setActiveConfigurator: (next: ActiveConfigurator) => void;
    toggleUiFlag: (key: keyof AppUiState) => void;
    setIsInteracting: (flag: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeConfigurator: "wardrobe",
    ui: {
        showGrid: true,
        showHelpers: true,
    },
    isInteracting: false,
    setActiveConfigurator: (next) => set({ activeConfigurator: next }),
    toggleUiFlag: (key) =>
        set((state) => ({ ui: { ...state.ui, [key]: !state.ui[key] } })),
    setIsInteracting: (flag) => set({ isInteracting: flag }),
}));


