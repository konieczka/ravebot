import type { SectionKind } from '#lib/dj/arrangement.js';
import { LAYERS, type LayerName } from '#lib/dj/types.js';
import { text, textC } from './font.js';
import { Crowd } from './crowd.js';
import { SHOULDERS, choreograph, type Pose } from './moves.js';
import { HEAD, TORSO, cuff, hand, headSprite, neck, torsoSprite, tube } from './robot.js';

/**
 * The club: a 480×270 pixel-art canvas (×4 = 1080p) drawn layer by layer every frame. Static
 * layers (walls, booth, sprites) are pre-rendered once; everything that moves reads the music's
 * schedule (beat phase, per-layer gains, arrangement section), never an audio analyser, so the
 * lights land exactly on the beat.
 */
export const W = 480;
export const H = 270;

export interface SceneInput {
	/** The set is playing. */
	live: boolean;
	/** Strudel clock in cycles (1 cycle = 1 bar). */
	cycle: number;
	/** Audible gain of each layer across both decks, 0..1. */
	levels: Record<LayerName, number>;
	/** Where the live track is in its arc, null when nothing plays. */
	section: SectionKind | null;
	/** Progress through the section, 0..1. */
	x: number;
	/** The beat of silence before the drop. */
	gap: boolean;
	/** Track intensity, 0..1. */
	intensity: number;
	energy: number;
	weirdness: number;
	accent: string;
	/** A track is being written. */
	thinking: boolean;
	/** Something broke: tear the picture. */
	glitch: boolean;
	/** Crossfader position: 0 = deck A, 1 = deck B. */
	crossfade: number;
	loaded: [boolean, boolean];
	liveDeck: 0 | 1;
	mixing: boolean;
	reducedMotion: boolean;
}

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
type Envelopes = Record<LayerName, number>;

const PINK = '#ff3dc8';
const BLUE = '#56a8ff';
const CYAN = '#56c8ff';
const TIERS = [54, 98, 142];

// ── pixel helpers ───────────────────────────────────────────────────────────

function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const hash = (a: number, b: number) => {
	const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
	return s - Math.floor(s);
};
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function px(g: Ctx, x: number, y: number, w: number, h: number, c?: string) {
	if (c) g.fillStyle = c;
	g.fillRect(Math.round(x), Math.round(y), w, h);
}
function disc(g: Ctx, cx: number, cy: number, r: number, c: string) {
	g.fillStyle = c;
	cx = Math.round(cx);
	cy = Math.round(cy);
	for (let dy = -r; dy <= r; dy++) {
		const w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.5));
		g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
	}
}
function ell(g: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) {
	g.fillStyle = c;
	for (let dy = -ry; dy <= ry; dy++) {
		const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
		g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
	}
}
function line(g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, c: string) {
	g.fillStyle = c;
	const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		g.fillRect(Math.round(lerp(x0, x1, t) - w / 2), Math.round(lerp(y0, y1, t) - w / 2), w, w);
	}
}
function rgba(hex: string, a: number) {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function smiley(g: Ctx, cx: number, cy: number, r: number, c: string) {
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
function canvas(w = W, h = H): [HTMLCanvasElement, Ctx] {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return [c, c.getContext('2d')!];
}
function concrete(
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

// ── static layers ───────────────────────────────────────────────────────────

function buildBackground() {
	const [c, g] = canvas();
	const R = rng(11);
	let gr = g.createLinearGradient(0, 0, 0, H);
	gr.addColorStop(0, '#05030a');
	gr.addColorStop(0.45, '#140b2a');
	gr.addColorStop(0.7, '#1b0f32');
	gr.addColorStop(1, '#07040d');
	g.fillStyle = gr;
	g.fillRect(0, 0, W, H);

	// Back window wall with the skyline behind it.
	px(g, 150, 18, 180, 140, '#0c0720');
	gr = g.createLinearGradient(0, 22, 0, 156);
	gr.addColorStop(0, '#120a2c');
	gr.addColorStop(1, '#3a1a5c');
	g.fillStyle = gr;
	g.fillRect(152, 22, 176, 134);
	for (let x = 152; x < 328;) {
		const w = (6 + R() * 12) | 0;
		const h = (12 + R() * 34) | 0;
		px(g, x, 156 - h, w, h, '#120a26');
		for (let k = 0; k < (w * h) / 18; k++)
			if (R() < 0.6)
				px(
					g,
					x + 1 + R() * (w - 2),
					158 - h + R() * (h - 4),
					1,
					1,
					R() < 0.7 ? '#e8b75a' : '#ff6fd8'
				);
		x += w + ((R() * 3) | 0);
	}
	// Fernsehturm.
	px(g, 299, 44, 3, 112, '#0a0618');
	disc(g, 300, 54, 6, '#0a0618');
	px(g, 296, 61, 9, 2, '#0a0618');
	px(g, 300, 22, 1, 26, '#0a0618');
	for (let x = 152; x < 330; x += 22) px(g, x, 22, 2, 134, '#08051a');
	for (let y = 22; y < 156; y += 27) px(g, 152, y, 176, 2, '#08051a');

	// Side walls with three balcony tiers each.
	concrete(g, R, 0, 0, 128, 200, '#100b1c', '#0a0714', '#1a1428');
	concrete(g, R, 352, 0, 128, 200, '#100b1c', '#0a0714', '#1a1428');
	for (const ty of TIERS)
		for (const [x0, x1] of [
			[0, 128],
			[352, 480]
		]) {
			px(g, x0, ty - 40, x1 - x0, 38, '#0a0614');
			for (let x = x0 + 10; x < x1; x += 30) px(g, x, ty - 40, 5, 38, '#17112a');
			px(g, x0, ty, x1 - x0, 4, '#2b2342');
			px(g, x0, ty, x1 - x0, 1, '#463a66');
			px(g, x0, ty + 4, x1 - x0, 2, '#06040b');
		}

	// Small wall banners.
	px(g, 16, 104, 34, 26, '#09070d');
	px(g, 16, 104, 34, 1, '#2a2535');
	['A', 'KINDER', 'WORLD'].forEach((s, i) => textC(g, s, 33, 107 + i * 7, '#cfc8e6'));
	px(g, 436, 104, 36, 26, '#09070d');
	px(g, 436, 104, 36, 1, '#2a2535');
	['BASS', 'UNITY', 'FREEDOM'].forEach((s, i) => textC(g, s, 454, 107 + i * 7, '#cfc8e6'));

	// Concrete pillars with tags.
	for (const x of [128, 330]) {
		concrete(g, R, x, 0, 22, 196, '#25202f');
		px(g, x, 0, 2, 196, '#14111b');
		px(g, x + 20, 0, 2, 196, '#14111b');
		for (let k = 0; k < 6; k++)
			px(g, x + 3 + R() * 14, 100 + R() * 80, 2 + R() * 4, 1, R() < 0.5 ? PINK : CYAN);
	}

	// Lighting truss.
	px(g, 118, 9, 244, 1, '#5a5274');
	px(g, 118, 17, 244, 1, '#4a4360');
	px(g, 118, 18, 244, 1, '#211c2e');
	for (let x = 118; x < 362; x += 8) {
		line(g, x, 10, x + 4, 16, 1, '#3c3550');
		line(g, x + 4, 16, x + 8, 10, 1, '#3c3550');
	}

	// Line arrays and subs (the cones are animated).
	for (const x of [154, 312]) {
		px(g, x + 6, 18, 2, 4, '#2a2535');
		for (let i = 0; i < 6; i++) {
			px(g, x, 22 + i * 12, 14, 11, '#121018');
			px(g, x, 22 + i * 12, 14, 1, '#2e2a3a');
		}
	}
	for (const x of [130, 330])
		for (let i = 0; i < 3; i++) {
			px(g, x, 152 + i * 13, 20, 12, '#110f17');
			px(g, x, 152 + i * 13, 20, 1, '#2e2a3a');
		}

	gr = g.createLinearGradient(0, 186, 0, H);
	gr.addColorStop(0, '#1a0f2c');
	gr.addColorStop(1, '#05030a');
	g.fillStyle = gr;
	g.fillRect(0, 186, W, H - 186);
	return c;
}

function buildBanner(lines: string[], emblem: 'smile' | 'crown') {
	const [c, g] = canvas(28, 76);
	px(g, 0, 0, 28, 72, '#0a0810');
	px(g, 0, 0, 28, 1, '#3a3448');
	px(g, 0, 0, 1, 72, '#1a1622');
	px(g, 27, 0, 1, 72, '#1a1622');
	lines.forEach((s, i) => textC(g, s, 14, 5 + i * 8, '#dcd6ee'));
	if (emblem === 'smile') smiley(g, 14, 54, 7, '#dcd6ee');
	else {
		const y = 48;
		const col = '#c070ff';
		const pts: Pt[] = [
			[7, y + 10],
			[7, y],
			[11, y + 5],
			[14, y - 1],
			[17, y + 5],
			[21, y],
			[21, y + 10]
		];
		for (let i = 1; i < pts.length; i++) line(g, ...pts[i - 1], ...pts[i], 1, col);
		px(g, 7, y + 10, 15, 1, col);
		for (const x of [9, 14, 19]) px(g, x, y + 11, 1, 2 + (x % 3), col);
	}
	for (let x = 0; x < 28; x += 4) px(g, x, 72, 2, 3, '#0a0810');
	return c;
}

/** Deck A and B: left edge of each CDJ, and where their jog wheels sit. */
const CDJ_X = [168, 268] as const;
const JOG_Y = 132;
/** Mixer channel columns. */
const CHANNELS = [222, 229, 252, 259];

function buildBooth() {
	const [c, g] = canvas();
	const R = rng(5);

	// Table top.
	px(g, 154, 136, 172, 6, '#2a2438');
	px(g, 154, 136, 172, 1, '#4a4260');
	px(g, 154, 141, 172, 1, '#0d0a14');

	// CDJs: screen, cue pads, play/cue, jog wheel, pitch fader.
	for (const x of CDJ_X) {
		px(g, x, 126, 44, 11, '#1c1a28');
		px(g, x + 1, 126, 42, 1, '#3a3550');
		px(g, x, 136, 44, 1, '#0e0c16');
		px(g, x + 2, 127, 11, 4, '#06050a');
		px(g, x + 3, 128, 9, 2, '#0a1a24');
		for (let k = 0; k < 4; k++) px(g, x + 3 + k * 2, 132, 1, 1, '#2a2438');
		px(g, x + 3, 134, 2, 2, '#1d3a24');
		px(g, x + 6, 134, 2, 2, '#3a2a10');
		ell(g, x + 22, JOG_Y, 10, 4, '#06050a');
		ell(g, x + 22, JOG_Y, 9, 3, '#4a4462');
		ell(g, x + 22, JOG_Y, 7, 2, '#0b0a12');
		ell(g, x + 22, JOG_Y, 2, 1, '#2a2438');
		px(g, x + 38, 128, 1, 8, '#06050a');
		px(g, x + 40, 128, 2, 1, '#3a3552');
		px(g, x + 40, 130, 2, 1, '#3a3552');
	}

	// Mixer: four channels of knobs and faders, a screen and the crossfader.
	px(g, 218, 124, 44, 13, '#191625');
	px(g, 219, 124, 42, 1, '#3a3550');
	px(g, 218, 136, 44, 1, '#0e0c16');
	for (const x of CHANNELS) {
		px(g, x, 125, 2, 1, '#d8d2ee');
		px(g, x, 127, 2, 1, '#8a84b8');
		px(g, x, 129, 2, 1, '#8a84b8');
		px(g, x, 131, 2, 1, '#8a84b8');
		px(g, x, 125, 1, 1, '#ffffff');
		px(g, x + 1, 133, 1, 3, '#06050a');
	}
	px(g, 236, 125, 9, 3, '#06050a');
	px(g, 237, 126, 7, 1, '#0a1a24');
	px(g, 232, 135, 17, 1, '#06050a');

	// Laptop on the right, lid towards the robot: we see its back and its stickers.
	px(g, 314, 124, 12, 12, '#2a2638');
	px(g, 314, 124, 12, 1, '#5a5274');
	px(g, 314, 124, 1, 12, '#3a3550');
	px(g, 313, 135, 14, 1, '#0e0c16');
	px(g, 316, 126, 3, 2, '#c6ff3d');
	px(g, 322, 132, 3, 2, '#4dd2ff');
	px(g, 316, 132, 2, 2, '#ffffff');
	px(g, 323, 126, 1, 2, '#ff3b5c');

	// A bottle of Club-Mate on the left.
	px(g, 158, 123, 1, 1, '#c8c0ee');
	px(g, 158, 124, 1, 3, '#5a4418');
	px(g, 157, 127, 3, 9, '#5a4418');
	px(g, 157, 130, 3, 3, '#f0b030');
	px(g, 158, 131, 1, 1, '#2a2438');
	px(g, 157, 127, 1, 3, '#8a6a28');

	// Patch cables between the decks and the mixer.
	for (const [x0, x1] of [
		[212, 218],
		[262, 268]
	])
		for (let x = x0; x <= x1; x++)
			px(g, x, 137 + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI)), 1, 1, '#07060c');

	// The concrete front.
	concrete(g, R, 156, 142, 168, 44, '#1d1826', '#15121c', '#2a2433');
	px(g, 156, 142, 168, 1, '#3a3348');
	px(g, 156, 184, 168, 2, '#0b0910');
	for (const x of [198, 284]) px(g, x, 143, 1, 41, '#110e18');

	// Torn wheatpaste posters under everything else.
	const paper = (x: number, y: number, w: number, h: number, ink: string) => {
		for (let yy = y; yy < y + h; yy++)
			for (let xx = x; xx < x + w; xx++) {
				const edge = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1;
				if (edge && R() < 0.45) continue;
				if (yy > y + h * 0.6 && R() < (yy - y) / h - 0.55) continue;
				px(g, xx, yy, 1, 1, R() < 0.08 ? '#bdb6cf' : '#d6d0e2');
			}
		for (let k = 0; k < 3; k++) px(g, x + 2, y + 2 + k * 3, w - 4 - k * 3, 1, ink);
	};
	paper(286, 168, 14, 16, '#3a2f52');
	paper(244, 170, 12, 13, '#b3263f');

	// Berlin sticker.
	const ink = '#14111c';
	px(g, 162, 147, 26, 30, '#e8e4f0');
	px(g, 174, 151, 2, 16, ink);
	disc(g, 175, 156, 2, ink);
	px(g, 175, 148, 1, 4, ink);
	for (const [x, h] of [
		[164, 4],
		[168, 7],
		[178, 6],
		[182, 3]
	])
		px(g, x, 167 - h, 4, h, ink);
	px(g, 163, 167, 24, 1, ink);
	text(g, 'BERLIN', 164, 170, ink);

	// NO PHOTO sticker: a crossed-out camera.
	disc(g, 191, 178, 4, '#e8e4f0');
	for (let a = 0; a < 40; a++) {
		const t = (a / 40) * Math.PI * 2;
		px(g, 191 + Math.cos(t) * 4, 178 + Math.sin(t) * 4, 1, 1, '#d8263f');
	}
	px(g, 189, 177, 5, 3, ink);
	px(g, 190, 176, 2, 1, ink);
	px(g, 191, 178, 1, 1, '#e8e4f0');
	line(g, 188, 175, 194, 181, 1, '#d8263f');

	// Graffiti.
	const chalk = '#e2dcf2';
	smiley(g, 211, 163, 7, chalk);
	for (let k = 0; k < 3; k++) px(g, 207 + k * 4, 170, 1, 3 + k * 2, chalk);
	text(g, 'RAVEBOT', 226, 155, '#5a1446', 2);
	text(g, 'RAVEBOT', 225, 154, PINK, 2);
	for (let k = 0; k < 12; k++) px(g, 226 + R() * 52, 164, 1, 2 + R() * 9, PINK);
	['MACHINES', 'DANCE', 'TOO'].forEach((s, i) => text(g, s, 288, 148 + i * 7, chalk));
	smiley(g, 312, 176, 4, chalk);
	// A tag, a few stickers and a gaffer tape cross.
	for (let k = 0; k < 9; k++) px(g, 202 + k, 147 + Math.round(Math.sin(k) * 1.5), 1, 1, CYAN);
	for (const [x, y, col] of [
		[267, 146, '#c6ff3d'],
		[277, 172, '#ffb03b'],
		[318, 160, '#4dd2ff'],
		[203, 176, '#ff3b5c']
	] as const) {
		px(g, x, y, 4, 4, col);
		px(g, x + 1, y + 1, 2, 1, '#14111c');
	}
	line(g, 270, 176, 276, 182, 2, '#4a4458');
	line(g, 276, 176, 270, 182, 2, '#5a5468');

	// Cables hanging over the edge.
	for (const [x, d] of [
		[206, 6],
		[262, -5],
		[216, 3]
	]) {
		let cx = x;
		let cy = 137;
		for (let k = 0; k < 14; k++) {
			px(g, cx, cy, 1, 1, '#07060c');
			cy++;
			cx += Math.sin(k * 0.7) * 0.6 + d * 0.04;
		}
	}
	return c;
}

function buildFog() {
	const [c, g] = canvas(W * 2, 90);
	const R = rng(3);
	for (let i = 0; i < 70; i++) {
		const x = R() * W * 2;
		const y = 25 + R() * 50;
		const r = 14 + R() * 30;
		const gr = g.createRadialGradient(x, y, 0, x, y, r);
		gr.addColorStop(0, 'rgba(200,150,255,.55)');
		gr.addColorStop(1, 'rgba(200,150,255,0)');
		g.fillStyle = gr;
		g.fillRect(x - r, y - r, r * 2, r * 2);
	}
	// Make it tile: the second half repeats the first.
	g.drawImage(c, 0, 0, W, 90, W, 0, W, 90);
	return c;
}

interface Emitter {
	x: number;
	y: number;
	a: number;
	s: number;
	c: number;
}
const EMITTERS: Emitter[] = [
	{ x: 0, y: 150, a: -0.1 * Math.PI, s: 0.07, c: 0 },
	{ x: 480, y: 150, a: -0.9 * Math.PI, s: 0.07, c: 1 },
	{ x: 122, y: 16, a: 0.28 * Math.PI, s: 0.14, c: 2 },
	{ x: 358, y: 16, a: 0.72 * Math.PI, s: 0.14, c: 0 },
	{ x: 164, y: 138, a: -0.72 * Math.PI, s: 0.12, c: 1 },
	{ x: 316, y: 138, a: -0.28 * Math.PI, s: 0.12, c: 2 },
	{ x: 240, y: 12, a: 0.5 * Math.PI, s: 0.38, c: 2 }
];

interface Confetto {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	c: string;
}

/** One frame's derived values, shared by the draw passes. */
interface Frame {
	i: SceneInput;
	kind: SectionKind;
	E: Envelopes;
	hype: number;
	beat: number;
	ph: number;
	brk: number;
}

export class ClubScene {
	private g: Ctx;
	private bg = buildBackground();
	private booth = buildBooth();
	private fog = buildFog();
	private banL = buildBanner(['TECHNO', 'PEOPLE', 'BETTER', 'HUMANS'], 'smile');
	private banR = buildBanner(['BERLIN', 'NEVER', 'SLEEPS'], 'crown');
	private crowd = new Crowd(W, H);
	private balconies: { x: number; hand: number; ph: number }[][][];
	private sparks: { lon: number; y: number; c: number }[];
	private confetti: Confetto[] = [];
	/** Smoothed layer levels. */
	private sm: Envelopes = { kick: 0, hats: 0, perc: 0, bass: 0, synth: 0, vox: 0 };
	private t = 0;
	private last = 0;
	private flash = 0;
	private tear = 0;
	private prevSection: SectionKind | null = null;

	constructor(private cv: HTMLCanvasElement) {
		cv.width = W;
		cv.height = H;
		this.g = cv.getContext('2d')!;
		const R = rng(42);
		this.balconies = TIERS.map(() =>
			[
				[2, 126],
				[354, 478]
			].map(([a, b]) =>
				Array.from({ length: 17 }, (_, i) => ({
					x: a + ((i + R() * 0.6) * (b - a)) / 17,
					hand: R(),
					ph: R() * 0.2
				}))
			)
		);
		this.sparks = Array.from({ length: 46 }, () => ({
			lon: R() * Math.PI * 2,
			y: 20 + R() * 150,
			c: R()
		}));
	}

	render(i: SceneInput, now: number) {
		const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
		this.last = now;
		this.t += dt;

		const kind = i.section ?? 'groove';
		if (i.live && i.section && i.section !== this.prevSection) {
			if (i.section === 'peak' && this.prevSection === 'build') this.drop(i);
			this.prevSection = i.section;
		}
		if (i.glitch && this.tear <= 0) this.tear = 8;

		for (const l of LAYERS) {
			const v = i.live ? i.levels[l] : 0;
			this.sm[l] += (v - this.sm[l]) * Math.min(1, dt * 8);
		}
		const sm = this.sm;
		const beat = i.cycle * 4;
		const ph = beat - Math.floor(beat);
		const E: Envelopes = {
			kick: sm.kick * Math.exp(-ph * 7),
			hats: sm.hats * Math.exp(-((ph + 0.5) % 1) * 11),
			perc:
				sm.perc *
				Math.exp(-((beat * 4) % 1) * 9) *
				(hash(Math.floor(beat * 4), 3) > 0.35 ? 1 : 0.25),
			bass: sm.bass * (0.45 + 0.55 * Math.exp(-((ph + 0.5) % 1) * 4)),
			synth: sm.synth * (0.75 + 0.25 * Math.sin((i.cycle * Math.PI) / 2)),
			vox: sm.vox * (i.cycle % 8 < 4 ? 1 : 0.55)
		};
		const hype = i.live ? i.intensity * (0.45 + (i.energy / 10) * 0.55) : 0.1;
		const f: Frame = { i, kind, E, hype, beat, ph, brk: kind === 'breakdown' ? 1 : 0 };

		const g = this.g;
		g.globalCompositeOperation = 'source-over';
		g.globalAlpha = 1;
		g.drawImage(this.bg, 0, 0);
		this.room(f);
		this.balconyCrowd(f);
		this.signs(f);
		this.tubes(f);
		this.strobes(f);
		this.discoBall(f);
		this.additive(() => {
			g.globalAlpha = i.live ? 0.08 + 0.1 * E.kick + 0.12 * f.brk + 0.05 * E.bass : 0.05;
			g.drawImage(this.fog, -((this.t * 5) % W), 100);
		});
		this.choreograph(f, dt);
		this.robot(f, 'body');
		g.drawImage(this.booth, 0, 0);
		this.boothLive(f);
		this.robot(f, 'arms');
		this.lasers(f);
		this.additive(() => {
			g.globalAlpha = i.live ? 0.05 + 0.06 * E.bass + 0.08 * f.brk : 0.03;
			g.drawImage(this.fog, -(W - ((this.t * 8) % W)), 160);
		});
		this.dancefloor(f);
		this.effects(f);
	}

	private drop(i: SceneInput) {
		if (i.reducedMotion) return;
		this.flash = 0.9;
		const cols = [PINK, CYAN, i.accent, '#ffffff', '#ffb03b'];
		for (let k = 0; k < 140; k++)
			this.confetti.push({
				x: 120 + Math.random() * 240,
				y: -Math.random() * 40,
				vx: (Math.random() - 0.5) * 1.6,
				vy: Math.random() * 0.6,
				life: 300,
				c: cols[k % cols.length]
			});
	}

	private additive(fn: () => void) {
		this.g.globalCompositeOperation = 'lighter';
		fn();
		this.g.globalAlpha = 1;
		this.g.globalCompositeOperation = 'source-over';
	}

	/** Window wash, TV tower light, truss fixtures and their beams. */
	private room({ i, E, brk }: Frame) {
		const g = this.g;
		this.additive(() => {
			g.fillStyle = rgba(brk ? '#4d8bff' : i.accent, 0.05 + 0.12 * E.synth + 0.1 * brk);
			g.fillRect(152, 22, 176, 134);
		});
		if (i.cycle % 1 < 0.5 || !i.live) {
			px(g, 300, 21, 1, 1, '#ff2a2a');
			g.globalAlpha = 0.4;
			px(g, 299, 20, 3, 3, '#ff2a2a');
			g.globalAlpha = 1;
		}
		this.additive(() => {
			for (let k = 0; k < 8; k++) {
				const x = 140 + k * 28;
				const a = Math.PI / 2 + Math.sin(this.t * 0.6 + k) * 0.35;
				const col = k % 2 ? PINK : brk ? '#4d8bff' : i.accent;
				g.fillStyle = rgba(col, (0.03 + 0.06 * E.synth + 0.05 * brk) * (i.live ? 1 : 0.2));
				g.beginPath();
				g.moveTo(x, 20);
				g.lineTo(x + Math.cos(a - 0.12) * 200, 20 + Math.sin(a - 0.12) * 200);
				g.lineTo(x + Math.cos(a + 0.12) * 200, 20 + Math.sin(a + 0.12) * 200);
				g.closePath();
				g.fill();
			}
		});
		for (let k = 0; k < 8; k++) {
			const x = 140 + k * 28;
			px(g, x - 2, 18, 5, 4, '#1a1626');
			px(g, x - 1, 21, 3, 1, rgba(k % 2 ? PINK : i.accent, 0.3 + 0.7 * E.kick));
		}
	}

	private balconyCrowd({ i, E, hype, ph }: Frame) {
		const g = this.g;
		TIERS.forEach((ty, ti) =>
			this.balconies[ti].forEach((side, si) => {
				for (const p of side) {
					const b = Math.round(
						this.sm.kick * Math.exp(-((ph + p.ph) % 1) * 7) * (hype > 0.3 ? 1.5 : 0.8)
					);
					const y = ty - 8 - b;
					px(g, p.x, y + 2, 2, 5 + b, '#07040e');
					px(g, p.x, y, 2, 2, '#07040e');
					px(g, p.x + (si ? 0 : 1), y, 1, 1, si ? '#3a6ad0' : '#a02a84');
					if (p.hand < hype * 0.7) px(g, p.x + (si ? -1 : 2), y - 3, 1, 4, '#07040e');
				}
				const [x0, x1] = si ? [352, 480] : [0, 128];
				px(g, x0, ty - 5, x1 - x0, 1, '#3a3152');
				for (let x = x0 + 2; x < x1; x += 5) px(g, x, ty - 5, 1, 5, '#2a2340');
				const col = si ? BLUE : PINK;
				const al = i.live ? 0.25 + 0.75 * E.hats : 0.12;
				px(g, x0, ty + 4, x1 - x0, 1, rgba(col, al));
				g.globalAlpha = al * 0.35;
				px(g, x0, ty + 5, x1 - x0, 3, col);
				g.globalAlpha = 1;
			})
		);
	}

	/** Neon slogans (vox), hanging banners, speaker cones (kick). */
	private signs({ i, E }: Frame) {
		const g = this.g;
		const flicker = hash(Math.floor(this.t * 12), 9) > 0.93 ? 0.3 : 1;
		const lit = i.live ? 0.25 + 0.75 * E.vox : 0.12;
		this.neon(['BERLIN', 'BRENNT', 'BESSER'], 82, 62, PINK, lit * flicker, 1);
		this.neon(['ALTE', 'MAUERN', 'NEUE', 'FREIHEIT'], 400, 58, CYAN, lit, 1);

		const sway = Math.round(Math.sin(this.t * 0.8) * 0.7);
		g.drawImage(this.banL, 126 + sway, 22);
		g.drawImage(this.banR, 326 - sway, 22);

		const pump = Math.round(E.kick * 1.6);
		for (const x of [154, 312])
			for (let k = 0; k < 6; k++) {
				disc(g, x + 7, 27 + k * 12, 2 + (k % 2 ? 0 : pump), '#22202c');
				px(g, x + 7, 27 + k * 12, 1, 1, '#06050a');
			}
		for (const x of [130, 330])
			for (let k = 0; k < 3; k++) {
				disc(g, x + 10, 158 + k * 13, 4 + pump, '#1d1b26');
				disc(g, x + 10, 158 + k * 13, 1 + pump, '#08070c');
			}
		this.neon(['RAVEBOT'], 240, 62, PINK, i.live ? (0.4 + 0.6 * E.vox) * flicker : 0.2, 2);
	}

	private neon(lines: string[], cx: number, y: number, col: string, a: number, k: number) {
		const g = this.g;
		const lh = 7 * k;
		this.additive(() => {
			g.globalAlpha = a * 0.35;
			for (const [dx, dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			])
				lines.forEach((s, n) => textC(g, s, cx + dx, y + n * lh + dy, col, k));
		});
		g.globalAlpha = a;
		lines.forEach((s, n) => textC(g, s, cx, y + n * lh, a > 0.5 ? '#ffe0f6' : col, k));
		g.globalAlpha = 1;
	}

	private discoBall({ i, E, kind, brk }: Frame) {
		const g = this.g;
		const rot = this.t * (0.4 + 0.5 * brk);
		const [cx, cy, r] = [240, 37, 13];
		px(g, 240, 18, 1, 6, '#3a3550');
		for (let y = -r; y <= r; y++)
			for (let x = -r; x <= r; x++) {
				const d = (x * x + y * y) / (r * r);
				if (d > 1) continue;
				const nz = Math.sqrt(1 - d);
				const lon = Math.atan2(x / r, nz) + rot;
				const lat = Math.asin(y / r);
				const fi = Math.floor(lon / 0.32);
				const fj = Math.floor(lat / 0.3);
				const seam = lon / 0.32 - fi < 0.2 || lat / 0.3 - fj < 0.2;
				const h = hash(fi, fj);
				let v = 0.25 + 0.55 * nz * (0.5 + 0.5 * h);
				let c = h < 0.33 ? '#ff7ad9' : h < 0.66 ? '#8aa8ff' : '#e8e4ff';
				if (hash(fi + Math.floor(this.t * 6), fj) > 0.96) {
					c = '#ffffff';
					v = 1;
				}
				if (seam) v *= 0.35;
				g.globalAlpha = Math.min(1, v + 0.1);
				px(g, cx + x, cy + y, 1, 1, c);
			}
		g.globalAlpha = 1;
		const glow = 0.25 + 0.75 * Math.max(brk, E.synth * 0.4, kind === 'build' ? 0.6 : 0);
		this.additive(() => {
			for (const s of this.sparks) {
				const a = s.lon + rot * 1.3;
				const z = Math.cos(a);
				if (z < 0.2) continue;
				g.fillStyle = rgba(
					s.c < 0.4 ? '#ffffff' : s.c < 0.7 ? '#ff8ae0' : '#8ab8ff',
					glow * z * (i.live ? 1 : 0.3)
				);
				g.fillRect(Math.round(240 + Math.sin(a) * 236), Math.round(s.y), 1, 1);
			}
		});
	}

	/** RaveBot's current move, and his arms easing towards it. */
	private pose: Pose | null = null;
	private arms: { hand: Pt; elbow: Pt }[] = SHOULDERS.map(() => ({ hand: [0, 0], elbow: [0, 0] }));

	private choreograph({ i }: Frame, dt: number) {
		const pose = choreograph({
			live: i.live,
			section: i.section,
			x: i.x,
			cycle: i.cycle,
			kick: this.sm.kick,
			energy: i.energy,
			intensity: i.intensity,
			mixing: i.mixing,
			crossfade: i.crossfade
		});
		// Fast enough to hit every beat, slow enough that a change of move reads as motion.
		const k = this.pose ? 1 - Math.exp(-dt * 16) : 1;
		[pose.left, pose.right].forEach((target, n) => {
			const a = this.arms[n];
			for (const key of ['hand', 'elbow'] as const)
				for (const c of [0, 1]) a[key][c] += (target[key][c] - a[key][c]) * k;
		});
		this.pose = pose;
	}

	private robot(f: Frame, part: 'body' | 'arms') {
		const g = this.g;
		const { i, E, ph } = f;
		const pose = this.pose!;
		const cx = 240 + pose.sway;
		const top = 78 + pose.nod;
		const tb = pose.bob;

		if (part === 'body') {
			g.drawImage(torsoSprite(), cx - TORSO.cx, 104 + tb);
			neck(g, cx + pose.tilt, 101 + Math.min(pose.nod, 2));
			const hx = cx + pose.tilt - HEAD.cx;
			g.drawImage(headSprite(), hx, top);
			const v = HEAD.visor;
			this.visor(hx + v.x, top + v.y, f);
			// Glass reflection across the visor.
			g.fillStyle = 'rgba(255,255,255,.22)';
			for (let k = 0; k < 4; k++) g.fillRect(hx + v.x + 2 + k, top + v.y + 3 - k, 1, 1);
			for (const [lx, ly] of HEAD.leds)
				px(g, hx + lx, top + ly, 1, 2, rgba(PINK, 0.35 + 0.65 * E.kick));
			const [ax, ay] = HEAD.antenna;
			px(g, hx + ax, top + ay, 1, 1, ph < 0.2 && i.live ? i.accent : '#3a3550');
			if (i.thinking)
				for (let k = 0; k < 3; k++)
					if (Math.floor(this.t * 3) % 4 > k)
						px(g, hx + HEAD.cx + 17 + k * 3, top - 2 - k * 2, 2, 2, '#ece8ff');
			return;
		}

		// Arms are drawn over the booth so the hands rest on the decks.
		const led = i.live ? rgba(i.accent, 0.5 + 0.5 * E.hats) : '#3a3550';
		const bands = [i.accent, PINK];
		[pose.left, pose.right].forEach((target, n) => {
			const side = n ? 1 : -1;
			const [sx, sy] = SHOULDERS[n];
			const { hand: h, elbow: e } = this.arms[n];
			const raised = h[1] < sy;
			tube(g, sx + pose.sway, sy + tb, e[0], e[1], 3);
			tube(g, e[0], e[1], h[0], h[1] + (raised ? 3 : -1), 2.6);
			cuff(
				g,
				e[0] + (h[0] - e[0]) * 0.78,
				e[1] + (h[1] - e[1]) * 0.78 + (raised ? 2 : -1),
				bands[n],
				E.hats
			);
			hand(g, h[0], h[1], target.pose, led, side as -1 | 1);
		});
	}

	/** The robot's face: an EQ by default, expressions for the big moments. */
	private visor(x: number, y: number, f: Frame) {
		const g = this.g;
		const { i, E, kind, ph } = f;
		if (!i.live) {
			const p = Math.round((Math.sin(this.t * 2) * 0.5 + 0.5) * 16);
			px(g, x + p, y + 3, 3, 1, PINK);
			return;
		}
		if (i.gap) return;
		if (kind === 'breakdown') {
			for (const ex of [4, 12]) {
				px(g, x + ex, y + 3, 1, 1, PINK);
				px(g, x + ex + 1, y + 2, 1, 1, PINK);
				px(g, x + ex + 2, y + 3, 1, 1, PINK);
			}
			px(g, x + 8, y + 5, 3, 1, rgba(PINK, 0.4 + 0.6 * E.vox));
			return;
		}
		if (kind === 'peak' && i.x * 32 < 1) {
			const c = ph < 0.5 ? '#ffffff' : PINK;
			for (const ex of [5, 12]) {
				px(g, x + ex, y + 1, 2, 4, c);
				px(g, x + ex, y + 6, 2, 1, c);
			}
			return;
		}
		if (kind === 'outro' || i.mixing) {
			const o = Math.floor(this.t * 8) % 3;
			for (let k = 0; k < 3; k++) {
				px(g, x + 3 - k + o, y + 2 + k, 1, 1, CYAN);
				px(g, x + 3 - k + o, y + 4 - k, 1, 1, CYAN);
				px(g, x + 15 + k - o, y + 2 + k, 1, 1, CYAN);
				px(g, x + 15 + k - o, y + 4 - k, 1, 1, CYAN);
			}
			return;
		}
		if (kind === 'build') {
			const n = Math.round(i.x * 19);
			for (let k = 0; k < n; k++)
				px(
					g,
					x + k,
					y + 6 - Math.round((k / 19) * 6),
					1,
					1 + Math.round((k / 19) * 6),
					k % 2 ? PINK : i.accent
				);
			return;
		}
		LAYERS.forEach((l, n) => {
			const h = Math.round(Math.max(E[l], this.sm[l] * 0.25) * 7);
			for (let j = 0; j < h; j++)
				px(g, x + 1 + n * 3, y + 6 - j, 2, 1, j > 4 ? '#ffffff' : j > 2 ? PINK : i.accent);
		});
	}

	private boothLive({ i, E, beat, ph }: Frame) {
		const g = this.g;
		const spin = (beat * Math.PI) / 2;
		const meter = (v: number, k: number) => (k > 6 ? PINK : k > 4 ? '#ffb03b' : '#4dff9a');
		CDJ_X.forEach((x, d) => {
			const loaded = i.live && i.loaded[d];
			const on = loaded && (i.liveDeck === d || i.mixing);
			const jx = x + 22;
			// Jog: LED ring chasing round, a marker turning once a bar.
			for (let k = 0; k < 16; k++) {
				const a = (k / 16) * Math.PI * 2;
				const lit = on && (k + Math.floor(beat * 4)) % 16 < 3;
				px(g, jx + Math.cos(a) * 9, JOG_Y + Math.sin(a) * 3, 1, 1, lit ? i.accent : '#2e2a42');
			}
			// Deck B's platter follows the robot's hand when he scratches.
			const a = loaded ? spin * (d ? 1.01 : 1) + (d ? (this.pose?.scratch ?? 0) : 0) : 0;
			px(g, jx + Math.cos(a) * 6, JOG_Y + Math.sin(a) * 2, 1, 1, '#ece8ff');
			// Waveform scrolling across the screen.
			for (let k = 0; k < 9; k++) {
				const h = loaded
					? Math.round(hash(Math.floor(beat * 2) + k, d) * 2 * (0.4 + E.kick * 0.6))
					: 0;
				px(g, x + 3 + k, 129 - h, 1, h + 1, k === 4 ? '#ffffff' : on ? i.accent : '#2a5a78');
			}
			// Cue pads flash with the percussion, play blinks on the beat.
			for (let k = 0; k < 4; k++)
				if (on && E.perc > 0.35 && hash(Math.floor(beat * 4), k + d * 4) > 0.55)
					px(g, x + 3 + k * 2, 132, 1, 1, [PINK, CYAN, '#4dff9a', '#ffb03b'][k]);
			px(g, x + 3, 134, 2, 2, loaded && ph < 0.5 ? '#4dff9a' : '#1d3a24');
			px(g, x + 6, 134, 2, 2, on ? '#ffb03b' : '#3a2a10');
			px(g, x + 37, 131 + (d ? 1 : 0), 3, 1, '#c8c0ee');
		});

		// Mixer: channel meters and faders, master meters, crossfader.
		const ch = [E.kick * 0.7 + E.bass * 0.3, E.hats * 0.6 + E.perc * 0.4, E.synth, E.vox];
		CHANNELS.forEach((x, n) => {
			const v = i.live ? ch[n] : 0;
			for (let k = 0; k < 6; k++)
				px(g, x + 3, 132 - k, 1, 1, k / 6 < v ? meter(v, k + 2) : '#1a1626');
			px(g, x, 133 + (v > 0.05 ? 0 : 2), 2, 1, '#ece8ff');
		});
		const lvl = [E.kick * 0.6 + E.bass * 0.4, E.hats * 0.5 + E.synth * 0.5];
		lvl.forEach((v, n) => {
			for (let k = 0; k < 6; k++)
				px(g, 238 + n * 4, 134 - k, 2, 1, k / 6 < v ? meter(v, k + 2) : '#1a1626');
		});
		if (i.live) px(g, 237 + (Math.floor(beat) % 4) * 2, 126, 1, 1, i.accent);
		px(g, 232 + Math.round(i.crossfade * 14), 134, 3, 2, '#ece8ff');

		// Laptop logo breathes; brighter while it is writing the next track.
		const glow = i.thinking ? 0.6 + 0.4 * Math.sin(this.t * 6) : 0.35 + 0.3 * E.vox;
		g.globalAlpha = i.live ? glow : 0.2;
		smiley(g, 320, 129, 2, PINK);
		g.globalAlpha = 1;

		// LED strip along the table edge, chasing on the beat.
		const step = Math.floor(beat * 2);
		for (let x = 156; x < 324; x += 3) {
			const k = ((x - 156) / 3) | 0;
			const lit = i.live && (k + step) % 8 < 2;
			px(g, x, 141, 2, 1, lit ? rgba(i.accent, 0.5 + 0.5 * E.kick) : '#1a1626');
		}

		const al = i.live ? 0.3 + 0.7 * E.bass : 0.1;
		px(g, 156, 186, 168, 1, rgba(PINK, al));
		this.additive(() => {
			const gr = g.createLinearGradient(0, 186, 0, 200);
			gr.addColorStop(0, rgba(PINK, al * 0.45));
			gr.addColorStop(1, rgba(PINK, 0));
			g.fillStyle = gr;
			g.fillRect(140, 186, 200, 14);
		});
	}

	/** LED tubes on the pillar fronts: a pulse runs up them on every kick. */
	private tubes({ i, E, beat, brk }: Frame) {
		const g = this.g;
		for (const [x, n] of [
			[133, 0],
			[145, 1],
			[335, 2],
			[347, 3]
		]) {
			px(g, x, 100, 2, 50, '#0e0c16');
			px(g, x, 99, 2, 1, '#3a3550');
			px(g, x, 150, 2, 1, '#3a3550');
			if (!i.live) continue;
			const col = n % 2 ? PINK : i.accent;
			for (let y = 0; y < 48; y++) {
				const p = 1 - y / 48;
				const v = brk
					? 0.25 + 0.25 * Math.sin(this.t * 2 + y * 0.2 + n)
					: Math.exp(-(((beat % 1) - p + 1) % 1) * 6) * (this.sm.kick * 0.8 + 0.2) + E.synth * 0.1;
				px(g, x, 101 + y, 2, 1, rgba(col, clamp(v, 0, 1)));
			}
		}
	}

	/** Strobe units on the truss fire with the strobe effect. */
	private strobes(f: Frame) {
		const g = this.g;
		const s = this.strobe(f);
		for (const x of [188, 288]) {
			px(g, x, 19, 9, 5, '#1a1626');
			px(g, x + 1, 20, 7, 3, s > 0.05 ? '#ffffff' : '#3a3550');
			if (s > 0.05)
				this.additive(() => {
					g.fillStyle = `rgba(255,240,255,${s * 0.8})`;
					g.fillRect(x - 3, 17, 15, 9);
				});
		}
	}

	/** Strobe brightness this frame: the first bars of the drop and the end of the build. */
	private strobe({ i, kind, ph, beat }: Frame) {
		if (i.reducedMotion || !i.live || i.gap) return 0;
		if (kind === 'peak' && i.x * 32 < 4) return 0.35 * Math.exp(-ph * 14);
		if (kind === 'build' && i.x > 0.5)
			return 0.22 * Math.exp(-((beat * (i.x > 0.8 ? 4 : 2)) % 1) * 12);
		return 0;
	}

	/** Lasers belong to the synth: off without it, slow and blue in the breakdown, a full fan at the peak. */
	private lasers({ i, E, kind }: Frame) {
		if (!i.live || i.gap || E.synth < 0.05) return;
		const g = this.g;
		const cols = [PINK, '#4d8bff', i.accent];
		let list = EMITTERS.slice(0, 4);
		let fan = 1;
		let speed = 0.5;
		if (kind === 'breakdown') {
			list = EMITTERS.slice(0, 2);
			speed = 0.2;
		} else if (kind === 'build') {
			list = EMITTERS.slice(2, 6);
			speed = 0.5 + i.x * 3;
		} else if (kind === 'peak' || (kind === 'main' && i.intensity > 0.7)) {
			list = EMITTERS;
			fan = kind === 'peak' ? 3 : 2;
			speed = 0.7;
		}
		this.additive(() => {
			list.forEach((e, ei) => {
				for (let j = 0; j < fan; j++) {
					let a =
						e.a +
						Math.sin(this.t * speed * (1 + ei * 0.13) + ei * 1.7) * e.s * Math.PI +
						(j - (fan - 1) / 2) * 0.09;
					if (kind === 'build') a = lerp(a, Math.atan2(150 - e.y, 240 - e.x), i.x * 0.7);
					const c = kind === 'breakdown' ? '#4d8bff' : cols[(e.c + j) % 3];
					const al = E.synth * (kind === 'breakdown' ? 0.45 : 0.8);
					const x1 = e.x + Math.cos(a) * 700;
					const y1 = e.y + Math.sin(a) * 700;
					for (const [w, k] of [
						[3, 0.18],
						[1, 1]
					]) {
						g.strokeStyle = rgba(c, al * k);
						g.lineWidth = w;
						g.beginPath();
						g.moveTo(e.x, e.y);
						g.lineTo(x1, y1);
						g.stroke();
					}
				}
			});
		});
	}

	private dancefloor({ i, E, hype, ph, beat, kind }: Frame) {
		this.crowd.draw(this.g, {
			live: i.live,
			cycle: i.cycle,
			beat,
			ph,
			t: this.t,
			kick: this.sm.kick,
			kickEnv: E.kick,
			hats: E.hats,
			synth: E.synth,
			hype,
			accent: i.accent,
			breakdown: kind === 'breakdown',
			peak: kind === 'peak'
		});
	}

	/** Standby dimming, the blackout before the drop, strobes, confetti and glitch tears. */
	private effects(f: Frame) {
		const { i } = f;
		const g = this.g;
		if (!i.live) {
			g.fillStyle = 'rgba(4,3,9,.4)';
			g.fillRect(0, 0, W, H);
		}
		if (i.gap) {
			g.fillStyle = 'rgba(0,0,0,.72)';
			g.fillRect(0, 0, W, H);
		}
		if (i.reducedMotion || !i.live) {
			this.confetti = [];
			return;
		}
		const s = Math.max(this.strobe(f), this.flash);
		this.flash *= 0.88;
		if (s > 0.01) {
			g.fillStyle = `rgba(255,240,255,${s})`;
			g.fillRect(0, 0, W, H);
		}
		for (const c of this.confetti) {
			c.x += c.vx;
			c.y += c.vy;
			c.vy = Math.min(c.vy + 0.03, 1.2);
			c.vx *= 0.99;
			c.life--;
			if (Math.floor(this.t * 10 + c.x) % 2) px(g, c.x, c.y, 2, 1, c.c);
			else px(g, c.x, c.y, 1, 2, c.c);
		}
		this.confetti = this.confetti.filter((c) => c.life > 0 && c.y < H);

		if (this.tear > 0) {
			this.tear--;
			for (let k = 0; k < 4; k++) {
				const y = (Math.random() * H) | 0;
				const h = (2 + Math.random() * 10) | 0;
				g.drawImage(this.cv, 0, y, W, h, (Math.random() - 0.5) * 16, y, W, h);
			}
		} else if (Math.random() < i.weirdness * 0.00025) this.tear = 6;
	}
}
