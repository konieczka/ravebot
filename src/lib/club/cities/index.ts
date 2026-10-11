import { BERLIN } from './berlin.js';
import { PARIS } from './paris.js';
import { WARSAW } from './warsaw.js';
import type { City, StageId } from './view.js';

export type { City, StageId } from './view.js';

/** The stages RaveBot can play, in switcher order. */
export const CITIES: City[] = [BERLIN, WARSAW, PARIS];
export const STAGE_IDS = CITIES.map((c) => c.id);
export const city = (id: StageId) => CITIES.find((c) => c.id === id) ?? BERLIN;
export const isStage = (v: unknown): v is StageId => STAGE_IDS.includes(v as StageId);
