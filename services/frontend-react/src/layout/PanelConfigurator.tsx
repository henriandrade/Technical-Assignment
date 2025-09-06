import { memo } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import { FrontViewSVG } from "@/scenes/Configurators/FrontViewSVG";
import { DraggableInput } from "@/lib/DraggableInput";

type Props = {
  store: StoreApi<ModuleStore>;
};

function PanelConfiguratorImpl({ store }: Props) {
  const dimensions = useStore(store, (s) => s.dimensions);
  const columns = useStore(store, (s) => s.columns);
  const shelves = useStore(store, (s) => s.shelves);
  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        width: "22rem",
        background: "#ffffffcc",
        borderRadius: "0.5rem",
        boxShadow: "0 0.25rem 1rem rgba(0,0,0,0.08)",
        padding: "1rem",
        backdropFilter: "saturate(120%) blur(0.375rem)",
      }}
    >
      <div
        style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}
      >
        Wardrobe
      </div>
      <div style={{ height: "10rem", marginBottom: "0.75rem" }}>
        <FrontViewSVG
          width={dimensions.width}
          height={dimensions.height}
          columns={columns}
          shelves={shelves}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <DraggableInput
          label="Width"
          value={dimensions.width}
          suffix="m"
          step={0.01}
          min={0.2}
          onChange={(v) => store.getState().setDimensions({ width: v })}
        />
        <DraggableInput
          label="Height"
          value={dimensions.height}
          suffix="m"
          step={0.01}
          min={0.2}
          onChange={(v) => store.getState().setDimensions({ height: v })}
        />
        <DraggableInput
          label="Depth"
          value={dimensions.depth}
          suffix="m"
          step={0.01}
          min={0.1}
          onChange={(v) => store.getState().setDimensions({ depth: v })}
        />
        <DraggableInput
          label="Shelves"
          value={shelves.length}
          step={1}
          dragPerPixel={0.05}
          min={0}
          precision={0}
          onChange={(n) => {
            store.getState().setShelvesEven(Math.max(0, Math.floor(n)));
          }}
        />
        <DraggableInput
          label="Columns"
          value={columns.length}
          step={1}
          dragPerPixel={0.05}
          min={0}
          precision={0}
          onChange={(n) => {
            store.getState().setColumnsEven(Math.max(0, Math.floor(n)));
          }}
        />
      </div>
    </div>
  );
}

export const PanelConfigurator = memo(PanelConfiguratorImpl);
