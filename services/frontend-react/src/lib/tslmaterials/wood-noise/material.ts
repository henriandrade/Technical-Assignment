import * as THREE from 'three';
import { uniform, positionWorld, normalWorld, vec3, float } from 'three/tsl';
import { buildWoodGraph, buildWoodGraphUniforms, type WoodNodeParams } from './nodes';
import { WoodPresets, type WoodPresetName } from './presets';

export function createWoodNodeMaterialTSL(params: WoodNodeParams) {
    const mat = new THREE.MeshStandardMaterial({ metalness: 0.0 });

    // World-space procedural evaluation
    const p = positionWorld;
    const n = normalWorld;

    // Build uniform nodes so we can live-update without rebuilding the graph
    const uniforms = {
        ringFrequency: uniform(float(params.ringFrequency)),
        ringSharpness: uniform(float(params.ringSharpness)),
        ringThickness: uniform(float(params.ringThickness)),
        ringNoiseScale: uniform(float(params.ringNoiseScale)),
        warpStrength: uniform(float(params.warpStrength)),
        poreScale: uniform(float(params.poreScale)),
        poreStrength: uniform(float(params.poreStrength)),
        lightColor: uniform(vec3(params.lightColor[0], params.lightColor[1], params.lightColor[2])),
        darkColor: uniform(vec3(params.darkColor[0], params.darkColor[1], params.darkColor[2])),
        roughMin: uniform(float(params.roughMin)),
        roughMax: uniform(float(params.roughMax)),
    };

    const graph = buildWoodGraphUniforms(p, n, uniforms);

    (mat as any).colorNode = graph.color;
    (mat as any).roughnessNode = graph.rough;
    mat.metalness = 0.0;

    (mat as any).userData = (mat as any).userData || {};
    (mat as any).userData.woodUniforms = uniforms;
    return mat as unknown as THREE.Material;
}

export function woodFromPresetTSL(name: WoodPresetName) {
    const preset = WoodPresets[name];
    return createWoodNodeMaterialTSL(preset);
}

export function updateWoodNodeMaterialTSL(mat: THREE.Material, params: Partial<WoodNodeParams>) {
    const u = (mat as any).userData?.woodUniforms;
    if (!u) return;
    if (params.ringFrequency !== undefined) u.ringFrequency.value = params.ringFrequency;
    if (params.ringSharpness !== undefined) u.ringSharpness.value = params.ringSharpness;
    if (params.ringThickness !== undefined) u.ringThickness.value = params.ringThickness;
    if (params.ringNoiseScale !== undefined) u.ringNoiseScale.value = params.ringNoiseScale;
    if (params.warpStrength !== undefined) u.warpStrength.value = params.warpStrength;
    if (params.poreScale !== undefined) u.poreScale.value = params.poreScale;
    if (params.poreStrength !== undefined) u.poreStrength.value = params.poreStrength;
    if (params.lightColor) {
        u.lightColor.value.set(params.lightColor[0], params.lightColor[1], params.lightColor[2]);
    }
    if (params.darkColor) {
        u.darkColor.value.set(params.darkColor[0], params.darkColor[1], params.darkColor[2]);
    }
    if (params.roughMin !== undefined) u.roughMin.value = params.roughMin;
    if (params.roughMax !== undefined) u.roughMax.value = params.roughMax;
}


