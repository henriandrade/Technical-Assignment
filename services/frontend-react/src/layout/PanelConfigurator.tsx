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
  const woodParams = useStore(store, (s) => s.woodParams);
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
      <div style={{ marginTop: "0.75rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          Wood generator
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <DraggableInput
            label="Ring freq"
            value={woodParams.ringFrequency}
            step={0.01}
            min={0.01}
            max={5}
            onChange={(v) =>
              store.getState().setWoodParams({ ringFrequency: v })
            }
          />
          <DraggableInput
            label="Ring sharp"
            value={woodParams.ringSharpness}
            step={0.01}
            min={0}
            max={2}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ ringSharpness: Math.max(0, Math.min(2, v)) })
            }
          />
          <DraggableInput
            label="Ring thickness"
            value={woodParams.ringThickness ?? 0.35}
            step={0.01}
            min={0.01}
            max={1}
            onChange={(v) =>
              store.getState().setWoodParams({
                ringThickness: Math.max(0.01, Math.min(1, v)),
              })
            }
          />
          <DraggableInput
            label="Ring bias"
            value={woodParams.ringBias ?? 0}
            step={0.001}
            min={-0.2}
            max={0.2}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ ringBias: Math.max(-0.2, Math.min(0.2, v)) })
            }
          />
          <DraggableInput
            label="Ring variance"
            value={woodParams.ringSizeVariance ?? 0}
            step={0.001}
            min={0}
            max={0.2}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  ringSizeVariance: Math.max(0, Math.min(0.2, v)),
                })
            }
          />
          <DraggableInput
            label="Variance scale"
            value={woodParams.ringVarianceScale ?? 4.4}
            step={0.1}
            min={0}
            max={10}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  ringVarianceScale: Math.max(0, Math.min(10, v)),
                })
            }
          />
          <DraggableInput
            label="Center size"
            value={woodParams.centerSize ?? 1.11}
            step={0.01}
            min={0}
            max={2}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ centerSize: Math.max(0, Math.min(2, v)) })
            }
          />
          <DraggableInput
            label="Large warp"
            value={woodParams.largeWarpScale ?? 0.32}
            step={0.001}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ largeWarpScale: Math.max(0, Math.min(1, v)) })
            }
          />
          <DraggableInput
            label="Grain stretch"
            value={woodParams.largeGrainStretch ?? 0.24}
            step={0.001}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  largeGrainStretch: Math.max(0, Math.min(1, v)),
                })
            }
          />
          <DraggableInput
            label="Small warp"
            value={woodParams.smallWarpStrength ?? 0.059}
            step={0.001}
            min={0}
            max={0.2}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  smallWarpStrength: Math.max(0, Math.min(0.2, v)),
                })
            }
          />
          <DraggableInput
            label="Small warp scale"
            value={woodParams.smallWarpScale ?? 2}
            step={0.01}
            min={0}
            max={5}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ smallWarpScale: Math.max(0, Math.min(5, v)) })
            }
          />
          <DraggableInput
            label="Fine warp"
            value={woodParams.fineWarpStrength ?? 0.006}
            step={0.001}
            min={0}
            max={0.05}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  fineWarpStrength: Math.max(0, Math.min(0.05, v)),
                })
            }
          />
          <DraggableInput
            label="Fine warp scale"
            value={woodParams.fineWarpScale ?? 32.8}
            step={0.1}
            min={0}
            max={50}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ fineWarpScale: Math.max(0, Math.min(50, v)) })
            }
          />
          <DraggableInput
            label="Pore scale"
            value={woodParams.poreScale ?? 18}
            step={0.5}
            min={1}
            max={64}
            onChange={(v) =>
              store.getState().setWoodParams({ poreScale: Math.max(1, v) })
            }
          />
          <DraggableInput
            label="Pore strength"
            value={woodParams.poreStrength ?? 0.12}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ poreStrength: Math.max(0, Math.min(1, v)) })
            }
          />
          <DraggableInput
            label="Bark thickness"
            value={woodParams.barkThickness ?? 0.3}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ barkThickness: Math.max(0, Math.min(1, v)) })
            }
          />
          <DraggableInput
            label="Splotch scale"
            value={woodParams.splotchScale ?? 0.2}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ splotchScale: Math.max(0, Math.min(1, v)) })
            }
          />
          <DraggableInput
            label="Splotch intensity"
            value={woodParams.splotchIntensity ?? 0.541}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({
                  splotchIntensity: Math.max(0, Math.min(1, v)),
                })
            }
          />
          <DraggableInput
            label="Cell scale"
            value={woodParams.cellScale ?? 910}
            step={1}
            dragPerPixel={0.2}
            min={100}
            max={2000}
            precision={0}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ cellScale: Math.max(1, Math.floor(v)) })
            }
          />
          <DraggableInput
            label="Cell size"
            value={woodParams.cellSize ?? 0.1}
            step={0.001}
            min={0.01}
            max={0.5}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ cellSize: Math.max(0.01, Math.min(0.5, v)) })
            }
          />
          <DraggableInput
            label="Rough min"
            value={woodParams.roughMin}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ roughMin: Math.max(0, Math.min(1, v)) })
            }
          />
          <DraggableInput
            label="Rough max"
            value={woodParams.roughMax}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) =>
              store
                .getState()
                .setWoodParams({ roughMax: Math.max(0, Math.min(1, v)) })
            }
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>
              Light color
            </div>
            <input
              type="color"
              value={woodParams.lightColor}
              onChange={(e) =>
                store.getState().setWoodParams({ lightColor: e.target.value })
              }
              style={{
                width: "3rem",
                height: "1.5rem",
                border: "0.0625rem solid #d1d5db",
                borderRadius: "0.25rem",
                background: "transparent",
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>
              Dark color
            </div>
            <input
              type="color"
              value={woodParams.darkColor}
              onChange={(e) =>
                store.getState().setWoodParams({ darkColor: e.target.value })
              }
              style={{
                width: "3rem",
                height: "1.5rem",
                border: "0.0625rem solid #d1d5db",
                borderRadius: "0.25rem",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Finish
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <DraggableInput
              label="Clearcoat"
              value={woodParams.clearcoat ?? 1}
              step={0.01}
              min={0}
              max={1}
              onChange={(v) =>
                store
                  .getState()
                  .setWoodParams({ clearcoat: Math.max(0, Math.min(1, v)) })
              }
            />
            <DraggableInput
              label="Clearcoat rough"
              value={woodParams.clearcoatRoughness ?? 0.2}
              step={0.01}
              min={0}
              max={1}
              onChange={(v) =>
                store
                  .getState()
                  .setWoodParams({
                    clearcoatRoughness: Math.max(0, Math.min(1, v)),
                  })
              }
            />
          </div>
        </div>
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
