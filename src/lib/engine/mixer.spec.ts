import { describe, expect, it } from 'vitest';
import { genreById } from '#lib/dj/genres.js';
import type { Track } from '#lib/dj/types.js';
import { Mixer, ORBITS, buildProgram } from './mixer';

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
	mixer.timelines = [{ origin: 0, style: genreById(genre).arc }, null];
	return mixer;
};

describe('sidechain', () => {
	it('ducks the vox lighter than the music where the genre asks for it', () => {
		const [music, vox] = live('french').duck(0, 40);
		expect(music).toBeCloseTo(0.7);
		expect(vox).toBeCloseTo(0.3);
		const [acid, acidVox] = live('acid').duck(0, 40);
		expect(acidVox).toBe(acid);
	});

	it('stops pumping while the kick is out', () => {
		expect(live('french').duck(0, 60)).toEqual([0, 0]);
	});

	it('routes vox to its own orbit and lets the kick duck music and vox', () => {
		const mixer = live('french');
		const code = buildProgram([track('french'), null], mixer);
		expect(code).toContain('.duckorbit(signal(() => [2, 5]))');
		expect(code).toMatch(/vowel[^\n]*\.orbit\(5\)/);
		expect(new Set(ORBITS).size).toBe(6);
	});

	it('does not duck genres without a sidechain', () => {
		expect(buildProgram([track('psy'), null], live('psy'))).not.toContain('duckorbit');
	});
});
