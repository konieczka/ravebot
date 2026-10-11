// Strudel ships without type declarations; these cover the small surface RaveBot uses.
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
	export function samples(
		source: string | Record<string, unknown>,
		baseUrl?: string
	): Promise<void>;
	export function getAudioContext(): AudioContext;
	export function getSuperdoughAudioController(): unknown;
	export function webAudioTimeout(
		ac: AudioContext,
		onComplete: () => void,
		startTime: number,
		stopTime: number
	): void;
	export function initAudioOnFirstClick(options?: object): Promise<void>;
	export function getSound(name: string): unknown;
	export function getSampleBuffer(value: object, samples: unknown): Promise<unknown>;
	export function signal(fn: (t: number) => unknown): Pattern;
	export function superdough(
		value: Record<string, unknown>,
		time: number,
		duration: number
	): Promise<void>;
	export function transpiler(code: string, options?: object): { output: string };
}
