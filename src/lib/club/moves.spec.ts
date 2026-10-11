import { describe, expect, it } from 'vitest';
import { choreograph, pickMove, type Move, type MoveInput } from './moves';

const base: MoveInput = {
	live: true,
	section: 'main',
	x: 0.3,
	cycle: 40,
	kick: 1,
	energy: 6,
	intensity: 0.7,
	mixing: false,
	crossfade: 0
};
const at = (patch: Partial<MoveInput>) => ({ ...base, ...patch });

/** Moves picked over many phrases of one section. */
function repertoire(patch: Partial<MoveInput>) {
	const seen = new Set<Move>();
	for (let p = 0; p < 200; p++) seen.add(pickMove(at({ ...patch, cycle: p * 4 + 1 })));
	return seen;
}

describe('pickMove', () => {
	it('stands still when the set is off', () => {
		expect(pickMove(at({ live: false }))).toBe('idle');
		expect(choreograph(at({ live: false })).nod).toBe(0);
	});

	it('points at the roof on the drop and cues in the headphones while mixing', () => {
		expect(pickMove(at({ section: 'peak', x: 0.05 }))).toBe('drop');
		expect(pickMove(at({ section: 'outro', x: 0.2, mixing: true }))).toBe('cue');
		expect(pickMove(at({ section: 'outro', x: 0.8, mixing: true }))).toBe('mixEq');
	});

	it('claps, tweaks and reaches up through the build', () => {
		expect(pickMove(at({ section: 'build', x: 0.2 }))).toBe('clap');
		expect(pickMove(at({ section: 'build', x: 0.6 }))).toBe('tweak');
		expect(pickMove(at({ section: 'build', x: 0.9 }))).toBe('reach');
	});

	it('keeps one move for a whole 4-bar phrase', () => {
		const moves = [0, 1, 2, 3.9].map((b) => pickMove(at({ cycle: 48 + b })));
		expect(new Set(moves).size).toBe(1);
	});

	it('mixes it up from phrase to phrase', () => {
		expect(repertoire({ section: 'main' }).size).toBeGreaterThan(2);
		expect(repertoire({ section: 'peak', x: 0.5 }).size).toBeGreaterThan(2);
	});

	it('matches the energy: calm moves at low energy, wild ones at the peak', () => {
		const calm = repertoire({ section: 'main', energy: 1, intensity: 0.1 });
		const wild = repertoire({ section: 'peak', x: 0.5, energy: 10, intensity: 1 });
		expect(calm.has('headbang')).toBe(false);
		expect(wild.has('deepNod')).toBe(false);
		expect([...wild].some((m) => ['roof', 'headbang', 'pump'].includes(m))).toBe(true);
	});

	it('only sways and waves in the breakdown', () => {
		for (const m of repertoire({ section: 'breakdown' }))
			expect(['sway', 'wave', 'deepNod']).toContain(m);
	});
});

describe('choreograph', () => {
	it('pumps the fist up on the beat and down off it', () => {
		const pumpCycle = [...Array(400).keys()]
			.map((p) => p * 4 + 1)
			.find((c) => pickMove(at({ section: 'peak', x: 0.5, cycle: c })) === 'pump')!;
		const onBeat = choreograph(at({ section: 'peak', x: 0.5, cycle: pumpCycle }));
		const offBeat = choreograph(at({ section: 'peak', x: 0.5, cycle: pumpCycle + 0.15 }));
		expect(onBeat.left.hand[1]).toBeLessThan(offBeat.left.hand[1]);
	});
});
