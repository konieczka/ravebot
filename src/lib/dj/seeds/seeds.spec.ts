import { describe, expect, it } from 'vitest';
import { CRATE_NAMES } from '../crate-names';
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
		const names = Object.values(CRATE_NAMES).flat();
		const titles = [...seeds.map((s) => s.title), ...names.map((n) => n.title)].map((t) =>
			t.toLowerCase()
		);
		expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
		const comments = names.map((n) => n.comment.toLowerCase());
		expect(comments.filter((c, i) => comments.indexOf(c) !== i)).toEqual([]);
		for (const n of names) expect(n.comment.split(/\s+/).length, n.title).toBeLessThanOrEqual(12);
		for (const genre of GENRES) expect(CRATE_NAMES[genre.id].length, genre.id).toBeGreaterThan(10);
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
