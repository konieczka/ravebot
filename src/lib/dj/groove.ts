import type { GenreId, LayerName } from './types';

export interface GrooveEvent {
	begin: number;
	end: number;
	value: Record<string, unknown>;
}
export interface GrooveContract {
	genre: GenreId;
	weirdness: number;
}

const onGrid = (time: number, steps: number) =>
	Math.abs(time * steps - Math.round(time * steps)) < 1e-6;

/** Check performed onsets before engine swing/humanization, not the model's description. */
export function checkGroove(
	layer: LayerName,
	events: GrooveEvent[],
	contract: GrooveContract
): void {
	if (layer === 'vox') return;
	const foundation = layer === 'kick' || layer === 'bass' || layer === 'synth';
	if ((foundation || contract.weirdness < 7) && events.some((e) => !onGrid(e.begin, 16)))
		throw new Error('notes must stay on the sixteenth-note grid');
	const onsets = new Set(events.map((e) => Math.round(e.begin * 16)));
	if (layer === 'kick') {
		if (events.length !== 64 || events.some((e) => !onGrid(e.begin, 4)) || onsets.size !== 64)
			throw new Error('kick must play exactly once on each beat');
	}
	if (layer === 'bass' && (contract.genre === 'psy' || contract.genre === 'hardbass')) {
		const expected = new Set(
			Array.from({ length: 256 }, (_, i) => i).filter((i) =>
				contract.genre === 'psy' ? i % 4 !== 0 : i % 4 === 2
			)
		);
		if (onsets.size !== expected.size || [...onsets].some((i) => !expected.has(i)))
			throw new Error(
				contract.genre === 'psy'
					? 'bass must play three sixteenths after each kick'
					: 'donk must play on each off-beat'
			);
	}
	// Stacked sub/top voices at the same pitch count as one bass note, not a chord.
	if (layer === 'bass') {
		const pitches = new Map<number, Set<unknown>>();
		for (const e of events) {
			const notes = pitches.get(e.begin) ?? new Set();
			notes.add(e.value.note);
			pitches.set(e.begin, notes);
		}
		if ([...pitches.values()].some((notes) => notes.size > 1))
			throw new Error('bass must be monophonic');
	}
	for (let bar = 0; bar < 16; bar++) {
		const inBar = events.filter((e) => e.begin >= bar && e.begin < bar + 1);
		const attacks = new Set(inBar.map((e) => e.begin)).size;
		const limit = layer === 'hats' || layer === 'perc' ? (contract.weirdness >= 7 ? 32 : 16) : 16;
		if (attacks > limit) throw new Error('too many attacks per bar for the composition budget');
	}
}
