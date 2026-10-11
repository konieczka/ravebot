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
	},
	// Classic XS Project anthem in D harmonic minor: i-VI-VII-V donk walk under a massive supersaw
	// hook whose answer lands on Bb over the A major V (the Slavic b9).
	{
		title: 'Squatting Is Cardio',
		layers: {
			kick: "s('hardkick:5*4').decay(.19).sustain(0).shape(.15).gain(.85)",
			hats: "stack(s('[~ oh]*4').gain(.43), s('hh*16').gain('.2 .1 .14 .1').degradeBy(arc.range(.4, 0))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~').bank('RolandTR909').gain(.46).room(.25).lastOf(8, x => x.ply(4))",
			bass: `note('<[~ d2]*4 [~ bb1]*4 [~ c2]*4 [~ a1 ~ a1 ~ a1 ~ c#2]>')${DONK}.fm(3).fmdecay(.12).fmsustain(.25).decay(.3).sustain(0).shape(.3).room(.15).gain(.68).lastOf(8, x => x.add(note(12)))`,
			synth:
				"note('<[d5 ~ a4 d5 ~ f5 e5 d5] [f5 ~ d5 ~ bb4 ~ ~ ~] [c5 ~ g4 c5 ~ e5 f5 g5] [a5 ~ bb5 a5 ~ f5 e5 c#5]>').s('supersaw').unison(7).detune(.3).spread(.9).lpf(arc.range(1500, 4500)).attack(.005).decay(.18).sustain(.35).release(.1).room(.3).gain(.12)",
			vox: "s('<rus:0 ~ ~ ~ rus:8 ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.1)"
		}
	},
	// Darker gopnik-techno hybrid in C# minor: donk layered with a ladder-filtered saw top, a ride
	// and a dotted rim echo, PWM pulse stabs on a 3-in-8 euclid through a squelchy ladder.
	{
		title: 'Podyezd Darknet',
		layers: {
			kick: "s('hardkick:3*4').speed(.9).decay(.2).sustain(0).shape(.25).gain(.9)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*16').gain(perlin.range(.08, .22)), s('rd*4').gain(.12)).bank('RolandTR909').lastOf(4, x => x.speed(1.2))",
			perc: "s('~ cp ~ cp, rim(5,16,2)').bank('RolandTR909').gain(.44).room(.2).delay(arc.range(0, .25)).delaytime(.285).delayfeedback(.4)",
			bass: `stack(note('<[~ c#2]*4 [~ c#2]*4 [~ a1]*4 [~ b1 ~ b1 ~ g#1 ~ b1]>')${DONK}.fm(arc.range(2, 4)).fmdecay(.1).fmsustain(.2).decay(.28).sustain(0).shape(.35).gain(.66), note('<[~ c#2]*4 [~ c#2]*4 [~ a1]*4 [~ b1 ~ b1 ~ g#1 ~ b1]>').s('sawtooth').ftype('ladder').lpf(arc.range(400, 1400)).lpq(8).hpf(200).decay(.15).sustain(0).gain(.3)).room(.1)`,
			synth:
				"note('<[c#4,e4,g#4] [c#4,e4,g#4] [a3,c#4,e4] [b3,d#4,f#4]>').struct('x(3,8,2)').s('pulse').pw(sine.range(.15, .6).slow(16)).ftype('ladder').lpf(arc.range(600, 2400)).lpq(10).lpenv(3).lpa(.005).lpd(.15).decay(.2).sustain(0).delay(.3).delaytime(.285).delayfeedback(.5).room(.2).gain(.12)",
			vox: "s('<~ ~ ~ [rus:5 ~ rus:6 ~] ~ ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.15).delay(.15).delaytime(.285)"
		}
	},
	// Folk hardbass: Kalinka (Ivan Larionov, 1860, public domain) reinterpreted in G harmonic minor
	// on a tremolo-picked balalaika saw: the falling "ka-lin-ka" refrain, a slow held-note verse
	// quote in bars 5-6, and a donk that follows its i-iv-V-VI harmony.
	{
		title: 'Malinka Raspberry Pi',
		layers: {
			kick: "s('clubkick:2*4').shape(.4).decay(.19).sustain(0).gain(.8)",
			hats: "stack(s('[~ oh]*4').gain(.44), s('hh*8').gain(.2), s('<cr ~ ~ ~ ~ ~ ~ ~>').gain(.25)).bank('RolandTR707')",
			perc: "s('~ cp ~ cp').bank('RolandTR707').gain(.47).room(.3).lastOf(8, x => x.ply('1 2 1 8'))",
			bass: `note('<[~ g1]*4 [~ g1 ~ g1 ~ d2 ~ d2] [~ c2]*4 [~ d2 ~ d2 ~ f#1 ~ a1] [~ g1]*4 [~ c2 ~ c2 ~ d2 ~ d2] [~ eb2]*4 [~ d2 ~ d2 ~ g1 ~ g1]>')${DONK}.fm(2.5).fmdecay(.13).fmsustain(.3).decay(.3).sustain(0).shape(.3).room(.15).gain(.68)`,
			synth:
				"note('<[d5 c5 bb4 ~ c5 bb4 a4 ~] [bb4 a4 g4 ~ a4 ~ f#4 ~] [d5 d5 eb5 d5 c5 ~ bb4 c5] [d5 c5 bb4 a4 f#4 ~ d4 ~] [g4@4 d5@4] [c5@2 bb4@2 a4@4] [d5 c5 bb4 ~ eb5 d5 c5 ~] [a4 c5 bb4 a4 g4 ~ ~ ~]>').ply(2).s('sawtooth').lpf(arc.range(700, 1600)).lpenv(4).lpa(.002).lpd(.06).decay(.08).sustain(0).room(.25).gain(.186)",
			vox: "s('<rus:8 ~ ~ ~ rus:11 ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.12)"
		}
	},
	// Hoover-rave hardbass in C harmonic minor: hoover samples on the phrase, a supersaw riff that
	// scoops up into each note (negative pitch envelope), octave-flip donks and a "give it" shot.
	{
		title: 'Siberian Hoover Express',
		layers: {
			kick: "s('hardkick:4*4').decay(.17).sustain(0).gain(.8)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*16').gain('.22 .1 .16 .1').sometimesBy(arc.range(0, .2), x => x.ply(2))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~ ~ sd ~ sd').bank('RolandTR909').gain(.43).room(.3).lastOf(4, x => x.ply(2))",
			bass: `note('<[~ c2 ~ c2 ~ c2 ~ c3] [~ c2 ~ c2 ~ c2 ~ c3] [~ ab1 ~ ab1 ~ ab1 ~ ab2] [~ g1 ~ g1 ~ b1 ~ g2]>')${DONK}.fm(3).fmdecay(.11).fmsustain(.25).penv(-2).pdecay(.03).decay(.28).sustain(0).shape(.3).room(.15).gain(.66)`,
			synth:
				"stack(s('<hoover:0 ~ ~ ~ hoover:4 ~ ~ ~>').lpf(arc.range(1500, 6000)).room(.35).gain(.33), note('<[c5 ~ ~ c5 ~ eb5 ~ d5] [c5 ~ ~ g4 ~ ab4 ~ b4] [c5 ~ ~ c5 ~ eb5 ~ g5] [f5 ~ eb5 ~ d5 ~ b4 ~]>').s('supersaw').unison(6).detune(.4).spread(.7).penv(-5).pdecay(.12).lpf(arc.range(1200, 3800)).decay(.25).sustain(.3).release(.15).gain(.12))",
			vox: "s('<rus:0 ~ ~ ~ rave:4 ~ ~ [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.15)"
		}
	},
	// Hard Bass School chant track in F# harmonic minor: the crowd does the work ("vse vmeste",
	// "bochka bass", "gromche", the count), crowd claps answer, a pulse lead lands on E# over C#.
	{
		title: 'Hard Bass Homework',
		layers: {
			kick: "s('hardkick:5*4').speed(1.05).decay(.18).sustain(0).gain(.85)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain('.18 .08')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~ cp').bank('RolandTR909').gain(.48).room(.35).lastOf(8, x => x.ply(2))",
			bass: `note('<[~ f#1]*4 [~ f#1]*4 [~ d2]*4 [~ c#2 ~ c#2 ~ e#1 ~ c#2]>')${DONK}.fm(sine.range(2, 4).slow(8)).fmdecay(.12).fmsustain(.25).decay(.3).sustain(0).shape(.3).room(.15).gain(.67).lastOf(4, x => x.ply(2))`,
			synth:
				"note('<[f#5 ~ f#5 ~ c#5 ~ ~ ~] [d5 ~ c#5 ~ b4 a4 b4 ~] [f#5 ~ f#5 ~ a5 ~ ~ ~] [g#5 ~ e#5 ~ f#5 ~ ~ ~]>').s('pulse').pw(.25).lpf(arc.range(1500, 4000)).decay(.12).sustain(.4).release(.05).delay(.2).delaytime(.19).delayfeedback(.25).gain(.12)",
			vox: "s('<rus:10 ~ [rus:5 ~ rus:6 ~] ~ rus:9 ~ [rus:5 ~ rus:6 ~] [rus:2 rus:3 rus:4 ~]>').gain(.87).room(.1)"
		}
	},
	// The weird one, Bb harmonic minor: a musette accordion (pulse with near-unison FM, vowel and a
	// detuned double) over a gabba bochka that stumbles at phrase ends, a bitcrushed donk on bar 4,
	// polymeter hats, and a count that stutters every 16 bars.
	{
		title: 'Garmoshka Gabba Glitch',
		layers: {
			kick: "s('gabba:0*4').decay(.16).sustain(0).gain(.6).lastOf(8, x => x.ply('1 1 1 2'))",
			hats: "s('[~ oh]*4, {hh ~ hh hh ~}%16').bank('RolandTR808').gain(.34)",
			perc: "s('~ cp ~ cp, ~ ~ cb ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cb').bank('RolandTR808').gain(.45).room(.25).lastOf(4, x => x.ply(2))",
			bass: `note('<[~ bb1]*4 [~ gb1 ~ gb1 ~ gb1 ~ gb2] [~ ab1]*4 [~ f1 ~ f2 ~ f1 ~ a1]>')${DONK}.fm(4).fmdecay(.1).fmsustain(.2).decay(.26).sustain(0).coarse('<1 1 1 4>').shape(.3).room(.15).gain(.65)`,
			synth:
				"note('<[bb4 ~ a4 bb4 c5 ~ db5 ~] [db5 ~ c5 bb4 gb4 ~ ~ ~] [ab4 ~ c5 eb5 db5 ~ c5 bb4] [c5 ~ bb4 a4 gb4 ~ a4 ~]>').s('pulse').pw(.4).fm(1.5).fmh(1.01).vib(5.5).vibmod(.1).vowel('o').superimpose(x => x.add(note(.15))).attack(.01).decay(.2).sustain(.6).release(.08).lpf(arc.range(1400, 3500)).room(.2).gain(.11).lastOf(8, x => x.add(note(12)))",
			vox: "s('<rus:7 ~ ~ ~ ~ ~ rus:1 [rus:2 rus:3 rus:4 ~]>').gain(.85).room(.1).lastOf(16, x => x.ply(2))"
		}
	}
];
