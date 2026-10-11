import { type Grid, set, toCanvas, withOutline } from './sprite.js';

/**
 * The dancefloor: five rows of ravers seen from behind, each one generated with their own look
 * (hair, skin, clothes, build), dance move and gesture. Bodies are pre-rendered sprites with a
 * separate rim-light layer, so the stage lights can brighten their edges every frame; arms and
 * props (phones, fans, glow sticks) are drawn live.
 */

type Ctx = CanvasRenderingContext2D;

const PINK = '#ff3dc8';
const BLUE = '#56a8ff';

export interface CrowdFrame {
	live: boolean;
	cycle: number;
	/** Beats since the start of the set, and the phase within the current beat. */
	beat: number;
	ph: number;
	/** Seconds, for ambient motion. */
	t: number;
	/** Smoothed kick level, 0..1. */
	kick: number;
	/** Per-beat envelopes. */
	hats: number;
	synth: number;
	kickEnv: number;
	/** How wild the floor is, 0..1. */
	hype: number;
	accent: string;
	breakdown: boolean;
	peak: boolean;
}

type Hair =
	| 'short'
	| 'buzz'
	| 'long'
	| 'pony'
	| 'bun'
	| 'afro'
	| 'mohawk'
	| 'cap'
	| 'bucket'
	| 'bob'
	| 'ears';
type Top = 'tee' | 'tank' | 'harness' | 'mesh' | 'hoodie' | 'jacket' | 'backpack';
type Gesture = 'one' | 'two' | 'point' | 'wave' | 'phone' | 'fan' | 'glow' | 'heart' | 'none';
type Move = 'bounce' | 'off' | 'sway' | 'jump';

const HAIRS: [Hair, number][] = [
	['short', 5],
	['buzz', 3],
	['long', 4],
	['pony', 2],
	['bun', 2],
	['afro', 2],
	['mohawk', 1],
	['cap', 2],
	['bucket', 2],
	['bob', 2],
	['ears', 1]
];
const TOPS: [Top, number][] = [
	['tee', 5],
	['tank', 3],
	['harness', 2],
	['mesh', 2],
	['hoodie', 3],
	['jacket', 2],
	['backpack', 1]
];
const GESTURES: [Gesture, number][] = [
	['one', 6],
	['two', 4],
	['point', 2],
	['wave', 2],
	['phone', 2],
	['fan', 2],
	['glow', 2],
	['heart', 1]
];
const SKINS = ['#f0c8a8', '#e0b090', '#c88f68', '#a8724c', '#7e5236', '#5a3a24', '#3e281a'];
const HAIR_COLS = [
	'#1a1210',
	'#1a1210',
	'#2e1e14',
	'#4a3020',
	'#6a4a2a',
	'#b89a5a',
	'#d8d0c8',
	'#c03a8a',
	'#3a6ad0',
	'#3aa070',
	'#a8341e'
];
const CLOTHES = [
	'#1c1826',
	'#1c1826',
	'#242030',
	'#3a1030',
	'#10303a',
	'#2a3a1a',
	'#3a2a5a',
	'#4a4a52',
	'#5a1a2a',
	'#1a2a4a',
	'#9ab83a',
	'#c8c4d0'
];
const HATS = ['#1c1826', '#c8c4d0', '#3a2a5a', '#c6ff3d', '#ff3dc8'];
const GLOWS = ['#4dff9a', '#ff3dc8', '#4dd2ff', '#c6ff3d'];

/** Rows from the back of the floor to the front: head height, head radius, how many, how dark. */
const ROWS = [
	{ y: 196, r: 4, n: 50, dark: 0.58 },
	{ y: 210, r: 5, n: 40, dark: 0.67 },
	{ y: 226, r: 7, n: 29, dark: 0.76 },
	{ y: 246, r: 9, n: 21, dark: 0.84 },
	{ y: 270, r: 13, n: 13, dark: 0.9 }
];
const NIGHT = '#06040c';

function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
function pick<T>(R: () => number, list: [T, number][]): T {
	let n = R() * list.reduce((s, [, w]) => s + w, 0);
	for (const [v, w] of list) if ((n -= w) < 0) return v;
	return list[0][0];
}
const any = <T>(R: () => number, list: T[]) => list[Math.floor(R() * list.length)];

function mix(a: string, b: string, t: number) {
	const p = parseInt(a.slice(1), 16);
	const q = parseInt(b.slice(1), 16);
	const ch = (s: number) => Math.round(((p >> s) & 255) * (1 - t) + ((q >> s) & 255) * t);
	return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}
/** Ramp color for brightness `v`, without dithering: the crowd reads cleaner as flat shapes. */
const tone = (ramp: string[], v: number, _x?: number, _y?: number) =>
	ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(v * (ramp.length - 1))))];
/** Shadow-to-light ramp around one color. */
const ramp = (c: string) => [mix(c, '#000000', 0.3), c, mix(c, '#ffffff', 0.1)];
function rgba(hex: string, a: number) {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function px(g: Ctx, x: number, y: number, w: number, h: number, c: string) {
	g.fillStyle = c;
	g.fillRect(Math.round(x), Math.round(y), w, h);
}
function line(g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, c: string) {
	g.fillStyle = c;
	const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		g.fillRect(
			Math.round(x0 + (x1 - x0) * t - w / 2),
			Math.round(y0 + (y1 - y0) * t - w / 2),
			w,
			w
		);
	}
}
function blob(g: Ctx, cx: number, cy: number, r: number, c: string) {
	g.fillStyle = c;
	cx = Math.round(cx);
	cy = Math.round(cy);
	for (let dy = -r; dy <= r; dy++) {
		const w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.5));
		g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
	}
}

interface Look {
	hair: Hair;
	hairCol: string;
	hatCol: string;
	skin: string;
	top: Top;
	cloth: string;
	/** Shoulder width in head radii. */
	broad: number;
	print: number;
}

interface Person {
	x: number;
	row: number;
	r: number;
	look: Look;
	move: Move;
	ph: number;
	amp: number;
	seed: number;
	gesture: Gesture;
	/** Hype above which this person gets their hands up. */
	hand: number;
	side: -1 | 1;
	band: string | null;
	glow: string;
	body: HTMLCanvasElement;
	rim: HTMLCanvasElement;
	ax: number;
	ay: number;
	/** Height and position jitter so the rows don't line up. */
	lift: number;
	/** Someone sitting on this person's shoulders. */
	rider?: Person;
}

/** Paints one raver, seen from behind, into a grid. Head centre at (ax, ay). */
function paintPerson(look: Look, r: number, len: number, R: () => number) {
	const w = Math.ceil(r * 5.2) + 4;
	const ax = Math.floor(w / 2);
	const ay = Math.ceil(r * 2.1) + 1;
	const h = ay + len;
	const grid: Grid = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
	const skin = ramp(look.skin);
	const cloth = ramp(look.cloth);
	const hair = ramp(look.hairCol);
	const hat = ramp(look.hatCol);
	const y0 = ay + r * 0.75;

	// Shoulders and back.
	for (let y = Math.floor(y0); y < h; y++) {
		const hw = Math.min(r * look.broad, r * 0.8 + (y - y0) * 0.95);
		for (let x = Math.ceil(ax - hw); x <= Math.floor(ax + hw); x++) {
			const dx = (x - ax) / (r * look.broad);
			const v = 0.55 - (y - y0) / (r * 7) - Math.abs(dx) * 0.25;
			let c = tone(cloth, v, x, y);
			const top = y < y0 + r * 1.3;
			if (look.top === 'tank' && Math.abs(dx) > 0.42 && top) c = tone(skin, v, x, y);
			if (look.top === 'tank' && Math.abs(Math.abs(dx) - 0.42) < 0.06 && top) c = cloth[1];
			if (look.top === 'harness') {
				c = tone(skin, v, x, y);
				const d = y - y0;
				if (Math.abs(Math.abs(x - ax) - d * 0.7) < 0.8 && d < r * 2.2) c = '#050307';
				if (Math.abs(y - (y0 + r * 1.6)) < 0.6) c = '#050307';
				if (Math.abs(x - ax) < 1 && Math.abs(y - (y0 + r * 0.9)) < 1) c = '#9a93c2';
			}
			if (look.top === 'mesh' && (x + y) % 3 === 0 && (x - y) % 3 === 0)
				c = tone(skin, v * 0.8, x, y);
			if (look.top === 'jacket' && x === ax && y > y0 + r * 0.6) c = cloth[0];
			if (
				look.top === 'backpack' &&
				Math.abs(x - ax) < r * 0.75 &&
				y > y0 + r * 0.6 &&
				y < y0 + r * 2.4
			)
				c = tone(ramp('#1a1a22'), v + 0.1, x, y);
			set(grid, x, y, c);
		}
	}
	// A print on the back of some tees.
	if (look.top === 'tee' && r >= 7) {
		const ink = mix(look.cloth, '#ffffff', 0.55);
		const py = Math.round(y0 + r * 1.2);
		if (look.print < 0.33)
			for (let a = 0; a < 24; a++) {
				const t = (a / 24) * Math.PI * 2;
				set(
					grid,
					Math.round(ax + Math.cos(t) * r * 0.45),
					Math.round(py + Math.sin(t) * r * 0.45),
					ink
				);
			}
		else if (look.print < 0.66)
			for (let k = 0; k < 3; k++)
				for (let x = -r * 0.5; x <= r * 0.5; x++) set(grid, Math.round(ax + x), py + k * 2, ink);
		else
			for (let x = -r * 0.6; x <= r * 0.6; x++)
				if (Math.round(x) % 2) set(grid, Math.round(ax + x), py, ink);
	}
	// Hood bunched up at the neck.
	if (look.top === 'hoodie')
		for (let y = 0; y < r * 0.9; y++)
			for (let x = -r * 0.7; x <= r * 0.7; x++)
				if ((x / (r * 0.7)) ** 2 + (y / (r * 0.9)) ** 2 <= 1)
					set(grid, Math.round(ax + x), Math.round(y0 + y), tone(cloth, 0.75, x, y));
	// Neck.
	for (let y = Math.floor(ay + r * 0.5); y < y0 + 1; y++)
		for (let x = -r * 0.35; x <= r * 0.35; x++) set(grid, Math.round(ax + x), y, skin[0]);

	// Head and hair.
	const head = (rad: number, col: string[] | ((x: number, y: number, v: number) => string)) => {
		for (let y = -Math.ceil(rad); y <= Math.ceil(rad); y++)
			for (let x = -Math.ceil(rad); x <= Math.ceil(rad); x++) {
				if (x * x + y * y > rad * rad + rad * 0.5) continue;
				const v = 0.5 - (y / rad) * 0.3 - (x / rad) * 0.1;
				set(grid, ax + x, ay + y, typeof col === 'function' ? col(x, y, v) : tone(col, v, x, y));
			}
	};
	switch (look.hair) {
		case 'buzz':
			head(r * 0.95, (x, y, v) => ((x * 7 + y * 3) % 11 ? tone(skin, v * 0.8, x, y) : hair[0]));
			break;
		case 'afro':
			for (let y = -r * 1.5; y <= r * 1.4; y++)
				for (let x = -r * 1.5; x <= r * 1.5; x++) {
					const a = Math.atan2(y, x);
					const rad = r * 1.3 + Math.sin(a * 7) * 0.6 + R() * 0.5;
					if (x * x + y * y <= rad * rad)
						set(
							grid,
							Math.round(ax + x),
							Math.round(ay + y - r * 0.15),
							tone(hair, 0.5 - (y / r) * 0.2, x, y)
						);
				}
			break;
		case 'mohawk':
			head(r * 0.95, (x, y, v) => tone(skin, v * 0.7, x, y));
			for (let y = -r * 1.6; y < r * 0.7; y++)
				for (let x = -r * 0.2; x <= r * 0.2; x++)
					if (y > -r * 0.9 || Math.abs(x) < r * 0.15 + (y + r * 1.6) * 0.2)
						set(grid, Math.round(ax + x), Math.round(ay + y), tone(hair, 0.6 - y / (r * 4), x, y));
			break;
		default:
			head(r, hair);
	}
	if (look.hair === 'long' || look.hair === 'bob') {
		const end = look.hair === 'long' ? y0 + r * 1.4 : ay + r * 1.05;
		const wide = look.hair === 'long' ? 0.9 : 1.15;
		for (let y = ay; y < end; y++)
			for (let x = -r * wide; x <= r * wide; x++)
				if (look.hair === 'bob' || Math.abs(x) < r * wide - Math.max(0, y - y0) * 0.3)
					set(grid, Math.round(ax + x), y, tone(hair, 0.45 - (y - ay) / (r * 6), x, y));
	}
	if (look.hair === 'pony')
		for (let y = 0; y < r * 1.3; y++)
			for (let x = -Math.max(0.5, r * 0.2); x <= Math.max(0.5, r * 0.2); x++)
				set(grid, Math.round(ax + x + y * 0.15), Math.round(ay + r * 0.6 + y), hair[(y | 0) % 2]);
	if (look.hair === 'bun')
		for (let y = -r * 0.45; y <= r * 0.45; y++)
			for (let x = -r * 0.45; x <= r * 0.45; x++)
				if (x * x + y * y <= r * r * 0.2)
					set(grid, Math.round(ax + x), Math.round(ay - r + y), tone(hair, 0.6, x, y));
	if (look.hair === 'cap') {
		for (let y = -r; y < -r * 0.05; y++)
			for (let x = -r; x <= r; x++)
				if (x * x + y * y <= r * r + r * 0.5)
					set(grid, ax + x, Math.round(ay + y), tone(hat, 0.6 - y / (r * 3), x, y));
		for (let x = -r * 0.25; x <= r * 0.25; x++)
			set(grid, Math.round(ax + x), Math.round(ay - r * 0.1), skin[0]);
	}
	if (look.hair === 'bucket') {
		for (let y = -r * 1.05; y < -r * 0.1; y++)
			for (let x = -r * 0.95; x <= r * 0.95; x++)
				if (x * x + (y + r * 0.1) ** 2 <= r * r)
					set(grid, Math.round(ax + x), Math.round(ay + y), tone(hat, 0.6, x, y));
		for (let x = -r * 1.5; x <= r * 1.5; x++)
			for (let y = 0; y < Math.max(1, r * 0.25); y++)
				set(grid, Math.round(ax + x), Math.round(ay - r * 0.1 + y), hat[y < 1 ? 2 : 1]);
	}
	if (look.hair === 'ears')
		for (const s of [-1, 1])
			for (let k = 0; k < Math.max(2, r * 0.6); k++)
				for (let x = 0; x <= k * 0.5; x++)
					set(
						grid,
						Math.round(ax + s * (r * 0.55 + x - k * 0.25)),
						Math.round(ay - r * 1.45 + k),
						PINK
					);
	return { grid, ax, ay };
}

/** Rim light: the top edge and the edge facing the stage centre. */
function rimOf(grid: Grid, side: -1 | 1, color: string, thick: number, sideUntil: number) {
	const out: Grid = grid.map((r) => r.map(() => null));
	for (let y = 0; y < grid.length; y++)
		for (let x = 0; x < grid[y].length; x++) {
			if (!grid[y][x]) continue;
			for (let k = 1; k <= thick; k++)
				if (!grid[y - k]?.[x] || (y < sideUntil && !grid[y][x + side * k])) {
					out[y][x] = color;
					break;
				}
		}
	return out;
}

function darken(grid: Grid, k: number) {
	return grid.map((row) => row.map((c) => (c ? mix(c, NIGHT, k) : null)));
}

export class Crowd {
	private rows: Person[][];

	constructor(width: number, height: number, seed = 42) {
		const R = rng(seed);
		const make = (x: number, ri: number, r: number, len: number): Person => {
			const look: Look = {
				hair: pick(R, HAIRS),
				hairCol: any(R, HAIR_COLS),
				hatCol: any(R, HATS),
				skin: any(R, SKINS),
				top: pick(R, TOPS),
				cloth: any(R, CLOTHES),
				broad: 1.35 + R() * 0.55,
				print: R()
			};
			const { grid, ax, ay } = paintPerson(look, r, len, R);
			const side = x < width / 2 ? 1 : -1;
			const dark = darken(grid, ROWS[ri].dark);
			const rimCol =
				Math.abs(x - width / 2) < 30 ? mix(PINK, '#ffffff', 0.3) : x < width / 2 ? PINK : BLUE;
			let gesture = pick(R, GESTURES);
			if (gesture === 'fan' && ri === 0) gesture = 'one';
			if (gesture === 'heart' && ri < 2) gesture = 'two';
			return {
				x,
				row: ri,
				r,
				look,
				move: R() < 0.55 ? 'bounce' : R() < 0.4 ? 'off' : R() < 0.6 ? 'sway' : 'jump',
				ph: R() * 0.08,
				amp: 0.8 + R() * 1.4,
				seed: R() * 6,
				gesture,
				hand: R(),
				side: R() < 0.5 ? -1 : 1,
				band: R() < 0.5 ? PINK : R() < 0.5 ? BLUE : null,
				glow: any(R, GLOWS),
				body: toCanvas(ri >= 2 ? withOutline(dark) : dark),
				rim: toCanvas(rimOf(grid, side, rimCol, r >= 9 ? 2 : 1, ay + r)),
				lift: Math.round((R() - 0.5) * r * 0.8),
				ax,
				ay
			};
		};
		this.rows = ROWS.map((row, ri) => {
			const people = Array.from({ length: row.n }, (_, i) =>
				make(
					(i + 0.2 + R() * 0.6) * (width / row.n) + (ri % 2) * 4,
					ri,
					row.r,
					height - row.y + row.r * 3 + 8
				)
			);
			// Someone up on their friend's shoulders.
			if (ri === 3) {
				const carrier = people[Math.floor(row.n * 0.68)];
				carrier.gesture = 'none';
				carrier.rider = make(carrier.x, 2, Math.round(row.r * 0.85), row.r * 4);
				carrier.rider.gesture = 'two';
				carrier.rider.hand = -1;
			}
			// Whoever stands lower on screen is closer, so draw them last.
			return people.sort((a, b) => a.lift - b.lift);
		});
	}

	draw(g: Ctx, f: CrowdFrame) {
		this.rows.forEach((people, ri) => {
			const row = ROWS[ri];
			const rimA =
				(0.25 + 0.4 * f.synth + 0.35 * f.kickEnv) *
				[1, 0.9, 0.8, 0.7, 0.6][ri] *
				(f.live ? 1 : 0.3);
			for (const p of people) {
				const { dx, dy } = this.motion(p, f);
				const x = p.x + dx;
				const y = row.y + p.lift + dy;
				this.person(g, p, x, y, rimA, f);
				if (p.rider) {
					const rr = p.rider.r;
					const ry = y - p.r * 2.3 + (f.live ? Math.round(Math.sin(f.beat * Math.PI) * 1) : 0);
					// Legs over the shoulders.
					const leg = mix(p.rider.look.cloth, NIGHT, 0.7);
					for (const s of [-1, 1])
						line(
							g,
							x + s * rr * 0.6,
							ry + rr * 2.2,
							x + s * p.r * 1.2,
							y + p.r * 1.4,
							Math.max(2, rr * 0.6),
							leg
						);
					this.person(g, p.rider, x, ry, rimA * 1.2, f);
				}
			}
			if (ri === 1) this.flag(g, f);
		});
	}

	private motion(p: Person, f: CrowdFrame) {
		if (!f.live) return { dx: 0, dy: 0 };
		const k = 1 + p.row * 0.45;
		const sway = Math.round(Math.sin((f.cycle * Math.PI) / 2 + p.seed) * k);
		// Without a kick everyone sways.
		if (f.kick < 0.3 || p.move === 'sway')
			return { dx: sway, dy: p.move === 'sway' ? -Math.round(f.kickEnv * k * 0.6) : 0 };
		const phase = (f.ph + p.ph + (p.move === 'off' ? 0.5 : 0)) % 1;
		const hit = f.kick * Math.exp(-phase * 7);
		const big = p.move === 'jump' && f.peak ? 2.2 : 1;
		return { dx: 0, dy: -Math.round(hit * p.amp * (0.4 + f.hype) * k * big) };
	}

	private person(g: Ctx, p: Person, x: number, y: number, rimA: number, f: CrowdFrame) {
		const bx = Math.round(x - p.ax);
		const by = Math.round(y - p.ay);
		g.drawImage(p.body, bx, by);
		g.globalAlpha = Math.min(1, rimA);
		g.drawImage(p.rim, bx, by);
		g.globalAlpha = 1;
		if (f.live && p.gesture !== 'none' && p.hand < f.hype * 0.95 - 0.05) this.arms(g, p, x, y, f);
	}

	private arms(g: Ctx, p: Person, x: number, y: number, f: CrowdFrame) {
		const { r, side } = p;
		const dark = ROWS[p.row].dark;
		const bare = p.look.top === 'tank' || p.look.top === 'harness' || p.look.top === 'mesh';
		const sleeve = mix(bare ? p.look.skin : p.look.cloth, NIGHT, dark);
		const skin = mix(p.look.skin, NIGHT, dark * 0.85);
		const rim = x < 240 ? PINK : BLUE;
		const w = Math.max(1, Math.round(r * 0.42));
		const beatWave = Math.sin((f.beat * Math.PI) / 2 + p.seed);
		const pump = f.kick * Math.exp(-((f.ph + p.ph) % 1) * 7);
		const arm = (s: number, hx: number, hy: number) => {
			line(g, x + s * r * 1.05, y + r * 1.25, hx, hy + w, w, sleeve);
			return [hx, hy] as const;
		};
		const fist = (hx: number, hy: number) => {
			blob(g, hx, hy, Math.max(1, Math.round(r * 0.36)), skin);
			px(g, hx - 1, hy - Math.max(1, Math.round(r * 0.36)), 2, 1, rgba(rim, 0.8));
		};
		const band = (hx: number, hy: number) => {
			if (!p.band) return;
			const a = 0.35 + 0.65 * f.hats;
			g.globalCompositeOperation = 'lighter';
			g.globalAlpha = a * 0.25;
			px(g, hx - w / 2 - 1, hy + r * 0.55 - 1, w + 2, 3, p.band);
			g.globalAlpha = a;
			px(g, hx - w / 2, hy + r * 0.55, w, 1, p.band);
			g.globalAlpha = 1;
			g.globalCompositeOperation = 'source-over';
		};
		const hy0 = y - r * 2.3 - pump * r * 0.3;

		switch (p.gesture) {
			case 'two': {
				for (const s of [-1, 1]) {
					const [hx, hy] = arm(s, x + s * r * (1.3 + beatWave * 0.15), hy0);
					fist(hx, hy);
					band(hx, hy);
				}
				break;
			}
			case 'heart': {
				for (const s of [-1, 1]) arm(s, x + s * r * 0.45, y - r * 2.1);
				const k = Math.max(1, Math.round(r / 6));
				const shape = ['.x.x.', 'xxxxx', '.xxx.', '..x..'];
				shape.forEach((row, j) =>
					[...row].forEach(
						(ch, i) => ch === 'x' && px(g, x + (i - 2.5) * k, y - r * 2.6 + j * k, k, k, skin)
					)
				);
				px(g, x - 2.5 * k, y - r * 2.6 - 1, 5 * k, 1, rgba(rim, 0.7));
				break;
			}
			case 'phone': {
				const [hx, hy] = arm(side, x + side * r * 0.7, y - r * 1.9);
				const pw = Math.max(2, Math.round(r * 0.45));
				const phh = Math.max(3, Math.round(r * 0.75));
				px(g, hx - pw / 2 - 1, hy - phh - 1, pw + 2, phh + 2, '#050307');
				px(g, hx - pw / 2, hy - phh, pw, phh, '#dfe8ff');
				if (r >= 7) px(g, hx - pw / 2, hy - phh * 0.5, pw, 1, PINK);
				g.globalCompositeOperation = 'lighter';
				g.globalAlpha = 0.18;
				px(g, hx - pw * 1.5, hy - phh * 1.6, pw * 3, phh * 2.2, '#dfe8ff');
				g.globalAlpha = 1;
				g.globalCompositeOperation = 'source-over';
				fist(hx, hy);
				break;
			}
			case 'fan': {
				const [hx, hy] = arm(side, x + side * r * 1.2, hy0 + r * 0.4);
				// Folding fans snap open on every other beat.
				const open = Math.floor(f.beat) % 2 ? 1 : 0.35;
				const span = Math.PI * (0.25 + 0.75 * open);
				const R = r * 1.7;
				for (let yy = -R; yy <= 0; yy++)
					for (let xx = -R; xx <= R; xx++) {
						const d = Math.hypot(xx, yy);
						if (d > R || d < r * 0.3) continue;
						const a = Math.atan2(xx, -yy) - side * 0.2;
						if (Math.abs(a) > span / 2) continue;
						const rib = Math.floor((a + span / 2) / (span / 7));
						const c = d > R - 1 ? rgba(rim, 0.9) : rib % 2 ? '#0c0a12' : mix(p.glow, NIGHT, 0.55);
						px(g, hx + xx, hy + yy, 1, 1, c);
					}
				fist(hx, hy);
				break;
			}
			case 'glow': {
				const [hx, hy] = arm(side, x + side * r * 1.4, hy0);
				const a = beatWave * 0.7;
				const L = r * 1.4;
				const ex = hx + Math.sin(a) * L;
				const ey = hy - Math.cos(a) * L;
				g.globalCompositeOperation = 'lighter';
				g.globalAlpha = 0.3;
				line(g, hx, hy, ex, ey, Math.max(2, w + 2), p.glow);
				g.globalAlpha = 1;
				g.globalCompositeOperation = 'source-over';
				line(g, hx, hy, ex, ey, Math.max(1, w), p.glow);
				fist(hx, hy);
				break;
			}
			case 'wave': {
				const [hx, hy] = arm(side, x + side * r * 1.4 + Math.sin(f.beat * Math.PI) * r * 0.5, hy0);
				fist(hx, hy);
				for (let k = -1; k <= 1; k++)
					px(g, hx + k * Math.max(1, r * 0.25), hy - r * 0.6, 1, Math.max(1, r * 0.3), skin);
				band(hx, hy);
				break;
			}
			case 'point': {
				const [hx, hy] = arm(side, x + side * r * 1.1, hy0);
				fist(hx, hy);
				px(g, hx, hy - r * 0.9, Math.max(1, w - 1), r * 0.6, skin);
				band(hx, hy);
				break;
			}
			default: {
				const [hx, hy] = arm(side, x + side * r * 1.5 + Math.round(beatWave * r * 0.3), hy0);
				fist(hx, hy);
				band(hx, hy);
			}
		}
	}

	/** A smiley flag waving over the second row. */
	private flag(g: Ctx, f: CrowdFrame) {
		const fx = 70 + Math.round(Math.sin(f.t * 2) * 3);
		const fy = 172 + (f.live ? Math.round(Math.sin((f.beat * Math.PI) / 2) * 2) : 0);
		line(g, fx, fy + 30, fx + 2, fy, 1, '#2a2338');
		for (let y = 0; y < 14; y++) {
			const wave = Math.round(Math.sin(f.t * 4 + y * 0.4) * 0.8);
			px(g, fx + 2 + wave, fy + y, 18, 1, '#0c0a12');
		}
		const c = '#e2dcf2';
		for (let a = 0; a < 40; a++) {
			const t = (a / 40) * Math.PI * 2;
			px(g, fx + 11 + Math.cos(t) * 5, fy + 7 + Math.sin(t) * 5, 1, 1, c);
		}
		px(g, fx + 9, fy + 5, 1, 2, c);
		px(g, fx + 13, fy + 5, 1, 2, c);
		for (let a = 0; a < 8; a++) {
			const t = Math.PI * (0.2 + (0.6 * a) / 7);
			px(g, fx + 11 + Math.cos(t) * 3, fy + 7 + Math.sin(t) * 2.5, 1, 1, c);
		}
	}
}
