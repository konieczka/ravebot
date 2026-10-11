import type { HarmonyId } from '../harmony';
import type { Layers } from '../types';

export interface Seed {
	title: string;
	harmony?: HarmonyId;
	layers: Layers;
}
