import { describe, expect, it } from 'vitest';
import {
	SECTIONS,
	TRACK_BARS,
	TRANSITION_BARS,
	djFilter,
	fxLevel,
	intensity,
	layerLevel,
	position,
	type ArcStyle,
	type Timeline
} from './arrangement';
import { GENRES } from './genres';

const drop: ArcStyle = {
	roll: { s: 'sd', bank: 'RolandTR909' },
	riser: 'white',
	impact: true,
	gap: true,
	duck: 0.5
};
const tl: Timeline = { origin: 100, style: drop };
const at = (bar: number, outro?: number) => position(tl, tl.origin + bar, outro);

describe('sections', () => {
	it('fill the body of the track up to the mix-out', () => {
		expect(SECTIONS[0].start).toBe(0);
		expect(SECTIONS.at(-1)!.end).toBe(TRACK_BARS - TRANSITION_BARS);
		for (let i = 1; i < SECTIONS.length; i++) expect(SECTIONS[i].start).toBe(SECTIONS[i - 1].end);
		// Every change lands on a phrase boundary.
		for (const s of SECTIONS) expect(s.start % 8).toBe(0);
	});
});

describe('position', () => {
	it('walks groove → lift → main → breakdown → build → peak', () => {
		expect([0, 16, 32, 56, 72, 80].map((b) => at(b).kind)).toEqual([
			'groove',
			'lift',
			'main',
			'breakdown',
			'build',
			'peak'
		]);
		expect(at(-4).kind).toBe('intro');
		expect(at(76).x).toBeCloseTo(0.5);
	});

	it('loops back to the main section when the track is held past its mix-out point', () => {
		expect(at(112).kind).toBe('main');
		expect(at(112 + 24).kind).toBe('breakdown');
		expect(at(112 + 80).kind).toBe('main');
	});

	it('switches to the outro once the mix-out starts', () => {
		const pos = at(60, tl.origin + 60);
		expect(pos.kind).toBe('outro');
		expect(at(59, tl.origin + 60).kind).toBe('breakdown');
	});
});

describe('levels', () => {
	it('adds layers over the track and strips the breakdown', () => {
		expect(layerLevel(tl, at(0), 'synth')).toBe(0);
		expect(layerLevel(tl, at(16), 'synth')).toBe(1);
		expect(layerLevel(tl, at(16), 'vox')).toBe(0);
		expect(layerLevel(tl, at(32), 'vox')).toBe(1);
		expect(layerLevel(tl, at(60), 'kick')).toBe(0);
		expect(layerLevel(tl, at(60), 'bass')).toBe(0);
		expect(layerLevel(tl, at(80), 'kick')).toBe(1);
	});

	it('keeps genre breakdown overrides and pinned layers', () => {
		const acid = { ...tl, style: GENRES.find((g) => g.id === 'acid')!.arc };
		expect(layerLevel(acid, at(60), 'bass')).toBe(1);
		expect(layerLevel(tl, at(60), 'kick', true)).toBe(1);
	});

	it('cuts everything for the beat before the drop, unless the genre has no gap', () => {
		expect(layerLevel(tl, at(79.8), 'hats')).toBe(0);
		expect(layerLevel(tl, at(79.7), 'hats')).toBe(1);
		const dub = { ...tl, style: { ...drop, gap: false } };
		expect(layerLevel(dub, at(79.8), 'hats')).toBe(1);
	});

	it('rises in intensity towards the peak and dips in the breakdown', () => {
		expect(intensity(at(0))).toBeLessThan(intensity(at(40)));
		expect(intensity(at(60))).toBeLessThan(intensity(at(40)));
		expect(intensity(at(80))).toBeGreaterThan(0.85);
	});

	it('sweeps the DJ filter: low-pass in the breakdown, high-pass in the build', () => {
		expect(djFilter(tl, at(40))).toBe(0.5);
		expect(djFilter(tl, at(57))).toBeLessThan(0.49);
		expect(djFilter(tl, at(78))).toBeGreaterThan(0.6);
		expect(djFilter(tl, at(80))).toBe(0.5);
	});
});

describe('build-up fx', () => {
	const fx = (bar: number, name: 'roll' | 'riser' | 'impact') =>
		fxLevel(tl, at(bar), name, tl.origin + bar, at(Math.floor(bar) - 0.5));

	it('rolls quarter notes first, then 32nds at the end', () => {
		expect(fx(72, 'roll')).toBeGreaterThan(0);
		expect(fx(72.125, 'roll')).toBe(0); // 8th note: not yet
		expect(fx(78 + 1 / 32, 'roll')).toBeGreaterThan(0);
		expect(fx(78 + 1 / 32, 'roll')).toBeGreaterThan(fx(72, 'roll'));
		expect(fx(40, 'roll')).toBe(0);
	});

	it('fires the impact on the first beat of the drop only', () => {
		expect(fx(80, 'impact')).toBe(1);
		expect(fx(80.25, 'impact')).toBe(0);
		expect(fx(81, 'impact')).toBe(0);
		expect(fx(79, 'riser')).toBeGreaterThan(fx(72, 'riser'));
	});
});
