import { LAYERS, type LayerName, type Track } from '#lib/dj/types.js';

export type Deck = 0 | 1;

export interface TransitionPlan {
	from: Deck;
	to: Deck;
	/** Cycle (bar) where the blend starts. */
	start: number;
	bars: number;
	/** Layers that are identical in both decks and simply keep playing on the outgoing deck. */
	locked: LayerName[];
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0 before `a`, 1 after `b`, smooth in between. */
const ramp = (p: number, a: number, b: number) => {
	const x = clamp01((p - a) / (b - a));
	return x * x * (3 - 2 * x);
};

/**
 * DJ-style blend curves over transition progress p (0..1). Hats and percussion sneak in first,
 * the synth follows, and kick + bass are swapped hard on the middle downbeat so two basslines
 * never overlap.
 */
const CURVES: Record<LayerName, { in: (p: number) => number; out: (p: number) => number }> = {
	hats: { in: (p) => ramp(p, 0, 0.25), out: (p) => 1 - ramp(p, 0.625, 1) },
	perc: { in: (p) => ramp(p, 0.125, 0.375), out: (p) => 1 - ramp(p, 0.5, 0.875) },
	synth: { in: (p) => ramp(p, 0.25, 0.5), out: (p) => 1 - ramp(p, 0.375, 0.75) },
	kick: { in: (p) => (p >= 0.5 ? 1 : 0), out: (p) => (p < 0.5 ? 1 : 0) },
	bass: { in: (p) => (p >= 0.5 ? 1 : 0), out: (p) => (p < 0.5 ? 1 : 0) }
};

export class Mixer {
	live: Deck = 0;
	plan: TransitionPlan | null = null;

	/** Gain of one deck layer at a given cycle. Called by Strudel at query time, so it must be cheap. */
	gain(deck: Deck, layer: LayerName, cycle: number): number {
		const plan = this.plan;
		if (!plan) return deck === this.live ? 1 : 0;
		const locked = plan.locked.includes(layer);
		const p = clamp01((cycle - plan.start) / plan.bars);
		if (deck === plan.from) return locked ? 1 : CURVES[layer].out(p);
		if (deck === plan.to) return locked ? 0 : CURVES[layer].in(p);
		return 0;
	}

	/** Average incoming level, used to drive the crossfader on screen. */
	crossfade(cycle: number): number {
		if (!this.plan) return this.live;
		const p = clamp01((cycle - this.plan.start) / this.plan.bars);
		const toward = LAYERS.reduce((sum, l) => sum + CURVES[l].in(p), 0) / LAYERS.length;
		return this.plan.to === 1 ? toward : 1 - toward;
	}
}

/** Name of the global the generated Strudel code reads gains from. */
export const GAIN_FN = '__technobotGain';

/**
 * Builds the single Strudel program that plays both decks. Every layer gets a `postgain`
 * driven by a signal, so the blend is computed per event at its exact cycle position:
 * one evaluate() per transition, no re-evaluation per bar.
 */
export function buildProgram(decks: [Track | null, Track | null]): string {
	const parts: string[] = [];
	decks.forEach((track, deck) => {
		if (!track) return;
		for (const layer of LAYERS) {
			const expr = track.layers[layer];
			if (!expr || expr === 'silence') continue;
			parts.push(`  (${expr}).postgain(signal(t => ${GAIN_FN}(${deck}, '${layer}', t)))`);
		}
	});
	return parts.length ? `stack(\n${parts.join(',\n')}\n)` : 'silence';
}
