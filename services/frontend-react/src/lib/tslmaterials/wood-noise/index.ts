// Barrel exports only
export { fbm2 as fbmNoise2D } from './noise';
export * from './nodes';
export * from './presets';
export * from './material';
export * from './preview';
export * from './compat';

// Align with example API for presets using the official addon
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { WoodNodeMaterial, WoodGenuses, Finishes } from 'three/addons/materials/WoodNodeMaterial.js';
