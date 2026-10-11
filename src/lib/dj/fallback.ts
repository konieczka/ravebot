import { CRATE_NAMES, type CrateName } from './crate-names';
import { GENRES, genreById } from './genres';
import { LAYERS, type GenreId, type LayerName, type Layers, type Track } from './types';

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/** Crate names already played this session, so a remix name does not come back until its genre runs out. */
const usedNames = new Set<CrateName>();

function crateName(genre: GenreId): CrateName {
	const names = CRATE_NAMES[genre];
	let fresh = names.filter((n) => !usedNames.has(n));
	if (!fresh.length) {
		for (const n of names) usedNames.delete(n);
		fresh = names;
	}
	const name = pick(fresh);
	usedNames.add(name);
	return name;
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
	const { title, comment } = crateName(genre);
	return {
		id: crypto.randomUUID(),
		title,
		comment,
		genre,
		layers,
		source: 'fallback'
	};
}
