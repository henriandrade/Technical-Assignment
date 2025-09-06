import { createStore } from "zustand";
import { MIN_SPACING } from "@/state/Config";

export interface ModuleDimensions {
    width: number; // meters
    height: number; // meters
    depth: number; // meters
}

export interface ModuleColumn {
    id: string;
    x: number; // meters from left
    width: number; // meters
}

export interface ModuleShelf {
    id: string;
    y: number; // meters from bottom
}

export interface ModuleState {
    dimensions: ModuleDimensions;
    columns: ModuleColumn[];
    shelves: ModuleShelf[];
    materials: Record<string, { name: string; color?: string; mapUrl?: string }>;
    hoveredId: { type: "shelf" | "column" | null; id: string | null };
    selectedId: { type: "shelf" | "column" | null; id: string | null };
}

export interface ModuleActions {
    setDimensions: (next: Partial<ModuleDimensions>) => void;
    setColumnsEven: (count: number, columnWidth?: number) => void;
    setShelvesEven: (count: number) => void;
    addColumn: (atX?: number, width?: number) => void;
    removeColumn: (id: string) => void;
    moveColumn: (id: string, nextX: number) => void;
    addShelf: (atY?: number) => void;
    removeShelf: (id: string) => void;
    moveShelf: (id: string, nextY: number) => void;
    registerMaterial: (key: string, def: { name: string; color?: string; mapUrl?: string }) => void;
    setHovered: (payload: { type: "shelf" | "column" | null; id: string | null }) => void;
    setSelected: (payload: { type: "shelf" | "column" | null; id: string | null }) => void;
}

export type ModuleStore = ModuleState & ModuleActions;

export interface ModuleOptions extends Partial<ModuleState> { }

function sortBy<T>(arr: T[], get: (t: T) => number): T[] {
    return [...arr].sort((a, b) => get(a) - get(b));
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export function createModuleStore(options: ModuleOptions) {
    return createStore<ModuleStore>()((set, get) => ({
        dimensions: options.dimensions ?? { width: 1.8, height: 2.2, depth: 0.6 },
        columns: options.columns ?? [],
        shelves: options.shelves ?? [],
        materials: options.materials ?? {},
        hoveredId: { type: null, id: null },
        selectedId: { type: null, id: null },

        setDimensions: (next) =>
            set((state) => {
                const prev = state.dimensions;
                let targetWidth = next.width ?? prev.width;
                let targetHeight = next.height ?? prev.height;
                const targetDepth = next.depth ?? prev.depth;

                // Compute minimal feasible size based on current elements and spacing
                const minWidth = MIN_SPACING.columns * (state.columns.length + 1) + state.columns.reduce((sum, c) => sum + c.width, 0);
                const minHeight = MIN_SPACING.shelves * (state.shelves.length + 1);
                if (targetWidth < minWidth) targetWidth = minWidth;
                if (targetHeight < minHeight) targetHeight = minHeight;

                // Proportional scaling factors for interior elements
                const scaleX = targetWidth / prev.width;
                const scaleY = targetHeight / prev.height;

                // Scale columns x positions proportionally then enforce spacing constraints
                let scaledColumns = sortBy(state.columns.map((c) => ({ ...c, x: c.x * scaleX })), (c) => c.x);
                // Forward pass: ensure left constraints
                let leftEdge = MIN_SPACING.columns;
                scaledColumns = scaledColumns.map((c) => {
                    const maxX = targetWidth - c.width - MIN_SPACING.columns;
                    const clampedX = clamp(c.x, leftEdge, maxX);
                    leftEdge = clampedX + c.width + MIN_SPACING.columns;
                    return { ...c, x: clampedX };
                });
                // Backward pass: ensure right constraints
                for (let i = scaledColumns.length - 1; i >= 0; i -= 1) {
                    const rightNeighbor = scaledColumns[i + 1];
                    const maxAllowed = rightNeighbor
                        ? rightNeighbor.x - scaledColumns[i]!.width - MIN_SPACING.columns
                        : targetWidth - scaledColumns[i]!.width - MIN_SPACING.columns;
                    const minAllowed = i > 0
                        ? scaledColumns[i - 1]!.x + scaledColumns[i - 1]!.width + MIN_SPACING.columns
                        : MIN_SPACING.columns;
                    scaledColumns[i] = {
                        ...scaledColumns[i]!,
                        x: clamp(scaledColumns[i]!.x, minAllowed, maxAllowed),
                    };
                }

                // Scale shelves y positions proportionally then enforce spacing constraints
                let scaledShelves = sortBy(state.shelves.map((s) => ({ ...s, y: s.y * scaleY })), (s) => s.y);
                // Forward pass: from bottom to top
                let bottom = MIN_SPACING.shelves;
                scaledShelves = scaledShelves.map((s) => {
                    const topLimit = targetHeight - MIN_SPACING.shelves;
                    const clampedY = clamp(s.y, bottom, topLimit);
                    bottom = clampedY + MIN_SPACING.shelves;
                    return { ...s, y: clampedY };
                });
                // Backward pass: from top to bottom
                for (let i = scaledShelves.length - 1; i >= 0; i -= 1) {
                    const above = scaledShelves[i + 1];
                    const maxAllowed = above ? above.y - MIN_SPACING.shelves : targetHeight - MIN_SPACING.shelves;
                    const minAllowed = i > 0 ? scaledShelves[i - 1]!.y + MIN_SPACING.shelves : MIN_SPACING.shelves;
                    scaledShelves[i] = { ...scaledShelves[i]!, y: clamp(scaledShelves[i]!.y, minAllowed, maxAllowed) };
                }

                return {
                    dimensions: { width: targetWidth, height: targetHeight, depth: targetDepth },
                    columns: scaledColumns,
                    shelves: scaledShelves,
                };
            }),

        setColumnsEven: (desiredCount, explicitWidth) =>
            set((state) => {
                const W = state.dimensions.width;
                const defaultW = state.columns[0]?.width ?? 0.02;
                const colW = explicitWidth ?? defaultW;
                const maxCount = Math.max(0, Math.floor((W - MIN_SPACING.columns) / (colW + MIN_SPACING.columns)) - 1);
                const count = Math.max(0, Math.min(desiredCount, maxCount));
                if (count === 0) return { columns: [] };
                const gap = Math.max(
                    MIN_SPACING.columns,
                    (W - count * colW) / (count + 1),
                );
                const next: ModuleColumn[] = Array.from({ length: count }).map((_, i) => {
                    const x = gap * (i + 1) + colW * i; // left edge
                    return { id: crypto.randomUUID(), x, width: colW };
                });
                return { columns: next };
            }),

        setShelvesEven: (desiredCount) =>
            set((state) => {
                const H = state.dimensions.height;
                const maxCount = Math.max(0, Math.floor((H - MIN_SPACING.shelves) / MIN_SPACING.shelves) - 1);
                const count = Math.max(0, Math.min(desiredCount, maxCount));
                if (count === 0) return { shelves: [] };
                const start = MIN_SPACING.shelves;
                const end = H - MIN_SPACING.shelves;
                const step = (end - start) / (count + 1);
                const next: ModuleShelf[] = Array.from({ length: count }).map((_, i) => ({
                    id: crypto.randomUUID(),
                    y: start + step * (i + 1),
                }));
                return { shelves: next };
            }),

        addColumn: (atX = 0.3, width = 0.02) =>
            set((state) => ({
                columns: sortBy(
                    [
                        ...state.columns,
                        { id: crypto.randomUUID(), x: atX, width },
                    ],
                    (c) => c.x,
                ),
            })),

        removeColumn: (id) =>
            set((state) => ({ columns: state.columns.filter((c) => c.id !== id) })),

        moveColumn: (id, nextX) =>
            set((state) => {
                const { width } = state.dimensions;
                const columns = sortBy(state.columns, (c) => c.x);
                const idx = columns.findIndex((c) => c.id === id);
                if (idx < 0) return {};
                const current = columns[idx]!;
                const leftNeighbor = columns[idx - 1];
                const rightNeighbor = columns[idx + 1];
                const minX = leftNeighbor
                    ? leftNeighbor.x + leftNeighbor.width + MIN_SPACING.columns
                    : MIN_SPACING.columns;
                const maxX = rightNeighbor
                    ? rightNeighbor.x - current.width - MIN_SPACING.columns
                    : width - current!.width - MIN_SPACING.columns;
                const clamped = clamp(nextX, minX, maxX);
                const updated = columns.map((c) => (c.id === id ? { ...c, x: clamped } : c));
                return { columns: updated };
            }),

        addShelf: (atY = 0.4) =>
            set((state) => ({
                shelves: sortBy(
                    [...state.shelves, { id: crypto.randomUUID(), y: atY }],
                    (s) => s.y,
                ),
            })),

        removeShelf: (id) =>
            set((state) => ({ shelves: state.shelves.filter((s) => s.id !== id) })),

        moveShelf: (id, nextY) =>
            set((state) => {
                const { height } = state.dimensions;
                const shelves = sortBy(state.shelves, (s) => s.y);
                const idx = shelves.findIndex((s) => s.id === id);
                if (idx < 0) return {};
                const top = height - MIN_SPACING.shelves;
                const bottom = MIN_SPACING.shelves;
                const above = shelves[idx + 1];
                const below = shelves[idx - 1];
                let minY = bottom;
                let maxY = top;
                if (below) minY = below.y + MIN_SPACING.shelves;
                if (above) maxY = above.y - MIN_SPACING.shelves;
                const clamped = clamp(nextY, minY, maxY);
                const updated = shelves.map((s) => (s.id === id ? { ...s, y: clamped } : s));
                return { shelves: updated };
            }),

        registerMaterial: (key, def) =>
            set((state) => ({ materials: { ...state.materials, [key]: def } })),

        setHovered: (payload) => set({ hoveredId: payload }),
        setSelected: (payload) => set({ selectedId: payload }),
    }));
}


