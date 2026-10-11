import type { Pattern, StrudelRepl } from '@strudel/web';
import { LAYERS, type Layers } from '#lib/dj/types.js';

/**
 * Thin client-only wrapper around @strudel/web. Strudel touches `window` on import,
 * so everything is loaded lazily from a user click.
 */

const DRUM_MACHINES =
	'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json';

let repl: StrudelRepl | null = null;
let web: typeof import('@strudel/web') | null = null;
let lastEvalError: Error | null = null;

export async function initEngine(): Promise<void> {
	if (repl) return;
	web = await import('@strudel/web');
	repl = await web.initStrudel({
		prebake: () => web!.samples(DRUM_MACHINES),
		onEvalError: (err) => (lastEvalError = err)
	});
	await web.getAudioContext().resume();
}

/** Plays `code`, replacing whatever runs now. The clock keeps going, so the swap is beat-aligned. */
export async function play(code: string): Promise<void> {
	if (!repl) throw new Error('engine not initialised');
	lastEvalError = null;
	const pattern = await repl.evaluate(code);
	if (!pattern) throw lastEvalError ?? new Error('evaluation failed');
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
 * Returns a map of layer -> problem; empty when the track is safe to mix in.
 */
export async function dryRun(layers: Layers): Promise<Partial<Record<keyof Layers, string>>> {
	if (!web) throw new Error('engine not initialised');
	const problems: Partial<Record<keyof Layers, string>> = {};
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
			}
		} catch (e) {
			problems[layer] = (e as Error).message;
		}
	}
	return problems;
}
