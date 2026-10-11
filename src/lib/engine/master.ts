import { DuckEnvelope } from './duck.js';
import { BASE_MIX, type MixProfile } from '#lib/dj/mix.js';
import { BUSES, busOrbit, type BusName } from './mixer.js';

/**
 * The mixing desk behind Strudel. Superdough sums every orbit straight into the speakers; this
 * module splices Web Audio processing into that graph:
 *
 *   orbit (Strudel) ─▶ bus insert (per deck and bus) ─▶ superdough output ─▶ master chain ─▶ out
 *
 * - drums: glue compression plus a parallel "smash" compressor
 * - bass: crossover at 120 Hz; the sub is mono; French house also ducks the upper band. The upper
 *   band is saturated so the bassline stays audible on small speakers
 * - synth: 24 dB high-pass at 150 Hz, low-mid cut, presence boost, saturation, level trim
 * - vox: high-pass and presence
 * - rumble: distortion → 100 Hz low-pass → mono, ducked by the kick
 * - reverb and delay returns of every orbit are high- and low-passed (delay repeats darken in the
 *   feedback loop, like a tape echo)
 * - master: mono below 120 Hz, gentle EQ, 2:1 glue compressor, saturation, limiter
 *
 * It relies on superdough 1.3 internals (Orbit nodes and the output's destinationGain), so the
 * package is pinned.
 */

interface Orbit {
	audioContext: AudioContext;
	output: GainNode;
	summingNode: GainNode;
	reverbNode?: ConvolverNode;
	delayNode?: DelayNode & { feedbackGain: GainNode; delayGain: GainNode };
	getReverb(...args: unknown[]): ConvolverNode;
	getDelay(...args: unknown[]): DelayNode;
	duck(t: number, onset?: number, attack?: number, depth?: number): void;
}

export interface AudioController {
	output: {
		destinationGain: GainNode | null;
		connectToDestination(input: AudioNode, channels?: number[]): void;
	};
	getOrbit(orbit: number, channels?: number[]): Orbit;
}

const db = (x: number) => 10 ** (x / 20);
const BUTTERWORTH = Math.SQRT1_2;

function biquad(
	ac: BaseAudioContext,
	type: BiquadFilterType,
	frequency: number,
	Q = BUTTERWORTH,
	gain = 0
) {
	return new BiquadFilterNode(ac, { type, frequency, Q, gain });
}

/** Connects nodes in series; returns the first and last. */
function series(...nodes: AudioNode[]): { input: AudioNode; output: AudioNode } {
	nodes.forEach((n, i) => i && nodes[i - 1].connect(n));
	return { input: nodes[0], output: nodes.at(-1)! };
}

/** Linkwitz-Riley 24 dB/oct filter: the low and high halves sum back flat at the crossover. */
const lr4 = (ac: BaseAudioContext, type: 'lowpass' | 'highpass', f: number) =>
	series(biquad(ac, type, f), biquad(ac, type, f));

/** Downmixes to mono; connected into a stereo node it plays on both sides. */
const mono = (ac: BaseAudioContext) =>
	new GainNode(ac, {
		channelCount: 1,
		channelCountMode: 'explicit',
		channelInterpretation: 'speakers'
	});

/**
 * tanh saturation with unity small-signal gain: quiet parts pass clean, peaks round off and grow
 * harmonics. `k` sets where it bites (higher bites earlier).
 */
function saturationCurve(k: number): Float32Array<ArrayBuffer> {
	const n = 4096;
	const curve = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const x = (i / (n - 1)) * 2 - 1;
		curve[i] = Math.tanh(k * x) / k;
	}
	return curve;
}

/** Stereo width by mid/side mixing: 1 leaves the image alone, 0 is mono. */
function stereoWidth(ac: BaseAudioContext) {
	const split = new ChannelSplitterNode(ac, { numberOfOutputs: 2 });
	const merge = new ChannelMergerNode(ac, { numberOfInputs: 2 });
	const [ll, lr, rr, rl] = [0, 0, 0, 0].map(() => new GainNode(ac));
	split.connect(ll, 0).connect(merge, 0, 0);
	split.connect(rl, 0).connect(merge, 0, 1);
	split.connect(rr, 1).connect(merge, 0, 1);
	split.connect(lr, 1).connect(merge, 0, 0);
	return {
		input: split,
		output: merge,
		set(width: number) {
			const same = (1 + width) / 2;
			const cross = (1 - width) / 2;
			for (const g of [ll, rr]) smooth(g.gain, same, ac);
			for (const g of [lr, rl]) smooth(g.gain, cross, ac);
		}
	};
}

function saturator(ac: BaseAudioContext, k: number) {
	const node = new WaveShaperNode(ac, { oversample: '4x' });
	node.curve = saturationCurve(k);
	let current = k;
	return {
		node,
		set(next: number) {
			if (Math.abs(next - current) < 0.05) return;
			current = next;
			node.curve = saturationCurve(next);
		}
	};
}

const smooth = (param: AudioParam, value: number, ac: BaseAudioContext) =>
	param.setTargetAtTime(value, ac.currentTime, 0.05);

interface Bus {
	name: BusName;
	input: GainNode;
	output: GainNode;
	/** What the kick ducks: by default the orbit output, the bass ducks only its sub. */
	duckParam?: AudioParam;
	upperDuck?: AudioParam;
	fullDuck?: number;
	/** High-pass on this orbit's reverb and delay returns, or 0 to keep the lows (rumble). */
	returnHp: number;
	/** Low-passes on the returns, tracking the profile's `space`. */
	returnLps: { filter: BiquadFilterNode; scale: number }[];
	wet: GainNode;
	dry: GainNode;
	update(mix: MixProfile): void;
}

function createBus(ac: AudioContext, name: BusName): Bus {
	const input = new GainNode(ac);
	const output = new GainNode(ac);
	const wet = new GainNode(ac);
	const dry = new GainNode(ac, { gain: 0 });
	input.connect(dry).connect(output);
	wet.connect(output);
	const bus: Bus = {
		name,
		input,
		output,
		wet,
		dry,
		returnHp: 250,
		returnLps: [],
		update: () => {}
	};

	if (name === 'drums') {
		// Glue: 10 ms attack lets the transients through. Smash: blended in low, for density.
		const glue = new DynamicsCompressorNode(ac, { knee: 6, attack: 0.01, release: 0.15 });
		const makeup = new GainNode(ac);
		const smash = new DynamicsCompressorNode(ac, {
			threshold: -36,
			knee: 0,
			ratio: 12,
			attack: 0.001,
			release: 0.1
		});
		const blend = new GainNode(ac);
		input.connect(glue).connect(makeup).connect(wet);
		input.connect(smash).connect(blend).connect(wet);
		bus.returnHp = 350;
		bus.update = (mix) => {
			glue.threshold.value = -10 - 8 * mix.glue;
			glue.ratio.value = 2 + 2 * mix.glue;
			smooth(makeup.gain, db(2 * mix.glue), ac);
			smooth(blend.gain, 0.35 * mix.glue, ac);
		};
	} else if (name === 'bass') {
		const trim = new GainNode(ac);
		const low = lr4(ac, 'lowpass', 120);
		const high = lr4(ac, 'highpass', 120);
		const sub = mono(ac);
		const duck = new GainNode(ac);
		const sat = saturator(ac, 2);
		const upperDuck = new GainNode(ac);
		const sum = new GainNode(ac);
		input.connect(trim);
		trim.connect(low.input);
		low.output.connect(sub).connect(duck).connect(sum);
		trim.connect(high.input);
		high.output.connect(sat.node).connect(upperDuck).connect(sum);
		sum.connect(biquad(ac, 'highpass', 28)).connect(wet);
		bus.duckParam = duck.gain;
		bus.upperDuck = upperDuck.gain;
		bus.update = (mix) => {
			smooth(trim.gain, db(mix.bass), ac);
			sat.set(1 + 8 * mix.bassDrive);
			bus.fullDuck = mix.bassFullDuck;
		};
	} else if (name === 'synth') {
		// Trim first, so drive and leveling do not depend on how loud the layer was written. The
		// leveler catches tracks written much hotter than the genre's seeds.
		const trim = new GainNode(ac);
		const hp = lr4(ac, 'highpass', 150);
		const mud = biquad(ac, 'peaking', 350, 0.8, -3);
		const presence = biquad(ac, 'peaking', 3200, 0.7, 3);
		const leveler = new DynamicsCompressorNode(ac, {
			threshold: -16,
			knee: 6,
			ratio: 3,
			attack: 0.02,
			release: 0.3
		});
		const sat = saturator(ac, 2);
		input.connect(trim).connect(hp.input);
		hp.output.connect(mud).connect(presence).connect(leveler).connect(sat.node).connect(wet);
		bus.update = (mix) => {
			smooth(trim.gain, db(mix.synth), ac);
			sat.set(1 + 4 * mix.synthDrive);
		};
	} else if (name === 'vox') {
		const trim = new GainNode(ac);
		const leveler = new DynamicsCompressorNode(ac, {
			threshold: -18,
			knee: 6,
			ratio: 3,
			attack: 0.01,
			release: 0.25
		});
		series(
			input,
			trim,
			biquad(ac, 'highpass', 110),
			biquad(ac, 'peaking', 3000, 0.8, 2),
			leveler,
			wet
		);
		bus.update = (mix) => smooth(trim.gain, db(mix.vox), ac);
	} else if (name === 'bochka') {
		// The source is a 4 ms noise burst, never the sustained kick body. High-pass before
		// exciting the shell, then sum a quiet dry impact with independently damped modes.
		const excite = biquad(ac, 'highpass', 180);
		const sum = new GainNode(ac);
		const impact = new GainNode(ac, { gain: 0.22 });
		input.connect(excite);
		excite.connect(impact).connect(sum);
		const modes = [
			{ f: 310, decay: 0.045, level: 12 },
			{ f: 487, decay: 0.04, level: 12 },
			{ f: 743, decay: 0.035, level: 12 },
			{ f: 1163, decay: 0.026, level: 10 },
			{ f: 1831, decay: 0.018, level: 7 }
		].map(({ f, decay, level }) => {
			// Q/(pi*f) is the amplitude e-folding time; higher modes die sooner.
			const band = biquad(ac, 'bandpass', f, Math.PI * f * decay);
			const send = new GainNode(ac, { gain: 0 });
			excite.connect(band).connect(send).connect(sum);
			return { send, level };
		});
		series(sum, biquad(ac, 'highpass', 180), biquad(ac, 'lowpass', 4500), wet);
		bus.returnHp = 250;
		bus.update = (mix) => {
			for (const { send, level } of modes) smooth(send.gain, level * mix.can, ac);
		};
	} else {
		// Rumble: input is the kick's reverb tail only. The level is set after the distortion, which
		// would otherwise flatten any difference in send level.
		const sat = saturator(ac, 6);
		const lp = lr4(ac, 'lowpass', 100);
		const sub = mono(ac);
		const duck = new GainNode(ac);
		const level = new GainNode(ac);
		input.connect(sat.node).connect(lp.input);
		lp.output.connect(sub).connect(duck).connect(level).connect(wet);
		bus.duckParam = duck.gain;
		bus.returnHp = 0;
		// 0.9 (hard techno) sits about 14 LU under the drums.
		bus.update = (mix) => smooth(level.gain, mix.rumble / 0.9, ac);
	}
	return bus;
}

/** Puts a high- and low-pass after a return node that feeds the orbit's summing node. */
function filterReturn(ac: AudioContext, bus: Bus, from: AudioNode, to: AudioNode, scale = 1) {
	from.disconnect();
	const lp = biquad(ac, 'lowpass', 7000 * scale);
	if (bus.returnHp > 0) series(from, biquad(ac, 'highpass', bus.returnHp), lp, to);
	else series(from, lp, to);
	bus.returnLps.push({ filter: lp, scale });
}

interface Master {
	input: GainNode;
	wet: GainNode;
	dry: GainNode;
	update(mix: MixProfile): void;
}

function createMaster(ac: AudioContext, out: AudioNode): Master {
	const input = new GainNode(ac);
	const wet = new GainNode(ac);
	const dry = new GainNode(ac, { gain: 0 });
	input.connect(dry).connect(out);

	// Mono lows: club systems and phones alike stay solid below 120 Hz. The sum is forced to stereo so
	// the width stage always gets two channels.
	const low = lr4(ac, 'lowpass', 120);
	const high = lr4(ac, 'highpass', 120);
	const sum = new GainNode(ac, { channelCount: 2, channelCountMode: 'explicit' });
	input.connect(low.input);
	low.output.connect(mono(ac)).connect(sum);
	input.connect(high.input);
	high.output.connect(sum);

	// Tone. Clean: a small low-mid dip and some air. Lo-fi: band-limited, a low-mid hump, no air.
	const width = stereoWidth(ac);
	const floor = biquad(ac, 'highpass', 10);
	const mud = biquad(ac, 'peaking', 300, 0.7, -1.5);
	const air = biquad(ac, 'highshelf', 9000, BUTTERWORTH, 1.5);
	const ceiling = biquad(ac, 'lowpass', 20000);
	const glue = new DynamicsCompressorNode(ac, {
		threshold: -14,
		knee: 8,
		ratio: 2,
		attack: 0.03,
		release: 0.25
	});
	const makeup = new GainNode(ac, { gain: db(2) });
	const sat = saturator(ac, 1.5);
	const limiter = new DynamicsCompressorNode(ac, {
		threshold: -3,
		knee: 0,
		ratio: 20,
		attack: 0.001,
		release: 0.08
	});
	const level = new GainNode(ac, { gain: db(2) });
	// Lo-fi drives the final clipper instead of letting the limiter stay transparent.
	const crunch = new GainNode(ac);
	// Last line of defence: a soft clipper just under full scale.
	const clip = new WaveShaperNode(ac, { oversample: '4x' });
	clip.curve = saturationCurve(1.15);
	sum.connect(width.input);
	series(
		width.output,
		floor,
		mud,
		air,
		ceiling,
		glue,
		makeup,
		sat.node,
		limiter,
		level,
		crunch,
		clip,
		wet
	);
	wet.connect(out);
	return {
		input,
		wet,
		dry,
		update: (mix) => {
			sat.set(1 + 3 * mix.drive);
			const { lofi, pump } = mix;
			width.set(1 - 0.85 * lofi);
			smooth(floor.frequency, 10 + 30 * lofi, ac);
			smooth(mud.gain, -1.5 + 3.5 * lofi, ac);
			smooth(air.gain, 1.5 - 5 * lofi, ac);
			smooth(ceiling.frequency, 20000 - 9000 * lofi, ac);
			// Pump: a fast, over-driven master compressor that breathes on every kick.
			glue.threshold.value = -14 - 10 * pump;
			glue.ratio.value = 2 + 4 * pump;
			glue.attack.value = 0.03 - 0.025 * pump;
			glue.release.value = 0.25 - 0.17 * pump;
			smooth(makeup.gain, db(2 + pump), ac);
			smooth(crunch.gain, db(1.5 * lofi), ac);
		}
	};
}

/** Shared processing makes separately played bass and keys behave like one sampled phrase.
 * Drums and vocals retain their own transients. A zero amount is an actual dry bypass.
 */
function createMusicGroup(ac: AudioContext) {
	const input = new GainNode(ac);
	const output = new GainNode(ac);
	const dry = new GainNode(ac);
	const wet = new GainNode(ac, { gain: 0 });
	const filter = biquad(ac, 'lowpass', 18000, 0.65);
	const glue = new DynamicsCompressorNode(ac, {
		threshold: -15,
		knee: 9,
		ratio: 2,
		attack: 0.025,
		release: 0.22
	});
	const sat = saturator(ac, 1.5);
	input.connect(dry).connect(output);
	series(input, filter, glue, sat.node, wet, output);
	return {
		input,
		output,
		set(amount: number, bypass: boolean) {
			const active = amount > 0 && !bypass;
			smooth(dry.gain, active ? 0 : 1, ac);
			smooth(wet.gain, active ? 1 : 0, ac);
			smooth(glue.threshold, -12 - 6 * amount, ac);
			smooth(glue.ratio, 1 + 1.5 * amount, ac);
			sat.set(1 + 1.5 * amount);
		},
		cutoff(hz: number) {
			smooth(filter.frequency, Math.max(200, Math.min(18000, hz)), ac);
		}
	};
}

// ── loudness meter ─────────────────────────────────────────────────────────

interface Tap {
	analyser: AnalyserNode;
	buf: Float32Array<ArrayBuffer>;
	sum: number;
	n: number;
	peak: number;
}

const lufs = (ms: number) => (ms > 0 ? -0.691 + 10 * Math.log10(ms) : -Infinity);

/**
 * Approximate loudness per bus (K-weighted mean square, ungated, as in ITU-R BS.1770) plus the
 * master's band balance and sample peak. Only built when asked for (dev tooling).
 */
class Meter {
	private taps = new Map<string, Tap>();
	private timer: ReturnType<typeof setInterval>;

	constructor(
		private ac: AudioContext,
		sources: Record<string, AudioNode[]>,
		master: AudioNode
	) {
		for (const [name, nodes] of Object.entries(sources)) {
			const pre = biquad(ac, 'highshelf', 1681, BUTTERWORTH, 4);
			const analyser = new AnalyserNode(ac, { fftSize: 4096 });
			series(pre, biquad(ac, 'highpass', 38, 0.5), analyser);
			nodes.forEach((n) => n.connect(pre));
			this.add(name, analyser);
		}
		const bands: [string, AudioNode[]][] = [
			['master', [biquad(ac, 'highshelf', 1681, BUTTERWORTH, 4), biquad(ac, 'highpass', 38, 0.5)]],
			['low', [biquad(ac, 'lowpass', 150)]],
			['mid', [biquad(ac, 'highpass', 150), biquad(ac, 'lowpass', 2000)]],
			['high', [biquad(ac, 'highpass', 2000)]]
		];
		for (const [name, filters] of bands) {
			const analyser = new AnalyserNode(ac, { fftSize: 4096 });
			const s = series(...filters, analyser);
			master.connect(s.input);
			this.add(name, analyser);
		}
		const raw = new AnalyserNode(ac, { fftSize: 4096 });
		master.connect(raw);
		this.add('peak', raw);
		this.timer = setInterval(() => this.poll(), 40);
	}

	private add(name: string, analyser: AnalyserNode) {
		this.taps.set(name, {
			analyser,
			buf: new Float32Array(analyser.fftSize),
			sum: 0,
			n: 0,
			peak: 0
		});
	}

	private poll() {
		for (const tap of this.taps.values()) {
			tap.analyser.getFloatTimeDomainData(tap.buf);
			let s = 0;
			for (const x of tap.buf) {
				s += x * x;
				if (Math.abs(x) > tap.peak) tap.peak = Math.abs(x);
			}
			tap.sum += s / tap.buf.length;
			tap.n++;
		}
	}

	reset() {
		for (const tap of this.taps.values()) Object.assign(tap, { sum: 0, n: 0, peak: 0 });
	}

	/** Loudness of each tap since the last reset (LUFS-ish), and the master's sample peak in dBFS. */
	snapshot(): Record<string, number> {
		const out: Record<string, number> = {};
		for (const [name, tap] of this.taps) {
			if (name === 'peak') out.peakDb = 20 * Math.log10(tap.peak || 1e-9);
			else out[name] = lufs(tap.n ? tap.sum / tap.n : 0);
		}
		for (const k of Object.keys(out)) out[k] = Math.round(out[k] * 10) / 10;
		return out;
	}

	stop() {
		clearInterval(this.timer);
	}
}

// ── wiring ─────────────────────────────────────────────────────────────────

let disconnectPatched = false;

/**
 * Superdough 1.3 tears down an oscillator's `noise` mix by disconnecting nodes it has already
 * released, which throws and skips the rest of the voice's cleanup (nodes leak, the voice never
 * ends). Disconnecting from a node that is not connected is harmless, so let exactly that pass.
 */
function tolerateStaleDisconnects(): void {
	if (disconnectPatched) return;
	disconnectPatched = true;
	const disconnect = AudioNode.prototype.disconnect as (...args: unknown[]) => void;
	AudioNode.prototype.disconnect = function (this: AudioNode, ...args: unknown[]) {
		try {
			disconnect.apply(this, args);
		} catch (e) {
			if ((e as DOMException).name !== 'InvalidAccessError') throw e;
		}
	} as AudioNode['disconnect'];
}

export class MixDesk {
	private buses = new Map<Orbit, Bus>();
	private deckBuses: Bus[][] = [[], []];
	private master: Master | null = null;
	private musicGroups: ReturnType<typeof createMusicGroup>[] = [];
	private destination: GainNode | null = null;
	private bypassed = false;
	private profiles: [MixProfile, MixProfile] = [BASE_MIX, BASE_MIX];
	private masterProfile = BASE_MIX;
	private meter: Meter | null = null;
	private duckEnvelopes = new Map<AudioParam, DuckEnvelope>();

	constructor(
		private ac: AudioContext,
		private controller: AudioController
	) {}

	/** Splices the desk into superdough. Call once after init, before any sound plays. */
	install(): void {
		tolerateStaleDisconnects();
		const first = this.controller.getOrbit(busOrbit('drums', 0), [0, 1]);
		this.patchOrbits(Object.getPrototypeOf(first));
		[0, 1].forEach((deck) => {
			const music = createMusicGroup(this.ac);
			this.musicGroups[deck] = music;
			this.controller.output.connectToDestination(music.output, [0, 1]);
			for (const name of BUSES) {
				const orbit = this.controller.getOrbit(busOrbit(name, deck), [0, 1]);
				const bus = createBus(this.ac, name);
				orbit.output.disconnect();
				orbit.output.connect(bus.input);
				if (name === 'bass' || name === 'synth') bus.output.connect(music.input);
				else this.controller.output.connectToDestination(bus.output, [0, 1]);
				this.buses.set(orbit, bus);
				this.deckBuses[deck].push(bus);
			}
		});
		this.ensureMaster();
		this.setDeckMix(0, BASE_MIX, true);
		this.setDeckMix(1, BASE_MIX, true);
		this.setMasterMix(BASE_MIX);
		this.setBypass(false);
	}

	/** Re-attaches the master chain if superdough rebuilt its output. */
	ensureMaster(): void {
		const dest = this.controller.output.destinationGain;
		if (!dest || dest === this.destination) return;
		this.destination = dest;
		this.master = createMaster(this.ac, this.ac.destination);
		dest.disconnect();
		dest.connect(this.master.input);
		this.master.update(this.masterProfile);
		this.applyBypass();
	}

	/**
	 * Wraps superdough's lazily created per-orbit reverb and delay so their returns get filtered,
	 * and its ducking so a bus can duck just part of itself (the bass's sub).
	 */
	private patchOrbits(proto: Orbit): void {
		const desk = this;
		const { getReverb, getDelay } = proto;
		proto.getReverb = function (this: Orbit, ...args: unknown[]) {
			const fresh = !this.reverbNode;
			const node = getReverb.apply(this, args);
			const bus = desk.buses.get(this);
			if (fresh && bus) {
				filterReturn(desk.ac, bus, node, this.summingNode);
				desk.updateReturns(bus);
			}
			return node;
		};
		proto.getDelay = function (this: Orbit, ...args: unknown[]) {
			const fresh = !this.delayNode;
			const node = getDelay.apply(this, args) as Orbit['delayNode'] & DelayNode;
			const bus = desk.buses.get(this);
			if (fresh && bus) {
				// Each repeat passes the filters again, so echoes get thinner and darker as they fade.
				const fb = node.feedbackGain;
				fb.disconnect();
				const loopLp = biquad(desk.ac, 'lowpass', 4000);
				series(fb, biquad(desk.ac, 'highpass', 300), loopLp);
				loopLp.connect(node);
				bus.returnLps.push({ filter: loopLp, scale: 0.6 });
				filterReturn(desk.ac, bus, node.delayGain, this.summingNode);
				desk.updateReturns(bus);
			}
			return node;
		};
		proto.duck = function (this: Orbit, t: number, onset = 0, attack = 0.1, depth = 1) {
			const bus = desk.buses.get(this);
			const params: [AudioParam, number][] = [
				[(!desk.bypassed && bus?.duckParam) || this.output.gain, depth]
			];
			if (!desk.bypassed && bus?.upperDuck)
				params.push([bus.upperDuck, depth * (bus.fullDuck ?? 0)]);
			const ac = this.audioContext;
			for (const [param, amount] of params) {
				let envelope = desk.duckEnvelopes.get(param);
				if (!envelope) {
					envelope = new DuckEnvelope(param);
					desk.duckEnvelopes.set(param, envelope);
				}
				envelope.schedule(ac.currentTime, t, onset, attack, amount);
			}
		};
	}

	private updateReturns(bus: Bus) {
		const deck = this.deckBuses[0].includes(bus) ? 0 : 1;
		const space = this.profiles[deck].space;
		for (const { filter, scale } of bus.returnLps)
			filter.frequency.setTargetAtTime(space * scale, this.ac.currentTime, 0.1);
	}

	setDeckMix(deck: 0 | 1, mix: MixProfile, force = false): void {
		if (mix === this.profiles[deck] && !force) return;
		this.profiles[deck] = mix;
		this.musicGroups[deck]?.set(mix.loopGlue, this.bypassed);
		for (const bus of this.deckBuses[deck]) {
			bus.update(mix);
			this.updateReturns(bus);
		}
	}

	setMusicCutoff(deck: 0 | 1, hz: number): void {
		this.musicGroups[deck]?.cutoff(hz);
	}

	setMasterMix(mix: MixProfile): void {
		const same = (['drive', 'lofi', 'pump'] as const).every(
			(k) => mix[k] === this.masterProfile[k]
		);
		if (same && this.master) return;
		this.masterProfile = mix;
		this.master?.update(mix);
	}

	/** A/B switch: true plays the raw superdough mix (pattern-level groove and rumble stay). */
	setBypass(on: boolean): void {
		this.bypassed = on;
		this.applyBypass();
	}

	get bypass() {
		return this.bypassed;
	}

	resetDucking() {
		for (const envelope of this.duckEnvelopes.values()) envelope.reset(this.ac.currentTime);
	}

	private applyBypass() {
		this.resetDucking();
		const on = this.bypassed;
		const set = (wet: GainNode, dry: GainNode) => {
			smooth(wet.gain, on ? 0 : 1, this.ac);
			smooth(dry.gain, on ? 1 : 0, this.ac);
		};
		for (const bus of this.buses.values()) {
			set(bus.wet, bus.dry);
			// Without the desk the bass ducks as a whole again; leave no sub stuck half-ducked.
			bus.duckParam?.cancelScheduledValues(0);
			bus.duckParam?.setValueAtTime(1, this.ac.currentTime);
		}
		for (const bus of this.buses.values()) {
			bus.upperDuck?.cancelScheduledValues(0);
			bus.upperDuck?.setValueAtTime(1, this.ac.currentTime);
		}
		this.musicGroups.forEach((group, deck) => group.set(this.profiles[deck].loopGlue, on));
		if (this.master) set(this.master.wet, this.master.dry);
	}

	/** Dev tooling: loudness per bus and master band balance. */
	startMeter(): Meter {
		if (this.meter) return this.meter;
		const sources: Record<string, AudioNode[]> = {};
		for (const name of BUSES)
			sources[name] = this.deckBuses.map((buses) => buses.find((b) => b.name === name)!.output);
		const out = new GainNode(this.ac);
		this.master?.wet.connect(out);
		this.master?.dry.connect(out);
		this.meter = new Meter(this.ac, sources, out);
		return this.meter;
	}
}
