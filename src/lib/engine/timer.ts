/**
 * setInterval/clearInterval backed by a Web Worker. Browsers throttle main-thread timers in hidden
 * or unfocused tabs (to ~1 Hz), but not timers inside a worker. Strudel's scheduler ticks every
 * 100 ms with a 200 ms lookahead and drops any slice it reaches too late, so on a throttled timer
 * most events vanish: whole layers seem to drop out until the tab is visible again.
 */

const WORKER_SOURCE = `
const timers = new Map();
onmessage = ({ data: { id, ms } }) => {
	if (ms === undefined) {
		clearInterval(timers.get(id));
		timers.delete(id);
	} else {
		timers.set(id, setInterval(() => postMessage(id), ms));
	}
};`;

let worker: Worker | null = null;
const callbacks = new Map<number, () => void>();
let nextId = 1;

function getWorker(): Worker {
	if (!worker) {
		const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
		worker = new Worker(url);
		URL.revokeObjectURL(url);
		worker.onmessage = ({ data }: MessageEvent<number>) => callbacks.get(data)?.();
	}
	return worker;
}

export function setWorkerInterval(fn: () => void, ms: number): number {
	const id = nextId++;
	callbacks.set(id, fn);
	getWorker().postMessage({ id, ms });
	return id;
}

export function clearWorkerInterval(id: number | undefined): void {
	if (id === undefined || !callbacks.delete(id)) return;
	worker?.postMessage({ id });
}
