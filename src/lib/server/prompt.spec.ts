import { describe, expect, it } from 'vitest';
import { buildMessages, extractJson, pickStyle } from './prompt';
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
