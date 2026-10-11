import { describe, expect, it } from 'vitest';
import { CRATE_TITLES } from '../crate-titles';
import { GENRES } from '../genres';
import { LAYERS } from '../types';

const seeds = GENRES.flatMap((g) => g.seeds);

describe('local crate', () => {
	it('has 9 tracks per genre', () => {
		for (const genre of GENRES) expect(genre.seeds.length, genre.id).toBe(9);
	});

	it('has unique titles', () => {
		const titles = seeds.map((s) => s.title.toLowerCase());
		expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
	});

	it('names crate remixes uniquely, apart from the seeds', () => {
		const titles = [...seeds.map((s) => s.title), ...Object.values(CRATE_TITLES).flat()].map((t) =>
			t.toLowerCase()
		);
		expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
		for (const genre of GENRES) expect(CRATE_TITLES[genre.id].length, genre.id).toBeGreaterThan(10);
	});

	it('never repeats a bassline or melody', () => {
		for (const layer of ['bass', 'synth', 'vox'] as const) {
			const codes = seeds.map((s) => s.layers[layer]);
			expect(
				codes.filter((c, i) => codes.indexOf(c) !== i),
				layer
			).toEqual([]);
		}
	});

	it('fills every layer of every track', () => {
		for (const seed of seeds)
			for (const layer of LAYERS) expect(seed.layers[layer], `${seed.title}/${layer}`).toBeTruthy();
	});
});
