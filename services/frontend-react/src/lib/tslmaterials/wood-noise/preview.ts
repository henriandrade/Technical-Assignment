export function generateWoodPreview(size = 64): string {
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : ({} as HTMLCanvasElement);
    if (!(canvas as any).getContext) return '';
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            const u = x / size;
            const v = y / size;
            const scale = 6.0;
            const px = u * scale;
            const py = v * scale * 0.8;
            const radial = px + py * 0.2;
            let n = 0; let amp = 0.5; let freq = 1;
            for (let i = 0; i < 4; i++) { // tiny fbm
                const s = Math.sin((px * freq) * 12.9898 + (py * freq) * 78.233) * 43758.5453;
                const f = s - Math.floor(s);
                n += f * amp; amp *= 0.5; freq *= 2.0;
            }
            let rings = radial + n * 0.25;
            rings = rings - Math.floor(rings);
            const ringSharp = Math.min(1, Math.max(0, Math.abs(rings * 2 - 1)));
            const light = [0.90, 0.86, 0.78];
            const dark = [0.58, 0.47, 0.35];
            const r = (light[0] ?? 0) * (1 - ringSharp) + (dark[0] ?? 0) * ringSharp;
            const g = (light[1] ?? 0) * (1 - ringSharp) + (dark[1] ?? 0) * ringSharp;
            const b = (light[2] ?? 0) * (1 - ringSharp) + (dark[2] ?? 0) * ringSharp;
            ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return canvas.toDataURL('image/png');
}


export function generateWoodPreviewWithColors(lightHex: string, darkHex: string, size = 64): string {
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : ({} as HTMLCanvasElement);
    if (!(canvas as any).getContext) return '';
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    function hexToRgb01(hex: string): [number, number, number] {
        let h = hex.trim();
        if (h.startsWith('#')) h = h.slice(1);
        if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
        const num = parseInt(h, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return [r / 255, g / 255, b / 255];
    }
    const light = hexToRgb01(lightHex);
    const dark = hexToRgb01(darkHex);
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            const u = x / size;
            const v = y / size;
            const scale = 6.0;
            const px = u * scale;
            const py = v * scale * 0.8;
            const radial = px + py * 0.2;
            let n = 0; let amp = 0.5; let freq = 1;
            for (let i = 0; i < 4; i++) {
                const s = Math.sin((px * freq) * 12.9898 + (py * freq) * 78.233) * 43758.5453;
                const f = s - Math.floor(s);
                n += f * amp; amp *= 0.5; freq *= 2.0;
            }
            let rings = radial + n * 0.25;
            rings = rings - Math.floor(rings);
            const ringSharp = Math.min(1, Math.max(0, Math.abs(rings * 2 - 1)));
            const r = (light[0] ?? 0) * (1 - ringSharp) + (dark[0] ?? 0) * ringSharp;
            const g = (light[1] ?? 0) * (1 - ringSharp) + (dark[1] ?? 0) * ringSharp;
            const b = (light[2] ?? 0) * (1 - ringSharp) + (dark[2] ?? 0) * ringSharp;
            ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return canvas.toDataURL('image/png');
}


