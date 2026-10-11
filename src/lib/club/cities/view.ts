import { bayer, canvas, clamp, disc, glow, hash, px, ramp, rgba, rng, type Ctx } from '../draw.js';

/**
 * The view through the club's back window, shared by every city: the window and its frame, and the
 * pieces each skyline is built from (sky, moon, blocks, a bridge over a river, things that pass by).
 * RaveBot hides the middle of the window, so each city puts its landmarks either side of him.
 */
export const WIN = { x: 128, y: 22, w: 224, h: 134 };
export const X1 = WIN.x + WIN.w;
/** Left edge of the two line arrays hanging in front of the glass. */
export const LINE_ARRAYS = [130, 336];
/** Top of the bridge deck: the horizon. */
export const DECK = 112;
/** Bottom of the visible water: the booth covers the rest. */
export const WATER = 124;

export type StageId = 'berlin' | 'warsaw' | 'paris';

export interface Neon {
	lines: string[];
	color: string;
}

export interface City {
	id: StageId;
	/** Shown on the booth sticker and in the stage switcher. */
	name: string;
	/** Neon slogans on the left and right balcony walls. */
	neon: [Neon, Neon];
	/** The banners hanging either side of the stage. */
	banners: [string[], string[]];
	/** Stencil on the old power station's control panel. */
	plant: string;
	/** Paints the city's landmark into the booth sticker, centred on `cx`, between `top` and `top + 20`. */
	sticker(g: Ctx, cx: number, top: number, ink: string): void;
	/** Paints the static city into the window. */
	paint(g: Ctx): void;
	/** Draws what moves out there, every frame. */
	live(g: Ctx, t: number, cycle: number, live: boolean): void;
}

// ── painters shared by the cities ───────────────────────────────────────────

export function sky(g: Ctx, colors: string[]) {
	const { x, y, w } = WIN;
	ramp(g, x, y, w, DECK - y, colors, (yy) => ((yy - y) / (DECK - y)) ** 1.15);
}

export function moon(g: Ctx, [mx, my]: number[], halo: string) {
	for (let y = -10; y <= 10; y++)
		for (let x = -10; x <= 10; x++) {
			const d = Math.hypot(x, y);
			if (d > 5 && d < 10 && (10 - d) / 5 > bayer(mx + x, my + y) + 0.3)
				px(g, mx + x, my + y, 1, 1, halo);
		}
	disc(g, mx, my, 5, '#ddd2f6');
	for (let y = -5; y <= 5; y++)
		for (let x = -5; x <= 5; x++)
			if (x * x + y * y <= 27 && x + y > 3) px(g, mx + x, my + y, 1, 1, '#b4a6e0');
	px(g, mx - 2, my - 2, 2, 1, '#c2b4e8');
	px(g, mx + 1, my + 1, 1, 1, '#c2b4e8');
	px(g, mx - 1, my + 2, 1, 1, '#c2b4e8');
}

export interface Star {
	x: number;
	y: number;
	b: number;
}
export function makeStars(seed: number, avoid: number[]): Star[] {
	const R = rng(seed);
	return Array.from({ length: 34 }, () => ({
		x: Math.round(WIN.x + 3 + R() * (WIN.w - 6)),
		y: Math.round(WIN.y + 2 + R() * 58),
		b: R()
	})).filter((s) => Math.hypot(s.x - avoid[0], s.y - avoid[1]) > 10);
}
export function twinkle(g: Ctx, stars: Star[], t: number) {
	for (const s of stars) {
		const a = 0.25 + 0.6 * s.b * (0.5 + 0.5 * Math.sin(t * (1 + s.b * 2) + s.x));
		px(g, s.x, s.y, 1, 1, rgba('#efe6ff', clamp(a, 0, 1)));
	}
}

/** Lit windows in a grid, mostly warm, some cool. */
export function windows(
	g: Ctx,
	R: () => number,
	x: number,
	y: number,
	w: number,
	h: number,
	p: number,
	colors = ['#ffcf6a', '#ffe6a8', '#ffb35a', '#9fd8ff']
) {
	for (let yy = y + 1; yy < y + h - 1; yy += 2)
		for (let xx = x + 1; xx < x + w - 1; xx += 2)
			if (R() < p) px(g, xx, yy, 1, 1, R() < 0.8 ? rgba(colors[(R() * 3) | 0], 0.75) : colors[3]);
}

/** The hazy far skyline, then nearer blocks with lit windows. */
export function blocks(
	g: Ctx,
	R: () => number,
	far: string,
	farLight: string,
	mid: string,
	rim: string,
	lights?: string[]
) {
	for (let x = WIN.x; x < X1;) {
		const bw = 4 + ((R() * 6) | 0);
		const h = 4 + ((R() * 13) | 0);
		px(g, x, DECK - h, bw, h, far);
		if (R() < 0.3) px(g, x + 1, DECK - h - 3, 1, 3, far);
		for (let k = 0; k < (bw * h) / 10; k++)
			if (R() < 0.5) px(g, x + R() * bw, DECK - h + 1 + R() * (h - 2), 1, 1, farLight);
		x += bw;
	}
	for (let x = WIN.x; x < X1;) {
		const bw = 6 + ((R() * 9) | 0);
		const h = 5 + ((R() * 10) | 0);
		if (R() < 0.75) {
			px(g, x, DECK - h, bw, h, mid);
			px(g, x, DECK - h, bw, 1, rim);
			windows(g, R, x, DECK - h, bw, h, 0.25, lights);
		}
		x += bw + ((R() * 4) | 0);
	}
}

/** A bridge deck on the horizon over dark water: arched (brick or stone) or a flat modern span. */
export function bridge(
	g: Ctx,
	R: () => number,
	o: { deck: string; top: string; speck: string; pier: string; arches: boolean; water: string }
) {
	const { x: X0, w } = WIN;
	px(g, X0, DECK, w, 4, o.deck);
	px(g, X0, DECK, w, 1, o.top);
	for (let k = 0; k < w * 1.2; k++) px(g, X0 + R() * w, DECK + 1 + R() * 3, 1, 1, o.speck);
	for (let x = X0; x < X1; x += 4) px(g, x, DECK - 2, 1, 2, o.pier);
	px(g, X0, DECK - 2, w, 1, o.pier);
	px(g, X0, DECK + 4, w, WATER + 40 - DECK, o.water);
	for (let x = X0; x < X1; x++) {
		if (!o.arches) {
			if ((x - X0) % 44 < 4) px(g, x, DECK + 4, 1, 40, o.pier);
			continue;
		}
		const u = (((x - X0 + 11) % 22) - 11) / 11;
		const top = DECK + 4 + Math.round(6 * (1 - Math.sqrt(Math.max(0, 1 - u * u))));
		px(g, x, DECK + 4, 1, top - DECK - 4, o.pier);
		if (Math.abs(u) > 0.82) px(g, x, top, 1, 40, o.pier);
		else px(g, x, top, 1, 1, '#0c0614');
	}
}

/** Still reflections of the city lights in the water. */
export function reflections(g: Ctx, R: () => number, colors: string[]) {
	for (let k = 0; k < 60; k++) {
		const x = WIN.x + R() * WIN.w;
		const y = DECK + 8 + R() * (WATER - DECK - 6);
		px(g, x, y, 1 + R() * 3, 1, rgba(colors[(R() * colors.length) | 0], 0.2));
	}
}

// ── live pieces ─────────────────────────────────────────────────────────────

/** A red aviation light with a small glow. */
export function blink(g: Ctx, x: number, y: number, on: boolean, color = '#ff3a3a') {
	if (!on) return;
	px(g, x, y, 1, 1, color);
	g.globalCompositeOperation = 'lighter';
	glow(g, x + 0.5, y + 0.5, 3, color, 0.5);
	g.globalCompositeOperation = 'source-over';
}

/** A plane crossing high up every 40 seconds. */
export function plane(g: Ctx, t: number) {
	const p = (t % 40) / 16;
	if (p >= 1) return;
	px(g, 152 + p * 180, 30 - p * 6, 1, 1, Math.floor(t * 2) % 2 ? '#ff4a4a' : '#ffffff');
}

export function clipped(g: Ctx, fn: () => void) {
	g.save();
	g.beginPath();
	g.rect(WIN.x, WIN.y, WIN.w, WIN.h);
	g.clip();
	fn();
	g.restore();
}

export interface Vehicle {
	cars: number;
	/** Length of one car, px. */
	len: number;
	body: string;
	roof: string;
	skirt: string;
	/** An optional stripe under the windows. */
	stripe?: string;
	windows: string;
	/** Seconds between two crossings. */
	period: number;
	/** A pantograph on the roof, for trams. */
	pantograph?: boolean;
}

/** A train or tram crossing the bridge, its headlight leading. Call inside `clipped`. */
export function crossing(g: Ctx, t: number, v: Vehicle) {
	const total = v.cars * (v.len + 1);
	const tx = WIN.x - total - 4 + ((t % v.period) / v.period) * (WIN.w + total + 300);
	for (let car = 0; car < v.cars; car++) {
		const x = Math.round(tx + car * (v.len + 1));
		px(g, x, DECK - 6, v.len, 5, v.body);
		px(g, x + 1, DECK - 7, v.len - 2, 1, v.roof);
		px(g, x, DECK - 2, v.len, 1, v.skirt);
		if (v.stripe) px(g, x, DECK - 3, v.len, 1, v.stripe);
		for (let k = 0; k < (v.len - 3) / 2; k++) px(g, x + 2 + k * 2, DECK - 5, 1, 2, v.windows);
		if (v.pantograph) {
			px(g, x + (v.len >> 1) - 2, DECK - 9, 5, 1, '#3a3a44');
			px(g, x + (v.len >> 1), DECK - 8, 1, 1, '#3a3a44');
		}
	}
	const front = Math.round(tx + total - 1);
	px(g, front, DECK - 3, 1, 1, '#ffffff');
	g.globalCompositeOperation = 'lighter';
	glow(g, front + 2, DECK - 3, 6, '#fff0b0', 0.35);
	g.globalCompositeOperation = 'source-over';
}

/** Light dancing on the river under the bridge. Call inside `clipped`. */
export function shimmer(g: Ctx, t: number, colors: [string, string]) {
	for (let y = DECK + 8; y < WATER; y++)
		for (let x = WIN.x; x < X1; x += 2) {
			const n = hash(Math.floor(x / 3), y + Math.floor(t * 3));
			if (n > 0.9) px(g, x, y, 2, 1, rgba(n > 0.96 ? colors[0] : colors[1], 0.45));
		}
}

// ── the window ──────────────────────────────────────────────────────────────

/** The window's steel frame and glass, laid over the city and whatever crosses it. */
export function windowFrame() {
	const [c, g] = canvas();
	const R = rng(31);
	const { x: X0, y: Y0, w, h } = WIN;
	const cols = Array.from({ length: 11 }, (_, k) => X0 + Math.round(k * 22.4));
	const rows = Array.from({ length: 5 }, (_, k) => Y0 + k * 27);

	// Grime collects at the bottom of each pane, and condensation runs down the glass.
	for (const y of rows.slice(1))
		for (let x = X0; x < X1; x++)
			for (let d = 1; d <= 4; d++)
				if (R() < 0.5 - d * 0.1) px(g, x, y - d, 1, 1, 'rgba(8,4,18,.45)');
	for (let k = 0; k < 14; k++) {
		const x = X0 + R() * w;
		const y = Y0 + R() * (h - 20);
		px(g, x, y, 1, 4 + R() * 9, 'rgba(200,180,255,.06)');
	}
	// A cracked pane.
	for (let k = 0; k < 6; k++) {
		const a = (k / 6) * Math.PI * 2 + R();
		let [x, y] = [210, 38];
		for (let s = 0; s < 4 + R() * 7; s++) {
			x += Math.cos(a) + (R() - 0.5) * 0.8;
			y += Math.sin(a) + (R() - 0.5) * 0.8;
			px(g, x, y, 1, 1, 'rgba(225,215,255,.35)');
		}
	}

	// Mullions and transoms with bolted plates where they cross.
	cols.forEach((x, k) => {
		px(g, x, Y0, k % 2 ? 1 : 2, h, '#0a0616');
		if (k % 2 === 0) px(g, x, Y0, 1, h, '#1e1632');
	});
	for (const y of rows) {
		px(g, X0, y, w, 2, '#0a0616');
		px(g, X0, y, w, 1, '#1e1632');
	}
	cols.forEach((x, k) => {
		if (k % 2) return;
		for (const y of rows) {
			px(g, x - 1, y - 1, 4, 4, '#16102a');
			px(g, x - 1, y - 1, 1, 1, '#3a3058');
			px(g, x + 2, y + 2, 1, 1, '#3a3058');
		}
	});
	// Outer frame.
	px(g, X0 - 2, Y0 - 4, w + 4, 4, '#0c0720');
	px(g, X0 - 2, Y0 - 1, w + 4, 1, '#251c3c');
	px(g, X0 - 2, Y0, 2, h, '#0c0720');
	px(g, X1, Y0, 2, h, '#0c0720');

	// Line arrays hang in front of the glass, every box with its grille and rigging.
	for (const x of LINE_ARRAYS) {
		px(g, x + 3, 18, 1, 4, '#2a2535');
		px(g, x + 10, 18, 1, 4, '#2a2535');
		for (let i = 0; i < 6; i++) {
			const y = 22 + i * 12;
			px(g, x, y, 14, 11, '#121018');
			px(g, x, y, 14, 1, '#2e2a3a');
			px(g, x, y + 10, 14, 1, '#07060b');
			for (let yy = y + 2; yy < y + 9; yy++)
				for (let xx = x + 1; xx < x + 13; xx++) if ((xx + yy) % 2) px(g, xx, yy, 1, 1, '#1a1722');
			px(g, x, y + 4, 1, 3, '#2e2a3a');
			px(g, x + 13, y + 4, 1, 3, '#2e2a3a');
		}
	}
	return c;
}
