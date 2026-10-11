import { noteToMidi } from './mix';
import type { LayerName } from './types';

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

export type HarmonyId = keyof typeof FRENCH_HARMONIES;
export const TONAL_LAYERS = ['bass', 'synth', 'vox'] as const;
export const PHRASE_BARS = 4;

export function parseHarmony(value: unknown): HarmonyId | undefined {
	return typeof value === 'string' && Object.hasOwn(FRENCH_HARMONIES, value)
		? (value as HarmonyId)
		: undefined;
}

export function chooseHarmony(previous?: HarmonyId): HarmonyId {
	if (parseHarmony(previous)) return previous!;
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
	if (layer === 'vox' && value.note === undefined && value.n === undefined) return true;
	const midi =
		typeof value.note === 'number'
			? value.note
			: typeof value.note === 'string'
				? noteToMidi(value.note)
				: null;
	if (midi === null || !Number.isFinite(midi)) return false;
	const plan = FRENCH_HARMONIES[id];
	const index = ((Math.floor(bar) % PHRASE_BARS) + PHRASE_BARS) % PHRASE_BARS;
	const pitches = [...plan.chords[index], plan.roots[index]].map((n) => noteToMidi(n)! % 12);
	return pitches.includes(((Math.round(midi) % 12) + 12) % 12);
}

/** Align against the outgoing track's origin, including after an earlier skip. */
export function transitionStart(now: number, origin: number, phraseBars: number): number {
	return origin + Math.ceil((now + 0.5 - origin) / phraseBars) * phraseBars;
}
