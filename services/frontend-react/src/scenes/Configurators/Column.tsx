import { memo, useEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import * as THREE from "three";
import {
  createTriplanarWoodMaterial,
  updateTriplanarWoodMaterial,
} from "@/lib/tslmaterials/wood-noise";
import { useAppStore } from "@/state/App.store";

type Props = {
  height: number;
  depth: number;
  x: number;
  width: number;
  id?: string;
  store?: StoreApi<ModuleStore>;
  gesture?: Record<string, unknown>;
};

function ColumnImpl({ height, depth, x, width, id, store, gesture }: Props) {
  const isInteractive = Boolean(id && store);
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
  useEffect(() => {
    const isWood =
      (material as any)?.isWoodNodeMaterial === true ||
      (material as any)?.constructor?.name?.includes("WoodNodeMaterial");
    if (!isWood) {
      updateTriplanarWoodMaterial(material, {
        relativeUV: true,
        objectInvSize: [1 / width, 1 / height, 1 / depth],
      });
    }
    if (isWood && woodParams) {
      const s = Math.max(0.01, woodParams.grainScale ?? 10.0);
      (material as any).transformationMatrix = new THREE.Matrix4().makeScale(
        s,
        s,
        s
      );
      // Subtle random Z offset per-instance to break moiré alignment when viewed at grazing angles
      const jitter = (id?.length ?? 0) * 0.0003;
      (material as any).transformationMatrix = (
        material as any
      ).transformationMatrix.multiply(
        new THREE.Matrix4().makeTranslation(0, 0, jitter)
      );
      updateTriplanarWoodMaterial(material, woodParams);
    } else if (woodParams) {
      updateTriplanarWoodMaterial(material, woodParams);
    }
    material.needsUpdate = true;
    return () => {
      if ((material as any)?.dispose) (material as any).dispose();
    };
  }, [selectedMaterialKey, woodParams, material, width, height, depth]);
  const isHovered =
    isInteractive && !!id && hovered.id === id && hovered.type === "column";
  const isSelected =
    isInteractive && !!id && selected.id === id && selected.type === "column";
  const color = useMemo(() => {
    if (!isInteractive) return "#bfbfbf";
    if (isSelected) return "#9ec5fe";
    if (isHovered && !isInteracting) return "#bcd6ff";
    return "#bfbfbf";
  }, [isInteractive, isHovered, isSelected, isInteracting]);

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!isInteractive || !id || !store) return;
    e.stopPropagation();
    store.getState().setHovered({ type: "column", id });
    document.body.style.cursor = "ew-resize";
  };
  const onPointerOut = () => {
    if (!isInteractive || !store) return;
    store.getState().setHovered({ type: null, id: null });
    if (!isInteracting) document.body.style.cursor = "auto";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isInteractive || !id || !store) return;
    e.stopPropagation();
    store.getState().setSelected({ type: "column", id });
  };

  const outlineColor = isSelected
    ? "#4f46e5"
    : isHovered && !isInteracting
    ? "#06b6d4"
    : null;
  const outlineGeometry = useMemo(() => {
    if (!outlineColor) return null;
    const box = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(box, 15);
    box.dispose();
    return edges;
  }, [width, height, depth, outlineColor]);

  return (
    <group position={[x + width / 2, height / 2, 0]}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        {...(gesture ?? {})}
      >
        <boxGeometry args={[width, height, depth]} />
        {/* Base tint overlay via vertex colors is skipped; instead, modulate env via emissive */}
        <primitive object={material} attach="material" />
        {outlineColor && outlineGeometry && (
          <lineSegments renderOrder={9999} raycast={() => null}>
            <primitive object={outlineGeometry} />
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
}

export const Column = memo(ColumnImpl);
