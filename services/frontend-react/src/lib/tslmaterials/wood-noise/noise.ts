import { vec2, float, floor, fract, mix, dot, sin } from 'three/tsl';

// Value noise 2D implemented in TSL (Node graph functions)
export function hash2(p: any) {
    return fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453123));
}

export function noise2(p: any) {
    const i = floor(p);
    const f = fract(p);
    const a = hash2(i);
    const b = hash2(i.add(vec2(1.0, 0.0)));
    const c = hash2(i.add(vec2(0.0, 1.0)));
    const d = hash2(i.add(vec2(1.0, 1.0)));
    const u = f.mul(f.mul(float(3.0).sub(f.mul(2.0))));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

export function fbm2(pIn: any, octaves = 4, gain = 0.5, lacunarity = 2.0) {
    let value: any = float(0.0);
    let amplitude: any = float(0.5);
    let frequency: any = float(1.0);
    let p: any = pIn;
    for (let i = 0; i < octaves; i += 1) {
        value = value.add(noise2(p).mul(amplitude));
        amplitude = amplitude.mul(gain);
        frequency = frequency.mul(lacunarity);
        p = pIn.mul(frequency);
    }
    return value;
}


