import type { LayerName } from './types';

/**
 * Track arrangement: turns a flat 6-layer loop into a DJ-friendly arc (groove → lift → main →
 * breakdown → build → drop/peak → outro). Strudel patterns count bars from the start of the set,
 * so the arc is computed here, per event, against each deck's own timeline instead of being
 * written into the layer code. Everything is in bars of track time: bar 0 is where the track's
 * kick and bass come in (the middle of its mix-in), and the last TRANSITION_BARS are the mix-out.
 */

/** Every track is this long: kick in to the end of its mix-out. */
export const TRACK_BARS = 128;
export const TRANSITION_BARS = 16;

export type SectionKind =
	'intro' | 'groove' | 'lift' | 'main' | 'breakdown' | 'build' | 'peak' | 'outro';

/** How a genre builds tension. */
export interface ArcStyle {
	/** Drum that rolls through the build-up (snare, clap, rim, tom), or null for no roll. */
	roll: { s: string; bank: string } | null;
	/** Noise riser under the build-up. */
	riser: 'white' | 'pink' | null;
	/** Crash + sub boom on the drop. */
	impact: boolean;
	/** One beat of silence right before the drop. */
	gap: boolean;
	/** Kick sidechain depth on bass/synth/vox, 0..1. */
	duck: number;
	/** Breakdown level overrides, e.g. acid keeps its 303 line playing without the kick. */
	breakdown?: Partial<Record<LayerName, number>>;
}

export interface Timeline {
	/** Absolute cycle of track bar 0. */
	origin: number;
	style: ArcStyle;
}

export interface Position {
	kind: SectionKind;
	/** Progress through the section, 0..1. */
	x: number;
	/** Bars left until the section ends. */
	left: number;
}

interface Section {
	kind: SectionKind;
	start: number;
	end: number;
}

/** The section map of every track: 112 bars of body, then the 16-bar mix-out. */
export const SECTIONS: Section[] = (
	[
		['groove', 16],
		['lift', 16],
		['main', 24],
		['breakdown', 16],
		['build', 8],
		['peak', 32]
	] as const
).reduce<Section[]>((acc, [kind, bars]) => {
	const start = acc.at(-1)?.end ?? 0;
	return [...acc, { kind, start, end: start + bars }];
}, []);

const BODY = TRACK_BARS - TRANSITION_BARS;
/** Where a held (or late-mixed) track loops back to once the body is over: the main section. */
const LOOP = SECTIONS.find((s) => s.kind === 'main')!.start;

/**
 * Where a deck is in its arc at absolute cycle `t`. `outroFrom` is the cycle its mix-out started
 * (set while it is the outgoing deck). Without a mix-out the track loops its main part, so a
 * held track (or one waiting for a slow LLM) keeps breaking down and dropping instead of going flat.
 */
export function position(tl: Timeline, t: number, outroFrom?: number): Position {
	if (outroFrom !== undefined && t >= outroFrom) {
		const x = Math.min(1, (t - outroFrom) / TRANSITION_BARS);
		return { kind: 'outro', x, left: TRANSITION_BARS * (1 - x) };
	}
	let p = t - tl.origin;
	if (p < 0) return { kind: 'intro', x: 0, left: -p };
	if (p >= BODY) p = LOOP + ((p - BODY) % (BODY - LOOP));
	const s = SECTIONS.find((s) => p < s.end) ?? SECTIONS.at(-1)!;
	return { kind: s.kind, x: (p - s.start) / (s.end - s.start), left: s.end - p };
}

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** Per-section layer levels: layers are added section by section and stripped for the breakdown. */
const LEVELS: Record<SectionKind, Record<LayerName, number>> = {
	// The incoming deck during its mix-in: DJ-friendly, drums only (the mixer fades them in).
	intro: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 0, vox: 0 },
	groove: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 0, vox: 0 },
	lift: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 1, vox: 0 },
	main: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 1, vox: 1 },
	breakdown: { kick: 0, hats: 0.5, perc: 0.7, bass: 0, synth: 1, vox: 1 },
	build: { kick: 0, hats: 1, perc: 1, bass: 0, synth: 1, vox: 0 },
	peak: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 1, vox: 1 },
	outro: { kick: 1, hats: 1, perc: 1, bass: 1, synth: 1, vox: 0 }
};

/** The beat of silence before the drop. */
const GAP_BARS = 0.25;
const inGap = (tl: Timeline, pos: Position) =>
	tl.style.gap && pos.kind === 'build' && pos.left <= GAP_BARS;

/** Arrangement level of one layer (multiplied with the mixer's crossfade). Pinned layers never drop out. */
export function layerLevel(tl: Timeline, pos: Position, layer: LayerName, pinned = false): number {
	if (inGap(tl, pos)) return 0;
	if (pinned) return 1;
	if (pos.kind === 'breakdown') return tl.style.breakdown?.[layer] ?? LEVELS.breakdown[layer];
	return LEVELS[pos.kind][layer];
}

/**
 * Track intensity 0..1, exposed to layer code as the `arc` signal: it climbs through the groove,
 * dips in the breakdown, rushes up in the build and stays high at the peak.
 */
export function intensity(pos: Position): number {
	const ramps: Record<SectionKind, [number, number]> = {
		intro: [0.15, 0.15],
		groove: [0.15, 0.35],
		lift: [0.35, 0.55],
		main: [0.55, 0.75],
		breakdown: [0.3, 0.45],
		build: [0.45, 1],
		peak: [0.9, 1],
		outro: [0.7, 0.4]
	};
	const [a, b] = ramps[pos.kind];
	return lerp(a, b, pos.x);
}

/**
 * DJ filter for the whole deck (Strudel's `djf`: 0.5 is flat, lower is low-pass, higher is
 * high-pass). The breakdown opens up from a muffled low-pass, the build sweeps a high-pass up
 * so the low end slams back on the drop.
 */
export function djFilter(tl: Timeline, pos: Position): number {
	if (pos.kind === 'breakdown') return lerp(0.26, 0.42, pos.x);
	if (pos.kind === 'build' && !inGap(tl, pos)) return lerp(0.52, 0.76, pos.x ** 1.5);
	return 0.5;
}

export type FxName = 'roll' | 'riser' | 'impact';

/**
 * Gains of the build-up tools the engine adds to every deck. `t` is the event's cycle, so the roll
 * can thin its 32nd-note grid down to quarters, eighths, 16ths, then 32nds as the build progresses.
 */
export function fxLevel(
	tl: Timeline,
	pos: Position,
	fx: FxName,
	t: number,
	prev: Position
): number {
	const s = tl.style;
	if (fx === 'impact')
		return s.impact && prev.kind === 'build' && pos.kind !== 'build' && t % 1 < 1 / 64 ? 1 : 0;
	if (pos.kind !== 'build' || inGap(tl, pos)) return 0;
	if (fx === 'riser') return s.riser ? 0.04 + 0.3 * pos.x ** 2 : 0;
	if (!s.roll) return 0;
	const density = [4, 8, 16, 32][Math.min(3, Math.floor(pos.x * 4))];
	const step = (t % 1) * density;
	if (Math.abs(step - Math.round(step)) > 1e-6) return 0;
	return 0.2 + 0.8 * pos.x ** 1.5;
}

/** High-pass cutoff of the noise riser: 300 Hz → 12 kHz over the build. */
export const riserCutoff = (pos: Position) =>
	pos.kind === 'build' ? 300 * 40 ** Math.min(1, pos.x) : 300;
