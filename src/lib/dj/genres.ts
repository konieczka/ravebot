import type { ArcStyle } from './arrangement';
import { mixProfile, type MixProfile } from './mix';
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
	/**
	 * Sub-styles (producer lineages) the LLM is given one of per track, so a set does not repeat
	 * one idea. The last one is the experimental pick, favoured at high weirdness.
	 */
	styles: { name: string; recipe: string; minWeirdness: number }[];
	/** Modes the LLM may write in (one is picked per track). Defaults to minor. */
	modes?: string[];
	/** How tracks of this genre build up and drop (see arrangement.ts). */
	arc: ArcStyle;
	/** How tracks of this genre are mixed: groove feel, bus processing and levels (see mix.ts). */
	mix: MixProfile;
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
			"Berlin minimal / microhouse (Perlon, M_nus, Kompakt, Raster-Noton). Space and silence matter more than density: dry tight 909/707 drums, clicky rims and shakers, small toms pitched with .speed(). Rubbery short basses (sine, pulse or triangle plucks with .lpf(...).lpenv(3).lpa(.005).lpd(.1), or a ladder low-pass with low-to-mid resonance). Sparse filtered blips, PWM pulse fragments, tiny FM pings with a short fmdecay. Movement comes from micro-variation over long stretches: degradeBy/sometimesBy, slow perlin filter drift, '<...>' changes every 4-16 bars, arc slowly opening one filter. Keep the kick dry: the engine adds a light sub rumble from it.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'Dry sparse drums, a short repeating bass motif and one quiet chord answer; space is part of the groove.'
			},
			{
				name: 'Plastikman',
				minWeirdness: 0,
				recipe:
					'A restrained resonant acid bass, dry sparse drums and one dark rim echo; move cutoff slowly.'
			},
			{
				name: 'Villalobos',
				minWeirdness: 7,
				recipe:
					'Warm wooden percussion and rubbery bass; one quiet percussion polymeter supplies the only rhythmic experiment.'
			},
			{
				name: 'Robert Hood',
				minWeirdness: 0,
				recipe:
					'One repeated minor chord stab, accented hats and a short pulse bass; keep the hook minimal.'
			},
			{
				name: 'Perlon skippy funk',
				minWeirdness: 7,
				recipe:
					'A playful pulse motif and dry clicky percussion; keep bass on its grid and use one supporting percussion variation.'
			},
			{
				name: 'dub-minimal',
				minWeirdness: 0,
				recipe:
					'Quiet pulse blips, sparse chord stabs and a deep sine bass with restrained dark echoes.'
			},
			{
				name: 'click-house (experimental)',
				minWeirdness: 9,
				recipe:
					'Crushed rim texture and short PWM fragments; one supporting percussion fill, a stable bass and hook.'
			}
		],
		arc: {
			roll: { s: 'rim', bank: 'RolandTR909' },
			riser: 'pink',
			impact: false,
			gap: true,
			duck: 0.3,
			breakdown: { perc: 0.8 }
		},
		mix: mixProfile({ accent: 0.45, glue: 0.4, drive: 0.2, rumble: 0.35, bass: 4.5, synth: 17 }),
		seeds: MINIMAL
	},
	{
		id: 'acid',
		name: 'Acid',
		bpm: 134,
		brief:
			"The Roland TB-303 and everything it spawned. The 303 line is the heart: a 16-step sawtooth or square pattern with rests, octave jumps, chromatic passing notes and accents written as a gain pattern (.gain('.55 .4 .4 .6')), through .ftype('ladder') with high resonance (lpq 12-22), a snappy filter envelope (.lpenv(2-6).lpa(.005).lpd(.1-.2)) and .drive(.6). The tweak is everything: ride cutoff with arc, wander resonance and envelope depth on slow perlin/sine, add .sometimesBy(.15, x => x.add(note(12))). Punchy 909 (or 808) drums, open hats on the off-beat, clap fills with lastOf + ply, rides in some. The synth layer supports in the same key: a second acid line, minor or sus chord stabs, a hoover or a pad. Never ladder a chordal 16th part (CPU).",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'One repeating acid bass motif with rests; move its filter slowly. A sparse chord stab supports it.'
			},
			{
				name: 'Phuture "Acid Tracks"',
				minWeirdness: 0,
				recipe:
					'A repeating sawtooth bass with rests, filter-envelope accents and a slowly opening resonant filter; sparse chord support.'
			},
			{
				name: 'Hardfloor',
				minWeirdness: 7,
				recipe:
					'One foreground acid bass with a quiet answering synth; both follow the same harmony and four-bar grid.'
			},
			{
				name: 'Josh Wink',
				minWeirdness: 7,
				recipe:
					'A repeating resonant bass motif whose cutoff rises slowly; restrained supporting chords.'
			},
			{
				name: 'London acid techno',
				minWeirdness: 0,
				recipe:
					'Firm drums, a lightly distorted acid bass and short square chord stabs; preserve the repeated motif.'
			},
			{
				name: 'Plastikman minimal acid',
				minWeirdness: 0,
				recipe:
					'A sparse acid motif under a nearly closed filter, quiet rim echoes and a soft triangle pad.'
			},
			{
				name: 'Vibert / Ceephax (experimental)',
				minWeirdness: 9,
				recipe:
					'Playful rounded acid timbre, short pulse answers and a sparse robot shot; one quiet percussion experiment.'
			}
		],
		arc: {
			roll: { s: 'cp', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.45,
			// The classic acid breakdown: the 303 line keeps squelching on its own.
			breakdown: { bass: 1, perc: 0.6, hats: 0.3 }
		},
		mix: mixProfile({ swing: 0.53, glue: 0.55, bassDrive: 0.45, bass: 8, synth: 19 }),
		seeds: ACID
	},
	{
		id: 'hard',
		name: 'Hard Techno',
		bpm: 150,
		brief:
			"Hard techno: relentless, distorted and industrial, locked to a nearly straight grid. A punchy saturated kick (909/808 with .shape(.4-.7), maybe a touch of .distort or .lpf), kept dry with no room: the engine adds a heavy distorted sub rumble from it. An off-beat or rolling sub ('[~ x]*4' or '[~ x x x]*4', short decay) through a ladder filter with drive, or FM grit, leaving room for kick and rumble. Claps and snares with room and .crush(), tom rolls, 16th hats. Synths: harsh distorted stabs with hpf, screaming hoovers, detuned supersaws (.unison(5-7).spread(.8)), FM metal (non-integer .fmh like 1.41 or 3.5), white/pink noise risers swept with hpf. arc opens filters and distortion; lastOf fills; '<...>' variations every 4 bars.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'Firm four-on-the-floor kick, short off-beat bass and one repeated dark stab; intensity comes from accents and tone.'
			},
			{
				name: 'schranz',
				minWeirdness: 7,
				recipe:
					'Firm distorted drums and dry repeated stabs, with short stable bass notes and a clear rhythmic anchor.'
			},
			{
				name: 'Berghain industrial',
				minWeirdness: 7,
				recipe:
					'Dark noisy synth texture behind a simple repeated motif, short bass and firm drums.'
			},
			{
				name: 'rave-hard',
				minWeirdness: 7,
				recipe: 'Bright restrained saw chords and a sparse rave shout over a steady kick and bass.'
			},
			{
				name: 'acid-hard',
				minWeirdness: 7,
				recipe: 'A resonant acid motif with firm drums and a short supporting chord answer.'
			},
			{
				name: 'hard-groove',
				minWeirdness: 7,
				recipe:
					'Accented tom percussion over a steady kick and short bass; one supporting percussion line may experiment.'
			},
			{
				name: 'neo-trance hard (experimental)',
				minWeirdness: 9,
				recipe:
					'A clear wide saw hook and a soft pulse answer; shared harmony, stable bass and no pitch effects.'
			}
		],
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.6,
			breakdown: { perc: 0.5, hats: 0 }
		},
		mix: mixProfile({
			swing: 0.51,
			accent: 0.35,
			glue: 0.8,
			drive: 0.6,
			bassDrive: 0.5,
			synthDrive: 0.45,
			rumble: 0.9,
			space: 6000,
			bass: -0.5,
			synth: 22
		}),
		seeds: HARD
	},
	{
		id: 'dub',
		name: 'Dub Techno',
		bpm: 122,
		brief:
			"Dub techno (Basic Channel, Maurizio, Rhythm & Sound, Deepchord, Echospace, Monolake, Porter Ricks). The chord stab is the soul: minor 7th, minor 9th or sus chords on sawtooth (or saw + square/pulse), hollowed with hpf 200-300 or bpf, a resonant low-pass wandering on slow perlin, short decay, drenched in delay (.delay(.5-.75).delaytime(.375) or unsynced like .264, .delayfeedback(.6-.85)) and a big dark reverb (.roomsize(4-8).roomlp(2000-4000)). Add .noise(.04) for tape grit. Chords barely move: one chord for 4-8 bars or a two-chord sway in '<...>'. A warm steady sine/triangle sub, never busy. Soft understated drums: a low-passed kick, quiet shuffled hats with perlin gain, rims, shakers, a muffled clap in room. Texture: very quiet pink-noise hiss or crushed white-noise crackle stacked in the synth layer. The engine darkens echo repeats like a tape delay.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'One warm sustained tonal centre, sparse chord stabs and a steady sub; restrained dark echoes.'
			},
			{
				name: 'Basic Channel',
				minWeirdness: 0,
				recipe:
					'Sparse warm chord stabs on the supplied harmonic grid, quiet drums and restrained dark echo.'
			},
			{
				name: 'Rhythm & Sound',
				minWeirdness: 0,
				recipe:
					'Off-beat square chord skanks, a warm root-focused bass and a sparse vowel chant in the supplied harmony.'
			},
			{
				name: 'Deepchord / Echospace',
				minWeirdness: 0,
				recipe:
					'Soft sustained chord colour with quiet filtered noise, a steady sub and gentle dark echoes.'
			},
			{
				name: 'Monolake',
				minWeirdness: 7,
				recipe:
					'Cold pulse chords and one quiet metallic percussion motif; keep the main chord rhythm and bass stable.'
			},
			{
				name: 'Porter Ricks',
				minWeirdness: 7,
				recipe:
					'Low filtered chord stabs, subtle noise and one quiet syncopated percussion part; steady bass.'
			},
			{
				name: 'melodica dub (experimental)',
				minWeirdness: 9,
				recipe:
					'A gently vibrating pulse answer over warm chords, stable bass and one supporting percussion experiment.'
			}
		],
		// Dub swells and recedes: no roll, no gap, no impact.
		arc: {
			roll: null,
			riser: 'pink',
			impact: false,
			gap: false,
			duck: 0.35,
			breakdown: { hats: 0.4, perc: 0.6 }
		},
		mix: mixProfile({
			swing: 0.56,
			jitter: 0.1,
			glue: 0.35,
			drive: 0.25,
			synthDrive: 0.2,
			rumble: 0.5,
			space: 3500,
			bass: -3,
			synth: 11
		}),
		seeds: DUB
	},
	{
		id: 'detroit',
		name: 'Detroit',
		bpm: 126,
		brief:
			"Detroit techno: soulful, futuristic machine music. Crisp 909 hats and rides, an 808 clap and cowbell, congas from pitched toms. Funky syncopated basses (pulse with .pw, sawtooth with lpenv, octave jumps, notes off the beat). Real harmony matters most: write voice-led progressions of minor 9th, 11th and maj7 chords in '<...>' (e.g. Cm9 -> Fm9 -> Bbmaj7 -> Ebmaj7), lush supersaw pads (.unison(7).spread(.9), attack .3-.6, long release) or syncopated string stabs, Rhodes-like FM keys (sine, .fm(1.5).fmh(1) with fmdecay), arps echoed with .off(). Call-and-response melodies over 2-4 bars. Hopeful minor-to-major colour (dorian especially). The engine already swings the hats and perc by 57%, so don't add swingBy.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'Close chord voicings on the supplied progression, a syncopated bass and a simple two-bar melodic answer.'
			},
			{
				name: 'Derrick May "Strings of Life"',
				minWeirdness: 7,
				recipe:
					'Syncopated string-like saw chords with a two-bar answer and a short bass following the supplied roots.'
			},
			{
				name: 'Model 500 electro',
				minWeirdness: 7,
				recipe:
					'Dry 808 colours, a funky pulse bass on the supplied groove and a short square sci-fi answer with sparse robot speech.'
			},
			{
				name: 'UR / Hi-Tech Jazz',
				minWeirdness: 7,
				recipe:
					'Warm FM keys with close voicings and a short singable answer over the supplied progression.'
			},
			{
				name: 'Carl Craig',
				minWeirdness: 0,
				recipe:
					'Warm sustained saw chords with a slow filter sweep and a quiet plucked answer; root-focused bass.'
			},
			{
				name: 'Kenny Larkin jazz-house',
				minWeirdness: 0,
				recipe:
					'Warm sine FM keys, gentle panning and syncopated bass following the supplied roots.'
			},
			{
				name: 'Drexciya (experimental)',
				minWeirdness: 9,
				recipe:
					'Aquatic filtered pulse and triangle colours with a short mysterious hook; one supporting percussion experiment.'
			}
		],
		arc: {
			roll: { s: 'cp', bank: 'RolandTR808' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.35,
			breakdown: { hats: 0.5, perc: 0.8 }
		},
		mix: mixProfile({
			swing: 0.57,
			accent: 0.55,
			glue: 0.45,
			drift: 6,
			space: 9000,
			bass: 3,
			synth: 9.5
		}),
		seeds: DETROIT
	},
	{
		id: 'hypnotic',
		name: 'Hypnotic',
		bpm: 130,
		brief:
			'Hypnotic techno (Donato Dozzy, Rrose, Voices From The Lake, Oscar Mulero, Peter Van Hoesen, Neel). Loops that barely change and pull you under: evolution comes from slow modulation over 16-64 bars (.slow(32), .slow(64), perlin), not from new riffs. Rolling tom polyrhythms (euclid lt/mt/ht, {...}%16 polymeters drifting against the kick, pitched with .speed), droning or pulsing basses (low ladder filter with slow resonance movement, pulse with slowly modulated .pw, a sine sub + gritty top), swirling textures (filtered noise with slow bpf/hpf sweeps, FM metallic shimmer with non-integer .fmh, short motifs fed into long delays at .6-.8 feedback until they smear, slow-attack pads in .roomsize(6-8)). Stereo motion with pan(sine.slow(n)), jux, off. Keep the kick dry: the engine adds a strong sub rumble from it.',
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'Repeat a short tonal motif over a steady bass and kick; evolve one filter slowly and keep percussion sparse.'
			},
			{
				name: 'Dozzy / VFTL',
				minWeirdness: 7,
				recipe:
					'Repeat a short soft FM motif, move one filter over many bars and keep a quiet steady bass.'
			},
			{
				name: 'Rrose',
				minWeirdness: 7,
				recipe:
					'A slowly evolving resonant motif over the supplied tonal centre, with restrained soft noise and steady bass.'
			},
			{
				name: 'Mulero / Semantica',
				minWeirdness: 7,
				recipe: 'A dark repeated bass motif with quiet square chord answers and filtered noise.'
			},
			{
				name: 'Peter Van Hoesen',
				minWeirdness: 7,
				recipe:
					'Precise short pulse notes over steady bass; one quiet percussion polymeter creates movement.'
			},
			{
				name: 'tribal',
				minWeirdness: 0,
				recipe:
					'Accented toms and a quiet sustained pad with one short melodic answer; keep space between parts.'
			},
			{
				name: 'polymetric web (experimental)',
				minWeirdness: 9,
				recipe:
					'One quiet percussion polymeter against a stable kick, bass and repeated pulse motif; all pitched parts share the four-bar plan.'
			}
		],
		arc: {
			roll: { s: 'mt', bank: 'RolandTR909' },
			riser: 'pink',
			impact: false,
			gap: true,
			duck: 0.3,
			breakdown: { perc: 1, hats: 0.6 }
		},
		mix: mixProfile({ swing: 0.55, rumble: 0.8, synthDrive: 0.3, space: 5000, bass: 1, synth: 15 }),
		seeds: HYPNOTIC
	},
	{
		id: 'french',
		name: 'French House',
		bpm: 124,
		brief:
			'French touch, Discovery-era warmth and filter disco. Build an original four-bar musical loop that feels played and resampled: closely voiced extended chords, syncopated attacks alternating with held notes, a rounded bass groove and a sparse singable response. Repetition is the hook; evolve the filter and arrangement, keep the melody recognizable. The bass, keys and voice share the supplied harmonic contract. Use warm electric piano, restrained saw chords or rounded pulse guitar colors. Avoid default arpeggios, continuous octave bass, tiny zero-sustain stabs and excessive detuned supersaws. A steady 909, claps on 2 and 4, lightly swung hats. The engine processes bass and keys together and supplies the pump; vowel-filtered synths are optional robotic color, not a required imitation of vocals.',
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'A repeating four-bar keyboard loop, rounded bass and a short singable answer following the supplied harmony.'
			},
			{
				name: 'Daft Punk "Discovery"',
				minWeirdness: 0,
				recipe:
					'warm sustained seventh/ninth keyboard voicings with two syncopated attacks per bar, a rounded syncopated bass and a held four-bar robotic answer'
			},
			{
				name: 'Daft Punk "Homework"',
				minWeirdness: 0,
				recipe:
					'raw 909 drums, a memorable restrained saw bass riff with space between notes, close pulse chord voicings and a sparse robot answer'
			},
			{
				name: 'Stardust / Modjo',
				minWeirdness: 0,
				recipe:
					'a repeating ninth-chord keyboard phrase following the supplied four-bar grid, a few guitar-like pulse accents, syncopated bass with occasional octaves and a breathy robotic answer; shared filter handled by the engine'
			},
			{
				name: 'Cassius / Bob Sinclar',
				minWeirdness: 0,
				recipe:
					'rounded brass chords with held notes, FM piano (.fm(1.5).fmh(1)) answering in the second half of the phrase, a sparse robotic voice; leave room for the shared filter'
			},
			{
				name: 'Alan Braxe & Fred Falke',
				minWeirdness: 0,
				recipe:
					'a warm nostalgic electric-piano loop with close ninth voicings, soft 707 drums, a rounded syncopated bass and a dreamy slow-attack robotic answer'
			},
			{
				name: 'Roule glitch (experimental)',
				minWeirdness: 9,
				recipe:
					'a disco loop with one short repeated chord answer on bar four, steady harmony and bass, crunchy percussion and a sparse speakspell shot; keep the core phrase intact'
			}
		],
		modes: ['major', 'dorian', 'minor'],
		// Filter house: the groove never stops; it is filtered down and swept back open into the drop.
		arc: {
			roll: null,
			riser: null,
			impact: false,
			gap: false,
			loopArrangement: true,
			duck: 0.42,
			// Held vocoder notes would wobble on every kick at the full pump.
			voxDuck: 0.16,
			sweep: 'lowpass',
			breakdown: { kick: 1, bass: 1, synth: 1, vox: 0, hats: 0.25, perc: 0.45 },
			build: { kick: 1, bass: 1, hats: 1, perc: 1, synth: 1, vox: 0 }
		},
		mix: mixProfile({
			swing: 0.56,
			glue: 0.6,
			drive: 0.35,
			drift: 2,
			synthDuck: 0.8,
			loopGlue: 0.65,
			bassFullDuck: 1,
			duckBeats: 0.65,
			space: 10000,
			bass: 3,
			synth: 13.5
		}),
		seeds: FRENCH
	},
	{
		id: 'psy',
		name: 'Psytrance',
		bpm: 143,
		brief:
			"Psytrance in all its colours. The foundation is the KBBB: a short tight kick on every beat (bd with .decay(.15).sustain(0)) locked with a rolling bass of three 16ths after each kick ('[~ e1 e1 e1]*4'), decay under .08 and never on the kick, through a ladder low-pass with lpenv for the knock; vary its timbre (saw, pulse, FM, square with .noise) and move it with arc. Fast 16th hats, off-beat open hats, sparse snares and claps, rides. On top: acid squelches (ladder, high lpq), gated 16th synths (struct/mask with euclids), FM blips and laser zaps (.penv(12-36).pdecay(.05)), vowel chatter, long synced delays and wide panning (pan(sine.fast(2)), jux(rev)). Eastern scales: phrygian, phrygian dominant, harmonic minor. Something mutates every 8 bars ('<...>', lastOf(8, ...), iter). Sci-fi speech samples, sparse.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'Short kick with three short bass sixteenths after every kick; one repeated harmonic-minor hook.'
			},
			{
				name: 'full-on',
				minWeirdness: 0,
				recipe:
					'A short memorable harmonic-minor saw hook over the exact three-sixteenths-after-kick bass pattern.'
			},
			{
				name: 'Goa',
				minWeirdness: 7,
				recipe:
					'A repeating resonant synth motif with a short answering FM tone, over the unchanged kick and rolling bass.'
			},
			{
				name: 'progressive',
				minWeirdness: 0,
				recipe:
					'Rounded bass with the exact rolling rhythm, sparse syncopated chords and slow filter movement.'
			},
			{
				name: 'dark forest',
				minWeirdness: 7,
				recipe:
					'Dark square bass on the fixed rolling rhythm, a quiet filtered noise texture and a short tonal hook.'
			},
			{
				name: 'twilight psy-techno',
				minWeirdness: 7,
				recipe:
					'One repeated gated pulse motif and slow timbral movement above the fixed rolling bass.'
			},
			{
				name: 'psychedelic lab (experimental)',
				minWeirdness: 9,
				recipe:
					'Slow pulse-width or vowel colour movement on a stable synth motif; the kick and rolling bass remain unchanged.'
			}
		],
		// The rolling bass already leaves room for the kick: no sidechain.
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0,
			breakdown: { hats: 0.4, perc: 0.6 }
		},
		mix: mixProfile({
			swing: 0.5,
			accent: 0.4,
			glue: 0.55,
			drive: 0.35,
			drift: 3,
			space: 8000,
			bass: 3.5,
			synth: 15
		}),
		seeds: PSY
	},
	{
		id: 'hardbass',
		name: 'Hardbass',
		bpm: 158,
		modes: ['minor', 'harmonic minor'],
		brief:
			"Russian hardbass (St Petersburg, XS Project, DJ Snat, Hard Bass School): fast, bouncy and cheeky. The 'bochka': a long distorted kick sample on every beat (hardkick:3/4/5, gabba:0 at gain .6, or clubkick:2 with .shape(.4); no bank) cut with .decay(.15-.22).sustain(0) so it ends before the off-beat. The hollow 'donk' bass on every off-beat: a sine at octave 1-2 with 2:1 FM, .fm(2-4).fmh(2).fmwave('triangle').fmdecay(.12).fmsustain(.25).decay(.3).sustain(0) and some .shape(); let it walk i-VI-VII-V and flip octaves at phrase ends. Off-beat open hats, claps on 2 and 4, snare rolls via lastOf + ply. Catchy Slavic hooks in harmonic minor (raised 7th, augmented second) in 2-4 bar call and response: a massive supersaw (.unison(7).spread(.9)), square or pulse leads, balalaika tremolo picking (.ply(4) with short decay and lpenv), accordion-like pulse with .vib and a slight vowel, whistles (high sine with .vib(5).vibmod(.3)), hoovers. Public-domain folk tunes (Kalinka, Korobeiniki, Polyushko Pole, Ochi Chornye) are fair game. Russian shouts (rus:N): davai on bar 1, pognali or gromche call-outs, a count rus:2 rus:3 rus:4 on the last bar of the phrase leading into the drop.",
		styles: [
			{
				name: 'classic groove',
				minWeirdness: 0,
				recipe:
					'A firm kick and hollow off-beat donk, with a short repeated hook following the supplied progression.'
			},
			{
				name: 'XS Project anthem',
				minWeirdness: 0,
				recipe:
					'Off-beat hollow donk following the supplied roots, a four-bar saw hook and sparse Russian call-outs.'
			},
			{
				name: 'gopnik-techno',
				minWeirdness: 0,
				recipe:
					'A darker donk colour with quiet pulse chord answers and a sparse Russian chant, in the supplied mode.'
			},
			{
				name: 'folk hardbass',
				minWeirdness: 0,
				recipe:
					'An original folk-like short repeated hook with a singable answer; donk follows the supplied roots.'
			},
			{
				name: 'hoover rave',
				minWeirdness: 7,
				recipe:
					'A restrained wide saw riff with stable pitch, off-beat donk and a sparse rave shout; synths only for pitched parts.'
			},
			{
				name: 'hard bass school chant',
				minWeirdness: 0,
				recipe:
					'Sparse Russian call-outs answered by a short pulse hook, with a stable off-beat donk.'
			},
			{
				name: 'accordion gabba (experimental)',
				minWeirdness: 9,
				recipe:
					'A pulse hook with gentle vibrato and vowel colour, a gabba kick and lightly crushed off-beat donk; stable pitch and rhythm.'
			}
		],
		arc: {
			roll: { s: 'sd', bank: 'RolandTR909' },
			riser: 'white',
			impact: true,
			gap: true,
			duck: 0.5,
			// Shouts stay steady over the pump so every word is clear.
			voxDuck: 0.15,
			breakdown: { hats: 0.5, perc: 0.5 },
			// The crowd chant carries through the build: a count on its last bar leads into the drop.
			build: { vox: 1 }
		},
		mix: mixProfile({
			// Keep the mix open; the dedicated kick and metal strike provide the character.
			swing: 0.5,
			accent: 0.2,
			jitter: 0.03,
			drift: 0,
			glue: 0.3,
			drive: 0.15,
			bassDrive: 0.15,
			synthDuck: 0.6,
			space: 8000,
			bass: 10,
			synth: 29,
			// Natural-pitch shouts retain their dynamics; leave master headroom.
			vox: 0,
			bochka: 0.6 * 10 ** (1 / 20),
			barrel: 0.1,
			can: 0.85,
			lofi: 0,
			pump: 0.15
		}),
		seeds: HARDBASS
	}
];

export const genreById = (id: GenreId): Genre => GENRES.find((g) => g.id === id) ?? GENRES[0];
