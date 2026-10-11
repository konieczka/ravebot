import { describe, expect, it, vi } from 'vitest';
import { DuckEnvelope } from './duck';

function setup() {
	const param = {
		cancelScheduledValues: vi.fn(),
		setValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn()
	};
	return { param, envelope: new DuckEnvelope(param as unknown as AudioParam) };
}

describe('ducking automation', () => {
	it('submits the whole envelope immediately using the kick timestamp', () => {
		const { param, envelope } = setup();
		envelope.schedule(0, 0.4, 0, 0.2, 0.81);
		expect(param.exponentialRampToValueAtTime).toHaveBeenCalledWith(expect.closeTo(0.1), 0.4);
		expect(param.exponentialRampToValueAtTime).toHaveBeenCalledWith(1, expect.closeTo(0.6));
	});
	it('retains future beats when an earlier kick is submitted later', () => {
		const { param, envelope } = setup();
		envelope.schedule(0, 0.4, 0, 0.2, 0.81);
		param.exponentialRampToValueAtTime.mockClear();
		envelope.schedule(0.05, 0.2, 0, 0.3, 0.64);
		const calls = param.exponentialRampToValueAtTime.mock.calls;
		expect(calls.some((c) => c[1] === 0.2)).toBe(true);
		expect(calls.some((c) => c[1] === 0.4)).toBe(true);
		expect(calls.map((c) => c[1])).toEqual(calls.map((c) => c[1]).sort((a, b) => a - b));
		expect(calls.at(-1)?.[1]).toBeCloseTo(0.6);
	});
	it('preserves an in-progress recovery and resets pending automation on stop', () => {
		const { param, envelope } = setup();
		envelope.schedule(0, 0.1, 0, 0.4, 0.81);
		envelope.schedule(0.3, 0.7, 0, 0.2, 0.81);
		expect(param.setValueAtTime).toHaveBeenCalledWith(expect.closeTo(Math.sqrt(0.1)), 0.3);
		envelope.reset(0.4);
		expect(param.cancelScheduledValues).toHaveBeenLastCalledWith(0.4);
		expect(param.setValueAtTime).toHaveBeenLastCalledWith(1, 0.4);
	});
});
