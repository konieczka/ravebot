import type { Pattern, StrudelRepl } from '@strudel/web';
import { LAYERS, type Layers } from '#lib/dj/types.js';
import { RUS_BASE, RUS_FILES } from '#lib/dj/voices.js';
import type { MixProfile } from '#lib/dj/mix.js';
import { MixDesk, type AudioController } from './master.js';
import { ORBITS } from './mixer.js';
import { clearWorkerInterval, setWorkerInterval } from './timer.js';

/**
 * Thin client-only wrapper around @strudel/web. Strudel touches `window` on import,
 * so everything is loaded lazily from a user click.
 */

const DRUM_MACHINES =
	'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json';
/** Dirt-Samples: the vocals, stabs and FX of the vox layer. Optional; drums work without it. */
const DIRT_SAMPLES = 'github:tidalcycles/dirt-samples';

let repl: StrudelRepl | null = null;
let web: typeof import('@strudel/web') | null = null;
let lastEvalError: Error | null = null;
let desk: MixDesk | null = null;

export async function initEngine(): Promise<void> {
	if (repl) return;
	web = await import('@strudel/web');
	repl = await web.initStrudel({
		prebake: () =>
			Promise.all([
				web!.samples(DRUM_MACHINES),
				web!.samples(DIRT_SAMPLES).catch((e: Error) => console.warn('vox samples:', e)),
				// Hardbass shouts, bundled with the app (see voices.ts).
				web!.samples({ rus: RUS_FILES }, RUS_BASE)
			]),
		onEvalError: (err) => (lastEvalError = err),
		// Keep the scheduler ticking at full rate when the tab is hidden or unfocused (see timer.ts).
		setInterval: setWorkerInterval,
		clearInterval: clearWorkerInterval
	});
	await web.getAudioContext().resume();
	// Strudel loads its AudioWorklets (djf, shape, crush, ...) on the first mousedown *after*
	// init, but we are already inside the click that started us. Trigger it now and wait, or
	// every event using a worklet effect fails until the user clicks again.
	const ready = web.initAudioOnFirstClick();
	document.dispatchEvent(new MouseEvent('mousedown'));
	await ready;
	// Splice the mixing desk (bus processing, master chain) into superdough before anything plays.
	desk = new MixDesk(
		web.getAudioContext(),
		web.getSuperdoughAudioController() as AudioController,
		web.webAudioTimeout
	);
	desk.install();
	if (import.meta.env.DEV) (globalThis as any).__ravebotDesk = desk;
	// Create every deck orbit up front with a silent note. The kick ducks its deck's music and vox
	// orbits, and superdough logs an error on every kick while a target orbit does not exist yet
	// (the vox stays silent for the first 32 bars of a track).
	const at = web.getAudioContext().currentTime + 0.05;
	await Promise.allSettled(
		ORBITS.map((orbit) => web!.superdough({ s: 'sine', gain: 0, orbit }, at, 0.01))
	);
	// Layers may read `arc` (track intensity). The mixer binds it per deck; this stand-in lets
	// a single layer compile on its own for the dry run.
	(globalThis as any).arc = web.signal(() => 0.6);
	// The mixer's build-up tools (rolls, impact) are not part of any track's dry run.
	await Promise.allSettled(FX_SOUNDS.map((name) => preload(name, {})));
}

/** Drums the mixer adds for build-ups and drops (see buildProgram). */
const FX_SOUNDS = [
	'RolandTR909_cr',
	'RolandTR808_bd',
	'RolandTR909_sd',
	'RolandTR909_cp',
	'RolandTR909_rim',
	'RolandTR909_mt',
	'RolandTR808_cp'
];

/**
 * Strudel fetches samples on their first trigger and skips that hit if it arrives late, which
 * would swallow a track's first vocal shot or the first drop's impact. Load them up front.
 * Resolves to null for synths and unknown sounds.
 */
function preload(name: string, value: Record<string, unknown>): Promise<unknown> | null {
	const sound = web!.getSound(name) as { data?: { samples?: unknown } } | undefined;
	return sound?.data?.samples ? web!.getSampleBuffer(value, sound.data.samples) : null;
}

/** Plays `code`, replacing whatever runs now. The clock keeps going, so the swap is beat-aligned. */
export async function play(code: string): Promise<void> {
	if (!repl) throw new Error('engine not initialised');
	lastEvalError = null;
	desk?.ensureMaster();
	const pattern = await repl.evaluate(code);
	if (!pattern) throw lastEvalError ?? new Error('evaluation failed');
}

/** Sets each deck's bus processing and the master bus from the genres' mix profiles. */
export function setMix(decks: [MixProfile, MixProfile], master: MixProfile): void {
	desk?.setDeckMix(0, decks[0]);
	desk?.setDeckMix(1, decks[1]);
	desk?.setMasterMix(master);
}

export function stop(): void {
	repl?.stop();
}

/** Current position in cycles (= bars). */
export function now(): number {
	return repl?.scheduler.started ? repl.scheduler.now() : 0;
}

export function setBpm(bpm: number): void {
	repl?.scheduler.setCps(bpm / 60 / 4);
}

/**
 * Compiles a (validated) expression to a pattern without touching the scheduler. Mirrors what
 * Strudel's own evaluate() does: transpile mini-notation, then run it in the global Strudel scope.
 */
async function compile(code: string): Promise<Pattern> {
	const { output } = web!.transpiler(code);
	const pattern = await Function(`"use strict";return (async () => {${output}})()`)();
	if (!pattern || typeof pattern.queryArc !== 'function')
		throw new Error('expression is not a pattern');
	return pattern;
}

/**
 * Compiles each layer and queries 16 bars without playing them. Catches runtime errors
 * (unknown methods, bad mini-notation), empty patterns and sounds that do not exist.
 * Also preloads the track's samples. Returns a map of layer -> problem; empty when the track
 * is safe to mix in.
 */
export async function dryRun(layers: Layers): Promise<Partial<Record<keyof Layers, string>>> {
	if (!web) throw new Error('engine not initialised');
	const problems: Partial<Record<keyof Layers, string>> = {};
	const loads = new Map<string, Promise<unknown> | null>();
	for (const layer of LAYERS) {
		const code = layers[layer];
		if (code === 'silence') continue;
		try {
			const pattern = await compile(code);
			const haps = pattern.queryArc(0, 16).filter((h) => h.hasOnset());
			if (!haps.length) {
				problems[layer] = 'pattern produced no events';
				continue;
			}
			for (const { value } of haps) {
				const s =
					typeof value.s === 'string'
						? value.s
						: value.note !== undefined || value.n !== undefined
							? 'triangle'
							: null;
				if (!s) throw new Error('event has no sound');
				const name = typeof value.bank === 'string' ? `${value.bank}_${s}` : s;
				if (!web.getSound(name)) throw new Error(`unknown sound "${name}"`);
				const key = `${name}:${value.n ?? 0}`;
				if (!loads.has(key)) loads.set(key, preload(name, value));
			}
		} catch (e) {
			problems[layer] = (e as Error).message;
		}
	}
	await Promise.allSettled(loads.values());
	return problems;
}
