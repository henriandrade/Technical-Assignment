import { memo } from "react";
import { Column } from "@/scenes/Configurators/Column";

type Props = {
  width: number;
  height: number;
  depth: number;
  thickness?: number;
};

function FrameImpl({ width, height, depth, thickness = 0.02 }: Props) {
  const halfT = thickness / 2;
  return (
    <group>
      {/* Left/Right vertical borders */}
      <Column height={height} depth={depth} x={0} width={thickness} />
      <Column
        height={height}
        depth={depth}
        x={width - thickness}
        width={thickness}
      />

      {/* Top/Bottom horizontal borders */}
      <group position={[width / 2, halfT, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, thickness, depth]} />
          <meshStandardMaterial color="#bfbfbf" />
        </mesh>
      </group>
      <group position={[width / 2, height - halfT, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, thickness, depth]} />
          <meshStandardMaterial color="#bfbfbf" />
        </mesh>
      </group>
    </group>
  );
}

export const Frame = memo(FrameImpl);

