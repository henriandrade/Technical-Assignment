import { memo } from "react";

type Props = {
  width: number;
  height: number;
  depth: number;
};

function DoorsImpl({ width, height, depth }: Props) {
  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[0, height / 2, depth / 2 + 0.01]}
      >
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial
          color="#cccccc"
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

export const Doors = memo(DoorsImpl);
