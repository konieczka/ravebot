import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('$app/env/private', () => ({
	CF_ACCOUNT_ID: 'test',
	CF_AI_GATEWAY_ID: 'test',
	CF_AIG_TOKEN: '',
	LLM_API_KEY: '',
	LLM_MODEL: 'test'
}));
import type { GenerateResponse } from '#lib/dj/types.js';
import { POST } from './+server';
import { genreById } from '#lib/dj/genres.js';
import { TONAL_LAYERS } from '#lib/dj/harmony.js';

const layers = {
	...genreById('acid').seeds[0].layers,
	synth: "note('a3 ~ e4 ~').s('triangle').gain(.17)"
};
const run = async (body: unknown) => {
	const response = await POST({
		request: new Request('http://localhost/api/generate', {
			method: 'POST',
			body: JSON.stringify(body)
		})
	} as Parameters<typeof POST>[0]);
	const result = (await response.json()) as GenerateResponse;
	if (!result.ok) throw new Error(result.error);
	return result;
};
const reply = (value: unknown) =>
	new Response(
		JSON.stringify({
			choices: [{ message: { content: JSON.stringify(value) }, finish_reason: 'stop' }]
		})
	);
afterEach(() => vi.unstubAllGlobals());

describe('generation policy', () => {
	it('preserves a compatible harmonic plan and accepts reused supporting rhythms', async () => {
		const fetch = vi
			.fn()
			.mockResolvedValue(reply({ title: 'New foreground', comment: 'Go', layers }));
		vi.stubGlobal('fetch', fetch);
		const result = await run({
			genre: 'acid',
			bpm: 134,
			energy: 6,
			weirdness: 0,
			previous: { title: 'Old', layers: { ...layers, synth: 'silence' }, harmony: 'pedal-d' }
		});
		expect(result.ok).toBe(true);
		expect(result.track.harmony).toBe('pedal-d');
		expect(result.repaired).toEqual([]);
		expect(fetch).toHaveBeenCalledTimes(1);
		const request = JSON.parse(fetch.mock.calls[0][1].body);
		expect(request.messages[1].content).toContain('Key: D minor');
	});
	it('repairs a failed pitched layer as one tonal group after exhausting retries', async () => {
		const fetch = vi
			.fn()
			.mockImplementation(async () =>
				reply({ title: 'Broken hook', layers: { ...layers, synth: "fetch('bad')" } })
			);
		vi.stubGlobal('fetch', fetch);
		const result = await run({ genre: 'acid', bpm: 134, energy: 6, weirdness: 10 });
		expect(fetch).toHaveBeenCalledTimes(3);
		expect(result.repaired.sort()).toEqual([...TONAL_LAYERS].sort());
		expect(result.track.harmony).toBeUndefined();
		expect(
			genreById('acid').seeds.some((seed) =>
				TONAL_LAYERS.every((l) => seed.layers[l] === result.track.layers[l])
			)
		).toBe(true);
	});
	it('does not let caller-selected harmony or high weirdness bypass the composition policy', async () => {
		const fetch = vi.fn().mockResolvedValue(reply({ title: 'New foreground', layers }));
		vi.stubGlobal('fetch', fetch);
		const result = await run({
			genre: 'psy',
			bpm: 143,
			energy: 6,
			weirdness: 10,
			harmony: 'sunrise-d'
		});
		expect(result.track.harmony).toMatch(/^psy-/);
		const request = JSON.parse(fetch.mock.calls[0][1].body);
		expect(request.temperature).toBe(0.45);
		expect(request.messages[1].content).toContain('exactly three short sixteenths');
	});
});
