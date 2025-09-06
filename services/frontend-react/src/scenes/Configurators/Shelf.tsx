import { memo, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import * as THREE from "three";
import { useAppStore } from "@/state/App.store";

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
  const hovered = store
    ? useStore(store, (s) => s.hoveredId)
    : { type: null, id: null };
  const selected = store
    ? useStore(store, (s) => s.selectedId)
    : { type: null, id: null };
  const isInteracting = useAppStore((s) => s.isInteracting);
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

  const effectiveWidth = Math.max(0, width - 2 * thickness);
  const outlineColor = isSelected
    ? "#4f46e5"
    : isHovered && !isInteracting
    ? "#06b6d4"
    : null;
  const outlineGeometry = useMemo(() => {
    if (!outlineColor) return null;
    const box = new THREE.BoxGeometry(effectiveWidth, 0.02, depth);
    const edges = new THREE.EdgesGeometry(box, 15);
    box.dispose();
    return edges;
  }, [effectiveWidth, depth, outlineColor]);

  return (
    <group position={[width / 2, y, 0]}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        {...(gesture ?? {})}
      >
        <boxGeometry args={[effectiveWidth, 0.02, depth]} />
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

export const Shelf = memo(ShelfImpl);
