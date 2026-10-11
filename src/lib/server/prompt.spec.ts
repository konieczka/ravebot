import { describe, expect, it } from 'vitest';
import { buildMessages, extractJson, pickStyle, extraIdea } from './prompt';
import { validateLayers } from '#lib/dj/validate.js';
import { GENRES } from '#lib/dj/genres.js';

describe('extractJson', () => {
	it('strips think blocks and code fences', () => {
		const reply =
			'<think>hmm { not this }</think>\n```json\n{"title":"X","layers":{"kick":"s(\'bd*4\')"}}\n```';
		expect(extractJson(reply)).toEqual({ title: 'X', layers: { kick: "s('bd*4')" } });
	});

	it('throws when there is no object', () => {
		expect(() => extractJson('sorry, I cannot')).toThrow(/no JSON/);
	});
});

describe('buildMessages', () => {
	it('includes the genre brief, controls and the previous track', () => {
		const [system, user] = buildMessages({
			genre: 'acid',
			bpm: 134,
			energy: 8,
			weirdness: 2,
			previous: {
				title: 'Prev',
				layers: {
					kick: "s('bd*4')",
					hats: 'silence',
					perc: 'silence',
					bass: 'silence',
					synth: 'silence',
					vox: 'silence'
				}
			}
		});
		expect(system.content).toMatch(/STRUDEL CHEAT SHEET/);
		expect(user.content).toMatch(/Acid/);
		expect(user.content).toMatch(/Energy: 8\/10/);
		expect(user.content).toMatch(/"Prev"/);
		expect(user.content).toMatch(/Style for this track: /);
	});
});

describe('pickStyle', () => {
	const styles = ['a', 'b', 'c', 'bold'];

	it('never picks the experimental style at low weirdness', () => {
		for (let i = 0; i < 50; i++) expect(pickStyle(styles, 2, () => i / 50)).not.toBe('bold');
	});

	it('favours the experimental style at high weirdness', () => {
		expect(pickStyle(styles, 9, () => 0.1)).toBe('bold');
		expect(pickStyle(styles, 9, () => 0.9)).not.toBe(undefined);
	});

	it('gives every genre several styles with an experimental one last', () => {
		for (const g of GENRES) {
			expect(g.styles.length, g.id).toBeGreaterThanOrEqual(4);
			expect(g.styles.at(-1)!.name, g.id).toMatch(/experimental/);
		}
	});
});

it('gives French house one shared harmonic grid and omits random arpeggio twists', () => {
	const [, user] = buildMessages({
		genre: 'french',
		bpm: 124,
		energy: 6,
		weirdness: 3,
		harmony: 'sunrise-d'
	});
	expect(user.content).toContain('Key: D major');
	expect(user.content).toContain('HARMONIC CONTRACT');
	expect(user.content).toContain('d2 | b1 | g1 | a1');
	expect(user.content).toContain('No running arpeggios');
	expect(user.content).not.toContain('Extra idea: synth: a 16th-note arpeggio');
});

describe('composition matrix', () => {
	it('gates every recipe and extra idea, including non-final experimental styles', () => {
		for (const genre of GENRES)
			for (const weirdness of [0, 3, 5, 7, 10]) {
				for (let i = 0; i < 100; i++) {
					const style = pickStyle(genre.styles, weirdness, () => i / 100);
					expect(style.minWeirdness, `${genre.id}/${style.name}`).toBeLessThanOrEqual(weirdness);
					if (weirdness < 7)
						expect(extraIdea(genre.id, weirdness, () => i / 100)).not.toMatch(
							/polymeter|euclidean/
						);
				}
			}
	});
	it('builds valid references and explicit coordinated contracts for all genres and control levels', () => {
		for (const genre of GENRES)
			for (const weirdness of [0, 5, 10])
				for (const energy of [2, 8]) {
					const [system, user] = buildMessages({
						genre: genre.id,
						bpm: genre.bpm,
						weirdness,
						energy
					});
					const reference = JSON.parse(system.content.split('):\n').at(-1)!);
					expect(validateLayers(reference.layers).errors, genre.id).toEqual({});
					expect(user.content).toContain('HARMONIC CONTRACT');
					expect(user.content).toContain('RHYTHM CONTRACT');
					expect(user.content).toContain('Passing-note palette:');
					if (weirdness < 7) expect(system.content).not.toContain('Optional at weirdness >= 7');
					if (genre.id === 'psy') expect(user.content).toContain('exactly three short sixteenths');
					if (genre.id === 'hardbass') expect(user.content).toContain('exactly one short donk');
				}
	});
});
