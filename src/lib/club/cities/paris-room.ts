import { disc, ell, hash, line, px, rgba, rng, type Ctx, type Pt } from '../draw.js';
import { text, textC } from '../font.js';
import { fireExit, paintWalls, warm, type Room, type RoomFrame } from './room.js';

/**
 * Paris's club is Art Nouveau: dressed stone, white Métro tiles in the bays, green cast iron, a
 * glass roof and wrought-iron balconies. A Guimard Métro entrance opens under the left balconies
 * and a café terrace sits under the right ones; its string lights chase the beat.
 */
const IRON = ['#3a6a4e', '#1c3a2c', '#10241a'];
const GLOBES: Pt[] = [
	[21, 151],
	[83, 151]
];
const CAFE = { x: 380, w: 64 };
const BULBS = Array.from({ length: 11 }, (_, k) => CAFE.x + 2 + k * 6);
const sag = (x: number) => 150 + Math.round(Math.sin(((x - CAFE.x) / CAFE.w) * Math.PI) * 3);

function stone(g: Ctx, R: () => number, x: number, y: number, w: number, h: number) {
	px(g, x, y, w, h, '#16121c');
	for (let yy = y, row = 0; yy < y + h; yy += 7, row++)
		for (let xx = x - (row % 2) * 7; xx < x + w; xx += 14) {
			const x0 = Math.max(x, xx);
			const x1 = Math.min(x + w, xx + 13);
			if (x1 <= x0) continue;
			px(
				g,
				x0,
				yy,
				x1 - x0,
				Math.min(6, y + h - yy),
				['#221e2a', '#26212e', '#1f1b27'][(R() * 3) | 0]
			);
			px(g, x0, yy, x1 - x0, 1, '#2a2533');
		}
}

function paint(g: Ctx) {
	const R = rng(29);
	paintWalls(g, {
		wall: (g, x, y, w, h) => stone(g, R, x, y, w, h),
		bay: (g, x, y, w, h) => {
			// Bevelled Métro tiles under an ochre frieze.
			px(g, x, y, w, h, '#16141e');
			for (let yy = y; yy < y + h; yy += 3)
				for (let xx = x - ((yy / 3) % 2) * 2; xx < x + w; xx += 5) {
					const x0 = Math.max(x, xx);
					const x1 = Math.min(x + w, xx + 4);
					if (x1 <= x0) continue;
					px(g, x0, yy, x1 - x0, 2, '#2a2734');
					px(g, x0, yy, x1 - x0, 1, '#36323f');
				}
			px(g, x, y + 3, w, 2, '#4a3c28');
			px(g, x, y + 3, w, 1, '#6a5636');
		},
		column: (g, x, top, h) => {
			// Guimard cast iron: a slim stem that flares like a plant at both ends.
			px(g, x + 1, top, 3, h, IRON[1]);
			px(g, x + 1, top, 1, h, IRON[0]);
			px(g, x + 3, top, 1, h, IRON[2]);
			px(g, x - 1, top, 7, 1, IRON[1]);
			px(g, x, top + 1, 5, 1, IRON[0]);
			px(g, x - 1, top + 2, 1, 1, IRON[1]);
			px(g, x + 5, top + 2, 1, 1, IRON[1]);
			px(g, x, top + h - 2, 5, 2, IRON[1]);
		},
		fixture: (g, x, top, clear) => {
			if (!clear) return;
			// A wall sconce: a curling iron arm holding an amber tulip.
			const y = top + 12;
			px(g, x, y - 4, 1, 3, IRON[1]);
			px(g, x + 1, y - 5, 1, 1, IRON[1]);
			px(g, x - 1, y - 1, 3, 1, IRON[0]);
			px(g, x - 1, y, 3, 3, '#ff9a3a');
			px(g, x - 1, y, 1, 3, '#ffd08a');
			px(g, x, y + 3, 1, 1, '#c86a2a');
			warm(g, x + 0.5, y + 1.5, 13, 0.22);
		},
		ceiling: (g, x0, x1) => {
			// A glass roof on iron ribs, the night showing through.
			const w = x1 - x0;
			px(g, x0, 0, w, 12, '#0c1026');
			px(g, x0, 0, w, 4, '#141a36');
			for (let x = x0 + 4; x < x1; x += 8) px(g, x, 0, 1, 10, '#1e2a36');
			px(g, x0, 4, w, 1, '#1e2a36');
			px(g, x0, 9, w, 3, '#1a2430');
			px(g, x0, 9, w, 1, '#34465a');
			for (let x = x0 + 2; x < x1; x += 4) px(g, x, 10, 2, 1, '#0c1018');
		},
		pendant: (g, x) => {
			// An opal globe on a chain.
			for (let y = 10; y < 13; y++) px(g, x, y, 1, 1, y % 2 ? '#2a2a34' : '#4a4a54');
			disc(g, x, 15, 2, '#e8d4b0');
			px(g, x - 1, 14, 1, 1, '#fff4dc');
			warm(g, x + 0.5, 15, 15, 0.26, '#ffc87a');
		},
		slab: (g, x0, x1, ty) => {
			// A carved stone balcony slab with a row of dentils.
			px(g, x0, ty, x1 - x0, 4, '#3a3240');
			px(g, x0, ty, x1 - x0, 1, '#5a5064');
			for (let x = x0; x < x1; x += 3) px(g, x, ty + 2, 2, 1, '#2a2430');
			px(g, x0, ty + 4, x1 - x0, 2, '#0a080e');
		}
	});
	metro(g);
	cafe(g);
	fireExit(g);
}

/** Left: a Guimard Métro entrance: stairs going down, iron balustrades, two lamp stalks, the sign. */
function metro(g: Ctx) {
	// Stairs into the dark.
	px(g, 24, 166, 56, 21, '#06040a');
	for (let k = 0; k < 6; k++)
		px(g, 24 + k * 2, 168 + k * 3, 56 - k * 4, 1, rgba('#3a3448', 1 - k * 0.15));
	// Balustrades either side, iron panels with the Guimard shield.
	for (const x0 of [10, 80]) {
		px(g, x0, 168, 14, 1, IRON[0]);
		px(g, x0, 169, 14, 1, IRON[1]);
		px(g, x0, 168, 1, 19, IRON[1]);
		px(g, x0 + 13, 168, 1, 19, IRON[1]);
		ell(g, x0 + 7, 176, 3, 4, IRON[1]);
		ell(g, x0 + 7, 176, 2, 3, '#0a1410');
		px(g, x0 + 7, 172, 1, 9, IRON[0]);
	}
	// The two stalks rise, curl in and carry the lamps; the sign hangs between them.
	for (const [x, dir] of [
		[21, 1],
		[83, -1]
	]) {
		px(g, x, 154, 2, 33, IRON[1]);
		px(g, x, 154, 1, 33, IRON[0]);
		line(g, x + dir * 2, 160, x + dir * 5, 156, 1, IRON[1]);
	}
	px(g, 25, 154, 55, 9, '#1c3a2c');
	px(g, 26, 155, 53, 7, '#b89a58');
	px(g, 26, 155, 53, 1, '#d8bc78');
	textC(g, 'METROPOLITAIN', 52, 156, '#1c3a2c');
	warm(g, 52, 158, 24, 0.12, '#ffd890');
	for (const [x, y] of GLOBES) {
		px(g, x - 1, y - 3, 4, 5, '#2a0e08');
		px(g, x, y - 3, 2, 5, '#8a2a14');
	}
}

/** Right: a café front with its striped awning, a lit window and bistro tables outside. */
function cafe(g: Ctx) {
	const { x, w } = CAFE;
	// The window, warm inside, shelves and bottles behind the glass.
	px(g, x + 2, 159, w - 4, 21, '#2a1810');
	px(g, x + 4, 161, w - 8, 17, '#4a2e18');
	g.globalCompositeOperation = 'lighter';
	const gr = g.createLinearGradient(0, 161, 0, 178);
	gr.addColorStop(0, 'rgba(255,170,80,.1)');
	gr.addColorStop(1, 'rgba(255,170,80,.25)');
	g.fillStyle = gr;
	g.fillRect(x + 4, 161, w - 8, 17);
	g.globalCompositeOperation = 'source-over';
	for (let xx = x + 6; xx < x + w - 6; xx += 3)
		px(g, xx, 168, 1, 3, ['#2f5a3e', '#8a5a2a', '#6a2a3a'][xx % 3]);
	px(g, x + 4, 171, w - 8, 1, '#2a1810');
	for (const xx of [x + 22, x + 42]) px(g, xx, 161, 1, 17, '#2a1810');
	text(g, 'CAFÉ', x + 25, 163, '#d8b060');
	// The awning: red and cream stripes, a scalloped edge.
	for (let xx = x; xx < x + w; xx++) {
		const red = Math.floor((xx - x) / 4) % 2 === 0;
		px(g, xx, 151, 1, 6, red ? '#6a1820' : '#9a8e7a');
		px(g, xx, 151, 1, 1, red ? '#8a2a30' : '#b8ac96');
		if ((xx - x) % 4 !== 0 && (xx - x) % 4 !== 3) px(g, xx, 157, 1, 1, red ? '#6a1820' : '#9a8e7a');
	}
	// Bistro tables and bentwood chairs on the terrace.
	for (const tx of [x + 14, x + 46]) {
		px(g, tx - 4, 177, 9, 1, '#3a3440');
		px(g, tx, 178, 1, 7, '#1a1620');
		px(g, tx - 2, 185, 5, 1, '#1a1620');
		for (const d of [-8, 7]) {
			px(g, tx + d, 172, 2, 1, '#1a1216');
			px(g, tx + d + (d < 0 ? 0 : 1), 172, 1, 8, '#1a1216');
			px(g, tx + d - 1, 179, 4, 1, '#1a1216');
			px(g, tx + d - 1, 180, 1, 6, '#1a1216');
			px(g, tx + d + 2, 180, 1, 6, '#1a1216');
		}
	}
	// The string of bulbs over the awning.
	for (let xx = x; xx < x + w; xx++) px(g, xx, sag(xx) - 1, 1, 1, '#1a1418');
}

function railing(g: Ctx, x0: number, x1: number, ty: number) {
	// Haussmann wrought iron: balusters with a ring between each pair, rails top and bottom.
	px(g, x0, ty - 5, x1 - x0, 1, '#3a3c4a');
	px(g, x0, ty - 1, x1 - x0, 1, '#1a1c24');
	for (let x = x0; x < x1; x++) {
		const m = (x - x0) % 6;
		if (m === 0) px(g, x, ty - 4, 1, 3, '#1a1c24');
		if (m === 3) {
			px(g, x, ty - 4, 1, 1, '#1a1c24');
			px(g, x, ty - 2, 1, 1, '#1a1c24');
		}
		if (m === 2 || m === 4) px(g, x, ty - 3, 1, 1, '#1a1c24');
	}
}

function live(g: Ctx, { live, beat, t, E }: RoomFrame) {
	// The Métro lamps glow orange-red, brighter on the kick.
	for (const [x, y] of GLOBES) {
		const a = live ? 0.45 + 0.55 * E.kick : 0.3;
		px(g, x, y - 3, 2, 5, rgba('#ff5a2a', a));
		px(g, x, y - 2, 1, 2, rgba('#ffc890', a));
		warm(g, x + 1, y - 1, 8, 0.35 * a, '#ff5a2a');
	}
	// The café's bulbs chase along the string on the beat; a few just twinkle.
	const step = Math.floor(beat * 2);
	BULBS.forEach((x, k) => {
		const lit = live ? (k + step) % 4 === 0 || hash(k, Math.floor(t * 3)) > 0.7 : k % 2 === 0;
		const y = sag(x);
		px(g, x, y, 1, 1, lit ? '#fff0b0' : '#7a6a40');
		if (lit) warm(g, x + 0.5, y + 0.5, 4, 0.4, '#ffd890');
	});
}

export const BELLE_EPOQUE: Room = { paint, railing, live };
