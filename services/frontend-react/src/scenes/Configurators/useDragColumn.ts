import { useMemo } from "react";
import { useDrag } from "@use-gesture/react";
import type { StoreApi } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import { useAppStore } from "@/state/App.store";

export function useDragColumn(store: StoreApi<ModuleStore>, columnId: string) {
    const getState = store.getState;
    const setIsInteracting = useAppStore((s) => s.setIsInteracting);

    const bind = useDrag(({ delta: [dx], first, last, event }) => {
        // Stop events so camera-controls doesn't capture them
        (event as unknown as { stopPropagation?: () => void })?.stopPropagation?.();
        if (first) {
            setIsInteracting(true);
            // Immediately select the column being dragged
            store.getState().setSelected({ type: "column", id: columnId });
            store.getState().setHovered({ type: "column", id: columnId });
            document.body.style.cursor = "ew-resize";
        }
        const { columns } = getState();
        const current = columns.find((c) => c.id === columnId);
        if (!current) return;
        const nextX = current.x + dx * 0.003; // increase sensitivity a bit

        store.getState().moveColumn(columnId, nextX);
        if (last) {
            setIsInteracting(false);
            document.body.style.cursor = "auto";
        }
    });

    return useMemo(() => bind, [bind]);
}


