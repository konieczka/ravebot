import { CRATE_TITLES } from './crate-titles';
import { GENRES, genreById } from './genres';
import { LAYERS, type GenreId, type LayerName, type Layers, type Track } from './types';

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

const SHOUTS = [
	'Backup routine engaged. Still bangs.',
	'Brain offline, hands on the faders.',
	'Running on pure muscle memory!',
	'Recycling the classics, beep boop.'
];

/** Crate titles already played this session, so a remix name does not come back until its genre runs out. */
const usedTitles = new Set<string>();

function crateTitle(genre: GenreId): string {
	const titles = CRATE_TITLES[genre];
	let fresh = titles.filter((t) => !usedTitles.has(t));
	if (!fresh.length) {
		for (const t of titles) usedTitles.delete(t);
		fresh = titles;
	}
	const title = pick(fresh);
	usedTitles.add(title);
	return title;
}

/** Layers that carry pitch: they always come from the same seed so the key stays consistent. */
const TONAL = new Set<LayerName>(['bass', 'synth', 'vox']);

/**
 * Offline / failure path: remixes the hand-written seed tracks, so the set keeps going when the
 * LLM is unavailable or its output did not survive validation. Bass, synth and vox come from one
 * seed (they share a key); the drums are mixed and matched.
 */
export function fallbackTrack(genre: GenreId, previous?: Layers): Track {
	const { seeds: own, bpm } = genreById(genre);
	// Only borrow from genres at a similar tempo: psy hats at a French house tempo sound wrong.
	const others = GENRES.filter((g) => Math.abs(g.bpm - bpm) <= 8).flatMap((g) => g.seeds);
	const fresh = own.filter((s) => s.layers.bass !== previous?.bass);
	const tonal = pick(fresh.length ? fresh : own);
	const layers = {} as Layers;
	for (const layer of LAYERS) {
		if (TONAL.has(layer)) {
			layers[layer] = tonal.layers[layer];
			continue;
		}
		// Drums occasionally borrow from neighbouring genres for variety.
		const pool = (layer === 'hats' || layer === 'perc') && Math.random() < 0.25 ? others : own;
		let candidate = pick(pool).layers[layer];
		if (previous && candidate === previous[layer] && pool.length > 1)
			candidate = pick(pool).layers[layer];
		layers[layer] = candidate;
	}
	return {
		id: crypto.randomUUID(),
		title: crateTitle(genre),
		comment: pick(SHOUTS),
		genre,
		layers,
		source: 'fallback'
	};
}
