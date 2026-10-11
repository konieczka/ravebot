import { disc, ell, glow, hash, px, rgba, rng, type Ctx } from '../draw.js';
import {
	DECK,
	WIN,
	X1,
	blocks,
	bridge,
	clipped,
	crossing,
	makeStars,
	moon,
	plane,
	reflections,
	shimmer,
	sky,
	twinkle,
	type City
} from './view.js';
import { BELLE_EPOQUE } from './paris-room.js';

/**
 * Paris: the Eiffel Tower lit gold on the right (it sparkles on the downbeat and its beacon sweeps
 * the sky), Sacré-Cœur on Montmartre and the Tour Montparnasse on the left, mansard roofs all
 * along the Seine, and a métro crossing a stone bridge.
 */
const EIFFEL = 304;
const TOP = 30;
const SC = 176;
const MOON = [160, 34];
const STARS = makeStars(53, MOON);

const SKY = [
	'#060820',
	'#0a0c2a',
	'#0f1034',
	'#16143e',
	'#201846',
	'#301c4a',
	'#44224a',
	'#5e2c46'
];
const MID = '#0c0a20';
const RIM = '#34305c';

/** Half width of the tower at row `y`. */
const towerHw = (y: number) => 0.5 + 14.5 * ((y - TOP) / (DECK - TOP)) ** 2.4;
/** Half width of the arch between the legs at row `y`, 0 above it. */
const archHw = (y: number) => (y > 100 ? 9 * Math.sqrt(Math.max(0, 1 - ((112 - y) / 12) ** 2)) : 0);

function paint(g: Ctx) {
	const R = rng(67);
	sky(g, SKY);
	moon(g, MOON, '#221c4e');
	blocks(g, R, '#22183c', '#5a3a5a', MID, RIM);

	// Tour Montparnasse: one dark slab.
	px(g, 148, 60, 10, DECK - 60, '#0a0818');
	px(g, 148, 60, 1, DECK - 60, RIM);
	for (let y = 62; y < DECK; y += 3)
		if (R() < 0.5) px(g, 150 + ((R() * 6) | 0), y, 1, 1, '#9fd8ff');

	// Montmartre and Sacré-Cœur, floodlit white at the top of the hill.
	for (let x = 140; x < 214; x++) {
		const top = Math.round(95 + 14 * ((x - SC) / 37) ** 2);
		if (top < DECK) px(g, x, top, 1, DECK - top, '#0c0a1e');
	}
	g.globalCompositeOperation = 'lighter';
	glow(g, SC, 84, 22, '#ffe8c8', 0.18);
	g.globalCompositeOperation = 'source-over';
	const STONE = ['#e2dcea', '#bdb4cf', '#8e86a8'];
	// The nave, lit from the left.
	px(g, SC - 10, 87, 21, 8, STONE[1]);
	px(g, SC - 10, 87, 6, 8, STONE[0]);
	for (let x = SC - 8; x < SC + 10; x += 3) px(g, x, 89, 1, 4, '#4a4468');
	// The great dome on its drum, egg-shaped, with the lantern on top.
	px(g, SC - 4, 83, 9, 4, STONE[1]);
	px(g, SC - 4, 83, 3, 4, STONE[0]);
	for (let x = SC - 3; x <= SC + 3; x += 2) px(g, x, 84, 1, 2, '#4a4468');
	for (let y = -6; y <= 0; y++) {
		const hw = Math.round(6 * Math.sqrt(1 - (y / 7) ** 2) * (1 + y / 18));
		px(g, SC - hw, 82 + y, hw * 2 + 1, 1, STONE[1]);
		px(g, SC - hw, 82 + y, Math.max(1, hw - 1), 1, STONE[0]);
		px(g, SC + Math.ceil(hw / 2), 82 + y, Math.max(1, hw - Math.ceil(hw / 2)) + 1, 1, STONE[2]);
	}
	px(g, SC - 5, 82, 11, 1, '#6a6288');
	px(g, SC - 10, 87, 21, 1, '#8e86a8');
	px(g, SC - 1, 73, 3, 3, STONE[1]);
	px(g, SC, 70, 1, 3, STONE[2]);
	// Small domes over the corners, and the campanile behind.
	for (const x of [SC - 8, SC + 8]) {
		px(g, x - 1, 84, 3, 3, STONE[1]);
		disc(g, x, 83, 1, STONE[1]);
		px(g, x, 81, 1, 1, STONE[2]);
	}
	px(g, SC + 12, 78, 3, 17, STONE[1]);
	px(g, SC + 12, 78, 1, 17, STONE[0]);
	px(g, SC + 13, 80, 1, 3, '#4a4468');
	ell(g, SC + 13, 77, 1, 1, STONE[1]);
	px(g, SC + 13, 74, 1, 2, STONE[2]);

	// Haussmann blocks along the river: cream facades, zinc mansards, dormers and chimney pots.
	for (let x = WIN.x; x < X1;) {
		const w = 10 + ((R() * 7) | 0);
		const h = 5 + ((R() * 3) | 0);
		const top = DECK - h;
		px(g, x, top, w, h, '#1e1a30');
		for (let yy = top + 1; yy < DECK - 1; yy += 2)
			for (let xx = x + 1; xx < x + w - 1; xx += 2)
				if (R() < 0.45) px(g, xx, yy, 1, 1, rgba('#ffcf6a', 0.7));
		for (let k = 0; k < 3; k++) px(g, x + k, top - 3 + k, w - k * 2, 1, '#2e3250');
		for (let xx = x + 3; xx < x + w - 3; xx += 4)
			px(g, xx, top - 2, 1, 1, R() < 0.5 ? '#ffcf6a' : '#3a3e5a');
		const cx = x + 2 + ((R() * (w - 4)) | 0);
		px(g, cx, top - 5, 2, 2, '#14121e');
		px(g, cx, top - 6, 1, 1, '#a0582a');
		x += w;
	}

	// The Eiffel Tower, lit gold: a lattice that thins towards the top, two platforms, the arch.
	for (let y = TOP; y < DECK; y++) {
		const hw = towerHw(y);
		const ih = archHw(y);
		for (let x = Math.round(EIFFEL - hw); x <= Math.round(EIFFEL + hw); x++) {
			const d = Math.abs(x - EIFFEL);
			if (d < ih) continue;
			const edge = d > hw - 1 || (ih > 0 && d < ih + 1);
			const c = edge ? '#ffc860' : (x + y) % 2 ? '#c8862a' : '#5a3a14';
			px(g, x, y, 1, 1, c);
		}
	}
	for (const y of [78, 98]) {
		const hw = Math.round(towerHw(y)) + 1;
		px(g, EIFFEL - hw, y, hw * 2 + 1, 1, '#ffe090');
		px(g, EIFFEL - hw, y + 1, hw * 2 + 1, 1, '#7a5418');
	}
	px(g, EIFFEL - 1, TOP, 3, 4, '#ffe090');
	px(g, EIFFEL, TOP - 6, 1, 6, '#c8862a');

	// A stone bridge over the Seine with gilded lamps.
	bridge(g, R, {
		deck: '#3a3448',
		top: '#5a5470',
		speck: '#2a2638',
		pier: '#2e2a3c',
		arches: true,
		water: '#070818'
	});
	g.globalCompositeOperation = 'lighter';
	for (let x = 136; x < X1; x += 16) glow(g, x + 0.5, DECK - 6, 4, '#ffd070', 0.4);
	g.globalCompositeOperation = 'source-over';
	for (let x = 136; x < X1; x += 16) {
		px(g, x, DECK - 6, 1, 6, '#8a6a2a');
		px(g, x - 1, DECK - 7, 3, 1, '#ffd070');
	}
	reflections(g, R, ['#ffcf6a', '#ffd070', '#ff9a6a']);
}

function live(g: Ctx, t: number, cycle: number, on: boolean) {
	twinkle(g, STARS, t);
	// The beacon on top sweeps round: we see its beam when it points sideways.
	const a = t * 0.6;
	const reach = Math.cos(a);
	clipped(g, () => {
		g.globalCompositeOperation = 'lighter';
		const len = 130 * Math.abs(reach);
		const dir = Math.sign(reach) || 1;
		const gr = g.createLinearGradient(EIFFEL, TOP, EIFFEL + dir * len, TOP - 10);
		gr.addColorStop(0, 'rgba(255,240,200,.28)');
		gr.addColorStop(1, 'rgba(255,240,200,0)');
		g.fillStyle = gr;
		g.beginPath();
		g.moveTo(EIFFEL, TOP);
		g.lineTo(EIFFEL + dir * len, TOP - 14);
		g.lineTo(EIFFEL + dir * len, TOP - 2);
		g.closePath();
		g.fill();
		g.globalCompositeOperation = 'source-over';
	});
	// The sparkle: white flashes all over the tower, a burst on every downbeat.
	const burst = on && cycle % 1 < 0.25 ? 26 : 7;
	const f = Math.floor(t * 12);
	for (let k = 0; k < burst; k++) {
		const y = Math.round(TOP + 2 + hash(k, f) * (DECK - TOP - 4));
		const hw = towerHw(y);
		const x = Math.round(EIFFEL - hw + hash(f, k) * hw * 2);
		if (Math.abs(x - EIFFEL) >= archHw(y)) px(g, x, y, 1, 1, '#ffffff');
	}
	plane(g, t);
	clipped(g, () => {
		crossing(g, t, {
			cars: 3,
			len: 16,
			body: '#c8ccd8',
			roof: '#8a8ea0',
			skirt: '#2a2c3a',
			stripe: '#2a7a8a',
			windows: '#fff0c8',
			period: 22
		});
		shimmer(g, t, ['#ffd070', '#ff9a6a']);
	});
}

/** The Eiffel Tower. */
function sticker(g: Ctx, cx: number, top: number, ink: string) {
	for (let y = 0; y <= 20; y++) {
		const hw = Math.round(0.5 + 9 * (y / 20) ** 2.2);
		const ih = y > 15 ? Math.round(5 * Math.sqrt(1 - ((20 - y) / 5) ** 2)) : -1;
		for (let x = -hw; x <= hw; x++) if (Math.abs(x) > ih) px(g, cx + x, top + y, 1, 1, ink);
	}
	px(g, cx - 6, top + 14, 13, 1, ink);
	px(g, cx - 3, top + 9, 7, 1, ink);
}

export const PARIS: City = {
	id: 'paris',
	name: 'PARIS',
	neon: [
		{ lines: ['PARIS', 'NE DORT', 'JAMAIS'], color: '#4d8bff' },
		{ lines: ['LIBERTÉ', 'ÉGALITÉ', 'TECHNO'], color: '#ff3b5c' }
	],
	banners: [
		['VIVE', 'LA', 'TECHNO'],
		['SOUS', 'LES', 'PAVÉS', 'LA RAVE']
	],
	room: BELLE_EPOQUE,
	sticker,
	paint,
	live
};
