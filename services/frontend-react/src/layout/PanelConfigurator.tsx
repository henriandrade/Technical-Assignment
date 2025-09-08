import { memo, useEffect, useMemo, useState } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import { FrontViewSVG } from "@/scenes/Configurators/FrontViewSVG";
import { DraggableInput } from "@/lib/DraggableInput";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  WoodGenuses,
  Finishes,
} from "three/addons/materials/WoodNodeMaterial.js";

type Props = {
  store: StoreApi<ModuleStore>;
};

function PanelConfiguratorImpl({ store }: Props) {
  const dimensions = useStore(store, (s) => s.dimensions);
  const columns = useStore(store, (s) => s.columns);
  const shelves = useStore(store, (s) => s.shelves);
  const columnThickness = useStore(store, (s) => s.columnThickness);
  const shelfThickness = useStore(store, (s) => s.shelfThickness);
  const frameThickness = useStore(store, (s) => s.frameThickness);
  const woodParams = useStore(store, (s) => s.woodParams);
  const selectedGenus = useStore(store, (s) => s.selectedGenus);
  const selectedFinish = useStore(store, (s) => s.selectedFinish);
  const applyPreset = useStore(store, (s) => s.applyPreset);
  const previewAspect = Math.max(
    0.1,
    Math.min(10, dimensions.width / dimensions.height || 1)
  );

  // Ensure initial appearance matches a selectable preset
  useEffect(() => {
    if (selectedGenus && selectedFinish) {
      applyPreset(selectedGenus as any, selectedFinish as any);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ generateWoodPreviewWithColors }, compat] = await Promise.all([
          import("@/lib/tslmaterials/wood-noise/preview"),
          import("@/lib/tslmaterials/wood-noise/compat"),
        ]);
        if (!mounted) return;
        const next: Record<string, string> = {};
        for (const f of Finishes as string[]) {
          for (const g of WoodGenuses as string[]) {
            const mapped = compat.getPresetParams(g as any, f as any);
            const url = generateWoodPreviewWithColors(
              (mapped.lightColor as string) ?? woodParams.lightColor,
              (mapped.darkColor as string) ?? woodParams.darkColor,
              64
            );
            next[`${f}:${g}`] = url;
          }
        }
        setThumbs(next);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [woodParams.lightColor, woodParams.darkColor]);
  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        width: "22rem",
        maxWidth: "22rem",
        background: "#ffffffcc",
        borderRadius: "0.5rem",
        boxShadow: "0 0.25rem 1rem rgba(0,0,0,0.08)",
        padding: "1rem",
        backdropFilter: "saturate(120%) blur(0.375rem)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ marginTop: "0.75rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          Wood presets
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(4, auto)",
            rowGap: "0.25rem",
            marginBottom: "0.75rem",
          }}
        >
          {(Finishes as string[]).map((f) => (
            <div
              key={f}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1.75rem)",
                columnGap: "0.25rem",
                justifyContent: "start",
              }}
            >
              {(WoodGenuses as string[]).map((g) => {
                const key = `${f}:${g}`;
                const isActive = selectedFinish === f && selectedGenus === g;
                return (
                  <button
                    key={key}
                    aria-pressed={isActive}
                    title={`${f} ${g.replace("_", " ")}`}
                    onClick={() => applyPreset(g as any, f as any)}
                    style={{
                      display: "block",
                      width: "1.75rem",
                      padding: "0.125rem",
                      borderRadius: "0.25rem",
                      boxSizing: "border-box",
                      border: isActive
                        ? "0.125rem solid #2563eb"
                        : "0.0625rem solid #e5e7eb",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "1.125rem",
                        background: "#f3f4f6",
                        borderRadius: "0.125rem",
                        backgroundImage: thumbs[key]
                          ? `url(${thumbs[key]})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            columnGap: "0.75rem",
            rowGap: "0.75rem",
            width: "100%",
            boxSizing: "border-box",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                marginBottom: "0.25rem",
                textAlign: "center",
              }}
            >
              Light color
            </div>
            <input
              type="color"
              value={woodParams.lightColor}
              onChange={(e) =>
                store.getState().setWoodParams({ lightColor: e.target.value })
              }
              style={{
                width: "3.25rem",
                height: "1.75rem",
                border: "0.0625rem solid #d1d5db",
                borderRadius: "0.25rem",
                background: "transparent",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                marginBottom: "0.25rem",
                textAlign: "center",
              }}
            >
              Dark color
            </div>
            <input
              type="color"
              value={woodParams.darkColor}
              onChange={(e) =>
                store.getState().setWoodParams({ darkColor: e.target.value })
              }
              style={{
                width: "3.25rem",
                height: "1.75rem",
                border: "0.0625rem solid #d1d5db",
                borderRadius: "0.25rem",
                background: "transparent",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        </div>

        <details open={false as unknown as boolean}>
          <summary
            style={{
              cursor: "pointer",
              userSelect: "none",
              fontSize: "0.8125rem",
              margin: "0.75rem 0 0.5rem 0",
            }}
          >
            Advanced wood generator
          </summary>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          ></div>
        </details>
      </div>
      <div
        style={{
          aspectRatio: previewAspect as unknown as number,
          width: "100%",
          margin: "0.75rem 0",
          padding: "0.5rem",
          display: "block",
          border: "0.0625rem solid #e5e7eb",
          borderRadius: "0.375rem",
          background: "#f9fafb",
          boxSizing: "border-box",
        }}
      >
        <FrontViewSVG
          width={dimensions.width}
          height={dimensions.height}
          columns={columns}
          shelves={shelves}
          frameThickness={frameThickness}
          columnThickness={columnThickness}
          shelfThickness={shelfThickness}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: "0.5rem",
        }}
      >
        <DraggableInput
          label="Column thickness"
          value={columnThickness}
          suffix="m"
          step={0.001}
          min={0.01}
          max={0.08}
          onChange={(v) => store.getState().setColumnThickness(v)}
        />
        <DraggableInput
          label="Shelf thickness"
          value={shelfThickness}
          suffix="m"
          step={0.001}
          min={0.01}
          max={0.06}
          onChange={(v) => store.getState().setShelfThickness(v)}
        />
        <DraggableInput
          label="Frame thickness"
          value={frameThickness}
          suffix="m"
          step={0.001}
          min={0.005}
          max={0.06}
          onChange={(v) => store.getState().setFrameThickness(v)}
        />
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
