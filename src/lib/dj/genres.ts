import type { ArcStyle } from './arrangement';
import type { Seed } from './seeds/types';
import { ACID } from './seeds/acid';
import { DETROIT } from './seeds/detroit';
import { DUB } from './seeds/dub';
import { HARD } from './seeds/hard';
import { HYPNOTIC } from './seeds/hypnotic';
import { MINIMAL } from './seeds/minimal';
import type { GenreId } from './types';

export interface Genre {
	id: GenreId;
	name: string;
	bpm: number;
	/** Style guide handed to the LLM. */
	brief: string;
	/** How tracks of this genre build up and drop (see arrangement.ts). */
	arc: ArcStyle;
	/** Hand-written tracks: few-shot examples for the LLM and the offline fallback pool. */
	seeds: Seed[];
}

/*
 * Seed layers are full-energy loops; the arrangement engine strips and rebuilds them over the
 * track. They lean on `arc` (track intensity, 0..1) so filters open, hats thicken and effects
 * grow as the track climbs, `lastOf(n, ...)` for fills at the end of each phrase, and `<...>`
 * sequences that run in track time, so a one-shot in '<rave:0 ~ ~ ~ ~ ~ ~ ~>' lands on bar 1 of
 * every 8-bar phrase.
 */
export const GENRES: Genre[] = [
	{
		id: 'minimal',
		name: 'Berlin Minimal',
		bpm: 128,
		brief:
			'Stripped-back, groovy, lots of space. Dry TR-909 drums, clicky rims, a short rubbery sawtooth bass with a low filter, sparse filtered blips. Small changes, long repetition.',
		arc: {
			roll: { s: 'rim', bank: 'RolandTR909' },
			riser: 'pink',
			impact: false,
			gap: true,
			duck: 0.3,
			breakdown: { perc: 0.8 }
		},
		seeds: MINIMAL
	},
	{
		id: 'acid',
		name: 'Acid',
		bpm: 134,
		brief:
			'Squelchy TB-303 style sawtooth bassline with high resonance (lpq 12-20) and a slowly sweeping low-pass filter, 16th-note patterns with octave jumps, punchy 909 drums, open hats on the off-beat.',
		arc: {
			roll: { s: 'cp', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.45,
			// The classic acid breakdown: the 303 line keeps squelching on its own.
			breakdown: { bass: 1, perc: 0.6, hats: 0.3 }
		},
		seeds: ACID
	},
	{
		id: 'hard',
		name: 'Hard Techno',
		bpm: 150,
		brief:
			'Relentless, distorted and industrial. Saturated kick (shape), rolling off-beat sub bass rumble, 16th hats, metallic claps with reverb, harsh stabs. Aggressive but locked to the grid.',
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.6,
			breakdown: { perc: 0.5, hats: 0 }
		},
		seeds: HARD
	},
	{
		id: 'dub',
		name: 'Dub Techno',
		bpm: 122,
		brief:
			'Deep, foggy and hypnotic. Soft kick, a warm sine sub bass, the signature chord stab (minor 7th chords on sawtooth, low-pass filtered, short decay) drenched in delay and reverb. Shuffled quiet hats.',
		// Dub swells and recedes: no roll, no gap, no impact.
		arc: {
			roll: null,
			riser: 'pink',
			impact: false,
			gap: false,
			duck: 0.35,
			breakdown: { hats: 0.4, perc: 0.6 }
		},
		seeds: DUB
	},
	{
		id: 'detroit',
		name: 'Detroit',
		bpm: 126,
		brief:
			'Soulful, futuristic and melodic. Crisp 909 drums with swing, an 808 clap, a funky syncopated bass, lush minor chord pads or arpeggios (supersaw or triangle) with reverb. Hopeful, machine soul.',
		arc: {
			roll: { s: 'cp', bank: 'RolandTR808' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.35,
			breakdown: { hats: 0.5, perc: 0.8 }
		},
		seeds: DETROIT
	},
	{
		id: 'hypnotic',
		name: 'Hypnotic',
		bpm: 130,
		brief:
			'Deep, rolling and tribal. Polyrhythmic toms and rims (euclidean rhythms), a droning low bass, swirling filtered textures that evolve slowly. Mesmerising loops that barely change.',
		arc: {
			roll: { s: 'mt', bank: 'RolandTR909' },
			riser: 'pink',
			impact: false,
			gap: true,
			duck: 0.3,
			breakdown: { perc: 1, hats: 0.6 }
		},
		seeds: HYPNOTIC
	}
];

export const genreById = (id: GenreId): Genre => GENRES.find((g) => g.id === id) ?? GENRES[0];
