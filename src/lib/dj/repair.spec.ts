import { describe, expect, it } from 'vitest';
import { copiedMotif, repairTrackLayers } from './repair';
import { genreById } from './genres';
import { TONAL_LAYERS } from './harmony';

const original = genreById('acid').seeds[0].layers;
describe('coherent repairs and novelty', () => {
	it('replaces all pitched layers from one seed and clears an uncertified harmony', () => {
		const repaired = repairTrackLayers('acid', original, ['synth'], 'pedal-a');
		expect(repaired.repaired.sort()).toEqual([...TONAL_LAYERS].sort());
		expect(repaired.harmony).toBeUndefined();
		expect(
			genreById('acid').seeds.some((seed) =>
				TONAL_LAYERS.every((l) => seed.layers[l] === repaired.layers[l])
			)
		).toBe(true);
		expect(repaired.layers.kick).toBe(original.kick);
	});
	it('preserves untouched harmony when only drums need repair', () => {
		const repaired = repairTrackLayers('acid', original, ['hats'], 'pedal-a');
		expect(repaired.harmony).toBe('pedal-a');
		for (const layer of TONAL_LAYERS) expect(repaired.layers[layer]).toBe(original[layer]);
	});
	it('repairs French pitched parts using the same certified chord grid', () => {
		const repaired = repairTrackLayers('french', original, ['bass'], 'sunrise-d');
		expect(repaired.harmony).toBe('sunrise-d');
		expect(
			genreById('french').seeds.some(
				(seed) =>
					seed.harmony === repaired.harmony &&
					TONAL_LAYERS.every((l) => seed.layers[l] === repaired.layers[l])
			)
		).toBe(true);
	});
	it('allows standard drums and supporting bass, but detects a copied foreground motif', () => {
		expect(copiedMotif({ ...original, synth: "note('a3 ~').s('triangle')" }, [original])).toBe(
			false
		);
		expect(copiedMotif(original, [original])).toBe(true);
		expect(copiedMotif({ ...original, synth: 'silence' }, [original])).toBe(true);
	});
});
