import { describe, expect, it } from 'vitest';
import { genreById } from '#lib/dj/genres.js';
import type { Track } from '#lib/dj/types.js';
import { Mixer, ORBITS, buildProgram, busOrbit } from './mixer';

const track = (genre: Track['genre']): Track => ({
	id: 'x',
	title: 'x',
	comment: '',
	genre,
	source: 'fallback',
	layers: genreById(genre).seeds[0].layers
});

const live = (genre: Track['genre']) => {
	const mixer = new Mixer();
	const { arc, mix } = genreById(genre);
	mixer.timelines = [{ origin: 0, style: arc, mix }, null];
	return mixer;
};

describe('buses', () => {
	it('gives each deck its own drums, bass, synth, vox and rumble orbit', () => {
		expect(new Set(ORBITS).size).toBe(10);
		expect(busOrbit('bass', 0)).toBe(2);
		expect(busOrbit('drums', 1)).toBe(6);
	});

	it('routes bass and synth to separate buses', () => {
		const code = buildProgram([track('acid'), null], live('acid'));
		expect(code).toMatch(/note\([^\n]*\.orbit\(2\)/);
		expect(code).toMatch(/'synth', v[^\n]*\.orbit\(3\)/);
	});
});

describe('sidechain', () => {
	it('ducks the synth and vox lighter than the bass where the genre asks for it', () => {
		const [bass, synth, vox] = live('french').duck(0, 40);
		expect(bass).toBeCloseTo(0.7);
		expect(synth).toBeCloseTo(0.7);
		expect(vox).toBeCloseTo(0.3);
		const [acid, acidSynth, acidVox] = live('acid').duck(0, 40);
		expect(acidVox).toBe(acid);
		expect(acidSynth).toBeLessThan(acid);
	});

	it('stops pumping while the kick is out', () => {
		expect(live('french').duck(0, 60)).toEqual([0, 0, 0, 0]);
	});

	it('lets the kick duck every music bus of its deck', () => {
		const code = buildProgram([track('french'), null], live('french'));
		expect(code).toContain('.duckorbit(signal(() => [2, 3, 4, 5]))');
		expect(code).toMatch(/vowel[^\n]*\.orbit\(4\)/);
	});

	it('does not duck genres without a sidechain', () => {
		expect(buildProgram([track('psy'), null], live('psy'))).not.toContain('duckorbit');
	});
});

describe('groove and weight', () => {
	it('swings hats and percussion but never the kick', () => {
		const code = buildProgram([track('detroit'), null], live('detroit'));
		const lines = code.split('\n');
		expect(lines.find((l) => l.includes("'kick', v"))).not.toContain('swingBy(0.140');
		expect(lines.filter((l) => l.includes('swingBy(0.140, 8)')).length).toBeGreaterThan(0);
	});

	it('leaves layers that swing themselves alone', () => {
		const t = track('minimal');
		t.layers = { ...t.layers, hats: "s('hh*16').bank('RolandTR909').swingBy(1/6, 8)" };
		const hats = buildProgram([t, null], live('minimal'))
			.split('\n')
			.find((l) => l.includes("'hats', v"))!;
		expect(hats.match(/swingBy/g)).toHaveLength(1);
	});

	it('adds a rumble send only to genres that want one', () => {
		expect(buildProgram([track('hard'), null], live('hard'))).toContain('.orbit(5).room(1)');
		expect(buildProgram([track('french'), null], live('french'))).not.toContain('.orbit(5)');
	});

	it('blends the master profile across a genre change', () => {
		const mixer = live('french');
		mixer.timelines[1] = {
			origin: 16,
			...{ style: genreById('hard').arc, mix: genreById('hard').mix }
		};
		mixer.plan = { from: 0, to: 1, start: 0, bars: 16, locked: [] };
		expect(mixer.masterMix(0).drive).toBeCloseTo(genreById('french').mix.drive);
		expect(mixer.masterMix(16).drive).toBeCloseTo(genreById('hard').mix.drive);
		const mid = mixer.masterMix(8).drive;
		expect(mid).toBeGreaterThan(genreById('french').mix.drive);
		expect(mid).toBeLessThan(genreById('hard').mix.drive);
	});
});
