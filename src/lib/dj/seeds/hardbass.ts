import type { Seed } from './types';

/*
 * St Petersburg hardbass: a hard, clipped kick on the beat and a metallic "donk" on every
 * off-beat between kicks (FM + a fast pitch drop + a short decay), off-beat open hats,
 * cheesy rave leads, whistles and shouted vocals.
 */
export const HARDBASS: Seed[] = [
	{
		title: 'Bochka Overflow',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.55).gain(.9)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain('.22 .1')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.25).lastOf(8, x => x.ply(4))",
			bass: "note('[~ a2]*4').s('sine').fm(3).fmh(1.41).penv(12).pdecay(.04).decay(.12).sustain(0).shape(.3).gain(.7)",
			synth:
				"note('<[a4 ~ a4 c5 ~ a4 e5 ~] [d5 ~ c5 ~ b4 ~ g4 ~]>').s('supersaw').lpf(arc.range(1500, 4000)).decay(.15).sustain(.2).room(.3).gain(.13)",
			vox: "s('<rave:0 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.3)"
		}
	},
	{
		title: 'Tracksuit Protocol',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).distort(.2).gain(.85)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*8').gain(.25)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd').bank('RolandTR909').gain(.45).room(.25)",
			bass: "note('<[~ d2]*4 [~ d2]*4 [~ f2]*4 [~ c2 ~ c2 ~ c2 ~ e2]>').s('square').lpf(1800).fm(2).fmh(1.5).penv(12).pdecay(.035).decay(.11).sustain(0).gain(.5)",
			// Whistle
			synth:
				"note('<[d6 ~ ~ ~] ~ [a5 ~ d6 ~] ~>').s('sine').vib(7).vibmod(.4).attack(.02).decay(.3).sustain(.3).gain(.12)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ rave:4 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.3).delay(.2)"
		}
	},
	{
		title: 'Squat Mode Enabled',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).gain(.9)",
			hats: "s('[~ oh]*4, hh*16').bank('RolandTR909').gain(.35)",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.3)",
			bass: "note('[~ e2]*4').s('sine').fm(5).fmh(1.73).penv(14).pdecay(.03).decay(.13).sustain(0).shape(.35).gain(.65).lastOf(4, x => x.add(note(3)))",
			synth:
				"s('<hoover:2 ~ ~ ~ hoover:2 ~ hoover:3 ~>').lpf(arc.range(1500, 5000)).room(.3).gain(.35)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ rave:5>').gain(.6).room(.3)"
		}
	},
	{
		title: 'Sunflower Seed Rush',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').shape(.6).gain(.9)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain(perlin.range(.1, .25))).bank('RolandTR707')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp').bank('RolandTR707').gain(.45).room(.25)",
			bass: "note('<[~ g2]*4 [~ g2]*4 [~ eb2]*4 [~ f2]*4>').s('sine').fm(4).fmh(1.41).penv(10).pdecay(.04).decay(.12).sustain(0).shape(.3).gain(.68)",
			synth:
				"n('<[0 2 4 7]*4 [0 2 4 7]*4 [-2 0 2 5]*4 [-1 1 3 5]*4>').scale('G4:minor').s('square').lpf(arc.range(1200, 3500)).decay(.08).sustain(0).delay(.19).gain(.12)",
			vox: "s('<~ ~ ~ ~ rave:1 ~ ~ ~>').gain(.55).room(.3)"
		}
	},
	{
		title: 'Kolbasa Kernel Panic',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.65).gain(.88)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*16').gain('.2 .1 .15 .1')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.3).lastOf(4, x => x.ply(2))",
			bass: "note('[~ c2 ~ c2 ~ c2 ~ [c2 c3]]').s('square').lpf(1600).fm(3).fmh(2.5).penv(12).pdecay(.04).decay(.1).sustain(0).gain(.5)",
			// Pumping-house off-beat stab, doubling the donk.
			synth:
				"note('<[c4,eb4,g4] [c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4]>').struct('~ x ~ x ~ x ~ x').s('supersaw').lpf(arc.range(1200, 3500)).decay(.1).sustain(0).gain(.12)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rave:2>').gain(.55).room(.3)"
		}
	},
	{
		title: 'Three Stripes Turbo',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.55).distort(.15).gain(.88)",
			hats: "s('[~ oh]*4, hh(7,16)').bank('RolandTR909').gain(.33)",
			perc: "s('~ cp ~ cp, ~ ~ ~ rim ~ ~ ~ ~').bank('RolandTR909').gain(.45).room(.25)",
			bass: "note('<[~ f2]*4 [~ f2]*4 [~ f2]*4 [~ ab2 ~ g2 ~ f2 ~ c2]>').s('sine').fm(4).fmh(1.73).penv(12).pdecay(.035).decay(.12).sustain(0).shape(.3).gain(.68)",
			synth:
				"note('<[f5 ~ f5 ab5 ~ f5 c6 ~] [bb5 ~ ab5 ~ g5 ~ eb5 ~]>').s('sawtooth').lpf(arc.range(1500, 4500)).decay(.12).sustain(.15).delay(.19).delayfeedback(.3).gain(.12)",
			vox: "s('<rave:3 ~ ~ ~ ~ ~ ~ ~>').gain(.55).room(.3)"
		}
	},
	{
		title: 'Courtyard Cosmonaut',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).gain(.9)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain('.2 .1')).bank('RolandTR909').lastOf(8, x => x.speed(1.3))",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.48).room(.35).delay(.15)",
			bass: "note('[~ b1]*4').s('sine').fm(6).fmh(1.41).penv(16).pdecay(.03).decay(.14).sustain(0).shape(.4).gain(.7)",
			synth:
				"note('<[b4,d5,f#5] ~ [a4,c#5,e5] ~ [g4,b4,d5] ~ [f#4,a#4,c#5] ~>').s('supersaw').attack(.01).decay(.4).sustain(.3).release(.3).lpf(arc.range(1200, 3500)).room(.4).gain(.12)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:6 ~ ~ ~>').room(.5).delay(.3).gain(.45)"
		}
	},
	{
		title: 'Lada Bass Cannon',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.7).gain(.85)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*8').gain(.22)).bank('RolandTR909').sometimesBy(.1, x => x.speed(1.4))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd').bank('RolandTR909').gain(.42).room(.2).lastOf(4, x => x.ply(2))",
			bass: "note('<[~ a1]*4 [~ a1]*4 [~ c2]*4 [~ g1 ~ g1 ~ e1 ~ g1]>').s('square').lpf(1400).fm(2).fmh(2).penv(12).pdecay(.04).decay(.12).sustain(0).distort(.3).gain(.4)",
			synth:
				"note('<[e5 ~ e5 ~ d5 ~ c5 ~] [e5 ~ e5 ~ g5 ~ a5 ~]>').s('square').lpf(arc.range(1200, 3500)).vib(5).vibmod(.15).decay(.15).sustain(.2).delay(.19).gain(.11)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ rave:0 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.3).delay(.2)"
		}
	},
	{
		title: 'Davai Daemon',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').shape(.65).gain(.9)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*16').gain('.2 .1')).bank('RolandTR707')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cb').bank('RolandTR707').gain(.45).room(.25)",
			bass: "note('[~ e2]*4').s('square').lpf(2000).fm(3).fmh(1.41).penv(12).pdecay(.04).decay(.1).sustain(0).gain(.48).sometimesBy(.15, x => x.add(note(12)))",
			// Whistle
			synth:
				"note('<[e6 ~ ~ ~ b5 ~ ~ ~] [e6 ~ g6 ~ e6 ~ ~ ~]>').s('sine').vib(8).vibmod(.5).attack(.02).decay(.25).sustain(.3).release(.1).gain(.13)",
			vox: "s('<rave:4 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.3)"
		}
	}
];
