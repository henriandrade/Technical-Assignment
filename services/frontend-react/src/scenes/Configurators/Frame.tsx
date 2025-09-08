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
    if (!isWood) {
      updateTriplanarWoodMaterial(material, {
        relativeUV: true,
        objectInvSize: [1 / width, 1 / thickness, 1 / depth],
      });
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
      const key = `frame-${width.toFixed(3)}-${height.toFixed(
        3
      )}-${depth.toFixed(3)}-${thickness.toFixed(3)}`;
      const [ox, oy, oz, angY, scaleJ] = seededOffset(key);
      const sj = s * scaleJ;
      (material as any).transformationMatrix = new THREE.Matrix4()
        .makeScale(sj, sj, sj)
        .multiply(new THREE.Matrix4().makeRotationY(angY))
        .multiply(new THREE.Matrix4().makeTranslation(ox, oy, oz));
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
        height={Math.max(0, height - 2 * thickness)}
        depth={depth}
        x={0}
        width={thickness}
        baseY={thickness}
        store={store as StoreApi<ModuleStore>}
      />
      <Column
        height={Math.max(0, height - 2 * thickness)}
        depth={depth}
        x={width - thickness}
        width={thickness}
        baseY={thickness}
        store={store as StoreApi<ModuleStore>}
      />

      {/* Top/Bottom horizontal borders (full width; sides are trimmed to avoid overlap) */}
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
