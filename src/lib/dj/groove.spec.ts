import { describe, expect, it } from 'vitest';
import { checkGroove, type GrooveEvent } from './groove';

const events = (steps: number[]): GrooveEvent[] =>
	steps.map((step) => ({ begin: step / 16, end: (step + 1) / 16, value: { note: 45 } }));
const steps = Array.from({ length: 256 }, (_, i) => i);
const classic = { genre: 'acid' as const, weirdness: 2 };

describe('performed groove contracts', () => {
	it('accepts steady kicks and rejects a missing, doubled or shifted kick', () => {
		const kick = events(steps.filter((i) => i % 4 === 0));
		expect(() => checkGroove('kick', kick, classic)).not.toThrow();
		for (const broken of [
			kick.slice(1),
			[...kick, kick[0]],
			events(steps.filter((i) => i % 4 === 1))
		])
			expect(() => checkGroove('kick', broken, classic)).toThrow(/kick/);
	});
	it('preserves the psy and hardbass foundations at every weirdness', () => {
		for (const weirdness of [0, 5, 10]) {
			const psy = events(steps.filter((i) => i % 4 !== 0));
			const donk = events(steps.filter((i) => i % 4 === 2));
			expect(() => checkGroove('bass', psy, { genre: 'psy', weirdness })).not.toThrow();
			expect(() => checkGroove('bass', donk, { genre: 'hardbass', weirdness })).not.toThrow();
			expect(() => checkGroove('bass', donk, { genre: 'psy', weirdness })).toThrow(/three/);
			expect(() => checkGroove('bass', psy, { genre: 'hardbass', weirdness })).toThrow(/off-beat/);
		}
	});
	it('permits doubled bass timbres but rejects simultaneous different pitches', () => {
		const bass = events([2, 6, 10, 14]);
		expect(() => checkGroove('bass', [...bass, ...bass], classic)).not.toThrow();
		expect(() =>
			checkGroove('bass', [...bass, { ...bass[0], value: { note: 48 } }], classic)
		).toThrow(/monophonic/);
	});
	it('confines off-grid experiments to supporting percussion at high weirdness', () => {
		const odd = [{ begin: 1 / 7, end: 2 / 7, value: {} }];
		expect(() => checkGroove('perc', odd, classic)).toThrow(/grid/);
		expect(() => checkGroove('perc', odd, { ...classic, weirdness: 9 })).not.toThrow();
		expect(() => checkGroove('bass', odd, { ...classic, weirdness: 9 })).toThrow(/grid/);
	});
});
