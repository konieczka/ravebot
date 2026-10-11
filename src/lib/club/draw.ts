/** Pixel helpers shared by the scene's painters. Everything snaps to whole pixels. */
export type Ctx = CanvasRenderingContext2D;
export type Pt = [number, number];

export const W = 480;
export const H = 270;

export function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
export const hash = (a: number, b: number) => {
	const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
	return s - Math.floor(s);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** 4×4 Bayer matrix, for dithered gradients. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

export function px(g: Ctx, x: number, y: number, w: number, h: number, c?: string) {
	if (c) g.fillStyle = c;
	g.fillRect(Math.round(x), Math.round(y), w, h);
}
export function disc(g: Ctx, cx: number, cy: number, r: number, c: string) {
	g.fillStyle = c;
	cx = Math.round(cx);
	cy = Math.round(cy);
	for (let dy = -r; dy <= r; dy++) {
		const w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.5));
		g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
	}
}
export function ell(g: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) {
	g.fillStyle = c;
	for (let dy = -ry; dy <= ry; dy++) {
		const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
		g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
	}
}
export function line(g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, c: string) {
	g.fillStyle = c;
	const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		g.fillRect(Math.round(lerp(x0, x1, t) - w / 2), Math.round(lerp(y0, y1, t) - w / 2), w, w);
	}
}
export function rgba(hex: string, a: number) {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
/** A soft round glow, for lamps. Use with additive blending. */
export function glow(g: Ctx, x: number, y: number, r: number, c: string, a: number) {
	const gr = g.createRadialGradient(x, y, 0, x, y, r);
	gr.addColorStop(0, rgba(c, a));
	gr.addColorStop(1, rgba(c, 0));
	g.fillStyle = gr;
	g.fillRect(x - r, y - r, r * 2, r * 2);
}
/** Fills a box with a vertical ramp, dithered between steps. `at(y)` maps a row to 0..1 along the ramp. */
export function ramp(
	g: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	colors: string[],
	at: (y: number) => number
) {
	for (let yy = y; yy < y + h; yy++) {
		const v = clamp(at(yy), 0, 1) * (colors.length - 1);
		const lo = Math.floor(v);
		const f = v - lo;
		for (let xx = x; xx < x + w; xx++)
			px(g, xx, yy, 1, 1, colors[Math.min(colors.length - 1, f > bayer(xx, yy) ? lo + 1 : lo)]);
	}
}
export function smiley(g: Ctx, cx: number, cy: number, r: number, c: string) {
	for (let a = 0; a < 64; a++) {
		const t = (a / 64) * Math.PI * 2;
		px(g, cx + Math.cos(t) * r, cy + Math.sin(t) * r, 1, 1, c);
	}
	px(g, cx - r * 0.35, cy - r * 0.3, 1, 2, c);
	px(g, cx + r * 0.35, cy - r * 0.3, 1, 2, c);
	for (let a = 0; a < 16; a++) {
		const t = Math.PI * (0.2 + (0.6 * a) / 15);
		px(g, cx + Math.cos(t) * r * 0.55, cy + Math.sin(t) * r * 0.5, 1, 1, c);
	}
}
export function canvas(w = W, h = H): [HTMLCanvasElement, Ctx] {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return [c, c.getContext('2d')!];
}
export function concrete(
	g: Ctx,
	R: () => number,
	x: number,
	y: number,
	w: number,
	h: number,
	base: string,
	dark = '#15121c',
	light = '#302a3c'
) {
	px(g, x, y, w, h, base);
	for (let i = 0; i < w * h * 0.18; i++)
		px(g, x + R() * w, y + R() * h, 1, 1, R() < 0.55 ? dark : light);
	for (let k = 0; k < (w * h) / 600; k++) {
		let cx = x + R() * w;
		let cy = y + R() * h;
		for (let j = 0; j < 8; j++) {
			px(g, cx, cy, 1, 1, '#0c0a12');
			cx += R() * 2 - 1;
			cy += 1;
		}
	}
}
/** Board-formed concrete: plank seams and the tie holes left by the formwork. */
export function formwork(g: Ctx, R: () => number, x: number, y: number, w: number, h: number) {
	for (let yy = y + 3; yy < y + h; yy += 7) {
		for (let xx = x; xx < x + w; xx++) if (R() < 0.8) px(g, xx, yy, 1, 1, '#0a0812');
		for (let xx = x + 5 + ((yy * 3) % 9); xx < x + w - 1; xx += 14) {
			px(g, xx, yy + 3, 1, 1, '#040309');
			px(g, xx, yy + 4, 1, 1, '#221c30');
		}
	}
}
