import { memo, useEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import * as THREE from "three";
import { useAppStore } from "@/state/App.store";
import {
  createTriplanarWoodMaterial,
  updateTriplanarWoodMaterial,
} from "@/lib/tslmaterials/wood-noise";

type Props = {
  width: number;
  depth: number;
  y: number;
  id?: string;
  store?: StoreApi<ModuleStore>;
  thickness?: number;
  gesture?: Record<string, unknown>;
};

function ShelfImpl({
  width,
  depth,
  y,
  id,
  store,
  thickness = 0,
  gesture,
}: Props) {
  const isInteractive = Boolean(id && store);
  const columns = store ? useStore(store, (s) => s.columns) : [];
  const frameThickness = store ? useStore(store, (s) => s.frameThickness) : 0;
  const hovered = store
    ? useStore(store, (s) => s.hoveredId)
    : { type: null, id: null };
  const selected = store
    ? useStore(store, (s) => s.selectedId)
    : { type: null, id: null };
  const isInteracting = useAppStore((s) => s.isInteracting);
  const selectedMaterialKey = store
    ? useStore(store, (s) => s.selectedMaterialKey)
    : null;
  const material = useMemo(() => createTriplanarWoodMaterial(), []);
  const woodParams = store
    ? useStore(store, (s) => s.woodParams)
    : (null as any);
  const seededOffset = (key: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < key.length; i += 1) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const rand = (salt: number) => {
      let x = (h ^ salt) >>> 0;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967295;
    };
    const amp = 0.25;
    const ox = (rand(0x9e3779b9) - 0.5) * 2 * amp;
    const oy = (rand(0x85ebca6b) - 0.5) * 2 * amp;
    const oz = (rand(0xc2b2ae35) - 0.5) * 2 * amp;
    const angY = (rand(0x27d4eb2f) - 0.5) * 2 * 0.12;
    const scaleJitter = 1 + (rand(0x165667b1) - 0.5) * 0.06;
    return [ox, oy, oz, angY, scaleJitter] as const;
  };
  const initialScaleRef = useRef<number | null>(null);
  useEffect(() => {
    const isWood =
      (material as any)?.isWoodNodeMaterial === true ||
      (material as any)?.constructor?.name?.includes("WoodNodeMaterial");
    // Use relative/world mapping; avoid binding to a single segment size
    if (!isWood) {
      updateTriplanarWoodMaterial(material, { relativeUV: true });
    }
    if (isWood && woodParams) {
      updateTriplanarWoodMaterial(material, woodParams);
      let s = initialScaleRef.current;
      if (s == null) {
        const grain = Math.max(0.01, woodParams.grainScale ?? 10.0);
        const base = 15.0;
        s = base / grain;
        initialScaleRef.current = s;
      }
      (material as any).transformationMatrix = new THREE.Matrix4().makeScale(
        s,
        s,
        s
      );
      const key = `${id ?? "shelf"}-${width.toFixed(3)}-${depth.toFixed(3)}-${
        thickness?.toFixed(3) ?? "0.02"
      }`;
      const [ox, oy, oz] = seededOffset(key);
      const [rox, roy, roz, angY, scaleJ] = seededOffset(key);
      const sj = s * scaleJ;
      (material as any).transformationMatrix = new THREE.Matrix4()
        .makeScale(sj, sj, sj)
        .multiply(new THREE.Matrix4().makeRotationY(angY))
        .multiply(new THREE.Matrix4().makeTranslation(rox, roy, roz));
    } else if (woodParams) {
      updateTriplanarWoodMaterial(material, woodParams);
    }
    material.needsUpdate = true;
    return () => {
      if ((material as any)?.dispose) (material as any).dispose();
    };
  }, [selectedMaterialKey, woodParams, material, width, thickness, depth]);
  const isHovered =
    isInteractive && !!id && hovered.id === id && hovered.type === "shelf";
  const isSelected =
    isInteractive && !!id && selected.id === id && selected.type === "shelf";
  const color = useMemo(() => {
    if (!isInteractive) return "#d9d9d9";
    if (isSelected) return "#9ec5fe";
    if (isHovered && !isInteracting) return "#bcd6ff";
    return "#d9d9d9";
  }, [isInteractive, isHovered, isSelected, isInteracting]);

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!isInteractive || !id || !store) return;
    e.stopPropagation();
    store.getState().setHovered({ type: "shelf", id });
    document.body.style.cursor = "ns-resize";
  };
  const onPointerOut = () => {
    if (!isInteractive || !store) return;
    store.getState().setHovered({ type: null, id: null });
    // Keep resize cursor while dragging; only reset when not interacting
    if (!isInteracting) document.body.style.cursor = "auto";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isInteractive || !id || !store) return;
    e.stopPropagation();
    store.getState().setSelected({ type: "shelf", id });
  };

  const outlineColor = isSelected
    ? "#4f46e5"
    : isHovered && !isInteracting
    ? "#06b6d4"
    : null;

  // Compute horizontal segments between frame borders and columns
  const segments = useMemo(() => {
    const x0 = frameThickness;
    const x1 = Math.max(frameThickness, width - frameThickness);
    const sorted = [...columns].sort((a, b) => a.x - b.x);
    const out: Array<{ x: number; w: number }> = [];
    let cursor = x0;
    for (const c of sorted) {
      const segW = c.x - cursor;
      if (segW > 0.0005) out.push({ x: cursor + segW / 2, w: segW });
      cursor = Math.max(cursor, c.x + c.width);
      if (cursor >= x1) break;
    }
    if (x1 - cursor > 0.0005)
      out.push({ x: cursor + (x1 - cursor) / 2, w: x1 - cursor });
    return out;
  }, [columns, frameThickness, width]);

  // Centered growth: the shelf's center is at y; thickness expands equally above/below
  const shelfCenterYOffset = 0;
  return (
    <group position={[0, y - shelfCenterYOffset, 0]}>
      {segments.map((seg, idx) => {
        const segKey = `${id ?? "shelf"}:${idx}`;
        const edges = outlineColor
          ? (() => {
              const box = new THREE.BoxGeometry(
                seg.w,
                thickness || 0.02,
                depth
              );
              const e = new THREE.EdgesGeometry(box, 15);
              box.dispose();
              return e;
            })()
          : null;
        return (
          <group key={segKey} position={[seg.x, 0, 0]}>
            <mesh
              castShadow
              receiveShadow
              onPointerOver={onPointerOver}
              onPointerOut={onPointerOut}
              onClick={onClick}
              {...(gesture ?? {})}
            >
              <boxGeometry args={[seg.w, thickness || 0.02, depth]} />
              <primitive object={material} attach="material" />
              {outlineColor && edges && (
                <lineSegments renderOrder={9999} raycast={() => null}>
                  <primitive object={edges} />
                  <lineBasicMaterial
                    color={outlineColor}
                    depthTest={false}
                    transparent={false}
                  />
                </lineSegments>
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const Shelf = memo(ShelfImpl);
