// Strudel ships without type declarations; these cover the small surface TechnoBot uses.
declare module '@strudel/web' {
	export interface Hap {
		value: Record<string, unknown>;
		hasOnset(): boolean;
	}
	export interface Pattern {
		queryArc(begin: number, end: number): Hap[];
	}
	export interface StrudelRepl {
		evaluate(code: string, autostart?: boolean): Promise<Pattern | undefined>;
		stop(): void;
		scheduler: { now(): number; setCps(cps: number): void; cps: number; started: boolean };
	}
	export function initStrudel(options?: {
		prebake?: () => Promise<unknown> | unknown;
		onEvalError?: (err: Error) => void;
	}): Promise<StrudelRepl>;
	export function samples(source: string | Record<string, unknown>): Promise<void>;
	export function getAudioContext(): AudioContext;
	export function initAudioOnFirstClick(options?: object): Promise<void>;
	export function getSound(name: string): unknown;
	export function getSampleBuffer(value: object, samples: unknown): Promise<unknown>;
	export function signal(fn: (t: number) => number): Pattern;
	export function transpiler(code: string, options?: object): { output: string };
}
