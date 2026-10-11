import {
	djFilter,
	fxLevel,
	intensity,
	layerLevel,
	position,
	riserCutoff,
	type FxName,
	type Position,
	type Timeline
} from '#lib/dj/arrangement.js';
import { BASE_MIX, blendMix, humanize, swingAmount, type MixProfile } from '#lib/dj/mix.js';
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
 * never overlap. Vocals leave early so two tracks never talk over each other.
 */
const CURVES: Record<LayerName, { in: (p: number) => number; out: (p: number) => number }> = {
	hats: { in: (p) => ramp(p, 0, 0.25), out: (p) => 1 - ramp(p, 0.625, 1) },
	perc: { in: (p) => ramp(p, 0.125, 0.375), out: (p) => 1 - ramp(p, 0.5, 0.875) },
	synth: { in: (p) => ramp(p, 0.25, 0.5), out: (p) => 1 - ramp(p, 0.375, 0.75) },
	vox: { in: (p) => ramp(p, 0.5, 0.75), out: (p) => 1 - ramp(p, 0, 0.25) },
	kick: { in: (p) => (p >= 0.5 ? 1 : 0), out: (p) => (p < 0.5 ? 1 : 0) },
	bass: { in: (p) => (p >= 0.5 ? 1 : 0), out: (p) => (p < 0.5 ? 1 : 0) }
};

export class Mixer {
	live: Deck = 0;
	plan: TransitionPlan | null = null;
	/** Arrangement timeline of each loaded deck. */
	timelines: [Timeline | null, Timeline | null] = [null, null];
	/** Locked layers: they also stay in through breakdowns. */
	pinned = new Set<LayerName>();

	/** Crossfade gain of one deck layer at a given cycle. */
	private blend(deck: Deck, layer: LayerName, cycle: number): number {
		const plan = this.plan;
		if (!plan) return deck === this.live ? 1 : 0;
		const locked = plan.locked.includes(layer);
		const p = clamp01((cycle - plan.start) / plan.bars);
		if (deck === plan.from) return locked ? 1 : CURVES[layer].out(p);
		if (deck === plan.to) return locked ? 0 : CURVES[layer].in(p);
		return 0;
	}

	/** Where a deck is in its track's arc, or null when it has no timeline. */
	position(deck: Deck, cycle: number): Position | null {
		const tl = this.timelines[deck];
		if (!tl) return null;
		const outro = this.plan?.from === deck ? this.plan.start : undefined;
		return position(tl, cycle, outro);
	}

	/**
	 * Gain of one deck layer at a given cycle: crossfade × arrangement. Called by Strudel at query
	 * time for every event, so it must be cheap.
	 */
	gain(deck: Deck, layer: LayerName, cycle: number): number {
		const g = this.blend(deck, layer, cycle);
		const pos = g > 0 ? this.position(deck, cycle) : null;
		if (!pos) return g;
		return g * layerLevel(this.timelines[deck]!, pos, layer, this.pinned.has(layer));
	}

	/** Track intensity (the `arc` signal), queried in the layer's own track time. */
	arc(deck: Deck, trackTime: number): number {
		const tl = this.timelines[deck];
		const pos = tl && this.position(deck, tl.origin + trackTime);
		return pos ? intensity(pos) : 0.5;
	}

	djf(deck: Deck, cycle: number): number {
		const pos = this.position(deck, cycle);
		return pos ? djFilter(this.timelines[deck]!, pos) : 0.5;
	}

	/** Mix profile of a deck's track. */
	mix(deck: Deck): MixProfile {
		return this.timelines[deck]?.mix ?? BASE_MIX;
	}

	/**
	 * Kick sidechain depths on the deck's [bass, synth, vox, rumble] buses. They follow the kick's
	 * level, so nothing pumps while the kick is out. The synth bus gets a share of the bass depth so
	 * leads are not pushed down as hard as the bass; the rumble always breathes with the kick.
	 */
	duck(deck: Deck, cycle: number): [number, number, number, number] {
		const tl = this.timelines[deck];
		if (!tl) return [0, 0, 0, 0];
		const kick = this.gain(deck, 'kick', cycle);
		const { duck, voxDuck } = tl.style;
		const mix = this.mix(deck);
		return [duck * kick, duck * mix.synthDuck * kick, (voxDuck ?? duck) * kick, 0.9 * kick];
	}

	/** Per-hit humanization of a layer event at track time `t` (see mix.ts). */
	humanize(deck: Deck, layer: LayerName, value: Record<string, unknown>, t: number) {
		return humanize(value, layer, t, this.mix(deck), deck);
	}

	/** The deck's rumble send: it follows the kick through the arrangement and the blend (the bus sets its level). */
	rumble(deck: Deck, cycle: number): number {
		return this.mix(deck).rumble > 0 ? this.gain(deck, 'kick', cycle) : 0;
	}

	/**
	 * The master bus profile at a cycle: the live deck's, blended toward the incoming deck's along
	 * the transition, so a genre change never jumps.
	 */
	masterMix(cycle: number): MixProfile {
		const plan = this.plan;
		if (!plan) return this.mix(this.live);
		const p = clamp01((cycle - plan.start) / plan.bars);
		return blendMix(this.mix(plan.from), this.mix(plan.to), ramp(p, 0.25, 0.75));
	}

	fx(deck: Deck, fx: FxName, cycle: number): number {
		const pos = this.position(deck, cycle);
		if (!pos) return 0;
		const prev = this.position(deck, Math.floor(cycle) - 0.5)!;
		return fxLevel(this.timelines[deck]!, pos, fx, cycle, prev);
	}

	riserCutoff(deck: Deck, cycle: number): number {
		const pos = this.position(deck, cycle);
		return pos ? riserCutoff(pos) : 300;
	}

	/** Average incoming level, used to drive the crossfader on screen. */
	crossfade(cycle: number): number {
		if (!this.plan) return this.live;
		const p = clamp01((cycle - this.plan.start) / this.plan.bars);
		const toward = LAYERS.reduce((sum, l) => sum + CURVES[l].in(p), 0) / LAYERS.length;
		return this.plan.to === 1 ? toward : 1 - toward;
	}
}

/** Name of the global the generated Strudel code reads the mixer from. */
export const MIXER_GLOBAL = '__ravebot';

const M = MIXER_GLOBAL;
/**
 * Each deck mixes into its own buses (Strudel orbits), and the engine processes every bus
 * separately (see master.ts): drums get glue, the bass keeps a mono sub that alone is ducked by the
 * kick, the synth bus is high-passed with presence and saturation, vox sits on its own, and the
 * rumble send is distorted and low-passed.
 */
export const BUSES = ['drums', 'bass', 'synth', 'vox', 'rumble'] as const;
export type BusName = (typeof BUSES)[number];
export const busOrbit = (bus: BusName, deck: number) =>
	1 + deck * BUSES.length + BUSES.indexOf(bus);
/** Every orbit the two decks use. */
export const ORBITS = [0, 1].flatMap((d) => BUSES.map((b) => busOrbit(b, d)));
const BUS_OF: Record<LayerName, BusName> = {
	kick: 'drums',
	hats: 'drums',
	perc: 'drums',
	bass: 'bass',
	synth: 'synth',
	vox: 'vox'
};
/** Drop silent events (breakdowns, faded decks) so they never reach the audio graph. */
const AUDIBLE = '.filterValues(v => v.postgain > 0.001)';
/** Layers whose 16ths get the genre's swing; the kick stays on the grid. */
const SWUNG = new Set<LayerName>(['hats', 'perc']);

/**
 * Builds the single Strudel program that plays both decks. Every layer gets a `postgain` driven by
 * a signal, so the blend and the arrangement are computed per event at its exact cycle position:
 * one evaluate() per transition, no re-evaluation per bar.
 *
 * Layer code runs in its own track time (`.late(origin)`), so `<...>` sequences, `.slow(16)`
 * sweeps and `.lastOf(8, ...)` fills line up with the track's phrases, and it can read `arc`,
 * the track's intensity. Each deck also gets the engine's build-up tools: a drum roll that speeds
 * up, a noise riser and an impact on the drop.
 */
export function buildProgram(decks: [Track | null, Track | null], mixer: Mixer): string {
	const parts: string[] = [];
	decks.forEach((track, deck) => {
		const tl = mixer.timelines[deck];
		if (!track || !tl) return;
		const deckFx = `.djf(signal(t => ${M}.djf(${deck}, t)))`;
		const layers: string[] = [];
		const mix = mixer.mix(deck as Deck);
		const orbit = (bus: BusName) => busOrbit(bus, deck);
		const ducks = tl.style.duck > 0 || (tl.style.voxDuck ?? 0) > 0 || mix.rumble > 0;
		for (const layer of LAYERS) {
			const expr = track.layers[layer];
			if (!expr || expr === 'silence') continue;
			// Array values duck several orbits, each with its own depth.
			const duck =
				layer === 'kick' && ducks
					? `.duckorbit(signal(() => [${(['bass', 'synth', 'vox', 'rumble'] as const).map(orbit).join(', ')}])).duckattack(.16)` +
						`.duckdepth(signal(t => ${M}.duck(${deck}, t)))`
					: '';
			// Swing unless the layer already swings itself.
			const swing =
				SWUNG.has(layer) && !expr.includes('swing') && swingAmount(mix.swing) > 0
					? `.swingBy(${swingAmount(mix.swing).toFixed(3)}, 8)`
					: '';
			const human = `.withHap(h => h.withValue(v => ${M}.humanize(${deck}, '${layer}', v, h.whole ? h.whole.begin.valueOf() : 0)))`;
			layers.push(
				`    (${expr})${swing}${human}.late(${tl.origin}).orbit(${orbit(BUS_OF[layer])})${duck}${deckFx}` +
					`.postgain(signal(t => ${M}.gain(${deck}, '${layer}', t)))${AUDIBLE}`
			);
		}
		// Rumble: the kick, fully wet into a long dark reverb on its own bus (distorted, low-passed
		// and ducked there), the low-end weight of Berlin techno.
		const kick = track.layers.kick;
		if (mix.rumble > 0 && kick && kick !== 'silence')
			layers.push(
				`    (${kick}).late(${tl.origin}).orbit(${orbit('rumble')}).room(1).roomsize(4).roomfade(.5).roomlp(1200).roomdim(200).dry(0)${deckFx}` +
					`.postgain(signal(t => ${M}.rumble(${deck}, t)))${AUDIBLE}`
			);
		const fx = (name: FxName, code: string) =>
			layers.push(
				`    ${code}.orbit(${orbit('drums')})${deckFx}` +
					`.postgain(signal(t => ${M}.fx(${deck}, '${name}', t)))${AUDIBLE}`
			);
		const { roll, riser, impact } = tl.style;
		if (roll) fx('roll', `s('${roll.s}*32').bank('${roll.bank}').room(.3).gain(.8)`);
		if (riser)
			fx(
				'riser',
				`s('${riser}*16').attack(.01).release(.05).hpf(signal(t => ${M}.riserCutoff(${deck}, t))).room(.4).gain(.9)`
			);
		if (impact)
			fx(
				'impact',
				`stack(s('cr').bank('RolandTR909').gain(.7), s('bd').bank('RolandTR808').speed(.6).lpf(400).room(.6))`
			);
		parts.push(
			`  ((arc) => stack(\n${layers.join(',\n')}\n  ))(signal(t => ${M}.arc(${deck}, t)))`
		);
	});
	return parts.length ? `stack(\n${parts.join(',\n')}\n)` : 'silence';
}
