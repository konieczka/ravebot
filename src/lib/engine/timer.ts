/** Worker wakeups avoid ordinary background timer throttling. Callbacks still run on the
 * main thread; the audio scheduler must submit events ahead of time to tolerate stalls.
 * Mobile browsers may suspend workers and audio altogether while backgrounded.
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
