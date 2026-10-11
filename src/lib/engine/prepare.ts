import type { Hap, Pattern } from '@strudel/web';

/** A new browser task, unlike Promise.resolve(), allows audio timer messages to run. */
export function yieldToMain(): Promise<void> {
	return new Promise((resolve) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = () => {
			channel.port1.close();
			channel.port2.close();
			resolve();
		};
		channel.port2.postMessage(null);
	});
}

export async function inspectPattern(
	pattern: Pattern,
	inspect: (hap: Hap) => void,
	yieldTask: () => Promise<void> = yieldToMain
): Promise<void> {
	let total = 0;
	for (let begin = 0; begin < 16; begin += 0.25) {
		await yieldTask();
		const haps = pattern.queryArc(begin, begin + 0.25);
		if (haps.length > 64) throw new Error('Pattern exceeds 64 events per beat');
		for (const hap of haps) {
			if (!hap.hasOnset()) continue;
			const v = hap.value;
			for (const [key, max] of [
				['unison', 8],
				['release', 4],
				['attack', 4],
				['decay', 4],
				['roomsize', 8]
			] as const) {
				if (
					v[key] !== undefined &&
					(!Number.isFinite(Number(v[key])) || Number(v[key]) < 0 || Number(v[key]) > max)
				)
					throw new Error(`${key} exceeds playback budget`);
			}
			inspect(hap);
			total++;
		}
	}
	if (!total) throw new Error('pattern produced no events');
}
