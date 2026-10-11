import { describe, expect, it } from 'vitest';
import { buildMessages, extractJson } from './prompt';

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
			vibe: 'sweaty basement',
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
		expect(user.content).toMatch(/sweaty basement/);
		expect(user.content).toMatch(/"Prev"/);
	});
});
