import { describe, expect, it } from 'vitest';
import { hardbassVoice } from './hardbass';

describe('hardbass playback voices', () => {
	it('removes distortion from Russian shouts while preserving the sample and phrasing', () => {
		const input = {
			s: 'rus',
			n: 9,
			gain: 0.85,
			velocity: 0.7,
			speed: 0.7,
			accelerate: -0.2,
			vowel: 'o',
			fmi: 3,
			vibrato: 8,
			room: 0.1,
			shape: 0.6,
			distort: 1,
			crush: 4,
			coarse: 8
		};
		expect(hardbassVoice('vox', input)).toEqual({
			s: 'rus',
			n: 9,
			gain: 0.85,
			velocity: 0.7,
			speed: 1,
			accelerate: 0,
			room: 0.1
		});
		expect(input.shape).toBe(0.6);
		const effect = { s: 'hoover', shape: 0.4 };
		expect(hardbassVoice('vox', effect)).toBe(effect);
	});

	it('replaces distorted samples with one dry body and retains hit dynamics', () => {
		const input = {
			s: 'gabba',
			n: 0,
			bank: 'old',
			speed: 0.8,
			gain: 0.6,
			velocity: 0.4,
			shape: 0.7,
			room: 0.5,
			decay: 0.3
		};
		const hit = hardbassVoice('kick', input);
		expect(hit).toMatchObject({ s: 'sine', velocity: 0.4, sustain: 0 });
		expect(hit.gain).toBeCloseTo(2.39431);
		expect(hit).not.toHaveProperty('bank');
		expect(hit).not.toHaveProperty('speed');
		expect(hit).not.toHaveProperty('room');
		expect(Number(hit.attack) + Number(hit.decay) + Number(hit.release)).toBeLessThan(60 / 158 / 2);
		expect(input.s).toBe('gabba');
	});

	it('excites metal with a brief burst, without a second pitched kick', () => {
		const hit = hardbassVoice('strike', { gain: 0.6, velocity: 0 });
		expect(hit).toMatchObject({ s: 'white', velocity: 0, sustain: 0 });
		expect(hit.gain).toBeCloseTo(2.39431);
		expect(hit).not.toHaveProperty('note');
		expect(Number(hit.attack) + Number(hit.decay)).toBeLessThan(0.006);
	});

	it.each(['f1', 'a1', 'd2', 'c3'])('cleans legacy FM donks while preserving pitch %s', (note) => {
		const hit = hardbassVoice('bass', {
			s: 'sine',
			note,
			fmi: 4,
			fmh: 1.41,
			fmwave: 'triangle',
			fmi2: 3,
			shape: 0.4,
			coarse: 4,
			crush: 6,
			room: 0.2,
			delay: 0.3,
			gain: 0.65
		});
		expect(hit).toMatchObject({
			note,
			gain: 0.65,
			fmh: 2,
			fmwave: 'sine',
			fmsustain: 0,
			sustain: 0,
			room: 0,
			delay: 0
		});
		for (const key of ['shape', 'coarse', 'crush', 'fmi2']) expect(hit).not.toHaveProperty(key);
		expect(Number(hit.decay) + Number(hit.release)).toBeLessThan(60 / 158 / 2);
	});

	it('leaves non-FM bass and other layers intact', () => {
		const saw = { s: 'sawtooth', note: 'c2', cutoff: 900 };
		expect(hardbassVoice('bass', saw)).toBe(saw);
		const lead = { s: 'sine', fmi: 4 };
		expect(hardbassVoice('synth', lead)).toBe(lead);
	});
});
