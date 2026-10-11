import type { LayerName } from '#lib/dj/types.js';
import { glow, px, type Ctx } from '../draw.js';

/**
 * The club around the stage: the side walls with three tiers of balconies, the ceiling over them
 * and what stands under the lowest balconies. Every city builds its own room from the same layout,
 * so the crowd on the balconies, the slogans and the banners always find their place.
 */
export const SIDES = [
	[0, 104],
	[376, 480]
] as const;
/** Top of each balcony slab. */
export const TIERS = [54, 98, 142];
/** Ceiling lamps hanging over the side walls. */
export const CEILING_LAMPS = [24, 80, 400, 456];
/** Text on the balcony walls (neon slogans, small banners): lamps keep clear of it. */
const WALL_TEXT = [
	[38, 58, 30, 26],
	[410, 54, 38, 32],
	[14, 102, 38, 30],
	[434, 102, 40, 30]
];

/** What the room's moving parts read each frame. */
export interface RoomFrame {
	live: boolean;
	beat: number;
	cycle: number;
	t: number;
	/** Per-layer envelopes, shaped by the beat. */
	E: Record<LayerName, number>;
	/** Smoothed per-layer levels. */
	sm: Record<LayerName, number>;
}

export interface Room {
	/** Side walls, balcony bays and slabs, the ceiling, what stands under the balconies. */
	paint(g: Ctx): void;
	/** The front rail of a balcony, drawn over the people standing on it. */
	railing(g: Ctx, x0: number, x1: number, ty: number): void;
	/** What moves under the balconies. */
	live(g: Ctx, f: RoomFrame): void;
}

/** How one city dresses the shared layout. */
export interface Walls {
	/** The wall itself, top to floor. */
	wall(g: Ctx, x: number, y: number, w: number, h: number): void;
	/** The back wall of one balcony bay. */
	bay(g: Ctx, x: number, y: number, w: number, h: number): void;
	/** A column at `x`, `h` px tall from `top`; they stand every 32 px. */
	column(g: Ctx, x: number, top: number, h: number): void;
	/** Something on the back wall between two columns: a lamp, a window. */
	fixture(g: Ctx, x: number, top: number, clear: boolean): void;
	/** The ceiling strip over one side. */
	ceiling(g: Ctx, x0: number, x1: number): void;
	/** A light hanging from the ceiling. */
	pendant(g: Ctx, x: number): void;
	/** The front of a balcony slab. */
	slab(g: Ctx, x0: number, x1: number, ty: number): void;
}

/** Paints both side walls with their balconies, in the city's materials. */
export function paintWalls(g: Ctx, s: Walls) {
	for (const [x0, x1] of SIDES) {
		const w = x1 - x0;
		s.wall(g, x0, 0, w, 200);
		s.ceiling(g, x0, x1);
		for (const ty of TIERS) {
			const top = ty - 40;
			s.bay(g, x0, top, w, 38);
			for (let x = x0 + 28; x < x1; x += 32) {
				const y = top + 11;
				const clear = !WALL_TEXT.some(
					([bx, by, bw, bh]) => x > bx - 4 && x < bx + bw + 4 && y > by - 14 && y < by + bh
				);
				s.fixture(g, x, top, clear);
			}
			for (let x = x0 + 12; x < x1 - 2; x += 32) s.column(g, x, top, 38);
		}
		for (const ty of TIERS) s.slab(g, x0, x1, ty);
		for (const x of CEILING_LAMPS) if (x > x0 && x < x1) s.pendant(g, x);
	}
}

/** A warm glow on the walls, for lamps. */
export function warm(g: Ctx, x: number, y: number, r: number, a: number, color = '#ff9a4a') {
	g.globalCompositeOperation = 'lighter';
	glow(g, x, y, r, color, a);
	g.globalCompositeOperation = 'source-over';
}

/** Every club has one: a steel door under a green running man, at the far right. */
export function fireExit(g: Ctx, dx = 452) {
	px(g, dx - 2, 156, 26, 31, '#0c0a12');
	px(g, dx, 158, 22, 29, '#1e1a2a');
	px(g, dx, 158, 22, 1, '#3a3448');
	px(g, dx, 158, 1, 29, '#2e2a3c');
	for (const y of [160, 184]) for (const x of [dx + 2, dx + 19]) px(g, x, y, 1, 1, '#4a4460');
	px(g, dx + 7, 161, 8, 6, '#06040a');
	px(g, dx + 7, 161, 8, 1, '#141222');
	px(g, dx + 2, 172, 18, 2, '#5a5470');
	px(g, dx + 2, 174, 18, 1, '#0c0a12');
	px(g, dx + 3, 149, 16, 6, '#0d6a34');
	px(g, dx + 3, 149, 16, 1, '#2aff7a');
	const man = ['..#..', '.###.', '#.#.#', '.#.#.', '#...#'];
	man.forEach((row, y) =>
		[...row].forEach((ch, x) => ch === '#' && px(g, dx + 5 + x, 150 + y, 1, 1, '#eafff0'))
	);
	px(g, dx + 12, 152, 5, 1, '#eafff0');
	px(g, dx + 15, 151, 1, 3, '#eafff0');
	warm(g, dx + 11, 152, 14, 0.18, '#2aff7a');
}

/** A needle on a round dial: `v` 0..1 sweeps from lower left to lower right. */
export function needle(g: Ctx, x: number, y: number, r: number, v: number, color: string) {
	const a = Math.PI * (0.85 + 1.3 * Math.max(0, Math.min(1, v)));
	const n = Math.max(2, Math.ceil(r));
	for (let k = 0; k <= n; k++)
		px(
			g,
			Math.round(x + (Math.cos(a) * r * k) / n),
			Math.round(y + (Math.sin(a) * r * k) / n),
			1,
			1,
			color
		);
}
