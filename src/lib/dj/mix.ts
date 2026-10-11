import type { LayerName } from './types';

/**
 * How a genre is mixed: groove feel, bus processing and levels. The engine applies all of it, so
 * LLM-written layers, seeds and old tracks get the same treatment. Numbers come from common club
 * techno practice: 16th swing around 54%, a few cents of analogue drift, bass a few dB under the
 * kick, leads pushed forward with presence and saturation instead of raw level, a rumble send
 * (kick → long reverb → distortion → low-pass → sidechain) for weight.
 */
export interface MixProfile {
	/** 16th swing of hats and percussion: 0.5 is straight, 0.54 loosens, 0.58 shuffles. */
	swing: number;
	/** How much the hats accent the beat and off-beat over the in-between 16ths, 0..1. */
	accent: number;
	/** Random level variation per hit, 0..1 (0.08 = ±8%). */
	jitter: number;
	/** Analogue pitch drift of bass and synth notes, in cents. */
	drift: number;
	/** Drum bus compression (glue plus parallel smash), 0..1. */
	glue: number;
	/** Master saturation, 0..1. */
	drive: number;
	/** Saturation on the bass's upper band (above the sub), 0..1. */
	bassDrive: number;
	/** Saturation on the synth bus, 0..1: harmonics so leads cut through without more level. */
	synthDrive: number;
	/** Rumble level (kick → long reverb → distortion → 100 Hz low-pass), 0 for none. */
	rumble: number;
	/**
	 * Level trims in dB, relative to the kick. Calibrated by metering every seed of the genre
	 * (K-weighted, main section): the seeds put the synth 20-35 LU under the drums, these bring it to
	 * about 9-13 LU under and the bass to about 7-13 LU under. Hats and percussion are trimmed per hit.
	 */
	bass: number;
	synth: number;
	vox: number;
	hats: number;
	perc: number;
	/** Low-pass on reverb and delay returns in Hz: lower sounds darker and further away. */
	space: number;
	/** Share of the genre's kick sidechain depth applied to the synth bus (the bass always gets all of it). */
	synthDuck: number;
	/** Level of the short metal impact exciter accompanying the Hardbass kick. */
	bochka: number;
	/** Mild waveshaping on the dedicated Hardbass kick body, independent of the drums bus. */
	barrel: number;
	/** Metal shell resonance level, independent of the dry impact and kick body. */
	can: number;
	/** Cheap master: band-limited (no air, no deep sub), narrowed to near mono, clipped instead of limited. */
	lofi: number;
	/** Over-driven fast master compression, so the whole mix breathes on every kick. */
	pump: number;
}

/** Shared starting point; genres override what makes them different. */
export const BASE_MIX: MixProfile = {
	swing: 0.54,
	accent: 0.5,
	jitter: 0.08,
	drift: 5,
	glue: 0.5,
	drive: 0.3,
	bassDrive: 0.3,
	synthDrive: 0.25,
	rumble: 0,
	bass: 3,
	synth: 16,
	vox: 6,
	hats: 3,
	perc: 2,
	space: 7000,
	synthDuck: 0.5,
	bochka: 0,
	barrel: 0,
	can: 0,
	lofi: 0,
	pump: 0
};

export const mixProfile = (overrides: Partial<MixProfile> = {}): MixProfile => ({
	...BASE_MIX,
	...overrides
});

/** Linear blend of two profiles, used for the master bus while two genres crossfade. */
export function blendMix(a: MixProfile, b: MixProfile, x: number): MixProfile {
	const out = { ...a };
	for (const key of Object.keys(a) as (keyof MixProfile)[])
		out[key] = a[key] + (b[key] - a[key]) * x;
	return out;
}

/** Strudel's swingBy(x, 8) delays the second 16th of each pair by x/2 of the pair. */
export const swingAmount = (swing: number) => Math.max(0, 2 * (swing - 0.5));

/** Deterministic hash noise in -1..1, so a hap queried twice gets the same humanization. */
function hash(...xs: number[]): number {
	let h = 2166136261;
	for (const x of xs) {
		h ^= Math.round(x * 100003) | 0;
		h = Math.imul(h, 16777619);
		h ^= h >>> 13;
	}
	return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Smooth value noise in -1..1 over `t`, one random point per unit. */
function drift(seed: number, t: number): number {
	const i = Math.floor(t);
	const f = t - i;
	const s = f * f * (3 - 2 * f);
	return hash(seed, i) * (1 - s) + hash(seed, i + 1) * s;
}

const LAYER_SEED: Record<LayerName, number> = {
	kick: 1,
	hats: 2,
	perc: 3,
	bass: 4,
	synth: 5,
	vox: 6
};

/** Oscillator synths: their pitch and filter drift. Samples keep their pitch. */
const OSCILLATORS = new Set(['sawtooth', 'saw', 'square', 'triangle', 'sine', 'supersaw', 'pulse']);

const CHROMA: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** 'eb2' -> 39, 'c#4' -> 61. Null when the value is not a note name. */
export function noteToMidi(note: string): number | null {
	const m = /^([a-gA-G])([#sbf]*)(-?\d+)?$/.exec(note.trim());
	if (!m) return null;
	const acc = [...m[2]].reduce((a, c) => a + (c === '#' || c === 's' ? 1 : -1), 0);
	return (Number(m[3] ?? 3) + 1) * 12 + CHROMA[m[1].toLowerCase()] + acc;
}

/**
 * Per-hit humanization of one layer event, at track time `t` (cycles): velocity accents and
 * jitter, slow pitch drift plus a little per-note detune on oscillators, and a slowly wandering
 * filter cutoff. The kick and the clap backbone stay steady; hats breathe the most.
 */
export function humanize(
	value: Record<string, unknown>,
	layer: LayerName,
	t: number,
	mix: MixProfile,
	deck: number
): Record<string, unknown> {
	const seed = LAYER_SEED[layer] + deck * 10;
	const out = { ...value };
	let vel = 1 + hash(seed, t) * mix.jitter * (layer === 'kick' ? 0.25 : 1);
	if (layer === 'hats') {
		// 16th position in the beat: the beat and the off-beat 8th carry the groove.
		const step = Math.round(t * 16) % 4;
		const accent = step === 0 ? 1 : step === 2 ? 0.88 : 0.68;
		vel *= 1 - mix.accent * (1 - accent);
	}
	if (layer === 'hats' || layer === 'perc') vel *= 10 ** (mix[layer] / 20);
	out.velocity = (typeof value.velocity === 'number' ? value.velocity : 1) * vel;

	const osc = typeof value.s !== 'string' || OSCILLATORS.has(value.s);
	if ((layer === 'bass' || layer === 'synth' || layer === 'vox') && osc && mix.drift > 0) {
		const midi =
			typeof value.note === 'number'
				? value.note
				: typeof value.note === 'string'
					? noteToMidi(value.note)
					: null;
		if (midi !== null) {
			// Slow drift over ~8 bars, plus a smaller random offset per note. The sub stays tighter.
			const cents = mix.drift * (0.7 * drift(seed, t / 8) + 0.3 * hash(seed + 7, t));
			out.note = midi + (cents * (layer === 'bass' ? 0.5 : 1)) / 100;
		}
		if (typeof value.cutoff === 'number')
			out.cutoff = value.cutoff * 2 ** (0.12 * drift(seed + 3, t / 4));
	}
	return out;
}
