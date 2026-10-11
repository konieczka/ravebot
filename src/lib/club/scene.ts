import type { SectionKind } from '#lib/dj/arrangement.js';
import { LAYERS, type LayerName } from '#lib/dj/types.js';
import { city, type City, type StageId } from './cities/index.js';
import { TIERS } from './cities/room.js';
import { LINE_ARRAYS, WIN, windowFrame } from './cities/view.js';
import {
	H,
	W,
	canvas,
	clamp,
	concrete,
	disc,
	ell,
	formwork,
	glow,
	hash,
	lerp,
	line,
	px,
	rgba,
	rng,
	smiley,
	type Ctx,
	type Pt
} from './draw.js';
import { text, textC } from './font.js';
import { Crowd } from './crowd.js';
import { Lights, type LightFrame } from './lights.js';
import { SHOULDERS, choreograph, type Pose } from './moves.js';
import { HEAD, TORSO, cuff, hand, headSprite, neck, torsoSprite, tube } from './robot.js';

/**
 * The club: a 480×270 pixel-art canvas (×4 = 1080p) drawn layer by layer every frame. Static
 * layers (walls, booth, sprites) are pre-rendered once; everything that moves reads the music's
 * schedule (beat phase, per-layer gains, arrangement section), never an audio analyser, so the
 * lights land exactly on the beat.
 */
export { W, H };

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
	/** Which city the club is in. */
	stage: StageId;
}

type Envelopes = Record<LayerName, number>;

const PINK = '#ff3dc8';
const BLUE = '#56a8ff';
const CYAN = '#56c8ff';

// ── static layers ───────────────────────────────────────────────────────────

/** CO2 cannon nozzles, between the LED tubes on the sub stacks. */
const CO2_X = [116, 364];

function buildBackground(town: City) {
	const [c, g] = canvas();
	const R = rng(11);
	px(g, 0, 0, W, H, '#07040d');
	town.paint(g);

	town.room.paint(g);

	// Small wall banners.
	px(g, 16, 104, 34, 26, '#09070d');
	px(g, 16, 104, 34, 1, '#2a2535');
	['A', 'KINDER', 'WORLD'].forEach((s, i) => textC(g, s, 33, 107 + i * 7, '#cfc8e6'));
	px(g, 436, 104, 36, 26, '#09070d');
	px(g, 436, 104, 36, 1, '#2a2535');
	['BASS', 'UNITY', 'FREEDOM'].forEach((s, i) => textC(g, s, 454, 107 + i * 7, '#cfc8e6'));

	// Concrete pillars with tags and stickers.
	for (const x of [104, 354]) {
		concrete(g, R, x, 0, 22, 196, '#25202f');
		formwork(g, R, x + 2, 0, 18, 196);
		px(g, x, 0, 2, 196, '#14111b');
		px(g, x + 20, 0, 2, 196, '#14111b');
		px(g, x + 2, 0, 1, 196, '#3a3448');
		for (let k = 0; k < 6; k++)
			px(g, x + 3 + R() * 14, 100 + R() * 80, 2 + R() * 4, 1, R() < 0.5 ? PINK : CYAN);
		for (let k = 0; k < 3; k++) {
			const y = 106 + k * 14 + R() * 6;
			px(g, x + 8 + R() * 3, y, 3, 3, ['#8a849a', '#6a8a2a', '#9a6a2a'][k]);
		}
		for (let k = 0; k < 2; k++) {
			let y = 22 + R() * 20;
			const sx = x + 4 + R() * 14;
			for (let j = 0; j < 30 + R() * 40; j++)
				px(g, sx + Math.sin(j * 0.3) * 0.5, y++, 1, 1, '#1a1622');
		}
	}

	// Lighting truss, with cable runs sagging off it.
	px(g, 94, 9, 292, 1, '#5a5274');
	px(g, 94, 17, 292, 1, '#4a4360');
	px(g, 94, 18, 292, 1, '#211c2e');
	for (let x = 94; x < 386; x += 8) {
		line(g, x, 10, x + 4, 16, 1, '#3c3550');
		line(g, x + 4, 16, x + 8, 10, 1, '#3c3550');
	}
	for (const x of [94, 385]) px(g, x, 0, 1, 18, '#3c3550');
	for (const [a, b, sag] of [
		[98, 126, 6],
		[354, 382, 5],
		[170, 214, 3]
	])
		for (let x = a; x <= b; x++)
			px(g, x, 18 + Math.round(Math.sin(((x - a) / (b - a)) * Math.PI) * sag), 1, 1, '#0c0a12');

	// Sub stacks either side of the booth.
	for (const x of [106, 354])
		for (let i = 0; i < 3; i++) {
			const y = 152 + i * 13;
			px(g, x, y, 20, 12, '#110f17');
			px(g, x, y, 20, 1, '#2e2a3a');
			px(g, x, y + 11, 20, 1, '#07060b');
			for (const [cx, cy] of [
				[x, y],
				[x + 19, y],
				[x, y + 11],
				[x + 19, y + 11]
			])
				px(g, cx, cy, 1, 1, '#4a4460');
			px(g, x + 17, y + 3, 1, 5, '#22202c');
		}
	// CO2 cannons on top of the stacks.
	for (const x of CO2_X) {
		px(g, x - 2, 149, 5, 3, '#2a2638');
		px(g, x - 2, 149, 5, 1, '#4a4460');
		px(g, x - 1, 146, 3, 3, '#1a1724');
		px(g, x - 1, 146, 1, 3, '#3a3550');
	}

	const gr = g.createLinearGradient(0, 186, 0, H);
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
/** The drum machine and the bassline box either side of the decks. */
const TR909 = { x: 141 };
const TB303 = { x: 314 };
/** Step button colours in groups of two, dim and lit. */
const STEP_COLORS = [
	['#5a1a14', '#ff4a2a'],
	['#5a3a14', '#ffa02a'],
	['#5a5214', '#ffe64a'],
	['#4a4858', '#ffffff']
];

function buildBooth(town: City) {
	const [c, g] = canvas();
	const R = rng(5);

	// Table top.
	px(g, 136, 136, 208, 6, '#2a2438');
	px(g, 136, 136, 208, 1, '#4a4260');
	px(g, 136, 141, 208, 1, '#0d0a14');

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
	px(g, 332, 124, 12, 12, '#2a2638');
	px(g, 332, 124, 12, 1, '#5a5274');
	px(g, 332, 124, 1, 12, '#3a3550');
	px(g, 331, 135, 14, 1, '#0e0c16');
	px(g, 334, 126, 3, 2, '#c6ff3d');
	px(g, 340, 132, 3, 2, '#4dd2ff');
	px(g, 334, 132, 2, 2, '#ffffff');
	px(g, 341, 126, 1, 2, '#ff3b5c');

	// A drum machine on the left: knobs over a row of step buttons (they light up live).
	px(g, TR909.x, 127, 26, 10, '#8a8698');
	px(g, TR909.x, 127, 26, 1, '#b4b0c2');
	px(g, TR909.x, 136, 26, 1, '#2a2638');
	px(g, TR909.x + 1, 128, 6, 1, '#c8402a');
	for (let k = 0; k < 7; k++) px(g, TR909.x + 9 + k * 2, 129, 1, 1, '#2a2638');
	for (let k = 0; k < 8; k++) px(g, TR909.x + 1 + k * 3, 133, 2, 2, STEP_COLORS[k >> 1][0]);

	// A silver bassline box on the right: knobs and a little keyboard.
	px(g, TB303.x, 128, 16, 9, '#9a96a8');
	px(g, TB303.x, 128, 16, 1, '#c4c0d2');
	px(g, TB303.x, 136, 16, 1, '#2a2638');
	for (let k = 0; k < 5; k++) px(g, TB303.x + 4 + k * 2, 130, 1, 1, '#2a2638');
	for (let k = 0; k < 14; k++) px(g, TB303.x + 1 + k, 133, 1, 2, k % 2 ? '#1a1724' : '#e8e4f0');

	// A bottle of Club-Mate on the left.
	px(g, 138, 123, 1, 1, '#c8c0ee');
	px(g, 138, 124, 1, 3, '#5a4418');
	px(g, 137, 127, 3, 9, '#5a4418');
	px(g, 137, 130, 3, 3, '#f0b030');
	px(g, 138, 131, 1, 1, '#2a2438');
	px(g, 137, 127, 1, 3, '#8a6a28');

	// Patch cables between the decks and the mixer.
	for (const [x0, x1] of [
		[212, 218],
		[262, 268],
		[166, 170],
		[310, 316]
	])
		for (let x = x0; x <= x1; x++)
			px(g, x, 137 + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI)), 1, 1, '#07060c');

	// The concrete front.
	concrete(g, R, 138, 142, 204, 44, '#1d1826', '#15121c', '#2a2433');
	px(g, 138, 142, 204, 1, '#3a3348');
	px(g, 138, 184, 204, 2, '#0b0910');
	for (const x of [158, 198, 284, 322]) px(g, x, 143, 1, 41, '#110e18');
	// Hazard tape along the stage edge.
	for (let x = 138; x < 342; x++)
		for (let y = 181; y < 184; y++) px(g, x, y, 1, 1, ((x + y) >> 2) % 2 ? '#a88418' : '#14111c');

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
	paper(141, 148, 14, 18, '#1a5a4a');
	paper(325, 162, 14, 17, '#2a4a8a');

	// The city sticker: its landmark over its name.
	const ink = '#14111c';
	px(g, 158, 146, 35, 31, '#e8e4f0');
	town.sticker(g, 175, 148, ink);
	textC(g, town.name, 176, 170, ink);

	// NO PHOTO sticker: a crossed-out camera.
	const [nx, ny] = [197, 179];
	disc(g, nx, ny, 4, '#e8e4f0');
	for (let a = 0; a < 40; a++) {
		const t = (a / 40) * Math.PI * 2;
		px(g, nx + Math.cos(t) * 4, ny + Math.sin(t) * 4, 1, 1, '#d8263f');
	}
	px(g, nx - 2, ny - 1, 5, 3, ink);
	px(g, nx - 1, ny - 2, 2, 1, ink);
	px(g, nx, ny, 1, 1, '#e8e4f0');
	line(g, nx - 3, ny - 3, nx + 3, ny + 3, 1, '#d8263f');

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
		[203, 176, '#ff3b5c'],
		[146, 170, '#ff3dc8'],
		[330, 150, '#c6ff3d']
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
	/** Seconds since the last frame. */
	dt: number;
	/** What the light show reads. */
	lf: LightFrame;
}

export class ClubScene {
	private g: Ctx;
	private town!: City;
	private bg!: HTMLCanvasElement;
	private booth!: HTMLCanvasElement;
	private banL!: HTMLCanvasElement;
	private banR!: HTMLCanvasElement;
	/** Lights out while the club moves to another city, 1 = black. */
	private blackout = 0;
	private frame = windowFrame();
	private fog = buildFog();
	private lights = new Lights();
	/** A quarter-size copy of the frame, for the bloom. */
	private glowBuf = canvas(W / 4, Math.ceil(H / 4));
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
		this.moveTo(city('berlin'));
		const R = rng(42);
		this.balconies = TIERS.map(() =>
			[
				[2, 102],
				[378, 478]
			].map(([a, b]) =>
				Array.from({ length: 14 }, (_, i) => ({
					x: a + ((i + R() * 0.6) * (b - a)) / 14,
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

	/** Rebuilds everything that belongs to a city: the view, the walls, the booth sticker, the banners. */
	private moveTo(town: City) {
		this.town = town;
		this.bg = buildBackground(town);
		this.booth = buildBooth(town);
		this.banL = buildBanner(town.banners[0], 'smile');
		this.banR = buildBanner(town.banners[1], 'crown');
	}

	render(i: SceneInput, now: number) {
		if (i.stage !== this.town.id) {
			this.moveTo(city(i.stage));
			this.blackout = i.reducedMotion ? 0 : 1;
		}
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
		const lf: LightFrame = {
			live: i.live,
			gap: i.gap,
			kind,
			x: i.x,
			cycle: i.cycle,
			beat,
			ph,
			E,
			sm,
			hype,
			intensity: i.intensity,
			accent: i.accent,
			t: this.t,
			dt,
			reducedMotion: i.reducedMotion
		};
		const f: Frame = { i, kind, E, hype, beat, ph, brk: kind === 'breakdown' ? 1 : 0, dt, lf };
		this.lights.update(lf);

		const g = this.g;
		g.globalCompositeOperation = 'source-over';
		g.globalAlpha = 1;
		// The whole picture shakes on the kick when the energy is up; the edges it uncovers stay dark.
		const [sx, sy] = this.shake(f);
		g.setTransform(1, 0, 0, 1, 0, 0);
		if (sx || sy) px(g, 0, 0, W, H, '#05030a');
		g.setTransform(1, 0, 0, 1, sx, sy);
		g.drawImage(this.bg, 0, 0);
		this.town.live(g, this.t, i.cycle, i.live);
		g.drawImage(this.frame, 0, 0);
		this.room(f);
		this.balconyCrowd(f);
		this.signs(f);
		this.tubes(f);
		this.machines(f);
		this.strobes(f);
		this.discoBall(f);
		this.co2(f);
		this.additive(() => {
			g.globalAlpha = i.live ? 0.08 + 0.1 * E.kick + 0.12 * f.brk + 0.05 * E.bass : 0.05;
			g.drawImage(this.fog, -((this.t * 5) % W), 100);
		});
		this.choreograph(f, dt);
		this.robot(f, 'body');
		g.drawImage(this.booth, 0, 0);
		this.boothLive(f);
		this.robot(f, 'arms');
		this.lights.beams(g, lf);
		this.lights.lasers(g, lf);
		this.additive(() => {
			g.globalAlpha = i.live ? 0.05 + 0.06 * E.bass + 0.08 * f.brk : 0.03;
			g.drawImage(this.fog, -(W - ((this.t * 8) % W)), 160);
		});
		this.dancefloor(f);
		this.lights.pools(g, lf);
		g.setTransform(1, 0, 0, 1, 0, 0);
		this.bloom(f);
		this.effects(f);
	}

	/** How far the picture is knocked this frame, in whole pixels. */
	private shake({ i, kind, E, hype, beat, ph }: Frame): [number, number] {
		if (i.reducedMotion || !i.live || i.gap || kind === 'breakdown') return [0, 0];
		const bar = i.x * 32;
		// The kick knocks the picture down a pixel or two once the energy and the track are up.
		let amp = clamp((hype - 0.35) / 0.55, 0, 1) * 1.8 * E.kick;
		// The drop lands hard: every beat of its first two bars.
		if (kind === 'peak' && bar < 2) amp += 2.6 * Math.exp(-ph * 6);
		let dx = (hash(Math.floor(beat * 8), 1) - 0.5) * amp * 0.9;
		let dy = amp;
		// The end of the build rumbles, a little more every bar.
		if (kind === 'build' && bar > 24) {
			const r = ((bar - 24) / 8) * 1.4;
			dx += (Math.random() - 0.5) * 2 * r;
			dy += (Math.random() - 0.5) * 2 * r;
		}
		return [Math.round(dx), Math.round(dy)];
	}

	/** A soft glow round everything bright: the frame, shrunk, squared and laid back over itself. */
	private bloom({ i, hype }: Frame) {
		const [c, s] = this.glowBuf;
		s.globalCompositeOperation = 'copy';
		s.imageSmoothingEnabled = true;
		s.imageSmoothingQuality = 'high';
		s.drawImage(this.cv, 0, 0, c.width, c.height);
		// Squaring keeps the lights and drops the dim walls.
		s.globalCompositeOperation = 'multiply';
		s.drawImage(c, 0, 0);
		const g = this.g;
		g.save();
		g.imageSmoothingEnabled = true;
		g.globalCompositeOperation = 'lighter';
		g.globalAlpha = i.live ? 0.35 + 0.35 * hype : 0.25;
		g.drawImage(c, 0, 0, W, H);
		g.restore();
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

	/** Window wash, the fixtures on the truss and its LED bar. */
	private room({ i, E, brk, lf }: Frame) {
		const g = this.g;
		this.additive(() => {
			g.fillStyle = rgba(brk ? '#4d8bff' : i.accent, 0.05 + 0.12 * E.synth + 0.1 * brk);
			g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
		});
		this.lights.fixtures(g, lf);
		// LED pixel bar along the bottom chord, chasing on the beat.
		const step = Math.floor(i.cycle * 8);
		for (let x = 94; x < 386; x += 2) {
			const n = (x - 94) / 2;
			const lit = i.live && (n + step) % 12 < 2;
			px(g, x, 17, 1, 1, lit ? rgba(n % 4 < 2 ? PINK : i.accent, 0.5 + 0.5 * E.hats) : '#2a2438');
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
				const [x0, x1] = si ? [376, 480] : [0, 104];
				this.town.room.railing(g, x0, x1, ty);
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
		const [left, right] = this.town.neon;
		this.neon(left.lines, 52, 62, left.color, lit * flicker, 1);
		this.neon(right.lines, 428, 58, right.color, lit, 1);

		const sway = Math.round(Math.sin(this.t * 0.8) * 0.7);
		g.drawImage(this.banL, 101 + sway, 22);
		g.drawImage(this.banR, 351 - sway, 22);

		const pump = Math.round(E.kick * 1.6);
		for (const x of LINE_ARRAYS)
			for (let k = 0; k < 6; k++) {
				disc(g, x + 7, 27 + k * 12, 2 + (k % 2 ? 0 : pump), '#22202c');
				px(g, x + 7, 27 + k * 12, 1, 1, '#06050a');
			}
		for (const x of [106, 354])
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

		// Drum machine: the running light steps through the bar in eighths, the kick key flashes.
		const stepAt = Math.floor(beat * 2) % 8;
		for (let k = 0; k < 8; k++) {
			const lit = i.live && (k === stepAt || (k % 2 === 0 && E.kick > 0.5 && k >> 1 === 0));
			px(g, TR909.x + 1 + k * 3, 133, 2, 2, STEP_COLORS[k >> 1][lit ? 1 : 0]);
		}
		// Bassline box: the accent LED follows the bass.
		px(g, TB303.x + 1, 130, 2, 1, i.live && E.bass > 0.4 ? '#ff3a3a' : '#4a1a1a');

		// Laptop logo breathes; brighter while it is writing the next track.
		const glow = i.thinking ? 0.6 + 0.4 * Math.sin(this.t * 6) : 0.35 + 0.3 * E.vox;
		g.globalAlpha = i.live ? glow : 0.2;
		smiley(g, 338, 129, 2, PINK);
		g.globalAlpha = 1;

		// LED strip along the table edge, chasing on the beat.
		const step = Math.floor(beat * 2);
		for (let x = 138; x < 342; x += 3) {
			const k = ((x - 138) / 3) | 0;
			const lit = i.live && (k + step) % 8 < 2;
			px(g, x, 141, 2, 1, lit ? rgba(i.accent, 0.5 + 0.5 * E.kick) : '#1a1626');
		}

		const al = i.live ? 0.3 + 0.7 * E.bass : 0.1;
		px(g, 138, 186, 204, 1, rgba(PINK, al));
		this.additive(() => {
			const gr = g.createLinearGradient(0, 186, 0, 200);
			gr.addColorStop(0, rgba(PINK, al * 0.45));
			gr.addColorStop(1, rgba(PINK, 0));
			g.fillStyle = gr;
			g.fillRect(122, 186, 236, 14);
		});
	}

	/** LED tubes on the pillar fronts: a pulse runs up them on every kick. */
	private tubes({ i, E, beat, brk }: Frame) {
		const g = this.g;
		for (const [x, n] of [
			[109, 0],
			[121, 1],
			[359, 2],
			[371, 3]
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

	/** Whatever stands under the balconies runs on the music. */
	private machines({ i, E, beat }: Frame) {
		this.town.room.live(this.g, { live: i.live, beat, cycle: i.cycle, t: this.t, E, sm: this.sm });
	}

	/** CO2 jets: a white plume shoots up on the drop's first two bars and the last bar of the build. */
	private co2({ i, kind }: Frame) {
		if (i.reducedMotion || !i.live || i.gap) return;
		const bar = i.x * 32;
		const firing = (kind === 'peak' && bar < 2) || (kind === 'build' && bar >= 31);
		if (!firing) return;
		const a = i.cycle % 1;
		const fade = a < 0.45 ? 1 : Math.max(0, 1 - (a - 0.45) * 2.5);
		if (fade <= 0) return;
		const g = this.g;
		const reach = Math.min(1, a * 5);
		const frame = Math.floor(this.t * 24);
		for (const x of CO2_X) {
			const n = Math.round(46 * reach);
			for (let k = 0; k < n; k++) {
				const y = 145 - k * 2;
				const r = 1 + Math.round(k * 0.18 + (1 - fade) * 3);
				const jx = (hash(k, frame + x) - 0.5) * (1 + k * 0.12);
				const al = (0.75 - (k / 46) * 0.55) * fade * (k > n - 4 ? 0.5 : 1);
				ell(g, x + jx, y, r, Math.max(1, r >> 1), rgba('#f4f0ff', al));
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

	private dancefloor({ i, E, hype, ph, beat, kind, dt }: Frame) {
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
			peak: kind === 'peak',
			section: i.live ? i.section : null,
			x: i.x,
			djMove: this.pose?.move ?? 'idle',
			dt
		});
	}

	/** Standby dimming, the blackout before the drop, strobes, confetti and glitch tears. */
	private effects(f: Frame) {
		const { i } = f;
		const g = this.g;
		if (this.blackout > 0) {
			g.fillStyle = `rgba(0,0,0,${Math.min(1, this.blackout * 1.4)})`;
			g.fillRect(0, 0, W, H);
			this.blackout = Math.max(0, this.blackout - f.dt * 1.6);
		}
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
