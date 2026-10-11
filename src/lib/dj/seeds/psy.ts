import type { Seed } from './types';

/*
 * Full-on psytrance: a short, tight kick on every beat and a rolling bass filling the three 16ths
 * after it ('[~ e2 e2 e2]*4'), with notes shorter than a 16th so kick and bass never overlap.
 * Acid lines, FM zaps, gated synths and sci-fi speech on top.
 */
export const PSY: Seed[] = [
	{
		title: 'Third Eye Firmware',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.16).sustain(0)",
			hats: "stack(s('hh*16').gain('.3 .14 .22 .14'), s('[~ oh]*4').gain(.32)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.32).room(.4).lastOf(8, x => x.ply(4))",
			bass: "note('[~ e2 e2 e2]*4').s('sawtooth').lpf(arc.range(300, 700)).decay(.07).sustain(0).gain(.55)",
			synth:
				"note('e3 e4 g3 e3 b3 e3 d4 e3').fast(2).s('sawtooth').lpf(sine.range(400, 3200).slow(8)).lpq(14).decay(.08).sustain(0).delay(.375).delayfeedback(.4).pan(sine.fast(2)).gain(arc.range(.08, .16))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speech:3>').room(.6).delay(.375).delayfeedback(.5).gain(.55)"
		}
	},
	{
		title: 'Mushroom Cloud Computing',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.15).sustain(0).shape(.15)",
			hats: "stack(s('hh*16').gain(perlin.range(.12, .32)), s('[~ oh]*4').gain(.3)).bank('RolandTR909')",
			perc: "s('~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd ~ ~ [sd sd]').bank('RolandTR909').gain(.3).room(.3)",
			bass: "note('[~ f2 f2 f2]*4').s('sawtooth').lpf(arc.range(320, 750)).decay(.065).sustain(0).gain(.55).lastOf(4, x => x.add(note(3)))",
			synth:
				"note('<f4 ab4 c5 eb5>*8').s('sine').fm(arc.range(2, 8)).fmh(1.5).penv(-12).pdecay(.06).decay(.09).sustain(0).delay(.25).delayfeedback(.5).pan(rand).gain(.14)",
			vox: "s('<~ ~ ~ space:4 ~ ~ ~ ~>').speed(.8).room(.7).delay(.5).delayfeedback(.6).gain(.45)"
		}
	},
	{
		title: 'Goa Away',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').decay(.15).sustain(0).gain(.95)",
			hats: "stack(s('hh*16').gain('.28 .12'), s('[~ oh]*4').gain(.3)).bank('RolandTR707')",
			perc: "s('~ cp ~ cp, rim(5,16,1)').bank('RolandTR707').gain(.3).room(.35)",
			bass: "note('[~ g2 g2 g2]*4').s('sawtooth').lpf(arc.range(300, 700)).lpq(4).decay(.07).sustain(0).gain(.55).lastOf(8, x => x.add(note(-2)))",
			synth:
				"note('<[g3,bb3,d4] [eb3,g3,bb3] [c3,eb3,g3] [d3,f#3,a3]>').struct('x x ~ x x ~ x ~ x x ~ x x ~ x ~').s('supersaw').lpf(arc.range(600, 2600)).decay(.07).sustain(0).pan(sine.slow(2)).gain(.12)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ speakspell:5>').room(.6).delay(.375).delayfeedback(.55).gain(.5)"
		}
	},
	{
		title: 'Fractal Hangover',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.17).sustain(0)",
			hats: "stack(s('hh*12').gain('.25 .12 .18'), s('[~ oh]*4').gain(.3)).bank('RolandTR909')",
			perc: "s('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp, ~ cp ~ ~').bank('RolandTR909').gain(.3).room(.4)",
			// Triplet roll: kick, bass, bass on each beat.
			bass: "note('[~ e2 e2]*4').s('sawtooth').lpf(arc.range(300, 650)).decay(.09).sustain(0).gain(.55)",
			synth:
				"n('<[0 2 4 6 7 6 4 2] [0 1 4 5 7 5 4 1]>*2').scale('E3:phrygian').s('square').lpf(sine.range(600, 3000).slow(16)).lpq(8).decay(.07).sustain(0).delay(.333).delayfeedback(.45).pan(sine.fast(3)).gain(arc.range(.08, .15))",
			vox: "s('<~ ~ ~ ~ numbers:3 ~ ~ ~>').speed(.85).room(.6).delay(.333).delayfeedback(.5).gain(.5)"
		}
	},
	{
		title: 'Wormhole Dial-Up',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.15).sustain(0).gain(.95)",
			hats: "stack(s('hh*16').gain('.3 .14 .24 .14'), s('oh(3,8,2)').gain(.28)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.3).room(.4).delay(.25)",
			bass: "note('[~ f#2 f#2 f#2]*4').s('sawtooth').lpf(arc.range(320, 700)).gain('[0 .6 .45 .5]*4').decay(.07).sustain(0)",
			synth:
				"note('f#5 c#6 a5 f#6').fast(4).s('sine').fm(4).fmh(3).penv(24).pdecay(.03).decay(.05).sustain(0).degradeBy(arc.range(.7, .2)).delay(.375).delayfeedback(.55).pan(rand).gain(.1)",
			vox: "s('<~ ~ ~ ~ ~ ~ space:9 ~>').room(.7).delay(.5).delayfeedback(.6).gain(.45)"
		}
	},
	{
		title: 'Alien Abduction Protocol',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.15).sustain(0).shape(.2)",
			hats: "stack(s('hh*16').gain(perlin.range(.15, .35)), s('[~ oh]*4').gain(.3)).bank('RolandTR909').sometimesBy(.1, x => x.speed(1.5))",
			perc: "s('~ ~ cp ~ ~ ~ cp ~, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim rim').bank('RolandTR909').gain(.3).room(.4)",
			bass: "note('[~ e2 e3 e2]*4').s('sawtooth').lpf(arc.range(300, 750)).decay(.07).sustain(0).gain(.5)",
			synth:
				"note('e3 e4 e3 g3 e3 bb3 e3 e4').fast(2).s('sawtooth').lpf(250).lpenv(arc.range(3, 7)).lpa(.005).lpd(.1).lpq(18).decay(.09).sustain(0).delay(.25).delayfeedback(.4).gain(.13)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ speech:5 ~ ~ ~>').speed(.7).room(.7).delay(.375).delayfeedback(.55).gain(.55)"
		}
	},
	{
		title: 'Dawn Patrol Dimension',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').decay(.16).sustain(0)",
			hats: "stack(s('hh*16').gain('.26 .12'), s('[~ oh]*4').gain(.32)).bank('RolandTR707').lastOf(8, x => x.speed(1.3))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cb').bank('RolandTR707').gain(.3).room(.35)",
			bass: "note('<[~ d2 d2 d2]*4 [~ d2 d2 d2]*4 [~ bb1 bb1 bb1]*4 [~ c2 c2 c2]*4>').s('sawtooth').lpf(arc.range(300, 700)).decay(.07).sustain(0).gain(.55)",
			synth:
				"note('<[d5 ~ f5 ~ a5 ~ g5 f5] [e5 ~ d5 ~ c5 ~ d5 ~]>').s('supersaw').lpf(arc.range(1200, 4000)).decay(.15).sustain(.1).delay(.375).delayfeedback(.45).room(.4).gain(.11)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:2>').room(.7).delay(.5).delayfeedback(.6).gain(.45)"
		}
	},
	{
		title: 'Kaleidoscope Kernel',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.14).sustain(0).gain(.95)",
			hats: "stack(s('hh*16').gain('.3 .15 .25 .15'), s('[~ oh]*4').gain(.3)).bank('RolandTR909').degradeBy(arc.range(.3, 0))",
			perc: "s('~ ~ ~ ~ cp ~ ~ ~, mt(3,16,4)').bank('RolandTR909').gain(.3).room(.4)",
			bass: "note('<[~ f2 f2 f2]*4 [~ f2 f2 f2]*4 [~ f2 f2 f2]*4 [[~ f2 f2 f2]!3 [~ ab2 ab2 ab2]]>').s('sawtooth').lpf(sine.range(300, 650).slow(16)).decay(.07).sustain(0).gain(.55)",
			synth:
				"n('0 2 4 7 4 2 7 9').fast(2).scale('F4:minor').s('triangle').jux(rev).decay(.08).sustain(0).delay(.25).delayfeedback(.5).gain(arc.range(.12, .22))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speakspell:9>').room(.6).delay(.375).delayfeedback(.5).gain(.5)"
		}
	},
	{
		title: 'Chai Shop Singularity',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.16).sustain(0)",
			hats: "stack(s('hh*16').gain('.24 .12 .2 .12'), s('[~ oh]*4').gain(.3)).bank('RolandTR909')",
			perc: "s('lt(3,8), ~ ~ ht ~ ~ ~ ht ~').bank('RolandTR909').gain(.28).room(.3)",
			bass: "note('[~ e2 e2 f2]*4').s('sawtooth').lpf(arc.range(300, 650)).decay(.07).sustain(0).gain(.55)",
			synth:
				"note('<[e4 f4 g#4 a4 g#4 f4 e4 ~] [b4 c5 b4 a4 g#4 a4 f4 e4]>').s('square').vib(5).vibmod(.2).lpf(2500).decay(.12).sustain(.2).delay(.375).delayfeedback(.4).gain(.12)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ mouth:4 ~ ~ ~ ~>').room(.5).delay(.375).delayfeedback(.5).gain(.5)"
		}
	}
];
