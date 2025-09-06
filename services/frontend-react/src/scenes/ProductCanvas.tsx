import { PropsWithChildren, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, SoftShadows } from "@react-three/drei";
import { useAppStore } from "@/state/App.store";

type Props = PropsWithChildren & {
  onPointerMissed?: (event: MouseEvent) => void;
};

export default function ProductCanvas({ children, onPointerMissed }: Props) {
  const isInteracting = useAppStore((s) => s.isInteracting);
  const controlsRef = useRef<CameraControls | null>(null);
  const handlePointerMissed = (e: MouseEvent) => {
    if (onPointerMissed) onPointerMissed(e);
  };
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas shadows dpr={[1, 2]} onPointerMissed={handlePointerMissed}>
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.25} />
        </mesh>

        <CameraControls
          ref={controlsRef as any}
          makeDefault
          enabled={!isInteracting}
        />
        {children}
      </Canvas>
    </div>
  );
}
