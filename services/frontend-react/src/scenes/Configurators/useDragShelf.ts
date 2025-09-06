import { useMemo } from "react";
import { useDrag } from "@use-gesture/react";
import type { StoreApi } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import { MIN_SPACING } from "@/state/Config";
import { useAppStore } from "@/state/App.store";

export function useDragShelf(store: StoreApi<ModuleStore>, shelfId: string) {
    const getState = store.getState;
    const setIsInteracting = useAppStore((s) => s.setIsInteracting);

    const bind = useDrag(({ delta: [, dy], first, last, event }) => {
        // Stop events so camera-controls doesn't capture them
        // @ts-expect-error R3F ThreeEvent typing
        event?.stopPropagation?.();
        if (first) {
            setIsInteracting(true);
            // Immediately select the shelf being dragged
            store.getState().setSelected({ type: "shelf", id: shelfId });
            store.getState().setHovered({ type: "shelf", id: shelfId });
            document.body.style.cursor = "ns-resize";
        }
        const { shelves, dimensions } = getState();
        const current = shelves.find((s) => s.id === shelfId);
        if (!current) return;
        const nextY = current.y + -dy * 0.003; // increase sensitivity a bit

        // Delegate to store action which clamps to valid range
        store.getState().moveShelf(shelfId, nextY);
        if (last) {
            setIsInteracting(false);
            // Keep the same resize cursor style on pointerout via component logic
            document.body.style.cursor = "auto";
        }
    });

    return useMemo(() => bind, [bind]);
}


