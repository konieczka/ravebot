import { LAYERS } from '#lib/dj/types.js';
import {
	clamp,
	concrete,
	disc,
	formwork,
	glow,
	line,
	px,
	rng,
	type Ctx,
	type Pt
} from '../draw.js';
import { text } from '../font.js';
import { fireExit, paintWalls, warm, type Room, type RoomFrame } from './room.js';

/**
 * Berlin's club is an old power station: board-marked concrete, riveted steel and bulkhead lamps.
 * Its control panel and a generator still stand under the balconies, and both run on the music.
 */
const GAUGES: Pt[] = [
	[17, 167],
	[37, 167],
	[57, 167],
	[77, 167]
];
const PANEL_LAMPS = Array.from({ length: 10 }, (_, k) => 12 + k * 7);
const FLYWHEEL: Pt = [431, 168];
const PRESSURE: Pt = [400, 155];
const BEACON: Pt = [415, 157];

function paint(g: Ctx) {
	const R = rng(11);
	paintWalls(g, {
		wall: (g, x, y, w, h) => {
			concrete(g, R, x, y, w, h, '#100b1c', '#0a0714', '#1a1428');
			formwork(g, R, x, y, w, h);
		},
		bay: (g, x, y, w, h) => {
			px(g, x, y, w, h, '#0c0818');
			formwork(g, R, x, y, w, h);
			// A pipe run along the top, flanged every 24 px.
			px(g, x, y + 3, w, 2, '#241c36');
			px(g, x, y + 3, w, 1, '#3a3052');
			for (let xx = x + 4; xx < x + w; xx += 24) px(g, xx, y + 2, 2, 4, '#2e2644');
		},
		column: (g, x, top, h) => {
			px(g, x, top, 5, h, '#15102a');
			px(g, x, top, 1, h, '#2a2244');
			px(g, x + 4, top, 1, h, '#1f1936');
			px(g, x + 2, top, 1, h, '#1b1530');
			for (const y of [top + 1, top + h - 3]) {
				px(g, x + 1, y, 1, 1, '#4a4068');
				px(g, x + 3, y, 1, 1, '#4a4068');
			}
		},
		fixture: (g, x, top, clear) => {
			if (!clear) return;
			const y = top + 11;
			px(g, x - 2, y - 1, 5, 4, '#2a1e18');
			px(g, x - 1, y, 3, 2, '#ffcf8a');
			px(g, x - 1, y, 1, 2, '#3a2a18');
			px(g, x + 1, y, 1, 2, '#3a2a18');
			warm(g, x + 0.5, y + 1, 12, 0.2);
		},
		ceiling: (g, x0, x1) => {
			px(g, x0, 0, x1 - x0, 12, '#06040b');
			for (let x = x0 + 6; x < x1; x += 16) line(g, x, 0, x + 8, 7, 1, '#141022');
			px(g, x0, 7, x1 - x0, 3, '#1a1428');
			px(g, x0, 7, x1 - x0, 1, '#2e2644');
			for (let x = x0 + 2; x < x1; x += 6) px(g, x, 8, 1, 1, '#3a3152');
		},
		pendant: (g, x) => {
			px(g, x, 10, 1, 3, '#1a1428');
			px(g, x - 2, 13, 5, 2, '#2a2238');
			px(g, x - 1, 15, 3, 1, '#ffd08a');
			warm(g, x + 0.5, 16, 14, 0.25);
		},
		slab: (g, x0, x1, ty) => {
			px(g, x0, ty, x1 - x0, 4, '#2b2342');
			px(g, x0, ty, x1 - x0, 1, '#463a66');
			for (let x = x0 + 3; x < x1; x += 8) px(g, x, ty + 2, 1, 1, '#4a3e66');
			px(g, x0, ty + 4, x1 - x0, 2, '#06040b');
		}
	});
	controlPanel(g);
	generator(g);
	fireExit(g);
}

/** Left: the control panel, steel with four gauges, a row of lamps and a knife switch. */
function controlPanel(g: Ctx) {
	px(g, 4, 148, 96, 39, '#0a0810');
	px(g, 6, 149, 92, 37, '#17131f');
	px(g, 6, 149, 92, 1, '#2c2638');
	px(g, 6, 149, 1, 37, '#221d2c');
	px(g, 97, 149, 1, 37, '#0e0b14');
	for (const x of [8, 95]) for (const y of [151, 183]) px(g, x, y, 1, 1, '#3e3650');
	text(g, 'KRAFTWERK', 10, 152, '#6e5e3e');
	px(g, 10, 158, 70, 1, '#0f0c16');
	for (const [x, y] of GAUGES) {
		disc(g, x, y, 7, '#0a0810');
		disc(g, x, y, 6, '#5c566a');
		for (let k = 0; k <= 6; k++) {
			const a = Math.PI * (0.85 + (1.3 * k) / 6);
			px(g, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 1, 1, k >= 5 ? '#8a2a3a' : '#2a2634');
		}
		px(g, x - 3, y + 8, 7, 2, '#3e3850');
		px(g, x - 2, y + 8, 5, 1, '#24202e');
	}
	for (const x of PANEL_LAMPS) {
		px(g, x - 1, 179, 4, 4, '#0a0810');
		px(g, x, 180, 2, 2, '#1c1824');
	}
	// Knife switch, thrown.
	px(g, 86, 160, 9, 16, '#0f0c16');
	px(g, 86, 160, 9, 1, '#2c2638');
	for (const x of [88, 92]) px(g, x, 162, 1, 12, '#4a3e30');
	line(g, 88, 173, 90, 163, 1, '#6a6478');
	line(g, 92, 173, 94, 163, 1, '#6a6478');
	px(g, 89, 162, 6, 2, '#1a1a1a');
	// Hazard sign: lightning in a yellow triangle.
	for (let y = 0; y < 6; y++) px(g, 88 - y / 2 + 3, 151 + y, y + 1, 1, '#8a7030');
	px(g, 91, 153, 1, 2, '#14111c');
	px(g, 90, 155, 1, 1, '#14111c');
	// Conduit down into the floor.
	for (const x of [20, 46, 70]) px(g, x, 186, 2, 3, '#121018');
}

/** Right: a generator with a flywheel (it turns with the beat). */
function generator(g: Ctx) {
	// Plinth and the drum of the generator, banded and riveted.
	px(g, 380, 180, 64, 7, '#15121c');
	px(g, 380, 180, 64, 1, '#2a2638');
	const shade = ['#3e504a', '#2e3c38', '#26322e', '#26322e', '#1f2a28', '#18201e', '#121816'];
	for (let y = 160; y < 180; y++)
		px(g, 384, y, 36, 1, shade[Math.floor(((y - 160) / 20) * shade.length)]);
	for (let x = 389; x < 420; x += 7) {
		px(g, x, 160, 1, 20, '#141c1a');
		px(g, x + 1, 161, 1, 1, '#5a6a64');
		px(g, x + 1, 178, 1, 1, '#5a6a64');
	}
	px(g, 383, 159, 2, 22, '#121816');
	px(g, 394, 166, 21, 7, '#a8903a');
	text(g, 'GEN 3', 395, 167, '#1a1408');
	// Shaft out to the flywheel.
	px(g, 420, FLYWHEEL[1] - 1, 11, 3, '#4a4a5a');
	px(g, 420, FLYWHEEL[1] - 1, 11, 1, '#7a7a8a');
	// Steam pipe up into the balcony slab, with a red valve wheel and a pressure gauge.
	px(g, 388, 148, 3, 12, '#2e2a3a');
	px(g, 388, 148, 1, 12, '#4a4460');
	disc(g, 389, 152, 2, '#8a1e24');
	px(g, 389, 152, 1, 1, '#14111c');
	px(g, PRESSURE[0], PRESSURE[1] + 3, 1, 2, '#4a4460');
	disc(g, PRESSURE[0], PRESSURE[1], 3, '#0c1210');
	disc(g, PRESSURE[0], PRESSURE[1], 2, '#bdb59a');
	px(g, BEACON[0] - 1, BEACON[1] + 1, 3, 2, '#1a1a22');
}

function railing(g: Ctx, x0: number, x1: number, ty: number) {
	px(g, x0, ty - 5, x1 - x0, 1, '#3a3152');
	for (let x = x0 + 2; x < x1; x += 5) px(g, x, ty - 5, 1, 5, '#2a2340');
}

/** Gauges, lamps and a flywheel turning a quarter turn per beat. */
function live(g: Ctx, { live, beat, E, sm }: RoomFrame) {
	const levels = [sm.kick * 0.5 + E.kick * 0.5, E.bass, sm.hats * 0.5 + E.hats * 0.5, E.synth];
	GAUGES.forEach(([x, y], n) => {
		const v = live ? clamp(levels[n], 0, 1) : 0;
		const a = Math.PI * (0.85 + 1.3 * v);
		line(g, x, y, x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5, 1, '#d8d2e6');
		px(g, x, y, 1, 1, '#8a2a3a');
	});
	const step = Math.floor(beat * 2);
	PANEL_LAMPS.forEach((x, k) => {
		const v = live ? E[LAYERS[k % LAYERS.length]] : 0;
		const lit = v > 0.35 || (live && (k + step) % 10 === 0);
		const col = ['#3aa870', '#b88030', '#b83a3a'][k % 3];
		px(g, x, 180, 2, 2, lit ? col : '#1c1824');
	});

	const [fx, fy] = FLYWHEEL;
	const rot = live ? (beat * Math.PI) / 2 : 0;
	for (let k = 0; k < 6; k++) {
		const a = rot + (k / 6) * Math.PI * 2;
		line(g, fx, fy, fx + Math.cos(a) * 10, fy + Math.sin(a) * 10, 1, '#3a4440');
	}
	for (let k = 0; k < 96; k++) {
		const a = (k / 96) * Math.PI * 2;
		const lit = Math.cos(a + Math.PI * 0.75) > 0.4;
		px(g, fx + Math.cos(a) * 12, fy + Math.sin(a) * 12, 1, 1, lit ? '#6a7a74' : '#2e3836');
		px(g, fx + Math.cos(a) * 11, fy + Math.sin(a) * 11, 1, 1, '#3e4a46');
	}
	px(g, fx + Math.cos(rot) * 11, fy + Math.sin(rot) * 11, 2, 2, '#b0242a');
	disc(g, fx, fy, 2, '#5a6460');
	px(g, fx, fy, 1, 1, '#9aa49e');

	const [gx, gy] = PRESSURE;
	const p = Math.PI * (0.85 + 1.3 * (live ? clamp(0.3 + 0.6 * sm.bass, 0, 1) : 0));
	line(g, gx, gy, gx + Math.cos(p) * 1.8, gy + Math.sin(p) * 1.8, 1, '#1a1410');
	const flash = live && E.kick > 0.5;
	px(g, BEACON[0], BEACON[1], 1, 1, flash ? '#ffb03b' : '#5a3a14');
	if (flash) {
		g.globalCompositeOperation = 'lighter';
		glow(g, BEACON[0] + 0.5, BEACON[1] + 0.5, 6, '#ffb03b', 0.5 * E.kick);
		g.globalCompositeOperation = 'source-over';
	}
}

export const POWER_STATION: Room = { paint, railing, live };
