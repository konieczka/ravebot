import { describe, expect, it, vi } from 'vitest';
import type { Hap, Pattern } from '@strudel/web';
import { AudioScheduler } from './scheduler';

function setup() {
	let time = 0;
	let tick = () => {};
	const trigger = vi.fn();
	const clear = vi.fn();
	const scheduler = new AudioScheduler(
		() => time,
		trigger,
		(fn) => {
			tick = fn;
			return 1;
		},
		clear
	);
	const pattern: Pattern = {
		queryArc(begin, end) {
			const out: Hap[] = [];
			// Sixteenth notes at exact cycle positions, with half-open query arcs.
			for (let n = Math.max(0, Math.ceil((begin - 1e-10) * 16)); n / 16 < end - 1e-10; n++) {
				out.push({
					value: { n },
					whole: { begin: n / 16, end: (n + 1) / 16 },
					hasOnset: () => true,
					ensureObjectValue() {}
				});
			}
			return out;
		}
	};
	return {
		scheduler,
		pattern,
		trigger,
		clear,
		advance(t: number) {
			time = t;
			tick();
		},
		setTime(t: number) {
			time = t;
		}
	};
}

describe('audio scheduler', () => {
	it('keeps every note exactly timed through a 350ms callback gap', () => {
		const s = setup();
		s.scheduler.setPattern(s.pattern);
		for (const t of [0.1, 0.2, 0.55, 0.6]) s.advance(t);
		const calls = s.trigger.mock.calls;
		expect(calls.map((c) => c[0].value.n)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		calls.forEach((c, n) => expect(c[1]).toBeCloseTo(0.05 + n / 8));
		expect(s.scheduler.lateEvents).toBe(0);
	});
	it('changes tempo only beyond scheduled notes and keeps the displayed clock continuous', () => {
		const s = setup();
		s.scheduler.setPattern(s.pattern);
		s.setTime(0.1);
		const before = s.scheduler.now();
		s.scheduler.setCps(1);
		expect(s.scheduler.now()).toBe(before);
		s.advance(0.2);
		s.setTime(0.5);
		expect(s.scheduler.now()).toBeCloseTo(0.225);
		s.setTime(0.6);
		expect(s.scheduler.now()).toBeCloseTo(0.325);
		expect(s.trigger.mock.calls.find((c) => c[0].value.n === 4)?.[1]).toBeCloseTo(0.525);
	});
	it('switches patterns at the scheduling frontier without resetting the clock or replaying notes', () => {
		const s = setup();
		s.scheduler.setPattern(s.pattern);
		s.setTime(0.1);
		const before = s.scheduler.now();
		const query = vi.fn(s.pattern.queryArc);
		s.scheduler.setPattern({ queryArc: query });
		s.advance(0.2);
		expect(query.mock.calls[0][0]).toBeCloseTo(0.225);
		expect(s.scheduler.now()).toBeGreaterThan(before);
		const ids = s.trigger.mock.calls.map((c) => c[0].value.n);
		expect(new Set(ids).size).toBe(ids.length);
	});
	it('does not replay missed notes after suspension and restarts at bar zero', () => {
		const s = setup();
		s.scheduler.setPattern(s.pattern);
		s.trigger.mockClear();
		s.advance(60);
		expect(s.trigger.mock.calls.length).toBeLessThanOrEqual(5);
		expect(s.trigger.mock.calls.every((c) => c[1] >= 60)).toBe(true);
		expect(s.scheduler.lateEvents).toBeGreaterThan(0);
		s.scheduler.stop();
		expect(s.clear).toHaveBeenCalledWith(1);
		expect(s.scheduler.now()).toBe(0);
		s.trigger.mockClear();
		s.scheduler.setPattern(s.pattern);
		expect(s.trigger.mock.calls[0][0].value.n).toBe(0);
	});
});
