import { GENRES, genreById } from './genres';
import { LAYERS, type GenreId, type LayerName, type Layers, type Track } from './types';

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

const TITLE_A = [
	'Binary',
	'Neon',
	'Warehouse',
	'Circuit',
	'Midnight',
	'Chrome',
	'Static',
	'Voltage',
	'Pixel',
	'Bunker'
];
const TITLE_B = [
	'Ritual',
	'Drift',
	'Pressure',
	'Loop',
	'Engine',
	'Signal',
	'Fever',
	'Protocol',
	'Haze',
	'Machine'
];
const SHOUTS = [
	'Backup routine engaged. Still bangs.',
	'Brain offline, hands on the faders.',
	'Running on pure muscle memory!',
	'Recycling the classics, beep boop.'
];

/** Layers that carry pitch: they always come from the same seed so the key stays consistent. */
const TONAL = new Set<LayerName>(['bass', 'synth', 'vox']);

/**
 * Offline / failure path: remixes the hand-written seed tracks, so the set keeps going when the
 * LLM is unavailable or its output did not survive validation. Bass, synth and vox come from one
 * seed (they share a key); the drums are mixed and matched.
 */
export function fallbackTrack(genre: GenreId, previous?: Layers): Track {
	const own = genreById(genre).seeds;
	const others = GENRES.flatMap((g) => g.seeds);
	const fresh = own.filter((s) => s.layers.bass !== previous?.bass);
	const tonal = pick(fresh.length ? fresh : own);
	const layers = {} as Layers;
	for (const layer of LAYERS) {
		if (TONAL.has(layer)) {
			layers[layer] = tonal.layers[layer];
			continue;
		}
		// Drums occasionally borrow from other genres for variety.
		const pool = (layer === 'hats' || layer === 'perc') && Math.random() < 0.25 ? others : own;
		let candidate = pick(pool).layers[layer];
		if (previous && candidate === previous[layer] && pool.length > 1)
			candidate = pick(pool).layers[layer];
		layers[layer] = candidate;
	}
	return {
		id: crypto.randomUUID(),
		title: `${pick(TITLE_A)} ${pick(TITLE_B)}`,
		comment: pick(SHOUTS),
		genre,
		layers,
		source: 'fallback'
	};
}
