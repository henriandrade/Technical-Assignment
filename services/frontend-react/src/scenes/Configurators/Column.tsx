import { memo, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import * as THREE from "three";
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
        <meshStandardMaterial color={color} />
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
