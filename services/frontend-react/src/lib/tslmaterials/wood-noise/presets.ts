import type { WoodNodeParams } from './nodes';

// Approximate matte white oak palette and parameters inspired by references
// Ref: three.js example webgpu_tsl_wood and boytchev/tsl-textures wood.js
export const MatteWhiteOak: WoodNodeParams = {
    ringFrequency: 4.6,
    ringSharpness: 1.45,
    ringThickness: 0.32,
    ringNoiseScale: 2.2,
    warpStrength: 0.065,
    poreScale: 16.0,
    poreStrength: 0.18,
    // Light tan with slightly warm hue; dark mid-brown
    lightColor: [0.90, 0.86, 0.78],
    darkColor: [0.58, 0.47, 0.35],
    roughMin: 0.62,
    roughMax: 0.78,
};

export type WoodPresetName = 'matte_white_oak';

export const WoodPresets: Record<WoodPresetName, WoodNodeParams> = {
    matte_white_oak: MatteWhiteOak,
};


