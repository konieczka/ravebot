/**
 * RaveBot himself: a chrome helmet with a visor, a leather jacket and tube arms. The head and
 * torso are shaded once into sprites (per-pixel lighting quantised to small palettes with ordered
 * dithering, then outlined); the arms are shaded every frame because they move.
 */

import { OUTLINE, clamp, light, norm, set, sprite, tone } from './sprite.js';

type Ctx = CanvasRenderingContext2D;

const PINK = '#ff3dc8';
const BLUE = '#56a8ff';

/** Ramps from shadow to highlight. */
const CHROME = ['#0d0a16', '#1a1528', '#2b2440', '#463b66', '#7a6ea8', '#c8c0ee'];
const LEATHER = ['#08060d', '#100c18', '#1a1428', '#2a2140', '#43375f'];
/** Lower helmet: chrome reflecting the pink stage. */
const CHROME_LOW = ['#0d0a16', '#1e1028', '#3a1840', '#6a2a6e', '#b04aa0'];
const GLOVE = ['#07050b', '#16111f', '#2e2542', '#5a4d80'];
const GOLD = ['#6b5420', '#b08a30', '#e8c860', '#fff2a8'];
const SHIRT = ['#141019', '#1f1a28', '#2c2638'];

// ── head ────────────────────────────────────────────────────────────────────

/** Head sprite size and where things sit inside it. */
export const HEAD = {
	w: 33,
	h: 27,
	cx: 16,
	/** Visor interior (drawn live): 19×7. */
	visor: { x: 7, y: 11, w: 19, h: 7 },
	/** Headphone LED rings. */
	leds: [
		[3, 14],
		[29, 14]
	] as [number, number][],
	/** Antenna tip. */
	antenna: [24, 0] as [number, number]
};

function buildHead() {
	const { w, h, cx, visor } = HEAD;
	const cy = 13;
	const rx = 12.3;
	const ry = 12.5;
	return sprite(w, h, (g) => {
		// Chrome dome with a slightly tapered chin.
		for (let y = 0; y < h; y++)
			for (let x = 0; x < w; x++) {
				const ny = (y + 0.5 - cy) / ry;
				const taper = 1 - Math.max(0, ny) * 0.18;
				const nx = (x + 0.5 - cx - 0.5) / (rx * taper);
				const r2 = nx * nx + ny * ny;
				if (r2 > 1) continue;
				const nz = Math.sqrt(1 - r2);
				const n = [nx, ny, nz];
				const v = light(n, 0.2, 60);
				// Chrome: the lower half mirrors the pink-lit stage below it.
				let c = ny > 0.3 ? tone(CHROME_LOW, v + 0.15, x, y) : tone(CHROME, v, x, y);
				// A sharp window reflection up top-left.
				if (nx > -0.62 && nx < -0.3 && ny > -0.78 && ny < -0.42 && (nx + 0.62) * 3 > -ny - 0.42)
					c = ny < -0.6 ? CHROME[5] : CHROME[4];
				if (nx < -0.76) c = nx < -0.84 || (x + y) % 2 ? PINK : '#8a2a78';
				else if (nx > 0.8) c = nx > 0.87 || (x + y) % 2 ? BLUE : '#2e4a8a';
				set(g, x, y, c);
			}
		// Centre seam over the top of the dome.
		for (let y = 2; y < visor.y - 1; y++) set(g, cx, y, '#120e1c');
		// Visor: a curved black band with a lit frame.
		for (let x = visor.x - 2; x < visor.x + visor.w + 2; x++) {
			const e = Math.abs(x + 0.5 - (cx + 0.5)) / (visor.w / 2 + 2);
			const sag = Math.round(e * e * 1.5);
			for (let y = visor.y - 1 + sag; y <= visor.y + visor.h + sag; y++) {
				const edge = y === visor.y - 1 + sag || y === visor.y + visor.h + sag;
				set(g, x, y, edge ? (y < visor.y + 2 ? '#6a5c96' : '#2b2440') : '#040208');
			}
		}
		// Chin vents.
		for (const y of [visor.y + visor.h + 3, visor.y + visor.h + 5])
			for (let x = cx - 3; x <= cx + 4; x++) set(g, x, y, x % 2 ? '#0d0a16' : '#1a1528');
		// Headphone band over the dome.
		for (let a = Math.PI * 1.08; a < Math.PI * 1.92; a += 0.02) {
			const x = Math.round(cx + 0.5 + Math.cos(a) * (rx + 1.5));
			const y = Math.round(cy + Math.sin(a) * (ry + 0.5));
			set(g, x, y, '#2e2547');
			set(g, x, y + 1, a > Math.PI * 1.3 && a < Math.PI * 1.45 ? '#6a5c96' : '#1e1730');
		}
		// Ear cups.
		for (const [ox, dir] of [
			[0, -1],
			[w - 6, 1]
		] as const)
			for (let y = 9; y < 20; y++)
				for (let x = 0; x < 6; x++) {
					const ny = (y - 14.5) / 5.5;
					const nx = ((x - 2.5) / 3) * 0.6 + dir * 0.5;
					if (ny * ny + ((x - 2.5) / 3) ** 2 > 1.05) continue;
					const v = light(norm([nx, ny, 0.8]), 0.15, 12);
					set(g, ox + x, y, tone(['#0b0812', '#1c1630', '#2f2650', '#54478a'], v, x, y));
				}
		// Antenna.
		for (let y = 1; y < 5; y++) set(g, HEAD.antenna[0], y, '#3a3550');
	});
}

// ── torso ───────────────────────────────────────────────────────────────────

export const TORSO = { w: 51, h: 40, cx: 25 };

function buildTorso() {
	const { w, h, cx } = TORSO;
	return sprite(w, h, (g) => {
		const half = (y: number) =>
			y < 7 ? 15 + Math.sqrt(Math.max(0, 49 - (7 - y) ** 2)) * 0.9 : 21 - (y - 7) * 0.08;
		// Leather jacket: a lit cylinder with rounded shoulders.
		for (let y = 1; y < h; y++) {
			const hw = half(y);
			for (let x = 0; x < w; x++) {
				const dx = x + 0.5 - (cx + 0.5);
				if (Math.abs(dx) > hw) continue;
				const nx = dx / (hw + 1);
				const ny = y < 8 ? -0.75 + y * 0.09 : 0.1;
				const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
				let v = light(norm([nx, ny, nz]), 0.14, 40);
				// Leather creases: a few darker diagonals at the sides.
				if (Math.abs(dx) > 9 && (x * 2 + y * 3) % 17 === 0) v *= 0.6;
				let c = tone(LEATHER, v, x, y);
				if (nx < -0.9) c = PINK;
				else if (nx > 0.9) c = BLUE;
				set(g, x, y, c);
			}
		}
		// Shirt in the open V of the jacket, with a pink print.
		for (let y = 0; y < h; y++) {
			const vw = y < 16 ? 7 - y * 0.32 : 2.2;
			for (let x = Math.ceil(cx - vw); x <= Math.floor(cx + vw); x++)
				set(g, x, y, tone(SHIRT, 0.5 - Math.abs(x - cx) * 0.05, x, y));
		}
		for (const [x, y] of [
			[cx - 1, 20],
			[cx + 1, 20],
			[cx - 2, 23],
			[cx + 2, 23],
			[cx - 1, 24],
			[cx, 24],
			[cx + 1, 24]
		])
			set(g, x, y, PINK);
		// Lapels with lit edges, popped collar.
		for (let y = 0; y < 17; y++)
			for (const s of [-1, 1]) {
				const x = Math.round(cx + s * (7.5 - y * 0.32));
				set(g, x, y, '#4a3d6e');
				set(g, x + s, y, '#2a2140');
				set(g, x + s * 2, y, '#100c18');
			}
		for (const s of [-1, 1])
			for (let k = 0; k < 4; k++) set(g, cx + s * (8 + k), k, k < 2 ? '#4a3d6e' : '#1a1428');
		// Open zip down the front.
		for (let y = 17; y < h; y++)
			for (const s of [-1, 1]) {
				set(g, cx + s * 3, y, y % 2 ? '#8f88bb' : '#3a3550');
				set(g, cx + s * 4, y, '#2a2140');
			}
		// Shoulder seams and studs.
		for (const s of [-1, 1]) {
			for (let k = 0; k < 7; k++) set(g, cx + s * (12 + Math.round(k * 0.5)), 2 + k, '#0a0710');
			for (let k = 0; k < 3; k++) {
				const x = cx + s * (15 + k * 2);
				const y = 3 + k;
				set(g, x, y, '#c8c0ee');
				set(g, x, y + 1, '#5a5274');
			}
		}
		// Left chest: pink patch. Right chest: smiley pin and printed slogan lines.
		for (let y = 13; y < 18; y++) for (let x = cx - 16; x < cx - 9; x++) set(g, x, y, PINK);
		for (const x of [cx - 15, cx - 14, cx - 12, cx - 11]) set(g, x, 15, '#ffd6f5');
		for (let y = 11; y < 16; y++)
			for (let x = cx + 9; x < cx + 14; x++)
				if ((x - (cx + 11)) ** 2 + (y - 13) ** 2 <= 5) set(g, x, y, '#ffd84a');
		set(g, cx + 10, 12, '#3a2a10');
		set(g, cx + 12, 12, '#3a2a10');
		for (const x of [cx + 10, cx + 11, cx + 12]) set(g, x, 14, '#3a2a10');
		for (let row = 0; row < 4; row++)
			for (let x = cx + 8; x < cx + 16 - (row % 2) * 2; x++)
				if ((x + row) % 4 !== 0) set(g, x, 19 + row * 2, '#9a93c2');
		// Pocket flaps.
		for (const s of [-1, 1])
			for (let k = 0; k < 8; k++) {
				const x = cx + s * (7 + k);
				set(g, x, 31, '#43375f');
				set(g, x, 32, '#08060d');
			}
		// Gold chain with a pendant.
		for (let dx = -7; dx <= 7; dx++) {
			const y = 2 + Math.round(5 * (1 - (dx / 7) ** 2));
			set(g, cx + dx, y, GOLD[(dx + 8) % 2 ? 1 : 2]);
		}
		for (let y = 8; y < 12; y++)
			for (let x = cx - 1; x <= cx + 1; x++)
				set(g, x, y, tone(GOLD, 0.9 - (y - 8) * 0.2 - (x - cx) * 0.15, x, y));
		set(g, cx - 1, 8, GOLD[3]);
	});
}

let head: HTMLCanvasElement | null = null;
let torso: HTMLCanvasElement | null = null;
export const headSprite = () => (head ??= buildHead());
export const torsoSprite = () => (torso ??= buildTorso());

/** Ribbed mechanical neck. */
export function neck(g: Ctx, cx: number, y: number) {
	for (let k = 0; k < 6; k++) {
		g.fillStyle = k % 2 ? '#120e1c' : '#3a3150';
		g.fillRect(cx - 4 + (k % 2), y + k, 9 - (k % 2) * 2, 1);
	}
	g.fillStyle = PINK;
	g.fillRect(cx + 3, y + 1, 1, 4);
}

// ── arms ────────────────────────────────────────────────────────────────────

/** A shaded tube between two points, like a jacket sleeve. */
export function tube(
	g: Ctx,
	ax: number,
	ay: number,
	bx: number,
	by: number,
	r: number,
	ramp = LEATHER
) {
	const dx = bx - ax;
	const dy = by - ay;
	const len2 = dx * dx + dy * dy || 1;
	const len = Math.sqrt(len2);
	// Unit normal of the tube axis in screen space.
	const px = -dy / len;
	const py = dx / len;
	const x0 = Math.floor(Math.min(ax, bx) - r - 1);
	const x1 = Math.ceil(Math.max(ax, bx) + r + 1);
	const y0 = Math.floor(Math.min(ay, by) - r - 1);
	const y1 = Math.ceil(Math.max(ay, by) + r + 1);
	for (let y = y0; y <= y1; y++)
		for (let x = x0; x <= x1; x++) {
			const qx = x + 0.5 - ax;
			const qy = y + 0.5 - ay;
			const t = clamp((qx * dx + qy * dy) / len2, 0, 1);
			const ox = qx - t * dx;
			const oy = qy - t * dy;
			const d = Math.hypot(ox, oy);
			if (d > r + 1) continue;
			if (d > r) {
				g.fillStyle = OUTLINE;
			} else {
				const s = (ox * px + oy * py) / r;
				const nz = Math.sqrt(Math.max(0, 1 - s * s));
				let c = tone(ramp, light([px * s, py * s, nz], 0.14, 30), x, y);
				if (s * px < -0.8) c = PINK;
				g.fillStyle = c;
			}
			g.fillRect(x, y, 1, 1);
		}
}

/** A gloved hand. `pose` = flat on a deck, a fist, or pointing at the roof. */
export function hand(g: Ctx, x: number, y: number, pose: 'flat' | 'fist' | 'point', led: string) {
	x = Math.round(x);
	y = Math.round(y);
	if (pose === 'point') {
		tube(g, x, y + 1, x, y - 6, 1.1, GLOVE);
		g.fillStyle = led;
		g.fillRect(x, y - 7, 1, 1);
	}
	const [rx, ry] = pose === 'flat' ? [3.2, 2] : [2.6, 2.6];
	for (let dy = -4; dy <= 4; dy++)
		for (let dx = -5; dx <= 5; dx++) {
			const nx = dx / rx;
			const ny = dy / ry;
			const r2 = nx * nx + ny * ny;
			if (r2 > 1.45) continue;
			if (r2 > 1) {
				g.fillStyle = OUTLINE;
			} else {
				g.fillStyle = tone(
					GLOVE,
					light([nx * 0.8, ny * 0.8, Math.sqrt(1 - r2 * 0.64)], 0.3, 20),
					dx,
					dy
				);
			}
			g.fillRect(x + dx, y + dy, 1, 1);
		}
	// Knuckle LEDs.
	g.fillStyle = led;
	if (pose === 'flat') g.fillRect(x - 2, y - 1, 5, 1);
	else g.fillRect(x - 1, y - 2, 3, 1);
}

/** A glowing raver wristband plus the jacket cuff. */
export function cuff(g: Ctx, x: number, y: number, color: string, glow: number) {
	x = Math.round(x);
	y = Math.round(y);
	g.fillStyle = '#43375f';
	g.fillRect(x - 3, y - 1, 6, 1);
	g.globalAlpha = 0.35 + 0.65 * glow;
	g.fillStyle = color;
	g.fillRect(x - 2, y + 1, 5, 1);
	g.globalAlpha = 1;
}
