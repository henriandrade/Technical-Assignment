import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { WoodNodeMaterial } from 'three/addons/materials/WoodNodeMaterial.js';
import { createWoodNodeMaterialTSL, updateWoodNodeMaterialTSL } from './material';

// Backward compatible params (legacy) + Extended params following WoodNodeMaterial
export type WoodParams = {
    // legacy/simple params (kept for compatibility with existing store/UI)
    ringFrequency: number;
    ringSharpness: number;
    ringThickness?: number;
    ringNoiseScale?: number;
    grainScale: number; // ignored in WoodNodeMaterial path
    grainWarp: number;  // maps to warp-like warping in TSL path only
    fbmOctaves: number; // ignored in WoodNodeMaterial path
    fbmGain: number;    // ignored in WoodNodeMaterial path
    fbmLacunarity: number; // ignored in WoodNodeMaterial path
    poreScale?: number;     // ignored in WoodNodeMaterial path
    poreStrength?: number;  // ignored in WoodNodeMaterial path
    lightColor: string; // hex
    darkColor: string;  // hex
    roughMin: number;   // ignored in WoodNodeMaterial path
    roughMax: number;   // ignored in WoodNodeMaterial path
    relativeUV?: boolean; // ignored
    objectInvSize?: [number, number, number]; // ignored

    // Extended TSL WoodNodeMaterial params (GUI parity)
    centerSize?: number;
    largeWarpScale?: number;
    largeGrainStretch?: number;
    smallWarpStrength?: number;
    smallWarpScale?: number;
    fineWarpStrength?: number;
    fineWarpScale?: number;
    ringBias?: number;
    ringSizeVariance?: number;
    ringVarianceScale?: number;
    barkThickness?: number;
    splotchScale?: number;
    splotchIntensity?: number;
    cellScale?: number;
    cellSize?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
};

function hexToRgb01(hex: string): [number, number, number] {
    const c = new THREE.Color(hex);
    return [c.r, c.g, c.b];
}

export function createTriplanarWoodMaterial(params?: Partial<WoodParams>): THREE.Material {
    // Prefer official WoodNodeMaterial to match the three.js reference demo
    const {
        // extended params with defaults mirroring the example's custom material
        centerSize = 1.11,
        largeWarpScale = 0.32,
        largeGrainStretch = 0.24,
        smallWarpStrength = 0.059,
        smallWarpScale = 2,
        fineWarpStrength = 0.006,
        fineWarpScale = 32.8,
        ringThickness = 1 / 34,
        ringBias = 0.03,
        ringSizeVariance = 0.03,
        ringVarianceScale = 4.4,
        barkThickness = 0.3,
        splotchScale = 0.2,
        splotchIntensity = 0.541,
        cellScale = 910,
        cellSize = 0.1,
        lightColor = '#926c50',
        darkColor = '#0c0504',
        clearcoat = 1,
        clearcoatRoughness = 0.2,
    } = params ?? {};

    try {
        const mat = new WoodNodeMaterial({
            centerSize,
            largeWarpScale,
            largeGrainStretch,
            smallWarpStrength,
            smallWarpScale,
            fineWarpStrength,
            fineWarpScale,
            ringThickness,
            ringBias,
            ringSizeVariance,
            ringVarianceScale,
            barkThickness,
            splotchScale,
            splotchIntensity,
            cellScale,
            cellSize,
            lightGrainColor: new THREE.Color(lightColor),
            darkGrainColor: new THREE.Color(darkColor),
            clearcoat,
            clearcoatRoughness,
        });
        return mat as unknown as THREE.Material;
    } catch (err) {
        // Fallback to legacy TSL material if the addon is unavailable in this three version
        // Swallow addon load failures silently in production
        const legacy = createWoodNodeMaterialTSL({
            ringFrequency: 5.0,
            ringSharpness: 1.6,
            ringThickness: 0.35,
            ringNoiseScale: 2.0,
            warpStrength: 0.08,
            poreScale: 18.0,
            poreStrength: 0.12,
            lightColor: hexToRgb01(lightColor),
            darkColor: hexToRgb01(darkColor),
            roughMin: 0.6,
            roughMax: 0.76,
        });
        return legacy;
    }
}

export function updateTriplanarWoodMaterial(mat: THREE.Material, params: Partial<WoodParams>) {
    // no debug logs
    // If material is an instance of the official WoodNodeMaterial, update its properties
    const isWoodNode = Boolean((mat as any)?.isWoodNodeMaterial === true || (mat as any)?.constructor?.name?.includes('WoodNodeMaterial'));
    if (isWoodNode) {
        const wm = mat as unknown as InstanceType<typeof WoodNodeMaterial> & { needsUpdate?: boolean };
        if (params.centerSize !== undefined) (wm as any).centerSize = params.centerSize;
        if (params.largeWarpScale !== undefined) (wm as any).largeWarpScale = params.largeWarpScale;
        if (params.largeGrainStretch !== undefined) (wm as any).largeGrainStretch = params.largeGrainStretch;
        if (params.smallWarpStrength !== undefined) (wm as any).smallWarpStrength = params.smallWarpStrength;
        if (params.smallWarpScale !== undefined) (wm as any).smallWarpScale = params.smallWarpScale;
        if (params.fineWarpStrength !== undefined) (wm as any).fineWarpStrength = params.fineWarpStrength;
        if (params.fineWarpScale !== undefined) (wm as any).fineWarpScale = params.fineWarpScale;
        if (params.ringThickness !== undefined) (wm as any).ringThickness = params.ringThickness;
        if (params.ringBias !== undefined) (wm as any).ringBias = params.ringBias;
        if (params.ringSizeVariance !== undefined) (wm as any).ringSizeVariance = params.ringSizeVariance;
        if (params.ringVarianceScale !== undefined) (wm as any).ringVarianceScale = params.ringVarianceScale;
        if (params.barkThickness !== undefined) (wm as any).barkThickness = params.barkThickness;
        if (params.splotchScale !== undefined) (wm as any).splotchScale = params.splotchScale;
        if (params.splotchIntensity !== undefined) (wm as any).splotchIntensity = params.splotchIntensity;
        if (params.cellScale !== undefined) (wm as any).cellScale = params.cellScale;
        if (params.cellSize !== undefined) (wm as any).cellSize = params.cellSize;
        if (params.lightColor) (wm as any).lightGrainColor = new THREE.Color(params.lightColor);
        if (params.darkColor) (wm as any).darkGrainColor = new THREE.Color(params.darkColor);
        if (params.clearcoat !== undefined) (wm as any).clearcoat = params.clearcoat;
        if (params.clearcoatRoughness !== undefined) (wm as any).clearcoatRoughness = params.clearcoatRoughness;
        (wm as any).needsUpdate = true;
        return;
    }

    // Fallback: update legacy TSL material (MeshStandardMaterial with nodes)
    const p: any = { ...params };
    if (p.lightColor) p.lightColor = hexToRgb01(p.lightColor);
    if (p.darkColor) p.darkColor = hexToRgb01(p.darkColor);
    if (p.grainWarp !== undefined) p.warpStrength = p.grainWarp;
    updateWoodNodeMaterialTSL(mat, p);
    // no debug logs
}


