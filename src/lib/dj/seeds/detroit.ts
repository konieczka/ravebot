import type { Seed } from './types';

export const DETROIT: Seed[] = [
	{
		title: 'Belleville Sunrise',
		layers: {
			kick: "s('bd*4').bank('RolandTR909')",
			hats: "stack(s('[~ hh]*4').gain(.45), s('hh*16').gain(arc.range(.08, .2))).bank('RolandTR909').swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ rim ~ ~ rim ~ ~ ~ ~ ~').bank('RolandTR808').gain(.5)",
			bass: "note('<[c2 ~ ~ c2 ~ ~ eb2 ~] [ab1 ~ ~ ab1 ~ ~ bb1 ~]>').s('sawtooth').lpf(arc.range(400, 1100)).decay(.2).sustain(0).gain(.6)",
			synth:
				"note('<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,bb3,d4]>').s('supersaw').lpf(arc.range(900, 2600)).attack(.05).release(.4).room(.6).gain(.18)",
			vox: "note('<[c5 ~ eb5 ~] ~ [g4 ~ ~ ~] ~>').s('sawtooth').vowel('<a e o>').lpf(2500).decay(.4).sustain(0).delay(.5).delayfeedback(.5).room(.6).gain(.18)"
		}
	},
	{
		title: 'Motor City Satellite',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "s('hh*16').bank('RolandTR909').gain('[.35 .12 .2 .12]*4').swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, ~ [~ cb] ~ ~').bank('RolandTR808').gain(.45).room(.3)",
			bass: "note('[a1 ~ a2 ~] [~ a1 c2 ~] [a1 ~ ~ e2] [~ g1 ~ a1]').s('sawtooth').lpf(arc.range(350, 1000)).decay(.15).sustain(0).gain(.6)",
			synth:
				"n('<[0 2 4 7]*4 [0 2 4 6]*4 [-2 0 2 4]*4 [-1 1 3 5]*4>').scale('A3:minor').s('triangle').lpf(arc.range(1000, 4000)).decay(.12).sustain(0).delay(.4).delayfeedback(.5).room(.4).gain(.2)",
			vox: "s('<~ ~ ~ ~ rave:1 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>').gain(.5).room(.5).delay(.3)"
		}
	},
	{
		title: 'Cass Corridor Choir',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.3), s('hh*16').gain(perlin.range(.1, .3))).bank('RolandTR909').swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp').bank('RolandTR808').gain(.45).room(.2).lastOf(4, x => x.ply(2))",
			bass: "note('<[~ f1 ~ f2]*2 [~ db1 ~ db2]*2 [~ eb1 ~ eb2]*2 [~ c1 ~ c2]*2>').s('sawtooth').lpf(arc.range(300, 950)).lpq(4).decay(.14).sustain(0).gain(.6)",
			synth:
				"note('<[f3,ab3,c4,eb4] [db3,f3,ab3,c4] [eb3,g3,bb3,db4] [c3,e3,g3,bb3]>').struct('[~ x]*4').s('square').lpf(arc.range(700, 2400)).decay(.15).sustain(0).room(.5).gain(.16)",
			vox: "note('<[f4,ab4,c5] ~ ~ ~ [eb4,g4,bb4] ~ ~ ~>').s('sawtooth').vowel('<a o>').lpf(1800).attack(.4).release(1.2).room(.8).gain(arc.range(.12, .22))"
		}
	},
	{
		title: 'Transmat Telegram',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95).lastOf(8, x => x.mask('1 1 1 0'))",
			hats: "s('hh(11,16,3), [~ oh]*2').bank('RolandTR707').gain(perlin.range(.2, .45)).swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, rim(3,8,2)').bank('RolandTR808').gain(.4).room(.25)",
			bass: "note('[~ g1 ~ g2] [~ g1 bb1 ~] [~ g1 ~ d2] [~ f1 g1 ~]').s('square').lpf(arc.range(300, 900)).decay(.12).sustain(0).gain(.55)",
			synth:
				"n('0 2 4 6 7 9 11 7 4 2 0 4 7 9 11 14').scale('G3:minor').iter(4).s('triangle').lpf(sine.range(900, 3500).slow(16)).decay(.1).sustain(0).delay(.375).delayfeedback(.45).room(.4).gain(arc.range(.1, .22))",
			vox: "s('<~ ~ ~ numbers:3 ~ ~ ~ numbers:1>').speed(.9).delay(.4).delayfeedback(.4).room(.5).gain(.4)"
		}
	},
	{
		title: 'Jazz Hands Android',
		layers: {
			kick: "s('bd*4, <~ [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bd]>').bank('RolandTR909').gain(.95)",
			hats: "s('[hh hh oh hh]*4').bank('RolandTR909').gain('[.25 .12 .3 .12]*4').sometimesBy(.1, x => x.speed(1.5))",
			perc: "s('~ cp ~ [cp ~ ~ cp], ~ ~ ~ ~ ~ ~ rim ~').bank('RolandTR808').gain(.4).room(.3)",
			bass: "n('[~ 0 ~ 7] [~ 0 2 ~] [~ 0 ~ 5] [~ 3 4 ~]').scale('D2:dorian').s('sawtooth').lpf(arc.range(350, 1100)).lpq(6).decay(.14).sustain(0).gain(.6)",
			synth:
				"note('<~ [~ [d4,f4,a4,c5] ~ [~ [d4,f4,a4,c5]]] ~ ~ ~ [~ [c4,e4,g4,b4] [~ [c4,e4,g4,b4]] ~] ~ ~>').s('sawtooth').lpf(arc.range(800, 3000)).decay(.18).sustain(0).delay(.25).room(.5).gain(.2)",
			vox: "s('<[stab:7 ~ ~ stab:7] ~ ~ ~ [stab:7 ~ stab:7 ~] ~ ~ ~>').gain(.4).room(.4).delay(.25).delayfeedback(.3)"
		}
	},
	{
		title: 'Rumble In The Rouge',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(3000).gain(.95)",
			hats: "s('{hh ~ hh oh}%16').bank('RolandTR606').gain(perlin.range(.2, .4)).swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, sd(2,16,7)').bank('RolandTR808').gain(.38).room(.2)",
			bass: "note('[~ eb1]*8').s('sine').shape(.3).lpf(300).decay(.2).sustain(0).room(.2).gain(arc.range(.5, .7))",
			synth:
				"note('<[eb3,gb3,bb3,db4] [b2,eb3,gb3,bb3] [db3,f3,ab3,c4] [gb3,bb3,db4,f4]>').slow(2).s('supersaw').attack(.6).release(2).lpf(sine.range(600, 2000).slow(32)).room(.7).gain(arc.range(.08, .2))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ bleep:2 ~ ~ ~ ~ ~ ~ ~ bleep:7>').speed(.75).delay(.5).delayfeedback(.55).room(.6).gain(.35)"
		}
	},
	{
		title: 'Assembly Line Funk',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.95)",
			hats: "s('{hh hh oh}%16').bank('RolandTR707').gain('{.35 .15 .3 .12 .2}%16').swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, {rim ~ ~ cb ~}%16').bank('RolandTR707').gain(.4)",
			bass: "n('{~ 0 ~ 7 0 ~ 10}%16').scale('Bb1:minor').s('sawtooth').lpf(arc.range(300, 1000)).lpq(5).decay(.1).sustain(0).gain(.6)",
			synth:
				"n('{0 2 4 7 9}%8').scale('Bb3:minor').s('square').lpf(arc.range(600, 2800)).lpq(4).decay(.1).sustain(0).delay(.5).delaytime(.375).room(.4).gain(.15)",
			vox: "note('<bb3 ~ ~ ~ [db4 bb3] ~ ~ ~>').s('square').vowel('<i o>').lpf(1800).decay(.25).sustain(0).delay(.4).delayfeedback(.5).room(.5).gain(.22)"
		}
	},
	{
		title: 'Ride Or Die Sunday',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95).lastOf(4, x => x.mask('1 1 1 [1 0]'))",
			hats: "stack(s('rd*8').gain(perlin.range(.15, .3)), s('[~ hh]*4').gain(.35)).bank('RolandTR909').swingBy(1/6, 8)",
			perc: "s('~ cp ~ cp, [~ ~ ~ rim]*2').bank('RolandTR909').gain(.4).sometimesBy(.15, x => x.ply(2))",
			bass: "note('<[~ f#1 ~ f#1 ~ a1 ~ f#2] [~ d2 ~ d2 ~ e2 ~ c#2]>').s('sawtooth').lpf(arc.range(300, 1000)).lpq(5).decay(.12).sustain(0).gain(.6)",
			synth:
				"note('<[f#3,a3,c#4,e4] [d3,f#3,a3,c#4]>').struct('x ~ ~ x ~ ~ x ~ ~ ~ x ~ ~ x ~ ~').s('supersaw').lpf(sine.range(800, 2400).slow(16)).decay(.25).sustain(0).room(.6).gain(arc.range(.1, .2))",
			vox: "s('<[speech:2 ~ speech:2 speech:2] ~ ~ ~ ~ ~ [~ speech:5 ~ speech:5] ~>').delay(.25).delayfeedback(.3).room(.4).gain(.45)"
		}
	},
	{
		title: 'Afrogermanic Warp Drive',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').lpf(1500).gain(.95)",
			hats: "s('[hh hh hh oh]*2, sh*16').bank('RolandTR808').gain(perlin.range(.15, .35)).lastOf(8, x => x.ply(2))",
			perc: "s('~ cp ~ cp, lt(3,8), ~ ~ ~ ~ ~ ~ cb ~').bank('RolandTR808').gain(.4).room(.3)",
			bass: "n('[~ 0 ~ 0] [~ 1 ~ 0] [~ 0 ~ 4] [~ 1 0 ~]').scale('E1:phrygian').s('sawtooth').lpf(arc.range(250, 900)).lpq(10).decay(.15).sustain(0).gain(.6)",
			synth:
				"n('<[0 ~ 1 ~ 0 ~ 4 3] [0 ~ 1 ~ 0 ~ -1 ~]>').scale('E4:phrygian').s('sawtooth').lpf(arc.range(1000, 3500)).decay(.2).sustain(0).delay(.3).room(.5).gain(.15)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:4>').speed(.8).delay(.3).room(.6).gain(.4)"
		}
	}
];
