import { memo } from "react";
import { Column } from "@/scenes/Configurators/Column";
import {
  createTriplanarWoodMaterial,
  updateTriplanarWoodMaterial,
} from "@/lib/tslmaterials/wood-noise";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  width: number;
  height: number;
  depth: number;
  thickness?: number;
  store?: StoreApi<ModuleStore> | undefined;
};

function FrameImpl({ width, height, depth, thickness = 0.02, store }: Props) {
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
        objectInvSize: [1 / width, 1 / thickness, 1 / depth],
      });
    }
    if (isWood && woodParams) {
      const s = Math.max(0.01, woodParams.grainScale ?? 10.0);
      (material as any).transformationMatrix = new THREE.Matrix4().makeScale(
        s,
        s,
        s
      );
      const jitter = 0.00015;
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
  }, [selectedMaterialKey, woodParams, material, width, thickness, depth]);
  const halfT = thickness / 2;
  return (
    <group>
      {/* Left/Right vertical borders */}
      <Column
        height={height}
        depth={depth}
        x={0}
        width={thickness}
        store={store as StoreApi<ModuleStore>}
      />
      <Column
        height={height}
        depth={depth}
        x={width - thickness}
        width={thickness}
        store={store as StoreApi<ModuleStore>}
      />

      {/* Top/Bottom horizontal borders */}
      <group position={[width / 2, halfT, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, thickness, depth]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
      <group position={[width / 2, height - halfT, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, thickness, depth]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

export const Frame = memo(FrameImpl);
