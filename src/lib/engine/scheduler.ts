import type { Hap, Pattern } from '@strudel/web';

export const LOOKAHEAD_SECONDS = 0.5;
export const SCHEDULER_INTERVAL_MS = 25;
const SLICE_SECONDS = 0.05;
const START_DELAY = 0.05;
interface Tempo {
	time: number;
	cycle: number;
	cps: number;
}

/** Query small slices ahead of the audio clock. Already submitted notes never get retimed. */
export class AudioScheduler {
	private pattern: Pattern | null = null;
	private tempos: Tempo[] = [];
	private nextTime = 0;
	private nextCycle = 0;
	private timer: number | undefined;
	private cps = 0.5;
	started = false;
	lateEvents = 0;

	constructor(
		private time: () => number,
		private trigger: (hap: Hap, time: number, duration: number, cps: number) => void,
		private interval: (fn: () => void, ms: number) => number,
		private clear: (id: number | undefined) => void,
		private onError: (error: unknown) => void = console.error
	) {}

	now() {
		if (!this.started) return 0;
		const time = this.time();
		const tempo = this.tempos.findLast((t) => t.time <= time) ?? this.tempos[0];
		return Math.max(0, tempo.cycle + (time - tempo.time) * tempo.cps);
	}

	/** Transitions must start beyond notes that have already been submitted. */
	get scheduledCycle() {
		return this.nextCycle;
	}

	setCps(cps: number) {
		if (!Number.isFinite(cps) || cps <= 0) throw new Error('Invalid tempo');
		if (cps === this.cps) return;
		this.cps = cps;
		if (this.started) {
			const last = this.tempos.at(-1)!;
			if (last.time === this.nextTime) last.cps = cps;
			else this.tempos.push({ time: this.nextTime, cycle: this.nextCycle, cps });
		}
	}

	setPattern(pattern: Pattern) {
		this.pattern = pattern;
		if (this.started) return;
		this.started = true;
		this.nextTime = this.time() + START_DELAY;
		this.nextCycle = 0;
		this.tempos = [{ time: this.nextTime, cycle: 0, cps: this.cps }];
		this.tick();
		this.timer = this.interval(() => this.tick(), SCHEDULER_INTERVAL_MS);
	}

	stop() {
		this.clear(this.timer);
		this.timer = undefined;
		this.started = false;
		this.pattern = null;
		this.tempos = [];
		this.nextCycle = 0;
	}

	private tick() {
		if (!this.started || !this.pattern) return;
		const now = this.time();
		// After a suspension, advance directly to the current grid instead of replaying a backlog.
		if (this.nextTime < now) {
			this.nextCycle += (now - this.nextTime) * this.cps;
			this.nextTime = now;
			this.lateEvents++;
		}
		const horizon = now + LOOKAHEAD_SECONDS;
		while (this.nextTime < horizon) {
			const duration = Math.min(SLICE_SECONDS, horizon - this.nextTime);
			const begin = this.nextCycle;
			const end = begin + duration * this.cps;
			try {
				const haps = this.pattern.queryArc(begin, end, { _cps: this.cps, cyclist: 'ravebot' });
				for (const hap of haps) {
					if (!hap.hasOnset() || !hap.whole) continue;
					const at = this.nextTime + (hap.whole.begin.valueOf() - begin) / this.cps;
					if (at < this.time()) {
						this.lateEvents++;
						continue;
					}
					this.trigger(
						hap,
						at,
						(hap.whole.end.valueOf() - hap.whole.begin.valueOf()) / this.cps,
						this.cps
					);
				}
			} catch (error) {
				this.onError(error);
			}
			this.nextCycle = end;
			this.nextTime += duration;
		}
		// Keep the segment covering audible time plus any future tempo changes.
		while (this.tempos.length > 1 && this.tempos[1].time <= now) this.tempos.shift();
	}
}
