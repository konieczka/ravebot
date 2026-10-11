import type { LayerName } from '#lib/dj/types.js';
import { bayer, disc, ell, hash, line, px, rgba, rng, type Ctx, type Pt } from '../draw.js';
import { text } from '../font.js';
import { fireExit, needle, paintWalls, warm, type Room, type RoomFrame } from './room.js';

/**
 * Warsaw's club is a red-brick distillery in Praga: arched factory windows, cast-iron columns and
 * enamel lamps. A copper still and its barrels stand under the left balconies; under the right
 * ones, old neon signs rescued from the city light up with the music.
 */
const STILL: Pt = [32, 174];
const COLUMN = { x: 62, w: 12 };
const SIGHT = { x: 66, y: 165, w: 4, h: 12 };
const GAUGE: Pt = [68, 158];

/** The neon signs: where they hang, their colour and the layer that lights them. */
interface Sign {
	draw(g: Ctx, color: string): void;
	color: string;
	layer: LayerName;
}
const SIGNS: Sign[] = [
	{ draw: (g, c) => text(g, 'KINO', 383, 151, c, 2), color: '#ff3b4a', layer: 'kick' },
	{
		draw: (g, c) => {
			text(g, 'MLECZNY', 383, 167, c);
			text(g, 'BAR', 383, 174, c);
		},
		color: '#7ad8ff',
		layer: 'hats'
	},
	{
		// A cup of coffee with steam over it.
		draw: (g, c) => {
			for (const [x, y, w, h] of [
				[421, 165, 1, 6],
				[431, 165, 1, 6],
				[421, 165, 11, 1],
				[422, 171, 9, 1],
				[432, 166, 3, 1],
				[434, 167, 1, 2],
				[432, 169, 3, 1],
				[419, 173, 15, 1],
				[424, 160, 1, 3],
				[427, 159, 1, 3]
			])
				px(g, x, y, w, h, c);
			text(g, 'KAWA', 419, 176, c);
		},
		color: '#ffb03b',
		layer: 'vox'
	}
];

const BRICK = ['#2e1216', '#36161a', '#3e1a1c', '#2a1014'];
const BAY_BRICK = ['#200b0e', '#260d10', '#2c1013', '#1e0a0d'];

function brick(
	g: Ctx,
	R: () => number,
	x: number,
	y: number,
	w: number,
	h: number,
	cols: string[],
	mortar: string
) {
	px(g, x, y, w, h, mortar);
	for (let yy = y, row = 0; yy < y + h; yy += 3, row++)
		for (let xx = x - (row % 2) * 3; xx < x + w; xx += 6) {
			const x0 = Math.max(x, xx);
			const x1 = Math.min(x + w, xx + 5);
			if (x1 > x0) px(g, x0, yy, x1 - x0, Math.min(2, y + h - yy), cols[(R() * cols.length) | 0]);
		}
}

function paint(g: Ctx) {
	const R = rng(19);
	paintWalls(g, {
		wall: (g, x, y, w, h) => brick(g, R, x, y, w, h, BRICK, '#160a0e'),
		bay: (g, x, y, w, h) => {
			brick(g, R, x, y, w, h, BAY_BRICK, '#12070a');
			px(g, x, y + h - 1, w, 1, '#0c0507');
		},
		column: (g, x, top, h) => {
			// Cast iron: a round shaft between a capital and a base.
			px(g, x + 1, top, 3, h, '#1c2422');
			px(g, x + 1, top, 1, h, '#3a4a46');
			px(g, x + 3, top, 1, h, '#121816');
			px(g, x, top, 5, 2, '#2a3632');
			px(g, x, top, 5, 1, '#4a5a54');
			px(g, x, top + h - 2, 5, 2, '#2a3632');
		},
		fixture: (g, x, top, clear) => {
			if (!clear) return;
			// An arched factory window with the night outside, under a brick arch.
			const [wx, wy, ww, wh] = [x - 6, top + 7, 13, 24];
			for (let yy = 0; yy < wh; yy++) {
				const u = yy < 6 ? Math.sqrt(1 - ((6 - yy) / 6.5) ** 2) : 1;
				const hw = Math.round(6.5 * u);
				for (let xx = -hw; xx <= hw; xx++) {
					const v = yy / wh;
					px(g, x + xx, wy + yy, 1, 1, v > bayer(x + xx, wy + yy) * 1.4 ? '#18224a' : '#0e1434');
				}
				px(g, x - hw - 1, wy + yy, 1, 1, '#4a2024');
				px(g, x + hw + 1, wy + yy, 1, 1, '#4a2024');
			}
			for (let xx = -3; xx <= 3; xx++) px(g, x + xx, wy - 1, 1, 1, '#4a2024');
			px(g, x, wy + 1, 1, wh - 1, '#1a1214');
			for (let yy = wy + 7; yy < wy + wh; yy += 6) px(g, wx + 1, yy, ww - 2, 1, '#1a1214');
			px(g, wx - 1, wy + wh, ww + 2, 1, '#4a3434');
			warm(g, x + 0.5, wy + wh - 6, 12, 0.08, '#6a8aff');
		},
		ceiling: (g, x0, x1) => {
			// Klein vaults: shallow brick arches between steel beams.
			px(g, x0, 0, x1 - x0, 12, '#0a0608');
			for (let x = x0; x < x1; x++) {
				const u = ((x - x0) % 16) / 16;
				const low = 8 - Math.round(4 * Math.sin(Math.PI * u));
				for (let y = 0; y < low; y++)
					px(g, x, y, 1, 1, (y + (Math.floor((x - x0) / 3) % 2)) % 3 ? '#2a1014' : '#1a090c');
				if ((x - x0) % 16 < 2) px(g, x, 0, 1, 9, '#1c1c22');
			}
			px(g, x0, 9, x1 - x0, 3, '#2a1a1c');
			px(g, x0, 9, x1 - x0, 1, '#4a2e2c');
			for (let x = x0 + 3; x < x1; x += 6) px(g, x, 10, 1, 1, '#5a3a34');
		},
		pendant: (g, x) => {
			// A green enamel factory shade, white inside.
			px(g, x, 10, 1, 2, '#1a1416');
			px(g, x - 1, 12, 3, 1, '#24483a');
			px(g, x - 2, 13, 5, 1, '#2e5a44');
			px(g, x - 3, 14, 7, 1, '#2e5a44');
			px(g, x - 3, 15, 7, 1, '#b8b4a8');
			px(g, x, 15, 1, 1, '#ffe0a0');
			warm(g, x + 0.5, 17, 14, 0.24);
		},
		slab: (g, x0, x1, ty) => {
			px(g, x0, ty, x1 - x0, 4, '#3a1a1c');
			px(g, x0, ty, x1 - x0, 1, '#5a2a2c');
			for (let x = x0 + 3; x < x1; x += 6) px(g, x, ty + 2, 1, 1, '#6a3a34');
			px(g, x0, ty + 4, x1 - x0, 2, '#0a0406');
		}
	});
	still(g);
	barrels(g);
	neonWall(g);
	fireExit(g);
}

/** Left: the copper pot still on its firebox, the column with a sight glass, a brass plaque. */
function still(g: Ctx) {
	px(g, 10, 149, 42, 7, '#160c0e');
	px(g, 10, 149, 42, 1, '#3a2a24');
	text(g, 'GORZELNIA', 14, 150, '#8a7040');

	// Firebox.
	px(g, 14, 181, 36, 6, '#2a1012');
	px(g, 14, 181, 36, 1, '#4a2024');
	px(g, 27, 183, 10, 3, '#0c0406');
	// The pot: copper, lit from the upper left, with a riveted seam.
	const [cx, cy] = STILL;
	for (let y = -10; y <= 8; y++)
		for (let x = -15; x <= 15; x++) {
			const d = (x / 15) ** 2 + (y / 10) ** 2;
			if (d > 1) continue;
			const v = -(x * 0.6 + y * 0.8) / 12 + (1 - d) * 0.4;
			px(
				g,
				cx + x,
				cy + y,
				1,
				1,
				v > 0.75 ? '#e8a060' : v > 0.35 ? '#a86434' : v > 0 ? '#7e4422' : '#4e2614'
			);
		}
	for (let x = -14; x <= 14; x += 3) px(g, cx + x, cy + 1, 1, 1, '#c88850');
	// Neck, helmet and the swan-neck pipe over to the column.
	px(g, cx - 2, 156, 5, 9, '#7e4422');
	px(g, cx - 2, 156, 2, 9, '#a86434');
	ell(g, cx, 155, 4, 2, '#a86434');
	px(g, cx - 2, 154, 2, 1, '#e8a060');
	line(g, cx + 3, 154, COLUMN.x, 159, 2, '#7e4422');
	line(g, cx + 3, 153, COLUMN.x, 158, 1, '#c88850');

	// The column: copper rings, a sight glass and a gauge.
	const { x, w } = COLUMN;
	for (let y = 153; y < 187; y++) {
		px(g, x, y, w, 1, y % 5 === 0 ? '#4e2614' : '#7e4422');
		px(g, x + 1, y, 3, 1, y % 5 === 0 ? '#7e4422' : '#a86434');
	}
	ell(g, x + w / 2, 152, w / 2, 2, '#a86434');
	px(g, SIGHT.x - 1, SIGHT.y - 1, SIGHT.w + 2, SIGHT.h + 2, '#c8a050');
	px(g, SIGHT.x, SIGHT.y, SIGHT.w, SIGHT.h, '#100c14');
	disc(g, GAUGE[0], GAUGE[1], 3, '#2a1a12');
	disc(g, GAUGE[0], GAUGE[1], 2, '#bdb59a');
}

/** Oak barrels stacked beside the column. */
function barrels(g: Ctx) {
	for (const [x, y] of [
		[84, 180],
		[97, 180],
		[90, 168]
	]) {
		disc(g, x, y, 6, '#3a2216');
		disc(g, x, y, 5, '#4e2e1c');
		for (let k = -4; k <= 4; k += 2) px(g, x + k, y - 4, 1, 9, '#40261a');
		disc(g, x, y, 1, '#2a1a12');
		// Iron hoop round the head.
		for (let a = 0; a < 24; a++) {
			const t = (a / 24) * Math.PI * 2;
			px(g, x + Math.cos(t) * 6, y + Math.sin(t) * 6, 1, 1, '#3a3a44');
		}
	}
}

/** Right: the unlit glass of the old neon signs, on mounting boards. */
function neonWall(g: Ctx) {
	for (const [x, y, w, h] of [
		[380, 149, 36, 14],
		[380, 165, 32, 15],
		[416, 157, 22, 25]
	]) {
		px(g, x, y, w, h, '#120a0e');
		px(g, x, y, w, 1, '#2a1a1e');
		px(g, x + 1, y + 1, 1, 1, '#4a3a3a');
		px(g, x + w - 2, y + 1, 1, 1, '#4a3a3a');
	}
	for (const s of SIGNS) s.draw(g, '#3a2228');
}

function railing(g: Ctx, x0: number, x1: number, ty: number) {
	px(g, x0, ty - 5, x1 - x0, 1, '#3a343c');
	px(g, x0, ty - 2, x1 - x0, 1, '#24202a');
	for (let x = x0 + 1; x < x1; x += 4) px(g, x, ty - 5, 1, 5, '#24202a');
}

function live(g: Ctx, { live, t, E, sm }: RoomFrame) {
	// The firebox breathes with the bass.
	const fire = live ? 0.4 + 0.6 * E.bass : 0.25;
	px(g, 27, 183, 10, 3, rgba('#ff7a2a', fire));
	px(g, 29, 184, 6, 1, rgba('#ffd060', fire));
	warm(g, 32, 184, 10, 0.35 * fire, '#ff7a2a');

	// Spirit in the sight glass, bubbling faster when the kick is in.
	const { x, y, w, h } = SIGHT;
	px(g, x, y + 4, w, h - 4, rgba('#c8e8ff', 0.35));
	if (live)
		for (let k = 0; k < 4; k++) {
			const p = (t * (4 + 8 * sm.kick) + k * 2.7) % (h - 4);
			px(g, x + (k % w), y + h - 1 - p, 1, 1, rgba('#ffffff', 0.5 + 0.5 * E.kick));
		}
	needle(g, GAUGE[0], GAUGE[1], 2, live ? 0.3 + 0.6 * sm.bass : 0.05, '#1a1410');

	// A puff from the helmet on the kick.
	if (live && E.kick > 0.3)
		for (let k = 0; k < 5; k++) {
			const sx = STILL[0] + (hash(k, Math.floor(t * 10)) - 0.5) * 4;
			px(g, sx, 151 - k * 1.5, 1, 1, rgba('#e8e4f0', E.kick * (1 - k / 5) * 0.6));
		}

	// The neon signs, each lit by its own part of the music, flickering like old glass does.
	for (const [n, s] of SIGNS.entries()) {
		const level = live ? 0.25 + 0.75 * E[s.layer] : 0.12;
		const flicker = hash(Math.floor(t * 14), n + 5) > 0.95 ? 0.3 : 1;
		const a = level * flicker;
		g.globalCompositeOperation = 'lighter';
		g.globalAlpha = a * 0.35;
		for (const [dx, dy] of [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1]
		]) {
			g.save();
			g.translate(dx, dy);
			s.draw(g, s.color);
			g.restore();
		}
		g.globalAlpha = 1;
		g.globalCompositeOperation = 'source-over';
		g.globalAlpha = Math.min(1, a + 0.15);
		s.draw(g, a > 0.6 ? '#fff0f4' : s.color);
		g.globalAlpha = 1;
	}
}

export const DISTILLERY: Room = { paint, railing, live };
