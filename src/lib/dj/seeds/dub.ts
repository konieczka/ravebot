import type { Seed } from './types';

export const DUB: Seed[] = [
	{
		title: 'Basic Channel Surfing',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').gain(.9)",
			hats: "stack(s('[~ hh]*4').gain(.3), s('hh*16').gain(perlin.range(.03, .12))).bank('RolandTR909')",
			perc: "s('~ rim(3,8)').bank('RolandTR808').gain(.3).room(.5).delay(.3)",
			bass: "note('<[~ c2]*4 [~ c2]*4 [~ bb1]*4 [~ g1]*4>').s('triangle').lpf(300).decay(.3).sustain(0).gain(.9)",
			synth:
				"note('<[~ [c3,eb3,g3,bb3]] [~ ~ [c3,eb3,g3,bb3] ~]>').s('sawtooth').lpf(arc.range(450, 1600)).decay(.18).sustain(0).delay(.6).delayfeedback(.65).room(.7).gain(.3)",
			vox: "s('<~ ~ space:3 ~ ~ ~ ~ ~>').gain(.4).hpf(400).delay(.6).delayfeedback(.6).room(.8).pan(sine.slow(8))"
		}
	},
	{
		title: 'Fog Machine Dub',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(1500).gain(.9)",
			hats: "s('[~ hh]*4').bank('RolandTR808').gain(arc.range(.15, .35)).delay(.25).delayfeedback(.4)",
			perc: "s('~ ~ ~ rim, ~ ~ [~ rim] ~').bank('RolandTR808').gain(.3).room(.6)",
			bass: "note('<f2 f2 db2 eb2>').struct('[~ x]*4').s('triangle').lpf(300).decay(.3).sustain(0).gain(.85)",
			synth:
				"note('<[f3,ab3,c4,eb4] ~ ~ [db3,f3,ab3,c4]>').struct('~ x ~ ~ ~ ~ x ~').s('sawtooth').lpf(arc.range(400, 1400)).lpq(4).decay(.15).sustain(0).delay(.7).delayfeedback(.7).room(.8).gain(.28).pan(sine.slow(16))",
			vox: "s('<~ ~ ~ ~ speech:1 ~ ~ ~>').speed(.75).delay(.7).delayfeedback(.7).room(.8).gain(.5)"
		}
	},
	{
		title: 'Echo Chamber Tea',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(1800).gain(.9)",
			hats: "s('[~ hh]*4, hh*16').bank('RolandTR909').gain(perlin.range(.08, .3)).swingBy(1/6, 8).lastOf(8, x => x.ply(2))",
			perc: "s('~ cp ~ ~, ~ ~ ~ rim').bank('RolandTR909').gain(.32).room(.7).delay(.35).delayfeedback(.5)",
			bass: "note('<[~ d2]*4 [~ d2]*4 [~ f2]*4 [~ c2]*4>').s('sine').decay(.35).sustain(0).gain(.95)",
			synth:
				"note('<[~ [d3,f3,a3,c4] ~ ~] [~ ~ ~ [a2,c3,e3,g3]]>').s('sawtooth').lpf(arc.range(400, 1800)).decay(.2).sustain(0).delay(.66).delaytime(.37).delayfeedback(.6).room(.7).gain(.28).pan('<.3 .7>')",
			vox: "s('<~ ~ ~ ~ wind:3 ~ ~ ~>').gain(.45).hpf(300).delay(.5).delayfeedback(.55).room(.9).pan(sine.slow(16))"
		}
	},
	{
		title: 'Submarine Telegraph',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').lpf(900).gain(.95)",
			hats: "s('{hh ~ oh ~ hh}%16').bank('RolandTR808').hpf(5000).gain(.24).degradeBy(arc.range(.5, 0))",
			perc: "s('rim(5,16,3)').bank('RolandTR808').gain(.3).room(.5).pan(sine.slow(4))",
			bass: "note('[~ g1 ~ g1] [~ g1 ~ bb1]').s('sine').decay(.25).sustain(0).gain(.9)",
			synth:
				"note('{[g3,bb3,d4,f4] ~ ~}%8').s('sawtooth').lpf(sine.range(500, 1500).slow(32)).decay(.15).sustain(0).delay(.6).delayfeedback(.6).room(.6).gain(arc.range(.15, .3))",
			vox: "s('<~ bleep:12 ~ ~ ~ ~ ~ ~>').speed(.5).gain(.35).delay(.7).delayfeedback(.7).room(.8)"
		}
	},
	{
		title: 'Rust Belt Rain',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').shape(.2).gain(.9)",
			hats: "s('hh*8').bank('RolandTR707').hpf(5000).gain(sine.range(.1, .3).slow(4)).sometimesBy(.15, x => x.ply(2))",
			perc: "s('~ cp, ~ ~ ~ [~ rim]').bank('RolandTR707').gain(.3).room(arc.range(.3, .8)).delay(.4).delayfeedback(.55)",
			bass: "note('a1*16').s('sine').lpf(200).decay(.12).sustain(0).gain('[0 .4 .7 .5]*4').room(.6).size(.9)",
			synth:
				"stack(note('<[a3,c4,e4,g4] ~ [d3,f#3,a3,c4] ~>').struct('[~ x]*2 ~ ~').s('sawtooth').lpf(arc.range(350, 1500)).decay(.2).sustain(0).delay(.6).delayfeedback(.65).room(.7).gain(.26), s('pink').hpf(4000).gain(arc.range(.02, .08)).pan(rand))",
			vox: "s('<~ ~ ~ ~ ~ ~ metal:3 ~>').speed(.5).gain(.35).hpf(500).delay(.5).delayfeedback(.6).room(.8)"
		}
	},
	{
		title: 'Smoke Signal Theory',
		layers: {
			kick: "s('<[bd*4] [bd*4] [bd*4] [bd bd bd [bd ~ ~ bd]]>').bank('RolandTR909').gain(.9)",
			hats: "s('~ hh ~ hh ~ hh ~ [hh oh]').bank('RolandTR606').hpf(3000).gain(arc.range(.18, .38))",
			perc: "s('[~ ~ ~ ~] [~ ~ sd ~] [~ ~ ~ ~] [~ ~ ~ sd]').bank('RolandTR606').gain(.3).room(.6).delay(.25).delayfeedback(.5).lastOf(8, x => x.ply(2))",
			bass: "note('<eb2 b1 gb1 db2>').slow(4).struct('[~ x] [~ x] [~ x] [~ x x]').s('sine').decay(.3).sustain(0).gain(.9)",
			synth:
				"note('<[eb3,gb3,bb3,db4] [b2,eb3,gb3,bb3] [gb2,bb2,db3,f3] [db3,f3,ab3,c4]>').slow(4).struct('~ [~ x] ~ [x ~ ~ x]').s('sawtooth').lpf(sine.range(600, 1600).slow(16)).lpq(6).decay(.2).sustain(0).delay(.55).delayfeedback(.6).room(arc.range(.4, .9)).gain(.25)",
			vox: "note('<eb4 ~ ~ ~ ~ ~ ~ ~ bb3 ~ ~ ~ ~ ~ ~ ~>').s('sawtooth').vowel('<a o>/8').lpf(2000).decay(.4).sustain(0).delay(.6).delayfeedback(.6).room(.8).gain(.4)"
		}
	},
	{
		title: 'Tape Hiss Lullaby',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').lpf(1200).gain(.9)",
			hats: "s('[~ hh]*4, sh*16').bank('RolandTR808').gain(perlin.range(.1, .32)).swingBy(1/6, 8)",
			perc: "s('~ ~ ~ cb, ~ rim ~ ~').bank('RolandTR808').gain(.3).room(.6).delay(.4).delayfeedback(.6).sometimesBy(.2, x => x.speed(1.5))",
			bass: "n('<0 0 -2 -3>').scale('Bb1:minor').struct('[~ x]*4').s('triangle').lpf(260).decay(.3).sustain(0).gain(.9)",
			synth:
				"n('<[0 4 2 6 4 2 0 4] [-2 2 0 4 2 0 -2 2]>').scale('Bb3:minor').s('triangle').lpf(arc.range(800, 3000)).decay(.12).sustain(0).delay(.5).delaytime(.37).delayfeedback(.55).room(.6).gain(arc.range(.12, .24)).pan(sine.slow(8))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ speech:3 ~ ~ ~ ~ ~ ~ ~>').speed(.8).hpf(300).gain(.5).delay(.75).delayfeedback(.72).room(.8)"
		}
	},
	{
		title: 'Lighthouse on Sabbatical',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.85)",
			hats: "stack(s('hh(7,16,1)').gain(perlin.range(.15, .35)), s('oh(3,8,2)').gain(.18)).bank('RolandTR707')",
			perc: "s('rim(5,12), cb(3,16,5), lt(2,7)').bank('RolandTR707').gain(.3).room(.5).delay(.3).delayfeedback(.45).pan('<.2 .8 .5>')",
			bass: "note('[~ e1] [~ e1] [~ f1] [~ e1]').s('sine').decay(.3).sustain(0).gain(.95).lastOf(4, x => x.ply(2))",
			synth:
				"note('<[e3,g3,b3,d4] [e3,g3,b3,d4] [f3,a3,c4,e4] [e3,g3,b3,d4]>').struct('x(5,16,3)').s('sawtooth').lpf(sine.range(400, 1400).slow(32)).lpq(5).decay(.12).sustain(0).delay(.5).delayfeedback(.6).room(.6).gain(arc.range(.14, .28))",
			vox: "s('<~ ~ ~ ~ stab:7 ~ ~ ~>').lpf(1500).gain(.4).delay(.7).delayfeedback(.7).room(.9)"
		}
	},
	{
		title: 'Deep Sea Postman',
		layers: {
			kick: "s('bd*4').bank('RolandTR606').lpf(1000).gain(.9)",
			hats: "s('rd*8').bank('RolandTR909').hpf(4000).gain(perlin.range(.12, .28)).lastOf(8, x => x.ply(2))",
			perc: "s('~ ~ [sd,rim] ~, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim ~ ~').bank('RolandTR909').gain(.35).room(.5).delay(.3).delayfeedback(.5)",
			bass: "note('<[~ f#1 ~ ~ ~ a1 ~ f#1] [~ d2 ~ ~ ~ c#2 ~ a1]>').s('sine').decay(.3).sustain(0).gain(.9)",
			synth:
				"note('<[f#3,a3,c#4,e4] [d3,f#3,a3,c#4]>').struct('[~ x]*4').s('square').hpf(300).lpf(arc.range(700, 2200)).decay(.08).sustain(0).delay(.4).delayfeedback(.5).room(.5).gain(.2)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:9 ~ ~ ~>').speed(.8).hpf(400).gain(.35).delay(.5).delayfeedback(.5).room(.9)"
		}
	}
];
