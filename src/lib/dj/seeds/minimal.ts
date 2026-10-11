import type { Seed } from './types';

export const MINIMAL: Seed[] = [
	{
		title: 'Spree Loop',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[~ hh]*4').gain(.5), s('hh*16').gain(arc.range(0, .18))).bank('RolandTR909').swingBy(1/6, 8)",
			perc: "s('~ rim ~ [rim ~ ~ rim], <~ [~ ~ ~ cp]>').bank('RolandTR909').gain(.45).room(.2).lastOf(8, x => x.ply(2))",
			bass: "note('<[c2 ~ c2 ~ ~ c2 ~ c3] [c2 ~ c2 ~ ~ eb2 ~ c2]>').s('sawtooth').lpf(arc.range(250, 1100)).lpq(6).decay(.12).sustain(0).gain(.7)",
			synth:
				"note('<[~ c4] [~ eb4] [~ g4] [~ bb3]>*2').s('square').lpf(arc.range(700, 2600)).decay(.08).sustain(0).delay(.4).delayfeedback(.45).gain(.2).lastOf(8, x => x.off(1/8, y => y.add(note(12))))",
			vox: "s('<speech:3 ~ ~ ~ speech:0 ~ ~ ~>').speed(.9).delay(.5).delayfeedback(.55).room(.5).gain(.7)"
		}
	},
	{
		title: 'Panorama Bar Tool',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "s('hh*8').bank('RolandTR909').gain('[.25 .5]*4').pan(sine.slow(4)).lastOf(4, x => x.ply(2))",
			perc: "s('~ cp ~ ~, rim(3,8,2)').bank('RolandTR909').gain(.4).room(arc.range(.1, .4))",
			bass: "note('[~ g1 ~ g1] [~ g1 bb1 ~]').s('sawtooth').lpf(arc.range(250, 700)).decay(.1).sustain(0).gain(.75)",
			synth:
				"note('<g4 ~ f4 ~ bb4 ~ f4 ~>').s('triangle').decay(.3).sustain(0).delay(.5).delayfeedback(.6).room(.4).gain(.22)",
			vox: "note('<[g3 ~ ~ g3] ~ ~ ~>').s('sawtooth').vowel('<o a>').lpf(1800).decay(.3).sustain(0).room(.5).delay(.4).gain(.22)"
		}
	},
	{
		title: 'Clicks and Cuts',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(3000).gain(.95)",
			hats: "s('{hh ~ hh}%16').bank('RolandTR909').gain(perlin.range(.2, .45)).hpf(6000)",
			perc: "s('rim(5,16,3), ~ ~ cp ~').bank('RolandTR808').gain(.4).pan(perlin.range(.3, .7))",
			bass: "note('<[f1 ~ ~ f1 ~ ~ ab1 ~] [f1 ~ ~ f1 ~ c2 ~ ~]>').s('triangle').lpf(arc.range(300, 800)).decay(.25).sustain(0).gain(.9)",
			synth:
				"n('<0 [~ 3] 5 [~ 7]>*2').scale('F4:minor').s('square').lpf(arc.range(500, 2200)).decay(.06).sustain(0).delay(.3).pan(sine.slow(8)).gain(.18)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speakspell:5>').speed('<1 .8>').delay(.6).delayfeedback(.6).room(.6).gain(.6)"
		}
	},
	{
		title: 'Rubber Ducking Club',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95).lastOf(8, x => x.mask('1 1 1 0'))",
			hats: "stack(s('[~ oh]*4').gain(.35), s('hh*16').gain(perlin.range(.08, .25)).degradeBy(arc.range(.5, 0))).bank('RolandTR909').hpf(6500)",
			perc: "s('~ ~ ~ ~ ~ ~ rim ~ ~ ~ rim ~ ~ ~ ~ ~, ~ cp').bank('RolandTR909').gain(.4).room(.15).lastOf(4, x => x.off(1/16, y => y.gain(.2)))",
			bass: "note('[~ d2 ~ d2] [~ d2 ~ ~] ~ ~').s('sawtooth').lpf(arc.range(280, 900)).lpq(8).decay(.11).sustain(0).gain(.75).lastOf(4, x => x.add(note(5)))",
			synth:
				"note('~ ~ <[~ a4 ~ f4] [~ c5 ~ a4]> [~ d4 ~ ~]').s('square').lpf(arc.range(600, 2400)).decay(.07).sustain(0).delay(.35).delayfeedback(.4).pan(.65).gain(.2)",
			vox: "s('<~ ~ ~ speech:1 ~ ~ ~ ~>').delay(.5).delayfeedback(.5).room(.4).pan(.35).gain(.6)"
		}
	},
	{
		title: 'Kreuzberg Keyfob',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.95)",
			hats: "s('{hh hh oh}%16').bank('RolandTR707').gain(perlin.range(.2, .45)).swingBy(1/6, 8)",
			perc: "s('{rim ~ ~ cb ~}%16, {~ ~ lt ~ ~ ~ ~}%8').bank('RolandTR707').gain(.38).pan(sine.range(.3, .7).slow(8)).room(arc.range(.1, .4))",
			bass: "note('{~ e1 ~ e2 f1}%8').s('sawtooth').lpf(sine.range(250, 700).slow(16)).lpq(7).decay(.09).sustain(0).gain(.75)",
			synth:
				"n('{0 1 4 ~ 7 ~ 1}%16').scale('E4:phrygian').s('triangle').decay(.05).sustain(0).lpf(arc.range(800, 3000)).delay(.25).gain(arc.range(.1, .25))",
			vox: "s('<~ ~ speakspell:2 ~ ~ ~ ~ speakspell:9>').delay(.375).delayfeedback(.5).room(.5).gain(.55)"
		}
	},
	{
		title: 'Tiny Arpeggio Diet',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(2500).gain(.9)",
			hats: "s('~ hh ~ hh ~ hh ~ [hh oh]').bank('RolandTR909').gain(.4).hpf(5000).lastOf(4, x => x.fast(2))",
			perc: "s('~ ~ rim ~ ~ ~ rim ~ ~ ~ ~ rim ~ ~ rim ~').bank('RolandTR909').gain(.4).room(.2)",
			bass: "note('[~ a1] [~ a1] [~ c2] [~ e1]').s('square').lpf(arc.range(250, 800)).decay(.1).sustain(0).gain(.6)",
			synth:
				"n('0 2 4 7 9 7 4 2').scale('A4:minor').iter(4).fast(2).s('triangle').decay(.06).sustain(0).lpf(arc.range(900, 3500)).delay(.3).delayfeedback(.35).pan(sine.slow(4)).gain(arc.range(.12, .28))",
			vox: "s('<bleep:8 ~ ~ ~ ~ ~ ~ ~ bleep:12 ~ ~ ~ ~ ~ ~ ~>').delay(.5).delayfeedback(.55).room(.5).gain(.45)"
		}
	},
	{
		title: 'Mouth to Mono',
		layers: {
			kick: "s('bd*4, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bd').bank('RolandTR909').gain(.9)",
			hats: "s('hh*8').bank('RolandTR606').gain(sine.range(.2, .45).fast(2)).hpf(arc.range(8000, 3000)).pan(.6).sometimesBy(.1, x => x.ply(2))",
			perc: "s('~ ~ cp ~, rim(3,16,5)').bank('RolandTR909').gain(.38).room(.3)",
			bass: "note('<[~ g1 ~ ~ ~ g1 ~ bb1] [~ g1 ~ ~ ~ c2 ~ g1]>').s('sine').shape(.3).lpf(400).decay(.2).sustain(0).gain(.9)",
			synth:
				"note('[~ ~ d4 ~] [~ ~ ~ ~] [~ e4 ~ ~] [~ ~ ~ ~]').s('triangle').lpf(arc.range(600, 2000)).decay(.15).sustain(0).delay(.4).room(.3).gain(.18)",
			vox: "s('<[~ ~ ~ ~ mouth:3 ~ ~ ~ ~ ~ ~ ~ ~ mouth:7 ~ ~] ~ ~ ~>').speed('<1 1.2 .9>').pan(rand).delay(.25).room(.3).gain(.5)"
		}
	},
	{
		title: 'Off-Grid Cufflinks',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').lpf(1800).gain(.9)",
			hats: "s('hh(7,16,1), oh(2,8,3)').bank('RolandTR808').gain(perlin.range(.2, .4)).degradeBy(arc.range(.4, 0))",
			perc: "s('rim(5,12,2), cb(3,16,7)').bank('RolandTR808').gain(.35).pan(perlin.range(.25, .75)).lastOf(8, x => x.iter(4))",
			bass: "note('bb1(5,16,3)').s('sawtooth').lpf(arc.range(250, 900)).lpq(10).decay(.08).sustain(0).gain(.7).lastOf(4, x => x.add(note(12)))",
			synth:
				"n('0(3,8,2) 4(3,8,5)').scale('Bb4:minor').s('square').decay(.05).sustain(0).lpf(sine.range(700, 2500).slow(32)).delay(.33).delayfeedback(.5).gain(.16)",
			vox: "s('<~ ~ ~ ~ ~ diphone:12 ~ ~>').speed(.85).delay(.66).delayfeedback(.55).room(.5).gain(.6)"
		}
	},
	{
		title: 'Afterhours Chord Memo',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.1).gain(.95)",
			hats: "stack(s('[~ hh]*4').gain(.4), s('rd*8').gain(arc.range(.05, .2))).bank('RolandTR909').hpf(4000)",
			perc: "s('~ ~ ~ ~ cp ~ ~ ~ ~ ~ ~ rim ~ ~ ~ ~').bank('RolandTR909').gain(.4).room(arc.range(.15, .45)).lastOf(8, x => x.ply(2))",
			bass: "note('<f#1 f#1 d1 e1>').struct('[~ x] [~ x] [~ x] [~ ~ x ~]').s('sawtooth').lpf(arc.range(260, 850)).lpq(5).decay(.12).sustain(0).gain(.75)",
			synth:
				"note('<[f#3,a3,c#4] [f#3,a3,c#4] [d3,f#3,a3] [e3,g#3,b3]>').struct('~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~').s('sawtooth').lpf(sine.range(600, 1800).slow(16)).decay(.18).sustain(0).room(.4).delay(.375).delayfeedback(.45).gain(.2)",
			vox: "note('<~ ~ ~ ~ ~ ~ [~ c#4] ~>').s('sawtooth').vowel('<a o e>').lpf(1800).decay(.25).sustain(0).delay(.5).delayfeedback(.5).room(.5).gain(.3)"
		}
	}
];
