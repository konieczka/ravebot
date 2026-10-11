import { describe, expect, it } from 'vitest';
import {
	FRENCH_HARMONIES,
	chooseHarmony,
	chooseTrackHarmony,
	fitsHarmonySpan,
	fitsHarmony,
	parseHarmony,
	transitionStart,
	type HarmonyId
} from './harmony';
import { fallbackTrack } from './fallback';
import { FRENCH } from './seeds/french';
import { noteToMidi } from './mix';

describe('harmonic plans', () => {
	it('rejects untrusted metadata, including inherited object keys', () => {
		for (const value of [null, {}, 'C major', '__proto__', 'constructor'])
			expect(parseHarmony(value)).toBeUndefined();
		expect(parseHarmony('sunrise-d')).toBe('sunrise-d');
	});

	it('keeps fallback and AI selection in the previous chord grid', () => {
		for (const id of Object.keys(FRENCH_HARMONIES) as HarmonyId[]) {
			const previous = FRENCH.find((s) => s.harmony === id)!;
			const next = fallbackTrack('french', previous.layers, id);
			expect(chooseHarmony(id)).toBe(id);
			expect(next.harmony).toBe(id);
			expect(next.layers.bass).not.toBe(previous.layers.bass);
			expect(next.layers.synth).not.toBe(previous.layers.synth);
		}
	});

	it('retains close keyboard voices across the loop seam as well as internal changes', () => {
		for (const plan of Object.values(FRENCH_HARMONIES)) {
			for (let bar = 0; bar < 4; bar++) {
				const next = plan.chords[(bar + 1) % 4].map((n) => noteToMidi(n)!);
				for (const n of plan.chords[bar]) {
					const nearest = Math.min(...next.map((m) => Math.abs(m - noteToMidi(n)!)));
					expect(nearest).toBeLessThanOrEqual(3);
				}
			}
		}
	});

	it('checks the chord at the actual bar, not merely the key', () => {
		expect(fitsHarmony('sunrise-d', 'synth', { note: 'c#4' }, 0)).toBe(true);
		expect(fitsHarmony('sunrise-d', 'synth', { note: 'c#4' }, 1)).toBe(false);
		expect(fitsHarmony('sunrise-d', 'bass', { note: 'd2' }, 4)).toBe(true);
		expect(fitsHarmony('sunrise-d', 'synth', { s: 'stab', n: 2 }, 0)).toBe(false);
		expect(fitsHarmony('sunrise-d', 'synth', { note: NaN }, 0)).toBe(false);
	});

	it('preserves phrase alignment after a shifted origin or a skip', () => {
		expect(transitionStart(113.2, 3, 4)).toBe(115);
		expect((transitionStart(119.8, 3, 4) + 4 - 3) % 4).toBe(0);
	});
});

describe('genre-wide composition plans', () => {
	it('keeps a compatible plan across tracks and changes incompatible genre plans', () => {
		expect(chooseTrackHarmony('acid', 'pedal-d')).toBe('pedal-d');
		expect(chooseTrackHarmony('detroit', 'jazz-a')).toBe('jazz-a');
		expect(chooseTrackHarmony('psy', 'pedal-a')).toMatch(/^psy-/);
		expect(chooseTrackHarmony('french', 'changes-a')).not.toBe('changes-a');
	});
	it('allows brief melodic passing notes but not bass clashes or held dissonance', () => {
		expect(fitsHarmony('pedal-a', 'synth', { note: 'b3' }, 0.125)).toBe(true);
		expect(fitsHarmony('pedal-a', 'synth', { note: 'b3' }, 0.25)).toBe(false);
		expect(fitsHarmony('pedal-a', 'bass', { note: 'b1' }, 0.125)).toBe(false);
		expect(fitsHarmonySpan('pedal-a', 'synth', { note: 'b3' }, 0.125, 0.25)).toBe(true);
		expect(fitsHarmonySpan('pedal-a', 'synth', { note: 'b3' }, 0.125, 0.5)).toBe(false);
		expect(fitsHarmonySpan('changes-a', 'synth', { note: 'e4' }, 0.75, 1.5)).toBe(false);
	});
	it('distinguishes vocal samples and noise from unknown pitched samples', () => {
		expect(fitsHarmony('pedal-a', 'vox', { s: 'rave', n: 0 }, 0)).toBe(true);
		expect(fitsHarmony('pedal-a', 'synth', { s: 'white' }, 0)).toBe(true);
		expect(fitsHarmony('pedal-a', 'synth', { s: 'stab', n: 0 }, 0)).toBe(false);
	});
});
