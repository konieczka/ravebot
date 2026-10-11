import { describe, expect, it } from 'vitest';
import { genreById } from '#lib/dj/genres.js';
import type { Track } from '#lib/dj/types.js';
import { Mixer, ORBITS, buildProgram, busOrbit, harmonicTransition } from './mixer';

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
		expect(new Set(ORBITS).size).toBe(12);
		expect(busOrbit('bass', 0)).toBe(2);
		expect(busOrbit('drums', 1)).toBe(7);
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
		expect(bass).toBeGreaterThan(0);
		expect(bass).toBeLessThan(0.7);
		expect(synth).toBeLessThan(bass);
		expect(vox).toBeLessThan(synth);
		const [acid, acidSynth, acidVox] = live('acid').duck(0, 40);
		expect(acidVox).toBe(acid);
		expect(acidSynth).toBeLessThan(acid);
	});

	it('stops pumping while the kick is out', () => {
		expect(live('hard').duck(0, 60)).toEqual([0, 0, 0, 0]);
		expect(live('french').duck(0, 60)[0]).toBeGreaterThan(0);
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

	it('replaces the hardbass kick and adds just one short metal exciter', () => {
		const code = buildProgram([track('hardbass'), null], live('hardbass'));
		expect(code).toContain("hardbassVoice('kick', v, 0)");
		expect(code).toContain("hardbassVoice('bass', v, 0)");
		expect(code).toContain("hardbassVoice('vox', v, 0)");
		expect(code.match(/hardbassVoice\('strike'/g)).toHaveLength(1);
		expect(code).toMatch(/hardbassVoice\('strike'[^\n]*\.orbit\(6\)/);
		expect(code).toContain('__ravebot.bochka(0, t)');
		expect(buildProgram([track('hard'), null], live('hard'))).not.toContain('hardbassVoice');
	});

	it('keeps the metal strike silent when the kick leaves the arrangement', () => {
		const mixer = live('hardbass');
		expect(mixer.bochka(0, 40)).toBeGreaterThan(0);
		expect(mixer.bochka(0, 60)).toBe(0);
		const t = track('hardbass');
		t.layers = { ...t.layers, kick: 'silence' };
		expect(buildProgram([t, null], mixer)).not.toContain("hardbassVoice('strike'");
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

describe('French phrase transitions', () => {
	const transition = (harmony: 'overlap' | 'bridge') => {
		const mixer = live('french');
		mixer.timelines[1] = { ...mixer.timelines[0]!, origin: 120 };
		mixer.plan = { from: 0, to: 1, start: 112, bars: 16, locked: [], harmony };
		return mixer;
	};

	it('requires both the same chord grid and aligned phrase phase', () => {
		expect(harmonicTransition('sunrise-d', 'sunrise-d', 3, 123)).toBe('overlap');
		expect(harmonicTransition('sunrise-d', 'sunrise-d', 3, 122)).toBe('bridge');
		expect(harmonicTransition('sunrise-d', 'velvet-a')).toBe('bridge');
		expect(harmonicTransition()).toBe('bridge');
	});

	it('keeps the incoming hook audible through a compatible handoff without a gain hump', () => {
		const mixer = transition('overlap');
		for (let t = 112; t < 128; t += 0.25) {
			expect(mixer.gain(0, 'synth', t) + mixer.gain(1, 'synth', t)).toBeCloseTo(1);
			// Exactly one bass owns the low end.
			expect(mixer.gain(0, 'bass', t) + mixer.gain(1, 'bass', t)).toBe(1);
		}
	});

	it('clears incompatible harmony before the new bass arrives while percussion continues', () => {
		const mixer = transition('bridge');
		expect(mixer.gain(0, 'synth', 119)).toBe(0);
		expect(mixer.gain(1, 'synth', 119)).toBe(0);
		expect(mixer.gain(1, 'bass', 120)).toBe(1);
		expect(mixer.gain(0, 'synth', 120)).toBe(0);
		expect(mixer.gain(1, 'synth', 122)).toBe(1);
		expect(mixer.gain(1, 'hats', 119)).toBeGreaterThan(0);
	});

	it('closes and reopens one music filter while leaving the drum filter flat', () => {
		const mixer = live('french');
		expect(mixer.musicCutoff(0, 71)).toBeLessThan(mixer.musicCutoff(0, 56));
		expect(mixer.musicCutoff(0, 79)).toBeGreaterThan(mixer.musicCutoff(0, 72));
		expect(mixer.djf(0, 72)).toBe(0.5);
		expect(live('acid').musicCutoff(0, 72)).toBe(18000);
	});

	it('lets the active kick pump both decks through a French house transition', () => {
		const mixer = transition('overlap');
		expect(mixer.duck(1, 118, 0)[0]).toBeGreaterThan(0);
		expect(mixer.duck(0, 122, 1)[1]).toBeGreaterThan(0);
		const code = buildProgram([track('french'), track('french')], mixer);
		expect(code).toContain('[2, 3, 4, 5, 8, 9, 10, 11]');
		expect(code).toContain('...__ravebot.duck(1, t, 0)');
	});

	it('scales recovery with tempo only for profiles that opt in', () => {
		const mixer = live('french');
		mixer.bpm = 120;
		const slow = mixer.duckRelease(0);
		mixer.bpm = 150;
		expect(mixer.duckRelease(0)).toBeCloseTo((slow * 120) / 150);
		expect(live('acid').duckRelease(0)).toBe(0.16);
	});
});
