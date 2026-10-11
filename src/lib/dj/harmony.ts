import { noteToMidi } from './mix';
import type { GenreId, LayerName } from './types';

/** A bar-by-bar contract shared by composition, generation and the DJ. */
export const FRENCH_HARMONIES = {
	'sunrise-d': {
		key: 'D',
		mode: 'major',
		roots: ['d2', 'b1', 'g1', 'a1'],
		chords: [
			['f#3', 'a3', 'c#4', 'e4'],
			['f#3', 'a3', 'b3', 'd4'],
			['g3', 'a3', 'b3', 'd4'],
			['g3', 'a3', 'c#4', 'e4']
		]
	},
	'velvet-a': {
		key: 'A',
		mode: 'major',
		roots: ['a1', 'f#1', 'd2', 'e2'],
		chords: [
			['g#3', 'b3', 'c#4', 'e4'],
			['a3', 'c#4', 'e4', 'f#4'],
			['a3', 'c#4', 'e4', 'f#4'],
			['g#3', 'b3', 'd4', 'f#4']
		]
	},
	'midnight-c': {
		key: 'C',
		mode: 'minor',
		roots: ['c2', 'ab1', 'f1', 'bb1'],
		chords: [
			['g3', 'bb3', 'd4', 'eb4'],
			['g3', 'bb3', 'c4', 'eb4'],
			['ab3', 'c4', 'eb4', 'g4'],
			['ab3', 'c4', 'd4', 'f4']
		]
	},
	'chrome-g': {
		key: 'G',
		mode: 'minor',
		roots: ['g1', 'eb2', 'c2', 'd2'],
		chords: [
			['f3', 'a3', 'bb3', 'd4'],
			['g3', 'bb3', 'd4', 'f4'],
			['g3', 'bb3', 'd4', 'eb4'],
			['f#3', 'a3', 'c4', 'e4']
		]
	},
	'honey-a': {
		key: 'A',
		mode: 'dorian',
		roots: ['a1', 'd2', 'a1', 'd2'],
		chords: [
			['g3', 'b3', 'c4', 'e4'],
			['f#3', 'a3', 'c4', 'e4'],
			['g3', 'b3', 'c4', 'e4'],
			['f#3', 'a3', 'c4', 'e4']
		]
	}
} as const;

export type FrenchHarmonyId = keyof typeof FRENCH_HARMONIES;

export interface HarmonicPlan {
	key: string;
	mode: string;
	roots: readonly string[];
	chords: readonly (readonly string[])[];
	/** Passing notes for short, weak-beat melody notes; bass stays on chord tones. */
	palette?: readonly string[];
}

const pedal = (
	key: string,
	mode: string,
	root: string,
	chord: string[],
	palette: string[]
): HarmonicPlan => ({
	key,
	mode,
	roots: Array(4).fill(root),
	chords: Array(4).fill(chord),
	palette
});

export const HARMONIES = {
	...FRENCH_HARMONIES,
	'pedal-a': pedal(
		'A',
		'minor',
		'a1',
		['a3', 'c4', 'e4'],
		['a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4']
	),
	'pedal-d': pedal(
		'D',
		'minor',
		'd2',
		['d3', 'f3', 'a3'],
		['d3', 'e3', 'f3', 'g3', 'a3', 'bb3', 'c4']
	),
	'psy-a': pedal(
		'A',
		'harmonic minor',
		'a1',
		['a3', 'c4', 'e4'],
		['a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g#4']
	),
	'psy-d': pedal(
		'D',
		'harmonic minor',
		'd2',
		['d3', 'f3', 'a3'],
		['d3', 'e3', 'f3', 'g3', 'a3', 'bb3', 'c#4']
	),
	'jazz-d': {
		...FRENCH_HARMONIES['sunrise-d'],
		palette: ['d3', 'e3', 'f#3', 'g3', 'a3', 'b3', 'c#4']
	},
	'jazz-a': {
		...FRENCH_HARMONIES['honey-a'],
		palette: ['a3', 'b3', 'c4', 'd4', 'e4', 'f#4', 'g4']
	},
	'changes-a': {
		key: 'A',
		mode: 'harmonic minor',
		roots: ['a1', 'f1', 'd2', 'e2'],
		chords: [
			['a3', 'c4', 'e4'],
			['a3', 'c4', 'f4'],
			['a3', 'd4', 'f4'],
			['g#3', 'b3', 'e4']
		],
		palette: ['a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g#4']
	},
	'changes-d': {
		key: 'D',
		mode: 'harmonic minor',
		roots: ['d2', 'bb1', 'g1', 'a1'],
		chords: [
			['a3', 'd4', 'f4'],
			['bb3', 'd4', 'f4'],
			['bb3', 'd4', 'g4'],
			['a3', 'c#4', 'e4']
		],
		palette: ['d3', 'e3', 'f3', 'g3', 'a3', 'bb3', 'c#4']
	}
} satisfies Record<string, HarmonicPlan>;

export type HarmonyId = keyof typeof HARMONIES;
export const harmonicPlan = (id: HarmonyId): HarmonicPlan => HARMONIES[id];
export const isFrenchHarmony = (id: HarmonyId): id is FrenchHarmonyId =>
	Object.hasOwn(FRENCH_HARMONIES, id);

export function chooseTrackHarmony(genre: GenreId, previous?: HarmonyId): HarmonyId {
	const pool: HarmonyId[] =
		genre === 'french'
			? (Object.keys(FRENCH_HARMONIES) as FrenchHarmonyId[])
			: genre === 'psy'
				? ['psy-a', 'psy-d']
				: genre === 'detroit'
					? ['jazz-d', 'jazz-a']
					: genre === 'hardbass'
						? ['changes-a', 'changes-d']
						: ['pedal-a', 'pedal-d'];
	return previous && pool.includes(previous)
		? previous
		: pool[Math.floor(Math.random() * pool.length)];
}
export const TONAL_LAYERS = ['bass', 'synth', 'vox'] as const;
export const PHRASE_BARS = 4;

export function parseHarmony(value: unknown): HarmonyId | undefined {
	return typeof value === 'string' && Object.hasOwn(HARMONIES, value)
		? (value as HarmonyId)
		: undefined;
}

export function chooseHarmony(previous?: HarmonyId): HarmonyId {
	if (previous && isFrenchHarmony(previous)) return previous;
	const ids = Object.keys(FRENCH_HARMONIES) as HarmonyId[];
	return ids[Math.floor(Math.random() * ids.length)];
}

/** Check performed notes, not model claims. Unknown pitched samples cannot certify harmony. */
export function fitsHarmony(
	id: HarmonyId,
	layer: LayerName,
	value: Record<string, unknown>,
	bar: number
): boolean {
	if (!(TONAL_LAYERS as readonly string[]).includes(layer)) return true;
	if (
		layer === 'vox' &&
		value.note === undefined &&
		['rave', 'numbers', 'speech', 'speakspell', 'rus', 'mouth'].includes(String(value.s))
	)
		return true;
	if (!isFrenchHarmony(id) && layer === 'synth' && ['white', 'pink'].includes(String(value.s)))
		return true;
	const midi =
		typeof value.note === 'number'
			? value.note
			: typeof value.note === 'string'
				? noteToMidi(value.note)
				: null;
	if (midi === null || !Number.isFinite(midi)) return false;
	const plan = harmonicPlan(id);
	const index = ((Math.floor(bar) % PHRASE_BARS) + PHRASE_BARS) % PHRASE_BARS;
	const weakBeat = Math.abs(bar * 4 - Math.round(bar * 4)) > 1e-6;
	const passing = layer !== 'bass' && weakBeat ? (plan.palette ?? []) : [];
	const pitches = [...plan.chords[index], plan.roots[index], ...passing].map(
		(n) => noteToMidi(n)! % 12
	);
	return pitches.includes(((Math.round(midi) % 12) + 12) % 12);
}

/** Passing notes cannot be held through a beat; sustained notes must fit every crossed chord. */
export function fitsHarmonySpan(
	id: HarmonyId,
	layer: LayerName,
	value: Record<string, unknown>,
	begin: number,
	end: number
): boolean {
	if (!fitsHarmony(id, layer, value, begin)) return false;
	for (let beat = Math.floor(begin * 4) + 1; beat / 4 < end - 1e-6; beat++) {
		if (!fitsHarmony(id, layer, value, beat / 4)) return false;
	}
	return true;
}

/** Align against the outgoing track's origin, including after an earlier skip. */
export function transitionStart(now: number, origin: number, phraseBars: number): number {
	return origin + Math.ceil((now + 0.5 - origin) / phraseBars) * phraseBars;
}
