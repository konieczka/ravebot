import { fallbackTrack } from './fallback';
import { TONAL_LAYERS, type HarmonyId } from './harmony';
import type { GenreId, LayerName, Layers } from './types';

/** A pitched part can never be spliced from an unrelated key into a new composition. */
export function repairTrackLayers(
	genre: GenreId,
	layers: Partial<Layers>,
	broken: LayerName[],
	harmony?: HarmonyId
): { layers: Layers; harmony?: HarmonyId; repaired: LayerName[] } {
	if (!broken.length) return { layers: layers as Layers, harmony, repaired: [] };
	const backup = fallbackTrack(genre, undefined, harmony);
	const replace = new Set(broken);
	const tonal = TONAL_LAYERS.some((l) => replace.has(l));
	if (tonal) for (const layer of TONAL_LAYERS) replace.add(layer);
	const repaired = { ...layers } as Layers;
	for (const layer of replace) repaired[layer] = backup.layers[layer];
	return { layers: repaired, harmony: tonal ? backup.harmony : harmony, repaired: [...replace] };
}

/** Common drum/bass grooves are vocabulary; originality belongs to the foreground motif. */
export function copiedMotif(layers: Layers, references: readonly Layers[]): boolean {
	return layers.synth !== 'silence'
		? references.some((r) => r.synth === layers.synth)
		: layers.bass !== 'silence' && references.some((r) => r.bass === layers.bass);
}
