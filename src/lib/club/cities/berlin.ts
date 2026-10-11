import { disc, line, px, rgba, rng, type Ctx } from '../draw.js';
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
import { POWER_STATION } from './berlin-room.js';

/**
 * Berlin: the Oberbaum bridge crosses the Spree with a U1 on it, the Fernsehturm and a gasometer
 * on the right, a crane, the Park Inn and the Dom on the left.
 */
const TOWER = 296;
/** The crane, the Park Inn and the Dom are drawn this far left of where their numbers say. */
const LEFT = -12;
const CRANE_TIP: [number, number] = [206 + LEFT, 56];
const PARK_INN_TOP: [number, number] = [172 + LEFT, 57];
const MOON = [166, 40];
const STARS = makeStars(77, MOON);

const SKY = [
	'#0b0622',
	'#120a2e',
	'#1b0d3a',
	'#261146',
	'#351552',
	'#481a5c',
	'#5e1f66',
	'#7a266c'
];
const MID = '#0c0620';
const RIM = '#3a2462';

function paint(g: Ctx) {
	const R = rng(23);
	sky(g, SKY);
	moon(g, MOON, '#2a1a50');
	blocks(g, R, '#2a1342', '#5a2a6a', MID, RIM);

	g.save();
	g.translate(LEFT, 0);
	// Park Inn at Alexanderplatz: a slab full of windows, an antenna on the roof.
	px(g, 166, 62, 13, DECK - 62, MID);
	px(g, 166, 62, 1, DECK - 62, RIM);
	px(g, 166, 62, 13, 1, RIM);
	px(g, 168, 59, 9, 3, MID);
	px(g, 172, PARK_INN_TOP[1] + 1, 1, 3, MID);
	for (let y = 64; y < DECK - 1; y += 2)
		for (let x = 167; x < 178; x += 2)
			if (R() < 0.4) px(g, x, y, 1, 1, rgba(R() < 0.8 ? '#ffcf6a' : '#9fd8ff', 0.75));

	// A building-site crane: lattice tower, jib, counter-jib, cab and hook.
	for (let y = 58; y < DECK; y++) {
		px(g, 157, y, 1, 1, MID);
		px(g, 160, y, 1, 1, MID);
		if (y % 3 === 0) px(g, 158, y, 2, 1, MID);
		else px(g, 157 + (y % 3), y, 1, 1, MID);
	}
	line(g, 158, 49, 158, 57, 1, MID);
	for (let x = 152; x <= CRANE_TIP[0] - LEFT; x++) {
		px(g, x, 57, 1, 1, MID);
		if (x > 160) px(g, x, 55 + (x > 190 ? 1 : 0), 1, 1, MID);
		if (x % 3 === 0 && x > 160) px(g, x, 56, 1, 1, MID);
	}
	line(g, 158, 49, 196, 55, 1, MID);
	line(g, 158, 49, 152, 55, 1, MID);
	px(g, 152, 57, 5, 3, MID);
	px(g, 160, 58, 4, 4, MID);
	px(g, 161, 59, 2, 1, '#ffcf6a');
	px(g, 192, 58, 1, 18, '#120822');
	px(g, 191, 76, 3, 2, MID);

	// Berliner Dom: the green dome with its lantern, corner towers either side.
	const D = 191;
	px(g, 182, 100, 19, DECK - 100, MID);
	px(g, 182, 100, 19, 1, RIM);
	for (const x of [182, 198]) {
		px(g, x, 95, 3, 5, MID);
		px(g, x + 1, 93, 1, 2, '#1c2a38');
	}
	px(g, D - 5, 95, 11, 5, MID);
	for (let y = -7; y <= 0; y++) {
		const hw = Math.floor(6 * Math.sqrt(1 - (y / 7.5) ** 2));
		px(g, D - hw, 95 + y, hw * 2 + 1, 1, '#1c2a38');
		px(g, D - hw, 95 + y, 1, 1, '#2e4656');
	}
	px(g, D - 1, 86, 3, 2, '#1c2a38');
	px(g, D, 83, 1, 3, '#2e4656');
	for (const x of [186, 190, 194]) px(g, x, 103, 1, 3, rgba('#ffcf6a', 0.6));
	g.restore();

	// One of the Oberbaum bridge's towers, crenellated, the other is behind RaveBot.
	const OB = 276;
	px(g, OB, 98, 7, DECK - 98, '#2a1028');
	px(g, OB, 98, 1, DECK - 98, '#3e1a38');
	for (let x = OB; x < OB + 7; x += 2) px(g, x, 96, 1, 2, '#2a1028');
	px(g, OB + 2, 92, 3, 4, '#2a1028');
	px(g, OB + 3, 88, 1, 4, '#2a1028');
	px(g, OB + 3, 101, 1, 2, '#ffb35a');
	px(g, OB + 3, 106, 1, 2, rgba('#ffb35a', 0.6));

	// Fernsehturm: shaft, sphere, antenna. The sphere catches the light from the upper left.
	px(g, TOWER - 11, 107, 23, DECK - 107, MID);
	px(g, TOWER - 11, 107, 23, 1, RIM);
	px(g, TOWER - 2, 90, 5, DECK - 90, MID);
	px(g, TOWER - 1, 64, 3, 26, MID);
	px(g, TOWER - 2, 64, 1, 48, RIM);
	px(g, TOWER - 2, 64, 5, 3, MID);
	for (let y = -7; y <= 7; y++)
		for (let x = -7; x <= 7; x++) {
			if (x * x + y * y > 52) continue;
			const v = -(x * 0.65 + y * 0.55) / 7;
			px(g, TOWER + x, 57 + y, 1, 1, v > 0.55 ? '#5a3e86' : v > 0.1 ? '#2a1a4c' : MID);
		}
	px(g, TOWER + 1, 67, 1, 23, '#4a2050');
	px(g, TOWER + 2, 90, 1, DECK - 90, '#4a2050');
	px(g, TOWER - 1, 48, 3, 2, MID);
	for (let y = 36; y < 48; y++)
		px(g, TOWER - 1, y, 3, 1, Math.floor(y / 3) % 2 ? '#4a1a2e' : '#2e2440');
	px(g, TOWER, 24, 1, 12, '#2e2440');

	// Gasometer: an empty steel cage of a gas holder.
	const GAS = 322;
	for (let x = GAS; x < X1; x += 3) px(g, x, 92, 1, DECK - 92, '#1e0f34');
	for (const y of [92, 99, 106]) px(g, GAS, y, X1 - GAS, 1, '#1e0f34');
	for (let x = GAS; x < X1 - 3; x += 6) {
		line(g, x, 92, x + 6, 99, 1, '#1e0f34');
		line(g, x + 6, 99, x, 106, 1, '#1e0f34');
	}

	// The Oberbaum's brick deck and arches over the Spree.
	bridge(g, R, {
		deck: '#3a1630',
		top: '#5a2244',
		speck: '#2a0e24',
		pier: '#2e1028',
		arches: true,
		water: '#0a0618'
	});
	reflections(g, R, ['#ff6fd8', '#ffcf6a']);
}

function live(g: Ctx, t: number, cycle: number, on: boolean) {
	twinkle(g, STARS, t);
	// The TV tower blinks on the bar, the crane and the hotel on their own.
	blink(g, TOWER, 23, cycle % 1 < 0.5 || !on);
	blink(g, ...CRANE_TIP, t % 1.7 < 0.6);
	blink(g, ...PARK_INN_TOP, (t + 0.8) % 2.3 < 0.7);
	// The sphere's window band turns slowly.
	for (let x = -6; x <= 6; x++) {
		const lit = (x + 13 + Math.floor(t * 2)) % 5 < 3;
		px(g, TOWER + x, 59, 1, 1, lit ? rgba('#ffb0e0', 0.8 - Math.abs(x) * 0.08) : '#22123a');
	}
	plane(g, t);
	clipped(g, () => {
		crossing(g, t, {
			cars: 2,
			len: 22,
			body: '#b8841a',
			roof: '#6e4c10',
			skirt: '#3a2410',
			windows: '#fff0b0',
			period: 20
		});
		shimmer(g, t, ['#ffcf6a', '#ff6fd8']);
	});
}

/** The Fernsehturm over a few blocks. */
function sticker(g: Ctx, cx: number, top: number, ink: string) {
	px(g, cx - 1, top + 4, 2, 16, ink);
	disc(g, cx, top + 9, 2, ink);
	px(g, cx, top + 1, 1, 4, ink);
	for (const [x, h] of [
		[-11, 4],
		[-7, 7],
		[3, 6],
		[7, 3]
	])
		px(g, cx + x, top + 20 - h, 4, h, ink);
	px(g, cx - 12, top + 20, 24, 1, ink);
}

export const BERLIN: City = {
	id: 'berlin',
	name: 'BERLIN',
	neon: [
		{ lines: ['BERLIN', 'BRENNT', 'BESSER'], color: '#ff3dc8' },
		{ lines: ['ALTE', 'MAUERN', 'NEUE', 'FREIHEIT'], color: '#56c8ff' }
	],
	banners: [
		['TECHNO', 'PEOPLE', 'BETTER', 'HUMANS'],
		['BERLIN', 'NEVER', 'SLEEPS']
	],
	room: POWER_STATION,
	sticker,
	paint,
	live
};
