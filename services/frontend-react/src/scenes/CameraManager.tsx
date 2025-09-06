import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import CameraControlsImpl from "camera-controls";
import * as THREE from "three";
import type { StoreApi } from "zustand";
import type { ModuleStore } from "@/scenes/createNewConfiguratorModule";
import { useAppStore } from "@/state/App.store";
import { DEFAULT_CAMERA_ANGLE } from "@/state/Config";
const CAMERA_MARGIN = 1.2;

export type ModuleLikeDimensions = {
  width: number;
  height: number;
  depth: number;
};

export function frameModuleForCamera(
  dims: ModuleLikeDimensions,
  aspect: number,
  fovDeg: number
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const polar = toRad(DEFAULT_CAMERA_ANGLE.polarDeg);
  const azimuth = toRad(DEFAULT_CAMERA_ANGLE.azimuthDeg);
  const fov = toRad(fovDeg);

  const halfHeight = dims.height * 0.5;
  const halfWidth = dims.width * 0.5;
  const projectedHalfHeight = halfHeight + dims.depth * 0.25;
  const projectedHalfWidth = halfWidth + dims.depth * 0.25;

  const verticalDistance = projectedHalfHeight / Math.tan(fov / 2);
  const hFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
  const horizontalDistance = projectedHalfWidth / Math.tan(hFov / 2);

  const distance =
    Math.max(verticalDistance, horizontalDistance) * CAMERA_MARGIN;
  const target = [0, dims.height * 0.5, 0] as const;

  const sinPhi = Math.sin(polar);
  const cosPhi = Math.cos(polar);
  const sinTheta = Math.sin(azimuth);
  const cosTheta = Math.cos(azimuth);
  const px = target[0] + distance * sinPhi * sinTheta;
  const py = target[1] + distance * cosPhi;
  const pz = target[2] + distance * sinPhi * cosTheta;
  const position = [px, py, pz] as const;
  return { target, position, azimuth, polar, distance };
}

type Props = {
  moduleStore?: StoreApi<ModuleStore> | undefined;
};

export default function CameraManager({ moduleStore }: Props) {
  const isInteracting = useAppStore((s) => s.isInteracting);
  const controlsRef = useRef<CameraControls | null>(null);
  const { camera, size, scene } = useThree();
  const aspect = size.width / size.height;
  const fov = (camera as any).fov ?? 50;

  // Frame from scene world-space bounds; fallback to module dimensions
  const frame = (smooth: boolean) => {
    if (!controlsRef.current) return;
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    const center = new THREE.Vector3();
    const sizeV = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.visible) return;
      if (mesh.userData?.__isGround || mesh.userData?.__ignoreInBounds) return;
      const geom: THREE.BufferGeometry | undefined = (mesh as any).geometry;
      if (!geom) return;
      if (!geom.boundingBox) geom.computeBoundingBox();
      if (!geom.boundingBox) return;
      tmp.copy(geom.boundingBox).applyMatrix4(mesh.matrixWorld);
      box.union(tmp);
    });

    if (!box.isEmpty()) {
      box.getCenter(center);
      box.getSize(sizeV);
      const radius = sizeV.length() * 0.5;
      const vFov = THREE.MathUtils.degToRad(fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const distV = radius / Math.sin(vFov / 2);
      const distH = radius / Math.sin(hFov / 2);
      const distance = Math.max(distV, distH) * CAMERA_MARGIN;
      const polar = THREE.MathUtils.degToRad(DEFAULT_CAMERA_ANGLE.polarDeg);
      const azimuth = THREE.MathUtils.degToRad(DEFAULT_CAMERA_ANGLE.azimuthDeg);
      const sinPhi = Math.sin(polar);
      const cosPhi = Math.cos(polar);
      const sinTheta = Math.sin(azimuth);
      const cosTheta = Math.cos(azimuth);
      const px = center.x + distance * sinPhi * sinTheta;
      const py = center.y + distance * cosPhi;
      const pz = center.z + distance * sinPhi * cosTheta;
      controlsRef.current.setLookAt(
        px,
        py,
        pz,
        center.x,
        center.y,
        center.z,
        smooth
      );
      controlsRef.current.saveState();
    } else {
      const dims = moduleStore?.getState().dimensions ?? {
        width: 1.8,
        height: 2.2,
        depth: 0.6,
      };
      const { position, target } = frameModuleForCamera(dims, aspect, fov);
      controlsRef.current.setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        smooth
      );
      controlsRef.current.saveState();
    }
  };

  // Initial frame and refit on viewport resize aspect/fov changes
  useEffect(() => {
    frame(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect, fov]);

  // Subscribe to module dimension changes to reframe
  useEffect(() => {
    if (!moduleStore) return;
    frame(true);
    let last = moduleStore.getState().dimensions;
    const unsub = moduleStore.subscribe(() => {
      const next = moduleStore.getState().dimensions;
      if (
        next.width !== last.width ||
        next.height !== last.height ||
        next.depth !== last.depth
      ) {
        last = next;
        frame(true);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleStore, aspect, fov]);

  // When app-level interactions stop, reframe again to settle view
  useEffect(() => {
    if (!isInteracting) frame(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteracting]);

  return (
    <CameraControls
      ref={controlsRef as any}
      makeDefault
      enabled={!isInteracting}
      mouseButtons={{
        left: (CameraControlsImpl as any).ACTION.ROTATE,
        middle: (CameraControlsImpl as any).ACTION.NONE,
        right: (CameraControlsImpl as any).ACTION.NONE,
        wheel: (CameraControlsImpl as any).ACTION.NONE,
      }}
      touches={{
        one: (CameraControlsImpl as any).ACTION.TOUCH_ROTATE,
        two: (CameraControlsImpl as any).ACTION.NONE,
        three: (CameraControlsImpl as any).ACTION.NONE,
      }}
      onEnd={() => {
        // Restore to saved default state after user stops orbiting
        controlsRef.current?.reset(true);
      }}
    />
  );
}
