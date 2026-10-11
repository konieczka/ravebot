import {
	bayer,
	canvas,
	clamp,
	disc,
	glow,
	hash,
	line,
	px,
	ramp,
	rgba,
	rng,
	type Ctx
} from './draw.js';

/**
 * The view through the back window: Berlin at night. The Oberbaum bridge crosses the Spree on
 * the horizon with a U1 train on it, the Fernsehturm stands on the right, a crane and the Park Inn
 * on the left. RaveBot hides the middle, so the landmarks stand either side of him.
 */
export const WIN = { x: 128, y: 22, w: 224, h: 134 };
/** Left edge of the two line arrays hanging in front of the glass. */
export const LINE_ARRAYS = [130, 336];
const X1 = WIN.x + WIN.w;
/** Top of the bridge deck: the horizon. */
const DECK = 112;
/** Bottom of the visible water: the booth covers the rest. */
const WATER = 124;
const TOWER = 296;
/** The crane, the Park Inn and the Dom are drawn this far left of where their numbers say. */
const LEFT = -12;
const CRANE_TIP: [number, number] = [206 + LEFT, 56];
const PARK_INN_TOP: [number, number] = [172 + LEFT, 57];

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
const FAR = '#2a1342';
const MID = '#0c0620';
const RIM = '#3a2462';
const WARM = ['#ffcf6a', '#ffe6a8', '#ffb35a', '#9fd8ff', '#ff9fd8'];

const MOON = [166, 40];
const R0 = rng(77);
const STARS = Array.from({ length: 34 }, () => ({
	x: Math.round(WIN.x + 3 + R0() * (WIN.w - 6)),
	y: Math.round(WIN.y + 2 + R0() * 58),
	b: R0()
})).filter((s) => Math.hypot(s.x - MOON[0], s.y - MOON[1]) > 10);

function windows(g: Ctx, R: () => number, x: number, y: number, w: number, h: number, p: number) {
	for (let yy = y + 1; yy < y + h - 1; yy += 2)
		for (let xx = x + 1; xx < x + w - 1; xx += 2)
			if (R() < p) px(g, xx, yy, 1, 1, R() < 0.8 ? rgba(WARM[(R() * 3) | 0], 0.75) : WARM[3]);
}

/** Paints the static city into the background canvas. */
export function paintBerlin(g: Ctx) {
	const R = rng(23);
	const { x: X0, y: Y0, w } = WIN;

	// Night sky, glowing pink over the city.
	ramp(g, X0, Y0, w, DECK - Y0, SKY, (y) => ((y - Y0) / (DECK - Y0)) ** 1.15);

	// Moon with a dithered halo.
	const [mx, my] = MOON;
	for (let y = -10; y <= 10; y++)
		for (let x = -10; x <= 10; x++) {
			const d = Math.hypot(x, y);
			if (d > 5 && d < 10 && (10 - d) / 5 > bayer(mx + x, my + y) + 0.3)
				px(g, mx + x, my + y, 1, 1, '#2a1a50');
		}
	disc(g, mx, my, 5, '#ddd2f6');
	for (let y = -5; y <= 5; y++)
		for (let x = -5; x <= 5; x++)
			if (x * x + y * y <= 27 && x + y > 3) px(g, mx + x, my + y, 1, 1, '#b4a6e0');
	px(g, mx - 2, my - 2, 2, 1, '#c2b4e8');
	px(g, mx + 1, my + 1, 1, 1, '#c2b4e8');
	px(g, mx - 1, my + 2, 1, 1, '#c2b4e8');

	// Far skyline, hazy in the glow.
	for (let x = X0; x < X1;) {
		const bw = 4 + ((R() * 6) | 0);
		const h = 4 + ((R() * 13) | 0);
		px(g, x, DECK - h, bw, h, FAR);
		if (R() < 0.3) px(g, x + 1, DECK - h - 3, 1, 3, FAR);
		for (let k = 0; k < (bw * h) / 10; k++)
			if (R() < 0.5) px(g, x + R() * bw, DECK - h + 1 + R() * (h - 2), 1, 1, '#5a2a6a');
		x += bw;
	}

	// Nearer blocks with lit windows.
	for (let x = X0; x < X1;) {
		const bw = 6 + ((R() * 9) | 0);
		const h = 5 + ((R() * 10) | 0);
		if (R() < 0.75) {
			px(g, x, DECK - h, bw, h, MID);
			px(g, x, DECK - h, bw, 1, RIM);
			windows(g, R, x, DECK - h, bw, h, 0.25);
		}
		x += bw + ((R() * 4) | 0);
	}

	g.save();
	g.translate(LEFT, 0);
	// Park Inn at Alexanderplatz: a slab full of windows, an antenna on the roof.
	px(g, 166, 62, 13, DECK - 62, MID);
	px(g, 166, 62, 1, DECK - 62, RIM);
	px(g, 166, 62, 13, 1, RIM);
	px(g, 168, 59, 9, 3, MID);
	px(g, 172, PARK_INN_TOP[1] + 1, 1, 3, MID);
	windows(g, R, 166, 63, 13, DECK - 63, 0.4);

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

	// The bridge: brick deck over the Spree, arches between the piers.
	px(g, X0, DECK, w, 4, '#3a1630');
	px(g, X0, DECK, w, 1, '#5a2244');
	for (let k = 0; k < w * 1.2; k++)
		px(g, X0 + R() * w, DECK + 1 + R() * 3, 1, 1, R() < 0.6 ? '#2a0e24' : '#4a1c3a');
	for (let x = X0; x < X1; x += 4) px(g, x, DECK - 2, 1, 2, '#2a1028');
	px(g, X0, DECK - 2, w, 1, '#2a1028');
	px(g, X0, DECK + 4, w, WATER + 40 - DECK, '#0a0618');
	for (let x = X0; x < X1; x++) {
		const u = (((x - X0 + 11) % 22) - 11) / 11;
		const top = DECK + 4 + Math.round(6 * (1 - Math.sqrt(Math.max(0, 1 - u * u))));
		px(g, x, DECK + 4, 1, top - DECK - 4, '#2e1028');
		if (Math.abs(u) > 0.82) px(g, x, top, 1, 40, '#2e1028');
		else px(g, x, top, 1, 1, '#1a0818');
	}
	// Still reflections of the city in the water.
	for (let k = 0; k < 60; k++) {
		const x = X0 + R() * w;
		const y = DECK + 8 + R() * (WATER - DECK - 6);
		px(g, x, y, 1 + R() * 3, 1, rgba(R() < 0.5 ? '#ff6fd8' : '#ffcf6a', 0.2));
	}
}

/** The window's steel frame and glass, laid over the city and the train. */
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

/** What moves out there: stars, warning lights, a plane, the U1 crossing the bridge, the river. */
export function berlinLive(g: Ctx, t: number, cycle: number, live: boolean) {
	for (const s of STARS) {
		const a = 0.25 + 0.6 * s.b * (0.5 + 0.5 * Math.sin(t * (1 + s.b * 2) + s.x));
		px(g, s.x, s.y, 1, 1, rgba('#efe6ff', clamp(a, 0, 1)));
	}

	// Aviation warning lights: the TV tower blinks on the bar, the crane and the hotel on their own.
	const blink = (x: number, y: number, on: boolean) => {
		if (!on) return;
		px(g, x, y, 1, 1, '#ff3a3a');
		g.globalCompositeOperation = 'lighter';
		glow(g, x + 0.5, y + 0.5, 3, '#ff2a2a', 0.5);
		g.globalCompositeOperation = 'source-over';
	};
	blink(TOWER, 23, cycle % 1 < 0.5 || !live);
	blink(...CRANE_TIP, t % 1.7 < 0.6);
	blink(...PARK_INN_TOP, (t + 0.8) % 2.3 < 0.7);

	// The sphere's window band turns slowly.
	for (let x = -6; x <= 6; x++) {
		const lit = (x + 13 + Math.floor(t * 2)) % 5 < 3;
		px(g, TOWER + x, 59, 1, 1, lit ? rgba('#ffb0e0', 0.8 - Math.abs(x) * 0.08) : '#22123a');
	}

	// A plane crossing high up every 40 seconds.
	const p = (t % 40) / 16;
	if (p < 1) {
		const x = 152 + p * 180;
		const y = 30 - p * 6;
		px(g, x, y, 1, 1, Math.floor(t * 2) % 2 ? '#ff4a4a' : '#ffffff');
	}

	g.save();
	g.beginPath();
	g.rect(WIN.x, WIN.y, WIN.w, WIN.h);
	g.clip();

	// The U1 crosses the bridge every 20 seconds.
	const tx = WIN.x - 48 + ((t % 20) / 20) * 520;
	for (let car = 0; car < 2; car++) {
		const x = Math.round(tx + car * 23);
		px(g, x, DECK - 6, 22, 5, '#b8841a');
		px(g, x + 1, DECK - 7, 20, 1, '#6e4c10');
		px(g, x, DECK - 2, 22, 1, '#3a2410');
		for (let k = 0; k < 9; k++) px(g, x + 2 + k * 2, DECK - 5, 1, 2, '#fff0b0');
		px(g, x + 21, DECK - 6, 1, 4, '#5a3c0c');
	}
	const front = Math.round(tx + 45);
	px(g, front, DECK - 3, 1, 1, '#ffffff');
	g.globalCompositeOperation = 'lighter';
	glow(g, front + 2, DECK - 3, 6, '#fff0b0', 0.35);
	g.globalCompositeOperation = 'source-over';

	// Light dancing on the Spree under the arches.
	for (let y = DECK + 8; y < WATER; y++)
		for (let x = WIN.x; x < WIN.x + WIN.w; x += 2) {
			const n = hash(Math.floor(x / 3), y + Math.floor(t * 3));
			if (n > 0.9) px(g, x, y, 2, 1, rgba(n > 0.96 ? '#ffcf6a' : '#ff6fd8', 0.45));
		}
	g.restore();
}
