import { PropsWithChildren } from "react";
import { Canvas } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import type { StoreApi } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import CameraManager from "@/scenes/CameraManager";

type Props = PropsWithChildren & {
  onPointerMissed?: (event: MouseEvent) => void;
  moduleStore?: StoreApi<ModuleStore> | undefined;
};

export default function ProductCanvas({
  children,
  onPointerMissed,
  moduleStore,
}: Props) {
  const handlePointerMissed = (e: MouseEvent) => {
    if (onPointerMissed) onPointerMissed(e);
  };
  // camera logic moved into CameraManager
  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        onPointerMissed={handlePointerMissed}
        onWheel={(e) => e?.nativeEvent?.preventDefault?.()}
      >
        <color attach="background" args={["#f6f7fb"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight intensity={0.35} groundColor={0xffffff} />

        <SoftShadows size={25} samples={20} focus={0.9} />

        {/* Ground */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          userData={{ __isGround: true }}
        >
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.25} />
        </mesh>
        <CameraManager moduleStore={moduleStore} />
        {children}
      </Canvas>
    </div>
  );
}
