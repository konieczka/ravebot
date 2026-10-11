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
	styles: { name: string; recipe: string }[];
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
				name: 'Plastikman',
				recipe:
					"a low 16th 303 hum through one ladder filter (.ftype('ladder').lpq(10-14).drive(.5)) that opens very slowly with arc and perlin, cavernous rim and clap in a big dark room (.roomsize(6)), almost nothing else"
			},
			{
				name: 'Villalobos',
				recipe:
					'long wandering 808 percussion polyrhythms: odd euclids like mt(5,12) and lt(3,11), rims on a 10-step polymeter with per-bar .speed(), perlin-gained shakers, wooden FM marimba pings answered by a fifth with .off(3/16, ...); loose and humid'
			},
			{
				name: 'Robert Hood',
				recipe:
					'one minor 7th chord stab on every off-beat (sawtooth, .lpenv pluck) into a dotted-8th delay, driving accented 16th hats, a PWM pulse bass; relentless and functional'
			},
			{
				name: 'Perlon skippy funk',
				recipe:
					'bouncy, off-grid: percussion on 7- and 12-step polymeters, an occasional skipped extra kick, a rubbery ladder bass with lpenv on a 13-step polymeter, PWM two-note stabs in call and response over 4 bars'
			},
			{
				name: 'dub-minimal',
				recipe:
					'echoing pulse blips and a minor 7th dub stab in long delays (.delayfeedback(.7)) and a dark room, deep sine bass, a rim and tom sent into the echoes'
			},
			{
				name: 'click-house (experimental)',
				recipe:
					"micro-clicks from crushed or coarse rims and claps pitched up 1.5-2.5x, white-noise .coarse() blips, stuttered PWM fragments with .ply('<1 1 2 1 1 3 1 2>'), speech chopped with .chop(6).degradeBy(.4)"
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
				name: 'Phuture "Acid Tracks"',
				recipe:
					'raw Chicago jack: a two-bar 16-step 303 riff with rests and a chromatic note, cutoff on arc, resonance on slow perlin, envelope depth on sine; a pulse chord stab with PWM on top'
			},
			{
				name: 'Hardfloor',
				recipe:
					'two interlocking 303s: the bass box in 16 steps, a second laddered box in the synth layer an octave up on an 11-step polymeter ({...}%16) with a slow phaser; rides come in with arc'
			},
			{
				name: 'Josh Wink',
				recipe:
					'one relentless 16th line whose cutoff climbs ~150 -> 4000 Hz and resonance 14 -> 23 with arc, light distort, and a screaming bar every 16 (.lastOf(16, x => x.lpq(25))); a minor supersaw pad underneath'
			},
			{
				name: 'London acid techno',
				recipe:
					'a distorted 303 whose .distort grows with arc, hard 909 with .shape(.4), bitcrushed square chord stabs on the off-beats, clap rolls every 8 bars, rave shouts'
			},
			{
				name: 'Plastikman minimal acid',
				recipe:
					'a sparse rest-heavy 303 under a nearly closed filter (perlin 200-650 Hz, lpq 20), euclidean 808 rims dripping into a dark long reverb and a dotted-8th delay, a slow triangle pad'
			},
			{
				name: 'Vibert / Ceephax (experimental)',
				recipe:
					'a playful melodic dorian 303 written as scale degrees with random .penv zaps, supersaw seventh chords with a PWM pulse arpeggio, 808 cowbell and toms, speakspell and bleeps'
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
				name: 'schranz',
				recipe:
					'looped hammering percussion: euclid tom rolls on lt/mt/ht, 16th hats whose .crush() harshens with arc, a rolling ladder sub, a looped FM metal hammer (square, .fmh(1.41), distort), little melody'
			},
			{
				name: 'Berghain industrial',
				recipe:
					'crushed and coarse claps, snares and cowbells with per-bar coarse amounts, FM grit bass, grinding crushed white noise under a clangorous FM stab (.fmh(3.5)) in a dark long reverb, dark speech with long delay'
			},
			{
				name: 'rave-hard',
				recipe:
					'emotional detuned supersaw chords (minor i-VI-III-VII) in a syncopated stab rhythm with a white-noise riser stacked in the synth layer, a ladder bass on the chord roots, rave shouts and hoovers'
			},
			{
				name: 'acid-hard',
				recipe:
					'a two-bar 16th 303 on a ladder with lpenv and .drive(1.2), resonance rising 10 -> 22 with arc, a short pulse off-beat roll as the bass'
			},
			{
				name: 'hard-groove',
				recipe:
					"funky looped 808 cowbell, tom and clap percussion, shaker euclids, a funky 16th bass resting on the beat, PWM pulse stabs with a phaser, a 'give it' / 'our crew' chant"
			},
			{
				name: 'neo-trance hard (experimental)',
				recipe:
					"a wide supersaw arpeggio (.unison(7).spread(1)) over a minor progression with an octave echo via .off(3/16, ...), a stacked sine sub + high-passed saw bass, a vowel-filtered pulse 'voice' singing a 16-bar melody"
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
				name: 'Basic Channel',
				recipe:
					"one hypnotic chord stab that only changes on bar 8 of each phrase ('<chord!7 other>'), an octave-up square layered with .superimpose, cutoff on perlin, feedback climbing .62 -> .8 with arc"
			},
			{
				name: 'Rhythm & Sound',
				recipe:
					'reggae dub: off-beat square skank chords high-passed at 400 over a i-i-iv-v minor 7th progression, a melodic roots bass (sine sub + pulse top via .layer), a one-drop clap on beat 3, a toaster-style vowel chant'
			},
			{
				name: 'Deepchord / Echospace',
				recipe:
					'oceanic fog: an add9 chord held 4 bars then two others, band-passed and drowned in an unsynced .264 s delay at .85 feedback and an 8-size reverb darkened to 2500 Hz, pink haze and crackle underneath'
			},
			{
				name: 'Monolake',
				recipe:
					'cold and precise: pulse chords on a 5-step polymeter, FM metallic clicks on a 7-step one, rims and cowbell polymeters with panning, a tight kick, a sparse FM bell in 16th delay'
			},
			{
				name: 'Porter Ricks',
				recipe:
					'submerged: chords on a 5-in-16 euclid through a ladder low-pass held nearly closed (250-900 Hz) and wobbled by fast perlin, resonance 10-18 rising with arc, bubbling swept pink noise'
			},
			{
				name: 'melodica dub (experimental)',
				recipe:
					'PWM pulse chords on a 7-step polymeter, FM bells (.fmh(3.5)) answering in the same echo, an 11-step broken bass, a melodica-like pulse phrase with vibrato on bars 3-4 of every 8'
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
				name: 'Derrick May "Strings of Life"',
				recipe:
					'syncopated supersaw string stabs (.attack(.005), short decay) on a dramatic progression like Em9 -> Cmaj9 -> Am7 -> B7, two stab rhythms alternating per bar and doubling at phrase end, a 16th lpenv saw bass with octave jumps'
			},
			{
				name: 'Model 500 electro',
				recipe:
					"a broken 808 electro kick ('bd ~ ~ bd ~ ~ bd ~') with fills, 808 cowbell and clap, a funky PWM pulse bass, a square sci-fi arp with a 3/16 octave echo and auto-pan, speakspell robot phrases"
			},
			{
				name: 'UR / Hi-Tech Jazz',
				recipe:
					'an 8-bar voice-led jazz progression (m9, 13, maj9, m7b5, 7sus, 7b9), syncopated saw comping under a soaring vibrato saw lead written against the chords, a ride-driven groove, a ladder saw bass'
			},
			{
				name: 'Carl Craig',
				recipe:
					'a lush cinematic supersaw pad (.unison(7).spread(.9).attack(.5).release(2)) whose filter sweeps over 32 bars with common tones held, an FM pluck fading in with arc, an off-beat sine sub + high-passed saw'
			},
			{
				name: 'Kenny Larkin jazz-house',
				recipe:
					'Rhodes FM keys comping m9 -> 13 -> maj9 -> maj7 with auto-pan, pitched 808 toms as congas, one funky saw bass pattern transposed to each chord root'
			},
			{
				name: 'Drexciya (experimental)',
				recipe:
					'aquatic electro: a broken kick with a long 808 boom, a self-resonant ladder pulse bass with drive, a mysterious vibrato triangle melody, FM bubbles (.fmh(3.5), .penv zaps, random pan) on a 5-step polymeter'
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
				name: 'Dozzy / VFTL',
				recipe:
					"aquatic: a 7-step FM sine arpeggio ({..}%16, .fmh(2.01)) with FM depth drifting over 32 bars, an octave echo into a long delay and a slow pan, a sine sub + PWM top rolling '[~ x x ~]'"
			},
			{
				name: 'Rrose',
				recipe:
					'droning and resonant: a 16th ladder saw roll with cutoff over 32 bars and lpq wandering 6-18 on perlin, a resonant supersaw cluster turning every 4 bars, FM shimmer (.fmh(1.414)), a slow vowel drone'
			},
			{
				name: 'Mulero / Semantica',
				recipe:
					'dark rolling industrial: a ladder saw roll with lpenv and drive opening with arc, white noise through a slow band-pass under answering square-FM dyads (.fmh(3.53)) with dub delay, detuned tom polymeters'
			},
			{
				name: 'Peter Van Hoesen',
				recipe:
					'precise and metallic: a 9-step FM pluck (.fmh(3.17)) through jux(rev), pitched-up 707 rim, cowbell and tom polymeters with iter fills, a sine sub + PWM top on a 5-step polymeter'
			},
			{
				name: 'tribal',
				recipe:
					'drums lead: five 808 tom, cowbell and perc lines pitched like congas across the stereo field, a slow-attack supersaw pad, a 2-bar call-and-response motif in high delay feedback'
			},
			{
				name: 'polymetric web (experimental)',
				recipe:
					'every layer on its own cycle length: 4/4 kick, a 3-step hat loop against hh(5,7), 5/7/11-step perc, a 9-step bass, a 5-step PWM pulse against a 7-step FM line, a 7-bar vox cycle'
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
			"French touch, 1996-2003 (Daft Punk, Stardust, Modjo, Cassius, Alan Braxe, Roule): shiny, euphoric filter-disco house. A 909 kick on every beat that pumps the whole mix, claps on 2 and 4, open hats, shakers and rides. A funky octave-jumping disco bass (plucky square or sawtooth with lpenv). A looped riff of lush 7th/9th chords in a real disco progression (e.g. Fmaj7 -> Em7 -> Dm9 -> G7sus in '<...>') that sounds like a filtered disco sample: sawtooth or supersaw with .phaser() and a slowly moving low-pass (sine.range(...).slow(16)), often stacked with a guitar-like pulse pluck. The robot vocoder hook is the signature: a held sawtooth melody in octave 3-4 (.sustain(.7)) with a vowel per note, e.g. .vowel('<[o o a e] [a a o o]>'), bright (.lpf(4500)), slightly driven (.shape(.15)), with .vib for talkbox wobble. Hooks matter most: bright, catchy, feel-good.",
		styles: [
			{
				name: 'Daft Punk "Discovery"',
				recipe:
					'a supersaw brass riff with lpenv and phaser over Fmaj7 -> Em7 -> Dm9 -> G7sus4 in a syncopated 16-step rhythm, an octave square disco bass, a 4-bar robot vocoder hook with a vowel per note and vibrato'
			},
			{
				name: 'Daft Punk "Homework"',
				recipe:
					'raw gritty 909 with bitcrushed hats; the bass is the lead: a squelchy ladder line with high resonance, lpenv and drive; off-beat coarse pulse stabs; a pulse-wave vocoder'
			},
			{
				name: 'Stardust / Modjo',
				recipe:
					"a looped two-chord 9th 'sample' with phaser and a slow 16-bar low-pass, stacked with a guitar-like pulse pluck in dotted delay, a 16th octave disco bass, a breathy talkbox vocoder"
			},
			{
				name: 'Cassius / Bob Sinclar',
				recipe:
					'supersaw brass stabs under a 32-bar filter sweep, FM piano chops (.fm(1.5).fmh(1)) answering in the second half of each bar, a vocoder phrase plus a rave shot on bar 16'
			},
			{
				name: 'Alan Braxe & Fred Falke',
				recipe:
					'a warm nostalgic keyboard loop of dense 9th voicings with .noise() breath, a 32-bar filter drift, soft 707 drums, a ladder bass, a dreamy slow-attack vocoder'
			},
			{
				name: 'Roule glitch (experimental)',
				recipe:
					"a chopped stuttering disco loop: .ply('<1 1 2 [1 4]>') stabs, .chunk(4, ...) octave jumps, a stepped-saw low-pass with fast phaser, an iter(4) bass, 5-step polymeter hats, a speakspell shot"
			}
		],
		modes: ['major', 'dorian', 'minor'],
		// Filter house: the groove never stops; it is filtered down and swept back open into the drop.
		arc: {
			roll: null,
			riser: null,
			impact: false,
			gap: true,
			duck: 0.7,
			// Held vocoder notes would wobble on every kick at the full pump.
			voxDuck: 0.3,
			sweep: 'lowpass',
			breakdown: { hats: 0.4, perc: 0.6 },
			build: { kick: 1, bass: 1, hats: 1, perc: 1, synth: 1, vox: 0 }
		},
		mix: mixProfile({
			swing: 0.56,
			glue: 0.6,
			drive: 0.35,
			drift: 4,
			synthDuck: 1,
			space: 10000,
			bass: 3,
			synth: 16.5
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
				name: 'full-on',
				recipe:
					'a 4-bar call-and-response supersaw melody in harmonic minor with an FM laser zap layer (.penv(24)) thickening with arc, a ladder KBBB bass that walks down in bar 4, crashes marking each phrase'
			},
			{
				name: 'Goa',
				recipe:
					'a 16th 303 squelch (ladder, lpq rising with arc, drive) with an .off(3/16, ...) octave echo and lastOf(8, iter(4)), an FM sitar phrase (.fmh(3), vibrato, jux(rev)) answering every 4 bars, tom polymeters'
			},
			{
				name: 'progressive',
				recipe:
					'deeper and groovy: an FM sine bass with depth on arc and accents, a slow PWM pulse pad over 2-bar minor chords with filtered syncopated saw stabs, rides'
			},
			{
				name: 'dark forest',
				recipe:
					'a square bass with .noise grit moving to the flat second at phrase ends, euclidean FM metal hits (.fmh(1.414)) and crushed white-noise chatter through vowel, crushed claps, pitched-down metal samples in a dark hall'
			},
			{
				name: 'twilight psy-techno',
				recipe:
					'a single gated note whose euclid changes per bar over an 8-bar cycle through PWM, vowel sweeps and a 16th ping-pong delay, a ladder bass with a 32-bar cutoff sine'
			},
			{
				name: 'psychedelic lab (experimental)',
				recipe:
					'a ladder acid line with FM depth and ratio modulated by sine and perlin, vowel chatter, chunk(4) octave jumps, hard ping-pong with pan(square.fast(4)), an FM triangle bass whose ratio changes per bar'
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
				name: 'XS Project anthem',
				recipe:
					'the donk walking i-VI-VII-V with an octave flip at phrase end, a 4-bar supersaw call and response whose answer leans on the raised 7th, davai on bar 1, pognali on bar 5, the count on bar 8'
			},
			{
				name: 'gopnik-techno',
				recipe:
					"darker natural minor: a donk stacked with a ladder saw top (FM depth rising with arc), PWM pulse stabs on a 3-in-8 euclid with dotted delay, a ride and rim echoes, a 'bochka bass' chant"
			},
			{
				name: 'folk hardbass',
				recipe:
					"a public-domain folk tune reinterpreted in harmonic minor on a tremolo-picked saw balalaika (ply with a short lpenv), the donk following the song's harmony, a crash on bar 1 and a clap roll at phrase end"
			},
			{
				name: 'hoover rave',
				recipe:
					'hoover samples on bars 1 and 5 stacked with a supersaw riff that scoops into each note with a negative .penv, an octave-flipping donk with a small pitch dip, davai plus a rave shot'
			},
			{
				name: 'hard bass school chant',
				recipe:
					"crowd chants carry it: vse vmeste, bochka bass, gromche, then the count; a second clap line answers the crowd, the donk's FM depth sweeps slowly, a pulse lead resolving through the raised 7th"
			},
			{
				name: 'accordion gabba (experimental)',
				recipe:
					"an accordion from a pulse with near-unison FM (.fmh(1.01)), vibrato, an 'o' vowel and a detuned copy, an original hook with the augmented second, a gabba bochka with an extra hit at phrase ends, a bitcrushed donk"
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
			bass: 6,
			synth: 26,
			// Natural-pitch shouts retain their dynamics; leave master headroom.
			vox: 0,
			bochka: 0.6,
			barrel: 0.1,
			can: 0.85,
			lofi: 0,
			pump: 0.15
		}),
		seeds: HARDBASS
	}
];

export const genreById = (id: GenreId): Genre => GENRES.find((g) => g.id === id) ?? GENRES[0];
