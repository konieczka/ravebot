import type { Seed } from './types';

/*
 * St Petersburg hardbass. The bochka: a long, distorted kick sample cut so it ends right where
 * the off-beat starts (8th note = 0.19 s at 158 BPM). The donk: a hollow FM bass on every
 * off-beat, a sine with a triangle modulator at 2:1 whose brightness decays (fmdecay), as on the
 * Yamaha FM synths it came from. Slavic melodies in harmonic minor, balalaika-style tremolo
 * picking (.ply(4)), hoovers and whistles, and Russian shouts (rus:N, see voices.ts). Vox plays
 * through the build-up here, so a count on bar 8 of a phrase leads into the drop.
 */
const DONK = ".s('sine').fmh(2).fmwave('triangle')";

export const HARDBASS: Seed[] = [
	{
		title: 'Bochka Overflow',
		layers: {
			kick: "s('hardkick:4*4').decay(.18).sustain(0).gain(.75)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain('.22 .1')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.25).lastOf(8, x => x.ply(4))",
			bass: `note('<[~ a1]*4 [~ a1]*4 [~ f1]*4 [~ e1 ~ e1 ~ e1 ~ g#1]>')${DONK}.fm(3).fmdecay(.12).fmsustain(.25).decay(.3).sustain(0).shape(.3).room(.15).gain(.7)`,
			synth:
				"note('<[a4 ~ c5 e5 ~ d5 c5 b4] [c5 ~ b4 a4 ~ g#4 ~ e4]>').s('supersaw').lpf(arc.range(1500, 4000)).decay(.15).sustain(.2).room(.3).gain(.13)",
			vox: "s('<rus:0 ~ ~ ~ ~ ~ ~ ~>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Tracksuit Protocol',
		layers: {
			kick: "s('hardkick:5*4').decay(.2).sustain(0).gain(.85)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*8').gain(.25)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd').bank('RolandTR909').gain(.45).room(.25)",
			bass: `note('<[~ d2]*4 [~ d2]*4 [~ bb1]*4 [~ a1 ~ a1 ~ a1 ~ c#2]>')${DONK}.fm(3.5).fmdecay(.1).fmsustain(.2).decay(.28).sustain(0).shape(.35).room(.15).gain(.65)`,
			// Whistle
			synth:
				"note('<[d6 ~ ~ ~] ~ [a5 ~ c#6 ~ d6 ~ ~ ~] ~>').s('sine').vib(7).vibmod(.4).attack(.02).decay(.3).sustain(.3).gain(.12)",
			vox: "s('<rus:0 ~ ~ ~ ~ ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Squat Mode Enabled',
		layers: {
			kick: "s('gabba:0*4').decay(.2).sustain(0).gain(.6)",
			hats: "s('[~ oh]*4, hh*16').bank('RolandTR909').gain(.35)",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.3)",
			bass: `note('[~ e2]*4')${DONK}.fm(4).fmdecay(.1).fmsustain(.3).penv(3).pdecay(.02).decay(.3).sustain(0).shape(.3).room(.15).gain(.65).lastOf(4, x => x.add(note(3)))`,
			synth:
				"s('<hoover:2 ~ ~ ~ hoover:2 ~ hoover:3 ~>').lpf(arc.range(1500, 5000)).room(.3).gain(.35)",
			vox: "s('<rus:8 ~ ~ ~ rus:1 ~ ~ [rus:1 ~ rus:1 ~]>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Sunflower Seed Rush',
		layers: {
			kick: "s('clubkick:2*4').speed(1.1).shape(.45).decay(.18).sustain(0).gain(.8)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain(perlin.range(.1, .25))).bank('RolandTR707')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp').bank('RolandTR707').gain(.45).room(.25)",
			bass: `note('<[~ g1]*4 [~ g1]*4 [~ eb2]*4 [~ d2]*4>')${DONK}.fm(3).fmdecay(.12).fmsustain(.25).decay(.3).sustain(0).shape(.3).room(.15).gain(.68)`,
			// Balalaika: tremolo-picked 16ths
			synth:
				"note('<[g4 bb4 d5 bb4] [g4 bb4 d5 g5] [eb5 d5 c5 bb4] [a4 f#4 a4 d5]>').ply(4).s('triangle').decay(.06).sustain(0).lpf(arc.range(2000, 5000)).gain(.14)",
			vox: "s('<rus:7 ~ ~ ~ ~ ~ rus:9 ~>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Kolbasa Kernel Panic',
		layers: {
			kick: "s('hardkick:3*4').decay(.17).sustain(0).shape(.2).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*16').gain('.2 .1 .15 .1')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.3).lastOf(4, x => x.ply(2))",
			bass: `note('[~ c2 ~ c2 ~ c2 ~ [c2 c3]]')${DONK}.fm(3).fmdecay(.1).fmsustain(.25).decay(.25).sustain(0).shape(.35).room(.15).gain(.65)`,
			// Pumping-house off-beat stab; the harmonic-minor V chord (B natural) at the end.
			synth:
				"note('<[c4,eb4,g4] [c4,eb4,g4] [ab3,c4,eb4] [g3,b3,d4]>').struct('~ x ~ x ~ x ~ x').s('supersaw').lpf(arc.range(1200, 3500)).decay(.1).sustain(0).gain(.12)",
			vox: "s('<rus:5 ~ rus:6 ~ ~ ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Three Stripes Turbo',
		layers: {
			kick: "s('clubkick:2*4').shape(.4).decay(.2).sustain(0).gain(.8)",
			hats: "s('[~ oh]*4, hh(7,16)').bank('RolandTR909').gain(.33)",
			perc: "s('~ cp ~ cp, ~ ~ ~ rim ~ ~ ~ ~').bank('RolandTR909').gain(.45).room(.25)",
			bass: `note('<[~ f1]*4 [~ f1]*4 [~ f1]*4 [~ ab1 ~ g1 ~ f1 ~ c2]>')${DONK}.fm(3).fmdecay(.12).fmsustain(.25).decay(.3).sustain(0).shape(.3).room(.15).gain(.7)`,
			synth:
				"note('<[f5 ~ f5 ab5 ~ f5 c6 ~] [db6 ~ c6 ~ bb5 ~ e5 ~]>').s('sawtooth').lpf(arc.range(1500, 4500)).decay(.12).sustain(.15).delay(.19).delayfeedback(.3).gain(.12)",
			vox: "s('<rus:10 ~ ~ ~ ~ ~ ~ ~ rus:0 ~ ~ ~ ~ ~ ~ [rus:0 ~ rus:0 ~]>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Courtyard Cosmonaut',
		layers: {
			kick: "s('hardkick:4*4').speed(1.12).decay(.18).sustain(0).gain(.75)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain('.2 .1')).bank('RolandTR909').lastOf(8, x => x.speed(1.3))",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.48).room(.35).delay(.15)",
			bass: `note('[~ b1]*4')${DONK}.fm(3.5).fmdecay(.14).fmsustain(.2).decay(.32).sustain(0).shape(.4).room(.2).gain(.7)`,
			synth:
				"note('<[b4,d5,f#5] ~ [a4,c#5,e5] ~ [g4,b4,d5] ~ [f#4,a#4,c#5] ~>').s('supersaw').attack(.01).decay(.4).sustain(.3).release(.3).lpf(arc.range(1200, 3500)).room(.4).gain(.12)",
			vox: "s('<rus:11 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:6 ~ ~ ~>').gain(.85).room(.1)"
		}
	},
	{
		title: 'Korobeiniki Overclock',
		layers: {
			kick: "s('hardkick:5*4').decay(.18).sustain(0).shape(.2).gain(.82)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*8').gain(.22)).bank('RolandTR909').sometimesBy(.1, x => x.speed(1.4))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~ sd sd').bank('RolandTR909').gain(.42).room(.2).lastOf(4, x => x.ply(2))",
			bass: `note('<[~ a1]*4 [~ a1]*4 [~ c2]*4 [~ g#1 ~ g#1 ~ e1 ~ g#1]>')${DONK}.fm(2.5).fmdecay(.1).fmsustain(.3).decay(.28).sustain(0).shape(.3).room(.15).gain(.7)`,
			// Korobeiniki (Russian folk song, 1861): the A section on a vibrato square lead.
			synth:
				"note('<[e5 ~ b4 c5 d5 ~ c5 b4] [a4 ~ a4 c5 e5 ~ d5 c5] [b4 ~ ~ c5 d5 ~ e5 ~] [c5 ~ a4 ~ a4 ~ ~ ~]>').s('square').lpf(arc.range(1200, 3500)).vib(5).vibmod(.15).decay(.15).sustain(.3).delay(.19).gain(.11)",
			vox: "s('<rus:9 ~ ~ ~ ~ ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.9).room(.1)"
		}
	},
	{
		title: 'Davai Daemon',
		layers: {
			kick: "s('hardkick:3*4').speed(.95).shape(.2).decay(.2).sustain(0).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*16').gain('.2 .1')).bank('RolandTR707')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cb').bank('RolandTR707').gain(.45).room(.25)",
			bass: `note('[~ e2]*4')${DONK}.fm(2.5).fmdecay(.12).fmsustain(.25).decay(.25).sustain(0).shape(.3).room(.15).gain(.65).sometimesBy(.15, x => x.add(note(12)))`,
			// Whistle, with the harmonic-minor D#
			synth:
				"note('<[e6 ~ ~ ~ b5 ~ ~ ~] [e6 ~ d#6 ~ b5 ~ ~ ~]>').s('sine').vib(8).vibmod(.5).attack(.02).decay(.25).sustain(.3).release(.1).gain(.13)",
			vox: "s('<rus:0 ~ rus:0 ~ ~ ~ ~ [rus:0 rus:0 rus:0 ~]>').gain(.85).room(.1)"
		}
	}
];
