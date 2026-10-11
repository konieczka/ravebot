import type { ArcStyle } from './arrangement';
import type { Seed } from './seeds/types';
import { ACID } from './seeds/acid';
import { DETROIT } from './seeds/detroit';
import { DUB } from './seeds/dub';
import { FRENCH } from './seeds/french';
import { HARD } from './seeds/hard';
import { HARDBASS } from './seeds/hardbass';
import { HYPNOTIC } from './seeds/hypnotic';
import { MINIMAL } from './seeds/minimal';
import { PSY } from './seeds/psy';
import type { GenreId } from './types';

/** Accent color of each subgenre: lasers, light lenses and the UI accent. */
export const GENRE_COLORS: Record<GenreId, string> = {
	minimal: '#4dd2ff',
	acid: '#c6ff3d',
	hard: '#ff3b5c',
	dub: '#5c8bff',
	detroit: '#ffb03b',
	hypnotic: '#c06bff',
	french: '#ff7ad9',
	psy: '#2dffc4',
	hardbass: '#ffe14d'
};

export interface Genre {
	id: GenreId;
	name: string;
	bpm: number;
	/** Style guide handed to the LLM. */
	brief: string;
	/** Modes the LLM may write in (one is picked per track). Defaults to minor. */
	modes?: string[];
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
	},
	{
		id: 'french',
		name: 'French House',
		bpm: 124,
		brief:
			"Daft Punk 'Discovery'-era French touch: shiny, euphoric disco house. A 909 kick on every beat that makes the whole mix pump, claps on 2 and 4, swung open hats and shakers. A funky, octave-jumping disco bass (plucky square or sawtooth). A looped riff of lush 7th/9th chords that sounds like a filtered disco sample (sawtooth or supersaw with .phaser() and a slowly moving low-pass), and a robot vocoder hook: a sawtooth melody through .vowel(). Bright and feel-good.",
		modes: ['major', 'dorian', 'minor'],
		// Filter house: the groove never stops; it is filtered down and swept back open into the drop.
		arc: {
			roll: null,
			riser: null,
			impact: false,
			gap: true,
			duck: 0.7,
			sweep: 'lowpass',
			breakdown: { hats: 0.4, perc: 0.6 },
			build: { kick: 1, bass: 1, hats: 1, perc: 1, synth: 1, vox: 0 }
		},
		seeds: FRENCH
	},
	{
		id: 'psy',
		name: 'Psytrance',
		bpm: 143,
		brief:
			"Full-on psytrance. A short, tight kick on every beat (bd with .decay(.15).sustain(0)) locked with a rolling bass: three short 16th sawtooth notes filling the gap after each kick ('~ e1 e1 e1'), decay under .08 and never on the kick. Fast 16th hats, off-beat open hats, sparse snares. On top: acid squelches, gated 16th synths, FM blips and laser zaps with pitch envelopes, long delays and wide panning. Alien and hypnotic; something mutates every 8 bars. Sci-fi speech samples.",
		// The rolling bass already leaves room for the kick: no sidechain.
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0,
			breakdown: { hats: 0.4, perc: 0.6 }
		},
		seeds: PSY
	},
	{
		id: 'hardbass',
		name: 'Hardbass',
		bpm: 158,
		brief:
			"Russian hardbass (St Petersburg, XS Project style): fast, bouncy and cheeky. A hard, distorted kick on every beat and a metallic 'donk' bass on every off-beat between the kicks (a sine or square note with .fm(), a pitch envelope like .penv(12).pdecay(.05) and a short decay). Open hats on the off-beat, claps on 2 and 4, a cheesy 90s rave lead or hoover riff, whistles (a high sine with .vib()) and shouted rave vocals. Simple, catchy, pumping.",
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.5,
			breakdown: { hats: 0.5, perc: 0.5 }
		},
		seeds: HARDBASS
	}
];

export const genreById = (id: GenreId): Genre => GENRES.find((g) => g.id === id) ?? GENRES[0];
