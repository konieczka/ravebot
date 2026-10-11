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
	},
	{
		// Full-on (Astrix / Vini Vici): euphoric harmonic-minor supersaw lead over a ladder "knock" bass.
		title: 'Hands Up Hyperspace',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.15).sustain(0).shape(.18)",
			hats: "stack(s('hh*16').gain('.3 .13 .22 .13'), s('[~ oh]*4').gain(.3), s('<cr ~ ~ ~ ~ ~ ~ ~>').gain(.22)).bank('RolandTR909')",
			perc: "stack(s('~ cp ~ cp'), s('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd sd sd').mask('<0 0 0 1 0 0 0 1>')).bank('RolandTR909').gain(.3).room(.35)",
			bass: "note('<[~ a1 a1 a1]*4 [~ a1 a1 a1]*4 [~ a1 a1 a1]*4 [[~ a1 a1 a1]!3 [~ c2 b1 g#1]]>').s('sawtooth').ftype('ladder').lpf(arc.range(200, 450)).lpenv(arc.range(2.5, 4.5)).lpa(.002).lpd(.06).lpq(5).drive(.5).decay(.07).sustain(0).gain(.55)",
			synth:
				"stack(note('<[a4 ~ c5 e5 g#5 ~ e5 c5] [b4 ~ d5 f5 e5 ~ c5 b4] [a4 ~ c5 e5 a5 ~ g#5 e5] [f5 e5 d5 c5 b4 ~ g#4 ~]>').s('supersaw').unison(5).detune(.22).spread(.8).lpf(arc.range(1400, 5000)).decay(.14).sustain(.15).delay(.35).delaytime(.315).delayfeedback(.45).room(.3).gain(arc.range(.09, .14)), note('a5(3,8,2)').s('sine').fm(5).fmh(1.5).penv(24).pdecay(.04).decay(.06).sustain(0).pan(rand).degradeBy(arc.range(.8, .3)).gain(.08))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ space:6 ~ ~ ~ ~ ~ ~ ~ speech:1>').room(.6).delay(.45).delaytime(.315).delayfeedback(.6).gain(.5)"
		}
	},
	{
		// Goa (Hallucinogen / Astral Projection): phrygian-dominant 303 squelch and an FM sitar answering every 4 bars.
		title: 'Sitar Hero',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').decay(.15).sustain(0).gain(.97)",
			hats: "stack(s('hh*16').gain('.28 .12 .2 .12'), s('[~ oh]*4').gain(.3)).bank('RolandTR707').lastOf(8, x => x.ply(2))",
			perc: "s('~ ~ ~ ~ cp ~ ~ ~, {lt ~ mt ~ ~ ht}%16').bank('RolandTR707').gain(.28).room(.35).pan(sine.slow(4))",
			bass: "note('<[~ d2 d2 d2]*4 [~ d2 d2 d2]*4 [~ d2 d2 d2]*4 [[~ d2 d2 d2]!2 [~ eb2 eb2 eb2]!2]>').s('pulse').pw(.3).lpf(arc.range(320, 720)).lpenv(2).lpd(.05).decay(.065).sustain(0).gain(.52)",
			synth:
				"note('d3 d4 eb3 d3 f#3 d3 a3 g3 d3 c4 d3 bb3 a3 d3 f#3 eb3').s('sawtooth').ftype('ladder').lpf(sine.range(280, 1300).slow(16)).lpq(arc.range(8, 16)).lpenv(3).lpa(.005).lpd(.09).drive(.7).decay(.1).sustain(0).gain(arc.range(.1, .15)).off(3/16, x => x.add(note(12)).gain(.07)).lastOf(8, x => x.iter(4)).delay(.3).delaytime(.315).delayfeedback(.45).pan(sine.fast(2))",
			vox: "note('<~ ~ ~ [d5 eb5 f#5 ~ a5 g5 f#5 eb5] ~ ~ ~ [g5 f#5 eb5 ~ d5 ~ ~ ~]>').s('sine').fm(3).fmh(3).fmdecay(.12).fmsustain(.1).decay(.2).sustain(0).vib(5).vibmod(.12).delay(.5).delaytime(.315).delayfeedback(.55).room(.5).jux(rev).gain(.22)"
		}
	},
	{
		// Progressive psy (Ace Ventura / Liquid Soul): deep FM roll, PWM pad and filtered off-beat stabs, B minor.
		title: 'Slow Burn Chakra',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.16).sustain(0)",
			hats: "stack(s('hh*16').gain('.22 .1 .16 .1'), s('[~ oh]*4').gain(.26), s('rd*4').gain(arc.range(.08, .2))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ rim ~ ~ rim ~ ~ rim ~ ~ ~ ~ rim ~').bank('RolandTR909').gain(.28).room(.4).roomsize(3)",
			bass: "note('<[~ b1 b1 b1]*4 [~ b1 b1 b1]*4 [~ b1 b1 b1]*4 [[~ b1 b1 b1]!3 [~ d2 c#2 a1]]>').s('sine').fm(arc.range(1.5, 3.5)).fmh(1).fmdecay(.06).fmsustain(.2).lpf(900).decay(.07).sustain(0).gain('[.5 .55 .45 .52]*4')",
			synth:
				"stack(note('<[b3,d4,f#4,a4] [g3,b3,d4,f#4] [e3,g3,b3,d4] [f#3,a3,c#4,e4]>').slow(2).s('pulse').pw(sine.range(.2, .8).slow(8)).attack(.5).decay(1).sustain(.6).release(.8).lpf(arc.range(600, 1800)).room(.5).roomsize(4).gain(.07), note('<[b3,d4,f#4] [g3,b3,d4] [e3,g3,b3] [f#3,a3,c#4]>').slow(2).struct('~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~').s('sawtooth').lpf(arc.range(500, 2200)).lpenv(2).lpd(.12).decay(.12).sustain(0).delay(.3).delaytime(.315).delayfeedback(.4).gain(.1))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ speech:2 ~ ~ ~ ~>').speed(.9).room(.6).roomsize(5).delay(.5).delaytime(.42).delayfeedback(.6).gain(.45)"
		}
	},
	{
		// Dark forest psy (Kindzadza / Parasense): C# phrygian grit, euclidean FM metal and crushed vowel noise chatter.
		title: 'Gnome Alone',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.14).sustain(0).shape(.25)",
			hats: "stack(s('hh*16').gain(perlin.range(.1, .32)), s('[~ oh]*4').gain(.28).speed(.9), s('rd(5,16,3)').gain(.16)).bank('RolandTR909').sometimesBy(.15, x => x.speed(2))",
			perc: "s('~ ~ ~ ~ cp ~ ~ ~, ~ ~ mt ~ ~ ~ ~ ~ ~ lt ~ ~ ~ ~ ht ~').bank('RolandTR909').crush(6).gain(.3).room(.3).lastOf(8, x => x.ply(3))",
			bass: "note('[~ c#2 c#2 c#2]*4').add(note('<0 0 0 0 0 0 1 [0 1]>')).s('square').noise(.06).lpf(arc.range(250, 600)).lpenv(3).lpd(.04).lpq(8).decay(.06).sustain(0).gain(.371)",
			synth:
				"stack(note('<c#4 d4 c#4 g4>').struct('x(7,16,2)').s('square').fm(sine.range(2, 9).slow(7)).fmh(1.414).fmwave('square').decay(.06).sustain(0).hpf(600).pan(rand).gain(.1), s('white(5,16,1)').hpf(3000).vowel('<a e i o>').decay(.03).sustain(0).crush(4).pan(sine.fast(3)).gain(arc.range(.04, .08))).lastOf(8, x => x.fast(2)).room(.4).roomsize(6).roomlp(3000)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ metal:3 ~ ~ ~ ~ ~ ~ ~ industrial:12>').speed(.6).room(.7).roomsize(6).roomlp(2500).delay(.5).delaytime(.42).delayfeedback(.65).gain(.45)"
		}
	},
	{
		// Twilight psy-techno: one G minor note gated by mutating euclids, PWM and vowel sweeps, rolling ladder bass.
		title: 'Hypnosis Buffering',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.16).sustain(0).gain(.97)",
			hats: "stack(s('hh*16').gain('.26 .12 .2 .12').hpf(sine.range(4000, 9000).slow(16)), s('[~ oh]*4').gain(.3)).bank('RolandTR909')",
			perc: "s('~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd ~ ~ ~, rim(3,8,1)').bank('RolandTR909').gain(.28).room(.4).delay(.2).delaytime(.315)",
			bass: "note('[~ g1 g1 g1]*4').s('sawtooth').ftype('ladder').lpf(sine.range(200, 520).slow(32)).lpenv(arc.range(1, 4)).lpd(.05).lpq(10).drive(1).decay(.07).sustain(0).gain(.5)",
			synth:
				"note('g3').struct('<x(5,16) x(5,16) x(7,16,2) x(5,16,3) x(5,16) x(5,16) x(9,16) x(7,16,4)>').add(note('<0 0 0 0 0 0 3 -2>')).s('pulse').pw(sine.range(.1, .5).slow(6)).vowel('<a e i o>/2').lpf(arc.range(500, 2500)).lpenv(2).lpd(.08).decay(.09).sustain(0).lastOf(8, x => x.add(note(7))).delay(.4).delaytime(.21).delayfeedback(.6).pan(sine.fast(2)).gain(arc.range(.234, .375))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ numbers:7 ~ ~ ~ ~ ~ ~ ~ [speakspell:2 ~ ~ numbers:1]>').speed(.9).room(.6).delay(.55).delaytime(.42).delayfeedback(.6).pan(sine.fast(2)).gain(.48)"
		}
	},
	{
		// Experiment: C phrygian acid with drifting FM ratios, vowel chatter and square-wave ping-pong.
		title: 'Cuttlefish Committee Meeting',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').decay(.15).sustain(0).shape(.3)",
			hats: "stack(s('hh*16').gain('.26 .12 .2 .12'), s('[~ oh]*4').gain(.28), s('sh(7,16,1)').gain(.16).pan(sine.fast(4))).bank('RolandTR808')",
			perc: "s('~ cp ~ [~ cp], cb(3,16,6)').bank('RolandTR808').gain(.28).room(.4).delay(.3).delaytime(.105).pan(sine.fast(2))",
			bass: "note('<[~ c2 c2 c2]*4 [~ c2 c2 c2]*4 [~ c2 c2 c2]*4 [~ c2 db2 c2]*4>').s('triangle').fm(arc.range(2, 5)).fmh('<1 1 2 1.5>').fmdecay(.05).fmsustain(.1).lpf(800).decay(.07).sustain(0).gain(.32)",
			synth:
				"note('c3 c4 eb3 [c3 g3] c3 ab3 c4 [db4 c3]').fast(2).s('sawtooth').ftype('ladder').lpf(perlin.range(300, 1800).slow(4)).lpq(16).lpenv(arc.range(2, 5)).lpd(.08).drive(1.2).fm(sine.range(0, 4).slow(16)).fmh(perlin.range(1, 3).slow(8)).vowel('<a e i o u>/2').decay(.08).sustain(0).chunk(4, x => x.add(note(12))).lastOf(8, x => x.ply(2)).delay(.35).delaytime(.21).delayfeedback(.55).pan(square.fast(4)).gain(arc.range(.186, .31))",
			vox: "s('<~ ~ ~ speakspell:7 ~ ~ ~ space:13>').speed(perlin.range(.6, 1.2)).room(.6).delay(.6).delaytime(.21).delayfeedback(.7).pan(square.fast(8)).gain(.45)"
		}
	}
];
