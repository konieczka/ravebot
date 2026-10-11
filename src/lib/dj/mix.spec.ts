import { describe, expect, it } from 'vitest';
import { BASE_MIX, humanize, mixProfile, noteToMidi, swingAmount } from './mix';

describe('humanize', () => {
	it('accents the beat and the off-beat over the in-between hats', () => {
		const vel = (t: number) =>
			humanize({ s: 'hh' }, 'hats', t, mixProfile({ jitter: 0, hats: 0 }), 0).velocity as number;
		expect(vel(0)).toBeCloseTo(1);
		expect(vel(2 / 16)).toBeLessThan(vel(0));
		expect(vel(1 / 16)).toBeLessThan(vel(2 / 16));
	});

	it('is deterministic for the same hit', () => {
		const a = humanize({ s: 'hh' }, 'hats', 3.25, BASE_MIX, 0);
		expect(humanize({ s: 'hh' }, 'hats', 3.25, BASE_MIX, 0)).toEqual(a);
	});

	it('keeps jitter within the profile', () => {
		const mix = mixProfile({ perc: 0 });
		for (let i = 0; i < 64; i++) {
			const v = humanize({ s: 'cp' }, 'perc', i / 16, mix, 0).velocity as number;
			expect(Math.abs(v - 1)).toBeLessThanOrEqual(BASE_MIX.jitter + 1e-9);
		}
	});

	it('drifts oscillator pitch by a few cents but leaves samples alone', () => {
		const drifted = humanize({ s: 'sawtooth', note: 'a2' }, 'synth', 1.5, BASE_MIX, 0)
			.note as number;
		expect(Math.abs(drifted - 45)).toBeLessThanOrEqual(BASE_MIX.drift / 100);
		expect(humanize({ s: 'hoover', note: 'a2' }, 'synth', 1.5, BASE_MIX, 0).note).toBe('a2');
	});

	it('trims hats and percussion per hit', () => {
		const v = humanize({ s: 'hh' }, 'hats', 0, mixProfile({ jitter: 0, hats: 6 }), 0)
			.velocity as number;
		expect(v).toBeCloseTo(10 ** (6 / 20));
	});

	it('keeps an existing velocity as the base', () => {
		const v = humanize({ s: 'bd', velocity: 0.5 }, 'kick', 0, mixProfile({ jitter: 0 }), 0);
		expect(v.velocity).toBeCloseTo(0.5);
	});
});

describe('helpers', () => {
	it('parses note names', () => {
		expect(noteToMidi('c4')).toBe(60);
		expect(noteToMidi('eb2')).toBe(39);
		expect(noteToMidi('f#1')).toBe(30);
		expect(noteToMidi('x')).toBeNull();
	});

	it('maps swing percentages onto swingBy', () => {
		expect(swingAmount(0.5)).toBe(0);
		expect(swingAmount(0.54)).toBeCloseTo(0.08);
	});
});
