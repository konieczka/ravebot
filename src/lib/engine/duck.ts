/** Sidechain automation is submitted with the kick, never from an onended callback. */
interface Pulse {
	time: number;
	onset: number;
	recovery: number;
	depth: number;
}
interface Point {
	time: number;
	value: number;
}

const interpolate = (a: Point, b: Point, time: number) =>
	a.value * (b.value / a.value) ** ((time - a.time) / (b.time - a.time));

function valueAt(points: Point[], time: number): number {
	for (let i = 1; i < points.length; i++) {
		if (time < points[i].time) return interpolate(points[i - 1], points[i], time);
	}
	return points.at(-1)?.value ?? 1;
}

export class DuckEnvelope {
	private pulses: Pulse[] = [];
	private points: Point[] = [];
	constructor(private param: AudioParam) {}

	schedule(now: number, time: number, onset: number, recovery: number, depth: number) {
		if (depth <= 0) return;
		// Retain future kicks, including those submitted out of order by different patterns.
		this.pulses = this.pulses.filter((p) => p.time + p.onset + p.recovery > now);
		const pulse = {
			time: Math.max(now, time),
			onset: Math.max(0, onset),
			recovery: Math.max(0.002, recovery),
			depth
		};
		const same = this.pulses.find((p) => p.time === pulse.time);
		if (same) same.depth = Math.max(same.depth, depth);
		else this.pulses.push(pulse);
		this.pulses.sort((a, b) => a.time - b.time);
		const initial = this.points.length ? valueAt(this.points, now) : 1;
		let points: Point[] = [{ time: now, value: initial }];
		for (const p of this.pulses) {
			const start = Math.max(now, p.time - 0.01);
			const lowTime = p.time + p.onset;
			const end = lowTime + p.recovery;
			if (lowTime < now) {
				points.push({ time: end, value: 1 });
				continue;
			}
			const before = valueAt(points, start);
			points = points.filter((point) => point.time < start);
			points.push({ time: start, value: before });
			points.push({
				time: lowTime,
				value: Math.min(before, Math.max(0.01, 1 - Math.sqrt(p.depth)))
			});
			points.push({ time: end, value: 1 });
		}
		this.points = points;
		this.param.cancelScheduledValues(now);
		this.param.setValueAtTime(initial, now);
		for (const point of points) {
			if (point.time > now) this.param.exponentialRampToValueAtTime(point.value, point.time);
			else this.param.setValueAtTime(point.value, now);
		}
	}

	reset(now: number) {
		this.pulses = [];
		this.points = [];
		this.param.cancelScheduledValues(now);
		this.param.setValueAtTime(1, now);
	}
}
