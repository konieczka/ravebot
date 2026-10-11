import type { GenreId, Layers } from './types';

export interface Genre {
	id: GenreId;
	name: string;
	bpm: number;
	/** Style guide handed to the LLM. */
	brief: string;
	/** Hand-written tracks: few-shot examples for the LLM and the offline fallback pool. */
	seeds: { title: string; layers: Layers }[];
}

export const GENRES: Genre[] = [
	{
		id: 'minimal',
		name: 'Berlin Minimal',
		bpm: 128,
		brief:
			'Stripped-back, groovy, lots of space. Dry TR-909 drums, clicky rims, a short rubbery sawtooth bass with a low filter, sparse filtered blips. Small changes, long repetition.',
		seeds: [
			{
				title: 'Spree Loop',
				layers: {
					kick: "s('bd*4').bank('RolandTR909')",
					hats: "s('[~ hh]*4').bank('RolandTR909').gain(.55)",
					perc: "s('~ rim ~ [rim ~ ~ rim]').bank('RolandTR909').gain(.45).room(.2)",
					bass: "note('<[c2 ~ c2 ~ ~ c2 ~ c3] [c2 ~ c2 ~ ~ eb2 ~ c2]>').s('sawtooth').lpf(450).decay(.12).sustain(0).gain(.7)",
					synth:
						"note('<[~ c4] [~ eb4] [~ g4] [~ bb3]>*2').s('square').lpf(1600).decay(.08).sustain(0).delay(.4).gain(.22)"
				}
			},
			{
				title: 'Panorama Bar Tool',
				layers: {
					kick: "s('bd*4').bank('RolandTR909').gain(.95)",
					hats: "s('hh*8').bank('RolandTR909').gain('[.25 .5]*4').pan(sine.slow(4))",
					perc: "s('~ cp ~ ~, rim(3,8)').bank('RolandTR909').gain(.4)",
					bass: "note('[~ g1 ~ g1] [~ g1 bb1 ~]').s('sawtooth').lpf(sine.range(250,600).slow(16)).decay(.1).sustain(0).gain(.75)",
					synth:
						"note('<g4 ~ f4 ~>').s('triangle').decay(.3).sustain(0).delay(.5).room(.4).gain(.2)"
				}
			}
		]
	},
	{
		id: 'acid',
		name: 'Acid',
		bpm: 134,
		brief:
			'Squelchy TB-303 style sawtooth bassline with high resonance (lpq 12-20) and a slowly sweeping low-pass filter, 16th-note patterns with octave jumps, punchy 909 drums, open hats on the off-beat.',
		seeds: [
			{
				title: 'Squelch Protocol',
				layers: {
					kick: "s('bd*4').bank('RolandTR909')",
					hats: "s('[~ oh]*4, hh*16').bank('RolandTR909').gain('.5 .3')",
					perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.25)",
					bass: "note('c2 c2 c3 c2 eb2 c2 g2 c3 c2 c2 bb2 c2 f2 c3 c2 g1').s('sawtooth').lpf(sine.range(300,2600).slow(8)).lpq(16).decay(.14).sustain(0).shape(.3).gain(.6)",
					synth: 'silence'
				}
			},
			{
				title: 'Lysergic Lunchbreak',
				layers: {
					kick: "s('bd*4').bank('RolandTR909').shape(.2)",
					hats: "s('hh*8').bank('RolandTR909').gain(.4).sometimesBy(.2, x => x.speed(1.5))",
					perc: "s('~ ~ ~ rim, ~ cp').bank('RolandTR909').gain(.45)",
					bass: "note('<[a1 a2 a1 a1 c2 a1 e2 a1] [a1 a2 g2 a1 a1 c3 a1 e2]>*2').s('sawtooth').lpf(saw.range(400,3000).slow(16)).lpq(18).decay(.12).sustain(0).gain(.55)",
					synth:
						"note('<[a4,c5,e5] ~ ~ ~>').s('sawtooth').lpf(2000).decay(.2).sustain(0).room(.5).delay(.3).gain(.18)"
				}
			}
		]
	},
	{
		id: 'hard',
		name: 'Hard Techno',
		bpm: 150,
		brief:
			'Relentless, distorted and industrial. Saturated kick (shape), rolling off-beat sub bass rumble, 16th hats, metallic claps with reverb, harsh stabs. Aggressive but locked to the grid.',
		seeds: [
			{
				title: 'Concrete Cathedral',
				layers: {
					kick: "s('bd*4').bank('RolandTR909').shape(.6).gain(.9)",
					hats: "s('hh*16').bank('RolandTR909').gain('.4 .25 .3 .25').hpf(7000)",
					perc: "s('~ cp ~ cp').bank('RolandTR909').room(.5).shape(.3).gain(.45)",
					bass: "note('[~ c1 c1 c1]*4').s('sawtooth').lpf(220).decay(.09).sustain(0).shape(.5).gain(.6)",
					synth:
						"note('<[c3,g3,c4] ~ ~ [c3,f3,c4]>').s('square').lpf(1200).decay(.15).sustain(0).room(.6).gain(.2)"
				}
			},
			{
				title: 'Rave Bunker 3AM',
				layers: {
					kick: "s('bd*4').bank('RolandTR909').shape(.7)",
					hats: "s('[~ oh]*4, hh*8').bank('RolandTR909').gain(.35)",
					perc: "s('rim(5,16), ~ cp').bank('RolandTR909').gain(.4).room(.4)",
					bass: "note('[~ f1 f1 f1]*4').s('sawtooth').lpf(sine.range(160,320).slow(8)).decay(.08).sustain(0).shape(.4).gain(.6)",
					synth: "s('white*16').hpf(saw.range(3000,9000).slow(8)).decay(.04).sustain(0).gain(.06)"
				}
			}
		]
	},
	{
		id: 'dub',
		name: 'Dub Techno',
		bpm: 122,
		brief:
			'Deep, foggy and hypnotic. Soft kick, a warm sine sub bass, the signature chord stab (minor 7th chords on sawtooth, low-pass filtered, short decay) drenched in delay and reverb. Shuffled quiet hats.',
		seeds: [
			{
				title: 'Basic Channel Surfing',
				layers: {
					kick: "s('bd*4').bank('RolandTR808').gain(.9)",
					hats: "s('[~ hh]*4').bank('RolandTR909').gain(.3)",
					perc: "s('~ rim(3,8)').bank('RolandTR808').gain(.3).room(.5)",
					bass: "note('<[~ c1]*4 [~ c1]*4 [~ bb0]*4 [~ g0]*4>').s('sine').decay(.3).sustain(0).gain(.9)",
					synth:
						"note('<[~ [c3,eb3,g3,bb3]] [~ ~ [c3,eb3,g3,bb3] ~]>').s('sawtooth').lpf(sine.range(500,1400).slow(16)).decay(.18).sustain(0).delay(.6).delayfeedback(.6).room(.7).gain(.3)"
				}
			}
		]
	},
	{
		id: 'detroit',
		name: 'Detroit',
		bpm: 126,
		brief:
			'Soulful, futuristic and melodic. Crisp 909 drums with swing, an 808 clap, a funky syncopated bass, lush minor chord pads or arpeggios (supersaw or triangle) with reverb. Hopeful, machine soul.',
		seeds: [
			{
				title: 'Belleville Sunrise',
				layers: {
					kick: "s('bd*4').bank('RolandTR909')",
					hats: "s('[~ hh]*4, hh*16').bank('RolandTR909').gain('.45 .15')",
					perc: "s('~ cp ~ cp').bank('RolandTR808').gain(.5)",
					bass: "note('<[c2 ~ ~ c2 ~ ~ eb2 ~] [ab1 ~ ~ ab1 ~ ~ bb1 ~]>').s('sawtooth').lpf(700).decay(.2).sustain(0).gain(.6)",
					synth:
						"note('<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,bb3,d4]>').s('supersaw').lpf(1800).attack(.05).release(.4).room(.6).gain(.18)"
				}
			}
		]
	},
	{
		id: 'hypnotic',
		name: 'Hypnotic',
		bpm: 130,
		brief:
			'Deep, rolling and tribal. Polyrhythmic toms and rims (euclidean rhythms), a droning low bass, swirling filtered textures that evolve slowly. Mesmerising loops that barely change.',
		seeds: [
			{
				title: 'Ritual Cycle',
				layers: {
					kick: "s('bd*4').bank('RolandTR909').gain(.9)",
					hats: "s('hh*16').bank('RolandTR909').gain(perlin.range(.15,.45))",
					perc: "s('lt(3,8), mt(5,16,2), rim(7,16)').bank('RolandTR909').gain(.35).room(.4).pan(sine.slow(3))",
					bass: "note('[~ d1]*4').s('sawtooth').lpf(sine.range(150,450).slow(32)).decay(.25).sustain(0).gain(.7)",
					synth:
						"note('d4 a4 f4 a4').fast(2).s('triangle').lpf(perlin.range(600,2400).slow(8)).decay(.1).sustain(0).delay(.5).room(.5).gain(.14)"
				}
			}
		]
	}
];

export const genreById = (id: GenreId): Genre => GENRES.find((g) => g.id === id) ?? GENRES[0];
