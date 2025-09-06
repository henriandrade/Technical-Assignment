import { useEffect, useMemo, useRef } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { createWardrobeStore, type WardrobeStore } from "./Wardrobe.store";
import { Shelf } from "@/scenes/Configurators/Shelf";
import { Column } from "@/scenes/Configurators/Column";
import { Frame } from "@/scenes/Configurators/Frame";
import { useDragShelf } from "@/scenes/Configurators/useDragShelf";
import { useDragColumn } from "@/scenes/Configurators/useDragColumn";

type Props = {
  store?: StoreApi<WardrobeStore>;
};

export function WardrobeConfigurator({ store: externalStore }: Props) {
  const storeRef = useRef<StoreApi<WardrobeStore> | null>(
    externalStore ?? null
  );
  if (!storeRef.current) storeRef.current = createWardrobeStore();
  const store = storeRef.current;
  const dimensions = useStore(store, (s) => s.dimensions);
  const columns = useStore(store, (s) => s.columns, shallow);
  const shelves = useStore(store, (s) => s.shelves, shallow);
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);
  const shelfIds = useMemo(() => shelves.map((sh) => sh.id), [shelves]);

  // Reset cursor on unmount
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        store.getState().setHovered({ type: null, id: null });
        store.getState().setSelected({ type: null, id: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <group>
      {/* Outer frame */}
      <Frame
        width={dimensions.width}
        height={dimensions.height}
        depth={dimensions.depth}
        thickness={0.02}
      />

      {/* Internal dividers */}
      {columnIds.map((id) => (
        <DraggableColumn key={id} store={store} id={id} />
      ))}

      {/* Shelves */}
      {shelfIds.map((id) => (
        <DraggableShelf key={id} store={store} id={id} />
      ))}
    </group>
  );
}

function DraggableColumn({
  store,
  id,
}: {
  store: StoreApi<WardrobeStore>;
  id: string;
}) {
  const dimensions = useStore(store, (s) => s.dimensions);
  const column = useStore(store, (s) => s.columns.find((c) => c.id === id));
  const bind = useDragColumn(store, id);
  if (!column) return null;
  return (
    <Column
      id={id}
      store={store}
      height={dimensions.height}
      depth={dimensions.depth}
      x={column.x}
      width={column.width}
      gesture={bind() as any}
    />
  );
}

function DraggableShelf({
  store,
  id,
}: {
  store: StoreApi<WardrobeStore>;
  id: string;
}) {
  const dimensions = useStore(store, (s) => s.dimensions);
  const shelf = useStore(store, (s) => s.shelves.find((sh) => sh.id === id));
  const bind = useDragShelf(store, id);
  if (!shelf) return null;
  return (
    <Shelf
      id={id}
      store={store}
      width={dimensions.width}
      depth={dimensions.depth}
      y={shelf.y}
      thickness={0.02}
      gesture={bind() as any}
    />
  );
}

export default WardrobeConfigurator;
