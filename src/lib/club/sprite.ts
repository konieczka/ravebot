/**
 * Pixel-art helpers shared by the club's sprites: per-pixel lighting quantised to small color
 * ramps with ordered dithering, and sprites built from a pixel grid.
 */

export const OUTLINE = '#06040a';

/** 2×2 ordered dither thresholds. */
const BAYER = [
	[0, 0.5],
	[0.75, 0.25]
];

/** Key light from the front-left and above. */
const L = norm([-0.5, -0.6, 0.62]);
const HALF = norm([L[0], L[1], L[2] + 1]);

export function norm(v: number[]) {
	const n = Math.hypot(v[0], v[1], v[2]);
	return [v[0] / n, v[1] / n, v[2] / n];
}
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Picks a ramp color for brightness `v` (0..1), dithered by pixel position. */
export function tone(ramp: string[], v: number, x: number, y: number) {
	// Dither only near tone boundaries: flat areas stay clean.
	const t = 0.25 + 0.5 * BAYER[Math.abs(Math.floor(y)) % 2][Math.abs(Math.floor(x)) % 2];
	return ramp[clamp(Math.floor(v * (ramp.length - 1) + t), 0, ramp.length - 1)];
}

/** Lighting of a surface normal: diffuse + a tight specular. */
export function light(n: number[], ambient = 0.18, gloss = 24) {
	const d = Math.max(0, dot(n, L));
	const s = Math.pow(Math.max(0, dot(n, HALF)), gloss);
	return clamp(ambient + 0.65 * d + 0.9 * s, 0, 1);
}

export type Grid = (string | null)[][];

/** Adds a 1px dark outline around everything drawn in a grid. */
export function withOutline(grid: Grid): Grid {
	const out: Grid = grid.map((r) => r.slice());
	for (let y = 0; y < grid.length; y++)
		for (let x = 0; x < grid[y].length; x++) {
			if (grid[y][x]) continue;
			if (grid[y - 1]?.[x] || grid[y + 1]?.[x] || grid[y][x - 1] || grid[y][x + 1])
				out[y][x] = OUTLINE;
		}
	return out;
}

export function toCanvas(grid: Grid) {
	const c = document.createElement('canvas');
	c.width = grid[0]?.length ?? 1;
	c.height = grid.length;
	const g = c.getContext('2d')!;
	for (let y = 0; y < grid.length; y++)
		for (let x = 0; x < grid[y].length; x++)
			if (grid[y][x]) {
				g.fillStyle = grid[y][x]!;
				g.fillRect(x, y, 1, 1);
			}
	return c;
}

/** Builds a sprite from a per-pixel color function, with a 1px dark outline. */
export function sprite(w: number, h: number, paint: (grid: Grid) => void) {
	const grid: Grid = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
	paint(grid);
	return toCanvas(withOutline(grid));
}

export const set = (grid: Grid, x: number, y: number, c: string) => {
	if (grid[y] && x >= 0 && x < grid[y].length) grid[y][x] = c;
};
