import type { SectionKind } from '#lib/dj/arrangement.js';
import type { LayerName } from '#lib/dj/types.js';
import { clamp, disc, glow, hash, lerp, px, rgba, type Ctx } from './draw.js';

/**
 * The light show shared by every stage: eight moving heads on the truss, the lasers and two
 * audience blinders. Like everything else it reads the music's schedule, not the audio: each
 * section gets its own looks, the looks change on 4-bar phrases and the light lands on the beat.
 */
export interface LightFrame {
	live: boolean;
	gap: boolean;
	kind: SectionKind;
	/** Progress through the section, 0..1. */
	x: number;
	cycle: number;
	beat: number;
	/** Phase within the beat, 0..1. */
	ph: number;
	E: Record<LayerName, number>;
	sm: Record<LayerName, number>;
	hype: number;
	intensity: number;
	accent: string;
	t: number;
	dt: number;
	reducedMotion: boolean;
}

const PINK = '#ff3dc8';
const BLUE = '#4d8bff';
const VIOLET = '#8a6bff';
const WHITE = '#f4f0ff';

/** Moving heads hang under the truss. */
const HEADS = Array.from({ length: 8 }, (_, k) => 132 + k * 31);
const HEAD_Y = 21;
/** Where the beams land: the crowd's heads. */
const FLOOR = 205;
/** The robot's head, for looks that point at him. */
const ROBOT: [number, number] = [240, 92];
/** Blinders sit on top of the truss. */
const BLINDERS = [150, 322];

interface Emitter {
	x: number;
	y: number;
	/** Resting angle and how far it sweeps, in half-turns. */
	a: number;
	s: number;
	c: number;
}
const EMITTERS: Emitter[] = [
	{ x: 0, y: 150, a: -0.1 * Math.PI, s: 0.07, c: 0 },
	{ x: 480, y: 150, a: -0.9 * Math.PI, s: 0.07, c: 1 },
	{ x: 98, y: 16, a: 0.28 * Math.PI, s: 0.14, c: 2 },
	{ x: 382, y: 16, a: 0.72 * Math.PI, s: 0.14, c: 0 },
	{ x: 146, y: 138, a: -0.72 * Math.PI, s: 0.12, c: 1 },
	{ x: 334, y: 138, a: -0.28 * Math.PI, s: 0.12, c: 2 },
	{ x: 240, y: 12, a: 0.5 * Math.PI, s: 0.38, c: 2 }
];

type Look = 'sweep' | 'fan' | 'cross' | 'converge' | 'chase';

const bars = (f: LightFrame) => f.x * 32;
const isDrop = (f: LightFrame) => f.kind === 'peak' && bars(f) < 4;

export class Lights {
	/** Current tilt of each moving head, eased towards its look. */
	private tilt = HEADS.map(() => Math.PI / 2);
	private blind = 0;
	private lastBeat = -1;

	/** The look for this phrase. */
	private look(f: LightFrame): Look {
		const phrase = Math.floor(f.cycle / 4);
		const pick = (opts: Look[]) => opts[Math.floor(hash(phrase, 17) * opts.length)];
		switch (f.kind) {
			case 'breakdown':
				return 'sweep';
			case 'build':
				return f.x > 0.75 ? 'chase' : 'converge';
			case 'peak':
				return isDrop(f) ? 'fan' : pick(['cross', 'chase', 'fan', 'sweep']);
			case 'main':
			case 'lift':
				return pick(['fan', 'cross', 'sweep']);
			default:
				return 'sweep';
		}
	}

	/** How bright the heads are in this section. */
	private dimmer(f: LightFrame) {
		if (!f.live) return 0.12;
		const base: Record<SectionKind, number> = {
			intro: 0.3,
			groove: 0.4,
			lift: 0.55,
			main: 0.7,
			breakdown: 0.5,
			build: 0.45 + 0.4 * f.x,
			peak: 1,
			outro: 0.35
		};
		// Everywhere but the breakdown the heads punch on the kick.
		const pulse = f.kind === 'breakdown' ? 1 : 0.65 + 0.35 * Math.exp(-f.ph * 5) * f.sm.kick;
		return base[f.kind] * pulse * (0.7 + 0.3 * f.hype);
	}

	private headColor(f: LightFrame, k: number) {
		if (f.kind === 'breakdown') return k % 2 ? BLUE : VIOLET;
		if (isDrop(f)) return WHITE;
		if (f.kind === 'build' && f.x > 0.75) return k % 2 ? WHITE : f.accent;
		return k % 2 ? PINK : f.accent;
	}

	/** Eases the heads towards this phrase's look. Call once per frame. */
	update(f: LightFrame) {
		const look = this.look(f);
		const speed = f.kind === 'breakdown' ? 0.35 : 0.6 + f.hype * 0.6;
		const k = 1 - Math.exp(-f.dt * (look === 'chase' ? 10 : 4));
		HEADS.forEach((x, n) => {
			const u = (n - 3.5) / 3.5;
			let a = Math.PI / 2;
			if (!f.live) a += u * 0.1;
			else if (look === 'fan') a -= u * 0.5 + Math.sin(f.beat * Math.PI * 0.125) * 0.08;
			else if (look === 'cross') a += u * 0.45 + Math.sin(f.t * speed) * 0.1;
			else if (look === 'converge') a = Math.atan2(ROBOT[1] + 20 - HEAD_Y, ROBOT[0] - x);
			else if (look === 'chase') a += u * 0.3 * (Math.floor(f.beat) % 2 ? 1 : -1);
			else a += Math.sin(f.t * speed + n * 0.55) * 0.45;
			this.tilt[n] += (a - this.tilt[n]) * k;
		});
		// Blinders hit on the drop and on every beat of the last bar of the build.
		const b = Math.floor(f.beat);
		if (b !== this.lastBeat) {
			this.lastBeat = b;
			const hit =
				f.live &&
				!f.gap &&
				((f.kind === 'peak' && bars(f) < 1) || (f.kind === 'build' && bars(f) >= 31));
			if (hit && !f.reducedMotion) this.blind = 1;
		}
		this.blind = Math.max(0, this.blind - f.dt * 2.2);
	}

	/** The fixtures themselves: yokes under the truss, heads tilted along their beams; blinders on top. */
	fixtures(g: Ctx, f: LightFrame) {
		const on = this.dimmer(f);
		HEADS.forEach((x, n) => {
			const a = this.tilt[n];
			px(g, x - 3, 18, 7, 1, '#2a2438');
			px(g, x - 3, 18, 1, 4, '#2a2438');
			px(g, x + 3, 18, 1, 4, '#2a2438');
			disc(g, x, HEAD_Y, 2, '#1a1626');
			px(g, x - 1, 19, 1, 1, '#3a3550');
			const lx = x + Math.round(Math.cos(a) * 2);
			const ly = HEAD_Y + Math.round(Math.sin(a) * 2);
			px(g, lx, ly, 1, 1, rgba(this.headColor(f, n), clamp(0.3 + on, 0, 1)));
		});
		for (const x of BLINDERS) {
			px(g, x - 5, 2, 11, 7, '#1a1626');
			px(g, x - 5, 2, 11, 1, '#3a3550');
			for (const lx of [x - 2, x + 3]) {
				disc(g, lx, 5, 2, '#0c0a12');
				const b = this.blind;
				const core = b > 0.5 ? '#fff8e8' : b > 0.15 ? '#ffb060' : b > 0.02 ? '#8a3a10' : '#2a2018';
				disc(g, lx, 5, 1, core);
			}
		}
	}

	/** Volumetric beams from the heads, fading from the lens towards the floor. */
	beams(g: Ctx, f: LightFrame) {
		const on = this.dimmer(f);
		if (on <= 0.02) return;
		g.globalCompositeOperation = 'lighter';
		HEADS.forEach((x, n) => {
			const look = this.look(f);
			let a = on;
			if (look === 'chase' && f.live) a *= (n + Math.floor(f.beat)) % 4 === 0 ? 1 : 0.15;
			if (a < 0.02) return;
			const col = this.headColor(f, n);
			const t = this.tilt[n];
			const len = (FLOOR - HEAD_Y) / Math.max(0.3, Math.sin(t));
			const ex = x + Math.cos(t) * len;
			const ey = HEAD_Y + Math.sin(t) * len;
			for (const [spread, k] of [
				[0.11, 0.14],
				[0.045, 0.3]
			]) {
				const gr = g.createLinearGradient(x, HEAD_Y, ex, ey);
				gr.addColorStop(0, rgba(col, a * k));
				gr.addColorStop(0.55, rgba(col, a * k * 0.45));
				gr.addColorStop(1, rgba(col, a * k * 0.12));
				g.fillStyle = gr;
				g.beginPath();
				g.moveTo(x, HEAD_Y);
				g.lineTo(x + Math.cos(t - spread) * len, HEAD_Y + Math.sin(t - spread) * len);
				g.lineTo(x + Math.cos(t + spread) * len, HEAD_Y + Math.sin(t + spread) * len);
				g.closePath();
				g.fill();
			}
			glow(g, x, HEAD_Y + 1, 4, col, a * 0.6);
		});
		g.globalCompositeOperation = 'source-over';
	}

	/** Pools of light where the beams land on the crowd's heads. Draw after the crowd. */
	pools(g: Ctx, f: LightFrame) {
		const on = this.dimmer(f);
		if (on <= 0.05) return;
		g.globalCompositeOperation = 'lighter';
		HEADS.forEach((x, n) => {
			const t = this.tilt[n];
			if (Math.sin(t) < 0.3) return;
			let a = on;
			if (this.look(f) === 'chase' && f.live) a *= (n + Math.floor(f.beat)) % 4 === 0 ? 1 : 0.15;
			const hx = x + (Math.cos(t) / Math.sin(t)) * (FLOOR - HEAD_Y);
			g.save();
			g.translate(hx, FLOOR);
			g.scale(1, 0.32);
			glow(g, 0, 0, 22, this.headColor(f, n), a * 0.35);
			g.restore();
		});
		// The blinders light up the whole room, warm, then fade like tungsten.
		if (this.blind > 0.01) {
			const b = this.blind;
			glow(g, 240, 150, 300, b > 0.5 ? '#fff4e0' : '#ff9a4a', b * 0.45);
			for (const x of BLINDERS) glow(g, x, 5, 26, '#ffe8c0', b);
		}
		g.globalCompositeOperation = 'source-over';
	}

	/** Lasers belong to the synth, and every section has its own show. */
	lasers(g: Ctx, f: LightFrame) {
		if (!f.live || f.gap || f.E.synth < 0.05) return;
		const syn = f.E.synth;
		const cols = [PINK, BLUE, f.accent];
		g.globalCompositeOperation = 'lighter';
		if (f.kind === 'breakdown') {
			this.sheet(g, f, syn);
			for (const e of EMITTERS.slice(0, 2)) {
				const a = e.a + Math.sin(f.t * 0.2 + e.x) * e.s * Math.PI;
				this.beam(g, f, e.x, e.y, a, BLUE, syn * 0.45);
			}
		} else if (f.kind === 'build') {
			// A tunnel: beams close in on RaveBot, spinning faster as the build rises.
			const spin = f.t * (0.5 + f.x * 4);
			const chop = f.x > 0.75 ? Math.floor(f.beat * 4) % 2 === 0 : true;
			if (chop)
				EMITTERS.slice(2, 6).forEach((e, n) => {
					const aim = Math.atan2(ROBOT[1] - e.y, ROBOT[0] - e.x);
					for (let j = -1; j <= 1; j++) {
						const off = j * (0.22 - f.x * 0.16) + Math.sin(spin + n) * 0.05;
						const col = f.x > 0.75 ? WHITE : cols[(e.c + j + 3) % 3];
						this.beam(g, f, e.x, e.y, aim + off, col, syn * 0.85);
					}
				});
		} else if (isDrop(f)) {
			// The drop: a burst of beams from the top of the truss, turning, plus the side fans.
			const turn = f.t * 0.8;
			for (let j = 0; j < 12; j++) {
				const a = Math.PI * (0.06 + (0.88 * j) / 11) + Math.sin(turn) * 0.06;
				this.beam(g, f, 240, 12, a, cols[j % 3], syn);
			}
			for (const e of EMITTERS.slice(0, 2))
				for (let j = -1; j <= 1; j++)
					this.beam(
						g,
						f,
						e.x,
						e.y,
						e.a + j * 0.1 + Math.sin(turn + e.x) * 0.1,
						cols[(e.c + j + 3) % 3],
						syn
					);
		} else if (f.kind === 'peak' || (f.kind === 'main' && f.intensity > 0.7)) {
			// Scans: every beat each emitter snaps to a new angle; at the peak the beams chop in 16ths.
			const b = Math.floor(f.beat);
			const snap = Math.min(1, f.ph / 0.12);
			const ease = snap * snap * (3 - 2 * snap);
			const fan = f.kind === 'peak' ? 3 : 2;
			const lit = f.kind !== 'peak' || Math.floor(f.beat * 4) % 2 === 0 || f.ph < 0.1;
			if (lit)
				EMITTERS.forEach((e, n) => {
					const at = (beat: number) => e.a + (hash(beat, n) - 0.5) * 2 * e.s * Math.PI;
					const a = lerp(at(b - 1), at(b), ease);
					for (let j = 0; j < fan; j++)
						this.beam(
							g,
							f,
							e.x,
							e.y,
							a + (j - (fan - 1) / 2) * 0.09,
							cols[(e.c + j) % 3],
							syn * 0.85
						);
				});
		} else {
			// Slow fans sweeping through the haze.
			EMITTERS.slice(0, 4).forEach((e, n) => {
				const a = e.a + Math.sin(f.t * 0.5 * (1 + n * 0.13) + n * 1.7) * e.s * Math.PI;
				for (let j = 0; j < 2; j++)
					this.beam(g, f, e.x, e.y, a + (j - 0.5) * 0.09, cols[(e.c + j) % 3], syn * 0.7);
			});
		}
		g.globalCompositeOperation = 'source-over';
	}

	/** One laser beam: soft glow and a hard core, fading along its length, dust sparkling in it. */
	private beam(g: Ctx, f: LightFrame, x: number, y: number, a: number, col: string, al: number) {
		const len = 620;
		const x1 = x + Math.cos(a) * len;
		const y1 = y + Math.sin(a) * len;
		for (const [w, k] of [
			[3, 0.2],
			[1, 1]
		]) {
			const gr = g.createLinearGradient(x, y, x1, y1);
			gr.addColorStop(0, rgba(col, al * k));
			gr.addColorStop(0.45, rgba(col, al * k * 0.6));
			gr.addColorStop(1, rgba(col, al * k * 0.1));
			g.strokeStyle = gr;
			g.lineWidth = w;
			g.beginPath();
			g.moveTo(x, y);
			g.lineTo(x1, y1);
			g.stroke();
		}
		glow(g, x, y, 5, col, al * 0.8);
		const frame = Math.floor(f.t * 20);
		for (let k = 0; k < 3; k++) {
			const d = 30 + hash(frame + k, x + a) * 260;
			px(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 1, 1, rgba('#ffffff', al * 0.7));
		}
	}

	/** The breakdown's laser ceiling: a sheet of light skimming the crowd's heads, rippling slowly. */
	private sheet(g: Ctx, f: LightFrame, al: number) {
		const y = 176 + Math.sin(f.t * 0.6) * 4;
		const tilt = Math.sin(f.t * 0.35) * 6;
		const gr = g.createLinearGradient(480, 0, 0, 0);
		gr.addColorStop(0, rgba(BLUE, al * 0.6));
		gr.addColorStop(1, rgba(BLUE, al * 0.18));
		g.fillStyle = gr;
		g.beginPath();
		g.moveTo(480, 170);
		g.lineTo(0, y - 10 + tilt);
		g.lineTo(0, y + 10 + tilt);
		g.closePath();
		g.fill();
		g.strokeStyle = rgba('#c4dcff', al);
		g.lineWidth = 1;
		g.beginPath();
		g.moveTo(480, 170);
		g.lineTo(0, y + tilt);
		g.stroke();
		glow(g, 478, 170, 7, BLUE, al);
	}
}
