import { disc, glow, px, rgba, rng, type Ctx } from '../draw.js';
import {
	DECK,
	X1,
	blink,
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

/**
 * Warsaw: the Palace of Culture and Science on the left, floodlit in colours that change every
 * four bars; Varso, Złota 44 and the Warsaw Spire on the right.
 * A red-and-yellow tram crosses the Vistula.
 */
const PKIN = 176;
/** The palace's tiers, bottom up: [half width, top]. */
const TIERS: [number, number][] = [
	[26, 100],
	[20, 92],
	[14, 84],
	[9, 66],
	[6, 56],
	[4, 48],
	[2, 42]
];
const VARSO = 298;
const MOON = [320, 34];
const STARS = makeStars(91, MOON);
const FLOOD = ['#ff3b4a', '#eef2ff', '#7a5cff', '#ffb03b'];

const SKY = [
	'#060a1e',
	'#0a0f28',
	'#0e1432',
	'#141a3c',
	'#1c1e46',
	'#28224c',
	'#3a2850',
	'#52304e'
];
const MID = '#0a0c20';
const RIM = '#2e3460';
/** Sandstone: lit, mid, shadow, groove. */
const STONE = ['#a49a88', '#867d70', '#665f58', '#4a4542'];
const GLASS = ['#9fd8ff', '#c8e8ff', '#7ab8e8', '#ffcf6a'];

function paint(g: Ctx) {
	const R = rng(41);
	sky(g, SKY);
	moon(g, MOON, '#1e2050');
	blocks(g, R, '#1e1e3e', '#4a4a6e', MID, RIM);

	// Palace of Culture and Science in its pale sandstone, lit from the left: stepped tiers with
	// pilasters and deep windows, pinnacles on every setback, a clock, the spire.
	let below = DECK;
	for (const [hw, top] of TIERS) {
		for (let x = PKIN - hw; x <= PKIN + hw; x++) {
			const u = (x - PKIN + hw) / (hw * 2 + 1);
			const tone = u < 0.34 ? 0 : u < 0.67 ? 1 : 2;
			const groove = (x - PKIN + hw) % 3 === 2 && hw > 3;
			px(g, x, top, 1, below - top, STONE[Math.min(3, tone + (groove ? 1 : 0))]);
		}
		px(g, PKIN - hw, top, hw * 2 + 1, 1, '#bcb2a0');
		if (hw > 3)
			for (let x = PKIN - hw; x <= PKIN + hw; x += 3) {
				px(g, x, top - 2, 1, 2, STONE[1]);
				px(g, x, top - 3, 1, 1, '#bcb2a0');
			}
		for (let y = top + 2; y < below - 1; y += 3)
			for (let x = PKIN - hw + 1; x < PKIN + hw; x += 3)
				px(g, x, y, 1, 2, R() < 0.25 ? rgba('#ffcf6a', 0.7) : '#34302c');
		below = top;
	}
	px(g, PKIN, 26, 1, 16, STONE[2]);
	px(g, PKIN, 26, 1, 8, STONE[1]);
	px(g, PKIN - 1, 60, 3, 3, '#34302c');
	px(g, PKIN, 61, 1, 1, '#bcb2a0');

	// Złota 44: a glass sail, straight on one side and curved on the other.
	for (let y = 64; y < DECK; y++) {
		const w = 4 + Math.round(7 * Math.sin(((y - 64) / (DECK - 64)) * Math.PI * 0.5));
		px(g, 276, y, w, 1, MID);
		px(g, 276 + w - 1, y, 1, 1, '#3a4a78');
		for (let x = 277; x < 276 + w - 1; x += 2)
			if (y % 2 === 0 && R() < 0.35) px(g, x, y, 1, 1, rgba(GLASS[(R() * 3) | 0], 0.6));
	}
	// Varso: the tallest tower in the EU, with its spire.
	px(g, VARSO - 4, 52, 9, DECK - 52, MID);
	px(g, VARSO - 3, 46, 7, 6, MID);
	px(g, VARSO - 4, 52, 1, DECK - 52, RIM);
	for (let y = 48; y < DECK - 1; y += 2)
		for (let x = VARSO - 2; x < VARSO + 4; x += 2)
			if (R() < 0.45) px(g, x, y, 1, 1, rgba(GLASS[(R() * 4) | 0], 0.6));
	px(g, VARSO, 23, 1, 23, '#2a2e50');
	// Warsaw Spire: a curved glass slab with a slanted crown and a needle.
	for (let x = 312; x < 327; x++) {
		const top = 58 + Math.round((x - 312) * 0.55);
		px(g, x, top, 1, DECK - top, MID);
		px(g, x, top, 1, 1, '#4a5a90');
		for (let y = top + 2; y < DECK - 1; y += 2)
			if (x % 2 === 0 && R() < 0.4) px(g, x, y, 1, 1, rgba(GLASS[(R() * 3) | 0], 0.55));
	}
	px(g, 312, 48, 1, 10, '#2a2e50');
	// A flat modern bridge over the Vistula, streetlamps all along it.
	bridge(g, R, {
		deck: '#2a2c3a',
		top: '#4a4c5e',
		speck: '#1e2030',
		pier: '#22242e',
		arches: false,
		water: '#070a18'
	});
	g.globalCompositeOperation = 'lighter';
	for (let x = 134; x < X1; x += 14) glow(g, x + 0.5, DECK - 4, 4, '#ffd08a', 0.35);
	g.globalCompositeOperation = 'source-over';
	for (let x = 134; x < X1; x += 14) {
		px(g, x, DECK - 4, 1, 4, '#3a3c4a');
		px(g, x - 1, DECK - 5, 3, 1, '#ffd08a');
	}
	reflections(g, R, ['#ffd08a', '#9fd8ff']);
}

function live(g: Ctx, t: number, cycle: number, on: boolean) {
	twinkle(g, STARS, t);
	// The palace is floodlit in a new colour every four bars, the light pulsing on the beat.
	const col = FLOOD[Math.floor(cycle / 4) % FLOOD.length];
	const pulse = on ? 0.12 + 0.1 * Math.exp(-((cycle * 4) % 1) * 5) : 0.1;
	let below = DECK;
	g.fillStyle = rgba(col, pulse);
	for (const [hw, top] of TIERS) {
		g.fillRect(PKIN - hw, top, hw * 2 + 1, below - top);
		below = top;
	}
	blink(g, PKIN, 26, cycle % 1 < 0.5 || !on);
	blink(g, VARSO, 22, t % 1.9 < 0.7);
	blink(g, 312, 47, (t + 0.6) % 2.2 < 0.7);
	plane(g, t);
	clipped(g, () => {
		crossing(g, t, {
			cars: 3,
			len: 12,
			body: '#d4a018',
			roof: '#e8c040',
			skirt: '#9a1a22',
			stripe: '#c41e2a',
			windows: '#fff0b0',
			period: 26,
			pantograph: true
		});
		shimmer(g, t, ['#ffd08a', '#9fd8ff']);
	});
}

/** The Palace of Culture's stepped silhouette. */
function sticker(g: Ctx, cx: number, top: number, ink: string) {
	px(g, cx - 10, top + 15, 21, 5, ink);
	px(g, cx - 7, top + 11, 15, 4, ink);
	px(g, cx - 4, top + 7, 9, 4, ink);
	px(g, cx - 2, top + 4, 5, 3, ink);
	px(g, cx, top, 1, 4, ink);
	px(g, cx - 12, top + 20, 25, 1, ink);
}

export const WARSAW: City = {
	id: 'warsaw',
	name: 'WARSZAWA',
	neon: [
		{ lines: ['TAŃCZ', 'DO', 'RANA'], color: '#ff3b4a' },
		{ lines: ['PRAGA', 'PO', 'ZMROKU'], color: '#eef2ff' }
	],
	banners: [
		['NOC', 'JEST', 'NASZA'],
		['WAWA', 'NIGDY', 'NIE', 'ŚPI']
	],
	plant: 'ELEKTROWNIA',
	sticker,
	paint,
	live
};
