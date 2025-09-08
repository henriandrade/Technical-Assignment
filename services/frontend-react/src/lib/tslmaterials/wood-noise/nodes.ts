import { vec2, vec3, float, abs, fract, length, max as tslMax, min as tslMin, smoothstep, pow, mix } from 'three/tsl';
import { fbm2 } from './noise';

export type WoodNodeParams = {
    ringFrequency: number;
    ringSharpness: number;
    ringThickness: number;
    ringNoiseScale: number;
    warpStrength: number;
    poreScale: number;
    poreStrength: number;
    lightColor: [number, number, number];
    darkColor: [number, number, number];
    roughMin: number;
    roughMax: number;
};

// Compute triplanar-like ring coordinate using object-space planes
export function woodRings(p: any, n: any, ringFreq = float(5.0), ringSharp = float(1.6), ringThick = float(0.35), noiseScale = float(2.0), warp = float(0.08)) {
    const an = abs(n.normalize());
    const total = an.x.add(an.y).add(an.z).add(1e-5);
    const weights = an.div(total);

    const px = vec2(p.y, p.z);
    const py = vec2(p.x, p.z);
    const pz = vec2(p.x, p.y);

    const nx = fbm2(px.mul(noiseScale), 4, 0.5, 2.1);
    const ny = fbm2(py.mul(noiseScale), 4, 0.5, 2.1);
    const nz = fbm2(pz.mul(noiseScale), 4, 0.5, 2.1);

    const rx = fract(px.y.mul(ringFreq).add(nx.mul(warp)));
    const ry = fract(length(py).mul(ringFreq).add(ny.mul(warp)));
    const rz = fract(pz.y.mul(ringFreq).add(nz.mul(warp)));

    let bx: any = float(1.0).sub(abs(rx.mul(2.0).sub(1.0)));
    let by: any = float(1.0).sub(abs(ry.mul(2.0).sub(1.0)));
    let bz: any = float(1.0).sub(abs(rz.mul(2.0).sub(1.0)));

    bx = pow(bx, tslMax(float(0.001), ringSharp));
    by = pow(by, tslMax(float(0.001), ringSharp));
    bz = pow(bz, tslMax(float(0.001), ringSharp));

    const tri = weights.x.mul(bx).add(weights.y.mul(by)).add(weights.z.mul(bz));
    const bands = smoothstep(float(1.0).sub(ringThick.clamp(0.001, 1.0)), float(1.0), tri);
    return bands;
}

export function woodPores(p: any, n: any, poreScale = float(18.0)) {
    const an = abs(n.normalize());
    const total = an.x.add(an.y).add(an.z).add(1e-5);
    const weights = an.div(total);

    const px = vec2(p.y.mul(6.0), p.z.mul(1.5));
    const py = vec2(p.x.mul(6.0), p.z.mul(1.5));
    const pz = vec2(p.x.mul(6.0), p.y.mul(1.5));

    const vx = fbm2(px.mul(poreScale), 4, 0.5, 3.0);
    const vy = fbm2(py.mul(poreScale), 4, 0.5, 3.0);
    const vz = fbm2(pz.mul(poreScale), 4, 0.5, 3.0);
    return weights.x.mul(vx).add(weights.y.mul(vy)).add(weights.z.mul(vz));
}

export function woodColorAndRough(p: any, n: any) {
    return vec3(0.0);
}

export function buildWoodGraph(p: any, n: any, params: WoodNodeParams) {
    const rings = woodRings(p, n, float(params.ringFrequency), float(params.ringSharpness), float(params.ringThickness), float(params.ringNoiseScale), float(params.warpStrength));
    const pores = woodPores(p, n, float(params.poreScale));
    const poresMask = smoothstep(0.9, 1.0, pores).mul(rings);

    const light = vec3(params.lightColor[0], params.lightColor[1], params.lightColor[2]);
    const dark = vec3(params.darkColor[0], params.darkColor[1], params.darkColor[2]);

    let color = mix(dark, light, rings);
    color = mix(color, dark, poresMask.mul(params.poreStrength));

    // Roughness varies slightly with FBM of position
    const rVar = fbm2(vec2(p.x, p.z).mul(1.3), 4, 0.5, 2.0).clamp(0.0, 1.0);
    const rough = float(params.roughMin).add(rVar.mul(params.roughMax - params.roughMin));

    return { color, rough } as const;
}

export type WoodUniformNodes = {
    ringFrequency: any;
    ringSharpness: any;
    ringThickness: any;
    ringNoiseScale: any;
    warpStrength: any;
    poreScale: any;
    poreStrength: any;
    lightColor: any; // vec3
    darkColor: any;  // vec3
    roughMin: any;
    roughMax: any;
};

export function buildWoodGraphUniforms(p: any, n: any, u: WoodUniformNodes) {
    const rings = woodRings(p, n, u.ringFrequency, u.ringSharpness, u.ringThickness, u.ringNoiseScale, u.warpStrength);
    const pores = woodPores(p, n, u.poreScale);
    const poresMask = smoothstep(0.9, 1.0, pores).mul(rings);

    let color = mix(u.darkColor, u.lightColor, rings);
    color = mix(color, u.darkColor, poresMask.mul(u.poreStrength));

    const rVar = fbm2(vec2(p.x, p.z).mul(1.3), 4, 0.5, 2.0).clamp(0.0, 1.0);
    const rough = u.roughMin.add(rVar.mul(u.roughMax.sub(u.roughMin)));
    return { color, rough } as const;
}


