import type { Seed } from './types';

/*
 * Discovery-era French touch: a pumping 909, swung hats, octave disco bass, a looped chord riff
 * that moves like a filtered disco sample (phaser + slow low-pass) and a vocoder hook: a low,
 * held sawtooth/supersaw melody with a vowel per syllable (.vowel()), dry and slightly driven.
 * The gain follows the vowels: 'o' and 'u' come through the formant filters quieter than 'a'.
 */
export const FRENCH: Seed[] = [
	{
		title: 'One More Byte',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*16').gain('.28 .12')).bank('RolandTR909').swingBy(1/8, 8)",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.2)",
			bass: "note('<[d2 d3]*4 [d2 d3]*4 [b1 b2]*4 [g1 g2]*4>').s('square').lpf(arc.range(500, 1400)).decay(.14).sustain(.1).gain(.45)",
			synth:
				"note('<[d4,f#4,a4,c#5] [d4,f#4,a4,c#5] [b3,d4,f#4,a4] [g3,b3,d4,f#4]>').struct('~ x ~ x ~ ~ x ~ x ~ ~ x ~ x ~ ~').s('sawtooth').lpf(sine.range(700, 3200).slow(16)).phaser(1).decay(.2).sustain(0).room(.3).gain(.16)",
			vox: "note('<[f#3 ~ a3 b3] [a3 ~ f#3 ~] ~ ~>').s('sawtooth').vowel('<[o o a e] [a a o o] o o>').gain('<[.34 .34 .3 .3] [.3 .3 .34 .34] .3 .3>').hpf(180).lpf(4500).attack(.01).decay(.1).sustain(.7).release(.08).shape(.15).vib(5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Digital Glove',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.95)",
			hats: "stack(s('hh*8').gain('.3 .18'), s('sh*16').gain(.18)).bank('RolandTR808').swingBy(1/8, 8)",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ rim ~ ~ rim ~ ~ ~ ~ ~').bank('RolandTR808').gain(.45).room(.25)",
			bass: "note('<[a1 ~ a2 a1 ~ a1 e2 ~] [f#1 ~ f#2 f#1 ~ e1 e2 g#1]>').s('square').lpf(1100).decay(.12).sustain(0).gain(.5)",
			synth:
				"note('<[a3,c#4,e4,g#4] [f#3,a3,c#4,e4] [d3,f#3,a3,c#4] [e3,g#3,b3,d4]>').struct('x ~ ~ x ~ ~ x ~').s('triangle').attack(.01).decay(.4).sustain(.3).release(.3).phaser(.5).room(.4).gain(.22)",
			vox: "note('<[c#4 ~ b3 a3] ~ [b3 ~ ~ ~] ~ [c#4 ~ e4 c#4] ~ [b3 ~ a3 ~] ~>').s('supersaw').vowel('<[i i o a] a o a [i i a i] a [o o a a] a>').gain('<[.28 .28 .34 .3] .3 .34 .3 [.28 .28 .3 .28] .3 [.34 .34 .3 .3] .3>').hpf(180).lpf(4000).attack(.01).decay(.1).sustain(.7).release(.1).shape(.1).vib(4.5).vibmod(.06).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Aerodynamic Croissant',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.15)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain(perlin.range(.12, .3))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~ ~').bank('RolandTR909').gain(.45).lastOf(8, x => x.ply(2))",
			bass: "note('<[b1 b1 b2 b1] [g1 g1 g2 g1] [d2 d2 d3 d2] [f#1 f#1 f#2 a1]>').fast(2).s('sawtooth').lpf(arc.range(400, 1200)).decay(.1).sustain(0).gain(.5)",
			synth:
				"n('<[0 2 4 6 7 6 4 2] [-2 0 2 4 5 4 2 0]>*2').scale('B3:dorian').s('sawtooth').lpf(sine.range(900, 4000).slow(8)).decay(.12).sustain(0).delay(.25).delayfeedback(.3).pan(sine.slow(4)).gain(arc.range(.1, .2))",
			vox: "note('<~ ~ ~ [b3 d4 ~ f#4] ~ ~ ~ ~>').s('sawtooth').vowel('<a a a [a e e o] a a a a>').gain('<.3 .3 .3 [.3 .3 .3 .34] .3 .3 .3 .3>').hpf(180).lpf(5000).attack(.01).decay(.1).sustain(.7).release(.08).shape(.15).vib(5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Chromed Disco Ball',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*8').gain(.25)).bank('RolandTR909').swingBy(1/8, 8)",
			perc: "s('~ cp ~ [cp cp]').bank('RolandTR909').gain(.45).room(.3)",
			bass: "note('<[g1 g2 ~ g1 ~ g2 f2 d2] [c2 c3 ~ c2 ~ c3 a2 g2] [e1 e2 ~ e1 ~ e2 d2 b1] [a1 a2 ~ a1 d2 d3 ~ d2]>').s('square').lpf(arc.range(600, 1600)).decay(.13).sustain(0).gain(.48)",
			synth:
				"note('<[g3,b3,d4,f#4] [c4,e4,g4,b4] [e3,g3,b3,d4] [a3,c4,e4,g4]>').struct('x ~ ~ ~ ~ ~ x ~ ~ ~ x ~ ~ ~ ~ ~').s('supersaw').attack(.02).decay(.5).sustain(.4).release(.4).lpf(sine.range(800, 2800).slow(16)).phaser(.25).room(.4).gain(.13)",
			vox: "note('<~ [d4 b3 ~ g3] ~ ~>').s('sawtooth').vowel('<a [e a a o] a a>').gain('<.3 [.3 .3 .3 .34] .3 .3>').hpf(180).lpf(4500).attack(.01).decay(.1).sustain(.7).release(.08).shape(.2).vib(5.5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Face to Faders',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.1)",
			hats: "stack(s('hh*16').gain('.3 .12 .2 .12'), s('[~ oh]*4').gain(.35)).bank('RolandTR909').sometimesBy(.1, x => x.speed(1.2))",
			perc: "s('~ cp ~ cp, rim(3,8,2)').bank('RolandTR909').gain(.42)",
			bass: "note('<[f1 ~ f2 ~ ab1 ~ bb1 c2] [db2 ~ db3 ~ c2 ~ bb1 ab1]>').s('sawtooth').lpf(arc.range(500, 1300)).lpq(6).decay(.14).sustain(0).gain(.5)",
			synth:
				"note('<[f3,ab3,c4,eb4] [f3,ab3,c4,eb4] [db3,f3,ab3,c4] [eb3,g3,bb3,db4]>').struct('~ x ~ x ~ x ~ x').s('sawtooth').lpf(sine.range(500, 2600).slow(32)).phaser(2).decay(.18).sustain(0).room(.35).gain(.17)",
			vox: "note('<~ ~ ~ [f3 ab3 c4 ~] ~ ~ ~ [eb4 ~ c4 ab3]>').s('sawtooth').vowel('<a a a [o a e e] a a a [a a o u]>').gain('<.3 .3 .3 [.34 .3 .3 .3] .3 .3 .3 [.3 .3 .34 .36]>').hpf(180).lpf(4000).attack(.01).decay(.1).sustain(.7).release(.08).shape(.15).vib(5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Something About Synths',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.9)",
			hats: "stack(s('sh*16').gain('.22 .1'), s('[~ oh]*4').gain(.3)).bank('RolandTR808')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cb ~').bank('RolandTR808').gain(.4).room(.3)",
			bass: "note('<[e2 ~ ~ e2 ~ ~ b1 ~] [c#2 ~ ~ c#2 ~ ~ g#1 ~] [a1 ~ ~ a1 ~ ~ e2 ~] [b1 ~ ~ b1 ~ d#2 ~ f#2]>').s('sine').decay(.3).sustain(.2).shape(.2).gain(.7)",
			synth:
				"note('<[e3,g#3,b3,d#4] [c#3,e3,g#3,b3] [a2,c#3,e3,g#3] [b2,d#3,f#3,a3]>').struct('x ~ ~ x ~ ~ x ~').s('triangle').decay(.5).sustain(.2).phaser(.5).room(.5).delay(.2).gain(.24)",
			vox: "note('<[g#3 ~ f#3 e3] ~ ~ ~ [b3 ~ g#3 ~] ~ ~ ~>').s('sawtooth').vowel('<[o o u a] a a a [e e o o] a a a>').gain('<[.34 .34 .36 .3] .3 .3 .3 [.3 .3 .34 .34] .3 .3 .3>').hpf(180).lpf(4500).attack(.01).decay(.1).sustain(.7).release(.15).shape(.1).vib(4.5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Nightvision Rollerdisco',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(arc.range(.25, .45)), s('hh*16').gain(.18)).bank('RolandTR909').swingBy(1/8, 8)",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.45).room(.2).lastOf(4, x => x.ply(2))",
			bass: "note('c2 c3 c2 c3 eb2 eb3 f2 g2').s('square').lpf(arc.range(500, 1500)).decay(.12).sustain(0).gain(.45).lastOf(4, x => x.add(note(-2)))",
			synth:
				"note('<[c4,eb4,g4,bb4] [ab3,c4,eb4,g4]>').struct('x x ~ x ~ x x ~ x ~ x ~ x x ~ x').s('supersaw').lpf(sine.range(400, 3000).slow(16)).lpq(4).phaser(4).decay(.1).sustain(0).gain(.13)",
			vox: "note('<~ ~ [g3 bb3 c4 ~] ~ ~ ~ [c4 ~ bb3 g3] ~>').s('sawtooth').vowel('<a a [a i a a] a a a [o o a i] a>').gain('<.3 .3 [.3 .28 .3 .3] .3 .3 .3 [.34 .34 .3 .28] .3>').hpf(180).lpf(5000).attack(.01).decay(.1).sustain(.7).release(.08).shape(.2).vib(5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Helmet Hair Day',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.2).gain(.92)",
			hats: "stack(s('hh*8').gain(.3), s('oh(3,8,2)').gain(.3)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ rim ~ ~ ~ ~ rim').bank('RolandTR909').gain(.42).room(.25)",
			bass: "note('<[d2 ~ d2 f2 ~ d2 a1 c2] [d2 ~ d2 f2 g2 ~ a2 c3]>').s('sawtooth').lpf(arc.range(400, 1200)).lpenv(2).lpd(.15).decay(.15).sustain(0).gain(.5)",
			synth:
				"note('<[d4,f4,a4,c5] [g3,b3,d4,f4]>').struct('~ x ~ ~ x ~ x ~').s('square').lpf(sine.range(900, 2500).slow(8)).phaser(1).decay(.15).sustain(0).delay(.25).room(.3).gain(.15)",
			vox: "note('<[a3 a3 ~ c4] [d4 ~ c4 a3] ~ ~>').s('sawtooth').vowel('<[a o o i] [o o i a] a a>').gain('<[.3 .34 .34 .28] [.34 .34 .28 .3] .3 .3>').hpf(180).lpf(4500).attack(.01).decay(.1).sustain(.7).release(.08).shape(.15).vib(5).vibmod(.08).delay(.125).delayfeedback(.2).room(.15)"
		}
	},
	{
		title: 'Short Circuit Romance',
		layers: {
			kick: "s('bd*4').bank('RolandTR909')",
			hats: "stack(s('[~ oh]*4').gain(.42), s('hh*16').gain('.25 .1')).bank('RolandTR909').swingBy(1/8, 8)",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp').bank('RolandTR909').gain(.45).room(.3)",
			bass: "note('<[bb1 bb2]*4 [g1 g2]*4 [eb2 eb3]*4 [f1 f2]*4>').s('sawtooth').lpf(arc.range(500, 1400)).decay(.12).sustain(.1).gain(.45)",
			synth:
				"note('<[bb3,d4,f4,a4] [g3,bb3,d4,f4] [eb3,g3,bb3,d4] [f3,a3,c4,eb4]>').struct('x ~ x ~ ~ x ~ x').s('supersaw').lpf(arc.range(700, 3500)).phaser(.5).decay(.25).sustain(.1).room(.4).gain(.14)",
			vox: "note('<~ ~ ~ [f3 bb3 ~ d4] ~ ~ ~ [c4 ~ bb3 a3]>').s('supersaw').vowel('<a a a [o a a e] a a a [e e o u]>').gain('<.3 .3 .3 [.34 .3 .3 .3] .3 .3 .3 [.3 .3 .34 .36]>').hpf(180).lpf(4000).attack(.01).decay(.1).sustain(.7).release(.1).shape(.1).vib(5).vibmod(.06).delay(.125).delayfeedback(.2).room(.15)"
		}
	}
];
