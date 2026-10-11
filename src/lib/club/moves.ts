import type { SectionKind } from '#lib/dj/arrangement.js';

/**
 * RaveBot's choreography. Every 4-bar phrase he picks a move that suits the section, the track's
 * intensity and the energy setting; within the move, every limb follows the beat. This module only
 * says where things should be: the scene eases the arms towards these targets, so moves blend.
 */

export type Move =
	| 'idle'
	| 'groove'
	| 'deepNod'
	| 'tweak'
	| 'scratch'
	| 'pointCrowd'
	| 'pump'
	| 'wave'
	| 'roof'
	| 'headbang'
	| 'clap'
	| 'sway'
	| 'reach'
	| 'drop'
	| 'cue'
	| 'mixEq';

export type HandPose = 'flat' | 'fist' | 'point' | 'pointSide' | 'open';
export type Pt = [number, number];

export interface Arm {
	hand: Pt;
	elbow: Pt;
	pose: HandPose;
}

export interface Pose {
	move: Move;
	/** Upper body offset left/right, px. */
	sway: number;
	/** Torso dip, px. */
	bob: number;
	/** Head drop, px. */
	nod: number;
	/** Head lean left/right, px. */
	tilt: number;
	left: Arm;
	right: Arm;
	/** Extra jog rotation on deck B while scratching, radians. */
	scratch: number;
}

export interface MoveInput {
	live: boolean;
	section: SectionKind | null;
	/** Progress through the section, 0..1. */
	x: number;
	cycle: number;
	/** Smoothed kick level, 0..1. */
	kick: number;
	/** 1..10 */
	energy: number;
	/** Track intensity, 0..1. */
	intensity: number;
	mixing: boolean;
	crossfade: number;
}

/** How wild each move is, 0..1: picked when it matches the moment. */
const HEAT: Partial<Record<Move, number>> = {
	deepNod: 0.2,
	sway: 0.2,
	tweak: 0.3,
	groove: 0.4,
	scratch: 0.5,
	wave: 0.55,
	pointCrowd: 0.6,
	clap: 0.7,
	pump: 0.8,
	roof: 0.9,
	headbang: 1
};

/** Moves that fit each section; the heat match picks among them. */
const REPERTOIRE: Record<SectionKind, Move[]> = {
	intro: ['groove', 'deepNod', 'tweak'],
	groove: ['groove', 'deepNod', 'tweak', 'scratch'],
	lift: ['groove', 'tweak', 'scratch', 'pointCrowd'],
	main: ['groove', 'scratch', 'tweak', 'pointCrowd', 'pump', 'wave', 'headbang'],
	breakdown: ['sway', 'wave', 'deepNod'],
	build: ['clap'],
	peak: ['pump', 'roof', 'wave', 'pointCrowd', 'headbang', 'clap'],
	outro: ['groove']
};

const CX = 240;
const SHOULDER_Y = 111;
const DECK_A: Pt = [194, 129];
const DECK_B: Pt = [288, 128];
/** Channel EQ knobs and the crossfader on the mixer. */
const EQ: Pt = [224, 128];
const XFADER_X = 233;

const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Picks the move for a phrase: the best heat match, with a little randomness, never the same twice in a row. */
export function pickMove(i: MoveInput): Move {
	if (!i.live || !i.section) return 'idle';
	if (i.mixing || i.section === 'outro') return i.x < 0.5 ? 'cue' : 'mixEq';
	if (i.section === 'peak' && i.x * 32 < 4) return 'drop';
	if (i.section === 'build') return i.x < 0.5 ? 'clap' : i.x < 0.75 ? 'tweak' : 'reach';
	const phrase = Math.floor(i.cycle / 4);
	const choose = (p: number) => {
		const level = clamp((i.energy / 10) * 0.5 + i.intensity * 0.5, 0, 1);
		const options = REPERTOIRE[i.section!];
		let best = options[0];
		let score = -Infinity;
		options.forEach((m, n) => {
			const s = -Math.abs((HEAT[m] ?? 0.5) - level) + hash(p * 7 + n) * 0.5;
			if (s > score) [best, score] = [m, s];
		});
		return best;
	};
	const move = choose(phrase);
	// Avoid repeating last phrase's move when there is a choice.
	if (move === choose(phrase - 1) && REPERTOIRE[i.section].length > 1) {
		const alt = choose(phrase + 1000);
		if (alt !== move) return alt;
	}
	return move;
}

/** Where everything should be right now. */
export function choreograph(i: MoveInput): Pose {
	const move = pickMove(i);
	const beat = i.cycle * 4;
	const ph = beat - Math.floor(beat);
	const count = Math.floor(beat) % 4;
	const onDecks = (): [Arm, Arm] => [
		{ hand: [...DECK_A], elbow: [CX - 29, 127], pose: 'flat' },
		{ hand: [...DECK_B], elbow: [CX + 29, 127], pose: 'flat' }
	];
	// The default head nod: a dip on every kick, a slow bob without one.
	const groove =
		i.kick > 0.2
			? ph < 0.25
				? 2
				: ph < 0.5
					? 1
					: 0
			: Math.round(Math.sin(i.cycle * Math.PI) * 0.6 + 0.6);
	const pose: Pose = {
		move,
		sway: 0,
		bob: 0,
		nod: 0,
		tilt: 0,
		left: onDecks()[0],
		right: onDecks()[1],
		scratch: 0
	};
	if (move === 'idle') return pose;
	pose.nod = groove;
	pose.bob = Math.min(1, groove);
	const wiggle = Math.sin((beat * Math.PI) / 2) * 2;
	pose.right.hand[0] += wiggle;

	switch (move) {
		case 'deepNod':
			pose.nod = Math.round(3 * Math.exp(-ph * 4));
			pose.bob = pose.nod > 1 ? 1 : 0;
			break;
		case 'tweak':
			// Head down, turning EQ knobs on the beat.
			pose.nod = 2 + (ph < 0.25 ? 1 : 0);
			pose.left = {
				hand: [EQ[0] + (Math.floor(beat / 2) % 2) * 7, EQ[1] + (count % 2)],
				elbow: [CX - 27, 128],
				pose: 'fist'
			};
			break;
		case 'scratch': {
			const s = Math.sin(beat * Math.PI * 2);
			pose.right.hand = [DECK_B[0] + s * 3, DECK_B[1]];
			pose.scratch = s * 1.2;
			pose.tilt = 1;
			break;
		}
		case 'pointCrowd': {
			// Points out at the crowd, switching arms every two bars.
			const side = Math.floor(i.cycle / 2) % 2 ? 1 : -1;
			const arm: Arm = {
				hand: [CX + side * 45, 104 + (ph < 0.2 ? 1 : 0)],
				elbow: [CX + side * 31, 108],
				pose: 'pointSide'
			};
			if (side < 0) pose.left = arm;
			else pose.right = arm;
			pose.tilt = side;
			break;
		}
		case 'pump': {
			const up = ph < 0.45;
			pose.left = { hand: [CX - 32, up ? 74 : 92], elbow: [CX - 33, up ? 96 : 104], pose: 'fist' };
			pose.nod = up ? 2 : 0;
			break;
		}
		case 'headbang':
			pose.nod = ph < 0.2 ? 4 : ph < 0.5 ? 2 : 0;
			pose.bob = pose.nod > 2 ? 2 : pose.nod > 0 ? 1 : 0;
			pose.tilt = Math.floor(beat / 2) % 2 ? 1 : -1;
			break;
		case 'wave': {
			const o = Math.sin((beat * Math.PI) / 2) * 8;
			pose.left = { hand: [CX - 14 + o, 68], elbow: [CX - 26 + o / 2, 92], pose: 'open' };
			pose.right = { hand: [CX + 14 + o, 68], elbow: [CX + 26 + o / 2, 92], pose: 'open' };
			pose.sway = Math.round(o / 4);
			pose.tilt = Math.sign(Math.round(o / 4));
			pose.nod = 1;
			break;
		}
		case 'roof': {
			// Arms go up beside the helmet, not across the visor.
			const y = 63 + (ph < 0.3 ? 0 : 5);
			pose.left = { hand: [CX - 20, y], elbow: [CX - 33, y + 25], pose: 'flat' };
			pose.right = { hand: [CX + 20, y], elbow: [CX + 33, y + 25], pose: 'flat' };
			break;
		}
		case 'clap': {
			// Claps overhead on 2 and 4.
			const hit = count % 2 === 1 ? Math.exp(-ph * 6) : 0;
			const gap = 2 + Math.round(10 * (1 - hit));
			pose.left = { hand: [CX - gap, 63], elbow: [CX - 31, 88], pose: 'open' };
			pose.right = { hand: [CX + gap, 63], elbow: [CX + 31, 88], pose: 'open' };
			break;
		}
		case 'sway': {
			const s = Math.sin((beat * Math.PI) / 4);
			pose.sway = Math.round(s * 2);
			pose.tilt = Math.round(s);
			pose.nod = 1;
			pose.bob = 0;
			break;
		}
		case 'reach': {
			// Arm rises with the build, pointing at the roof by the drop.
			const up = clamp((i.x - 0.75) * 4, 0, 1);
			pose.left = {
				hand: [DECK_A[0] + (CX - 31 - DECK_A[0]) * up, DECK_A[1] + (68 - DECK_A[1]) * up],
				elbow: [CX - 29, 127 - 33 * up],
				pose: up > 0.5 ? 'point' : 'flat'
			};
			break;
		}
		case 'drop':
			pose.left = { hand: [CX - 31, 68], elbow: [CX - 29, 94], pose: 'point' };
			pose.nod = ph < 0.2 ? 3 : ph < 0.5 ? 1 : 0;
			break;
		case 'cue':
			// The classic: one hand pressing the headphone to his ear, the other on the crossfader.
			pose.left = { hand: [CX - 19, 93], elbow: [CX - 33, 108], pose: 'fist' };
			pose.right = {
				hand: [XFADER_X + i.crossfade * 14, 133],
				elbow: [CX + 27, 129],
				pose: 'flat'
			};
			pose.tilt = -1;
			pose.nod = 1;
			break;
		case 'mixEq':
			pose.left = {
				hand: [CX - 16 + Math.round(wiggle), 128],
				elbow: [CX - 28, 128],
				pose: 'fist'
			};
			pose.right = {
				hand: [XFADER_X + i.crossfade * 14, 133],
				elbow: [CX + 27, 129],
				pose: 'flat'
			};
			break;
	}
	return pose;
}

export const SHOULDERS: [Pt, Pt] = [
	[CX - 17, SHOULDER_Y],
	[CX + 17, SHOULDER_Y]
];
