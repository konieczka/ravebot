import { describe, expect, it, vi } from 'vitest';
import type { Hap } from '@strudel/web';
import { inspectPattern } from './prepare';
const hap = (begin: number): Hap => ({
	value: {},
	whole: { begin, end: begin + 0.25 },
	hasOnset: () => true,
	ensureObjectValue() {}
});

describe('track preparation', () => {
	it('queries the full 16 bars in small tasks with no missing or duplicate onsets', async () => {
		let yielded = 0;
		const inspect = vi.fn();
		const queryArc = vi.fn((begin: number, end: number) => {
			expect(yielded).toBe(begin * 4 + 1);
			expect(end - begin).toBe(0.25);
			return [hap(begin)];
		});
		await inspectPattern({ queryArc }, inspect, async () => {
			yielded++;
		});
		expect(inspect).toHaveBeenCalledTimes(64);
		expect(inspect.mock.calls.at(-1)?.[0].whole?.begin).toBe(15.75);
	});
	it('rejects dense patterns before inspecting or preloading their events', async () => {
		const inspect = vi.fn();
		await expect(
			inspectPattern(
				{ queryArc: () => Array.from({ length: 65 }, () => hap(0)) },
				inspect,
				async () => {}
			)
		).rejects.toThrow(/64 events/);
		expect(inspect).not.toHaveBeenCalled();
	});
	it('rejects excessive voice tails and empty patterns', async () => {
		await expect(
			inspectPattern(
				{ queryArc: () => [{ ...hap(0), value: { release: 60 } }] },
				() => {},
				async () => {}
			)
		).rejects.toThrow(/release/);
		await expect(
			inspectPattern(
				{ queryArc: () => [] },
				() => {},
				async () => {}
			)
		).rejects.toThrow(/no events/);
	});
});
