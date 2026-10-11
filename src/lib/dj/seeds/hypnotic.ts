import type { Seed } from './types';

export const HYPNOTIC: Seed[] = [
	{
		title: 'Ritual Cycle',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.9)",
			hats: "s('hh*16').bank('RolandTR909').gain(perlin.range(.15, .45))",
			perc: "s('lt(3,8), mt(5,16,2), rim(7,16)').bank('RolandTR909').gain(.35).room(.4).pan(sine.slow(3))",
			bass: "note('[~ d1]*4').s('sawtooth').lpf(sine.range(150, 450).slow(32)).decay(.25).sustain(0).gain(.7)",
			synth:
				"note('d4 a4 f4 a4').fast(2).s('triangle').lpf(arc.range(600, 2400)).decay(.1).sustain(0).delay(.5).room(.5).gain(.14)",
			vox: "note('<d3 ~ ~ ~ f3 ~ ~ ~>').s('sawtooth').vowel('<o u>').lpf(1200).attack(.5).release(1.5).room(.8).gain(.15)"
		}
	},
	{
		title: 'Polymeter Prayer',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(2500).gain(.9)",
			hats: "s('{hh hh oh}%16').bank('RolandTR909').gain(.3)",
			perc: "s('{rim ~ ~ rim ~}%16, mt(3,8,2), ~ ~ ~ ~ ~ ~ ~ ht').bank('RolandTR909').gain(.35).room(.35).pan(perlin.range(.2, .8))",
			bass: "note('<[g1 ~ ~ g1 ~ ~ g1 ~] [g1 ~ ~ g1 ~ bb1 ~ ~]>').s('sawtooth').lpf(arc.range(180, 520)).lpq(8).decay(.2).sustain(0).gain(.7)",
			synth:
				"n('{0 3 5 7 10}%8').scale('G3:minor').s('square').lpf(perlin.range(500, 1800).slow(8)).decay(.08).sustain(0).delay(.5).delayfeedback(.6).gain(arc.range(.06, .16))",
			vox: "s('<~ ~ ~ ~ speech:2 ~ ~ ~>').speed(.8).delay(.6).delayfeedback(.6).room(.8).gain(.45)"
		}
	},
	{
		title: 'Tom Tom Trance',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').lpf(1800).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.3), s('sh*16').gain(perlin.range(.1, .3))).bank('RolandTR808').swingBy(1/6, 8)",
			perc: "s('lt(5,16), mt(3,8,1), ht(7,16,4), rim(2,5)').bank('RolandTR808').gain(.38).room(arc.range(.15, .45)).pan('<.3 .7>*4').lastOf(8, x => x.ply(2))",
			bass: "note('[~ e1 e1 ~]*4').s('sawtooth').lpf(sine.range(120, 380).slow(16)).lpq(4).decay(.15).sustain(0).gain(.65)",
			synth:
				"n('0 1 4 1 0 7 4 1').scale('E4:phrygian').s('triangle').lpf(arc.range(400, 2000)).decay(.07).sustain(0).delay(.375).delayfeedback(.5).pan(sine.slow(6)).gain(.13)",
			vox: "s('<wind:3 ~ ~ ~ ~ ~ ~ ~>').speed(.7).lpf(3000).delay(.5).room(.7).gain(.4)"
		}
	},
	{
		title: 'Spiral Staircase',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.9)",
			hats: "s('hh*16').bank('RolandTR707').gain('[.15 .3 .45 .3]*4').degradeBy(arc.range(.4, 0)).lastOf(4, x => x.ply(2))",
			perc: "s('~ ~ rim ~, cb(3,16,6), mt(3,8,3), ~ cp').bank('RolandTR707').gain(.34).room(.3)",
			bass: "note('[~ a1]*4').s('square').lpf(arc.range(200, 600)).decay(.12).sustain(0).gain(.6)",
			synth:
				"n('0 2 4 7 9 7 4 2').scale('A3:minor').iter(4).s('sawtooth').lpf(sine.range(500, 2500).slow(32)).lpq(6).decay(.1).sustain(0).delay(.25).delayfeedback(.55).room(.3).gain(arc.range(.08, .2))",
			vox: "note('<~ ~ ~ [a3 ~ c4 ~] ~ ~ ~ ~>').s('square').vowel('<i e>').lpf(2200).decay(.2).sustain(0).delay(.375).delayfeedback(.55).room(.5).gain(.3)"
		}
	},
	{
		title: 'Sleepwalker Rumble',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.3).gain(.9)",
			hats: "s('[hh hh oh hh]*4').bank('RolandTR909').gain('[.15 .25 .4 .25]*4').swingBy(1/6, 8).pan(perlin.range(.35, .65))",
			perc: "s('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ lt ~ ~ ~ ~ ~, rim(3,16,2)').bank('RolandTR909').gain(.4).room(.4)",
			bass: "note('[~ f#1 f#1 f#1]*4').s('sine').lpf(200).decay(.18).sustain(0).room(.6).size(.9).shape(arc.range(.1, .4)).gain(.85)",
			synth:
				"stack(note('<[~ c#4] [~ a3] [~ e4] [~ f#4]>').s('square').lpf(1500).decay(.06).sustain(0).delay(.6).delayfeedback(.6).gain(.12), s('pink*16').hpf(sine.range(2000, 8000).slow(16)).decay(.03).sustain(0).gain(arc.range(.02, .08)))",
			vox: "s('<space:9 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>').speed(.6).lpf(2500).room(.7).gain(.35)"
		}
	},
	{
		title: 'Mantra Machine',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').gain(.9)",
			hats: "stack(s('sh*8').gain(perlin.range(.2, .4)), s('~ oh ~ oh').gain(.3)).bank('RolandTR808').swingBy(1/6, 4)",
			perc: "s('cb(3,8), perc(5,16,3), ~ ~ ~ [~ ~ cp ~]').bank('RolandTR808').gain(.32).room(.3).lastOf(8, x => x.sometimesBy(.5, y => y.ply(2)))",
			bass: "n('<[~ 0 ~ 0 ~ 0 ~ 3] [~ 0 ~ 0 ~ 5 ~ 4]>').scale('C2:dorian').s('triangle').lpf(arc.range(250, 700)).decay(.2).sustain(0).gain(.85)",
			synth:
				"n('<[0,2,4] ~ [~ [1,3,5]] ~>').scale('C4:dorian').s('supersaw').lpf(1200).decay(.2).sustain(0).delay(.5).room(.5).gain(arc.range(.08, .2))",
			vox: "s('<[diphone:5 ~ diphone:12 ~] ~ ~ ~ [~ ~ diphone:20 ~] ~ ~ ~>').delay(.5).delayfeedback(.55).room(.6).gain(.55)"
		}
	},
	{
		title: 'Five Over Four',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.92)",
			hats: "s('{hh hh oh hh hh}%16').bank('RolandTR909').gain('{.2 .3 .45 .3 .2}%16').hpf(arc.range(8000, 5000))",
			perc: "s('{rim ~ ~ mt ~}%16, {~ ~ ht}%8').bank('RolandTR909').gain(.36).room(.35).pan('{.2 .5 .8}%8')",
			bass: "note('{~ bb1 bb1 ~ f1}%16').s('sawtooth').lpf(sine.range(200, 500).slow(20)).decay(.1).sustain(0).gain(.7)",
			synth:
				"n('{0 ~ 4 ~ 7 ~ 2}%8').scale('Bb3:minor').s('triangle').lpf(arc.range(600, 2800)).decay(.09).sustain(0).delay(.33).delayfeedback(.5).gain(.15)",
			vox: "s('<mouth:4 ~ ~ ~ ~ mouth:9 ~ ~>').speed(.85).delay(.4).delayfeedback(.6).room(.5).gain(.5)"
		}
	},
	{
		title: 'Swamp Lantern',
		layers: {
			kick: "s('bd bd bd [bd ~ ~ bd]').bank('RolandTR606').gain(.95)",
			hats: "s('[~ hh hh hh]*4').bank('RolandTR606').gain(perlin.range(.15, .4)).degradeBy(arc.range(.5, 0))",
			perc: "s('lt(3,8,2), ht(5,16), ~ ~ ~ ~ sd ~ ~ ~').bank('RolandTR606').gain(.35).room(.5).size(.8)",
			bass: "note('<eb1 eb1 b0 db1>').struct('[~ x]*4').s('sine').lpf(300).decay(.2).sustain(0).gain(.9)",
			synth:
				"note('<[eb3,gb3,bb3,db4] [eb3,gb3,bb3,db4] [b2,eb3,gb3,bb3] [db3,f3,ab3,db4]>').s('supersaw').attack(.4).release(1).lpf(sine.range(400, 1800).slow(32)).room(.6).gain(arc.range(.08, .2))",
			vox: "note('<eb3 ~ ~ ~ ~ ~ ~ ~ bb2 ~ ~ ~ ~ ~ ~ ~>').s('sawtooth').vowel('<o a>').lpf(1000).attack(1).release(2.5).room(.9).size(.9).gain(.25)"
		}
	},
	{
		title: 'Broken Compass',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.9)",
			hats: "s('hh(7,16,1), oh(3,8,5)').bank('RolandTR909').gain(.3).pan(rand.range(.3, .7)).sometimesBy(.1, x => x.speed(1.5))",
			perc: "s('rim(5,16), mt(3,16,5), cp(2,7)').bank('RolandTR909').iter(4).gain(.36).room(arc.range(.1, .4)).lastOf(8, x => x.ply(2))",
			bass: "note('f1(5,16,2)').s('sawtooth').lpf(arc.range(180, 650)).lpq(10).decay(.12).sustain(0).gain(.65)",
			synth:
				"n('0 ~ ~ 3 ~ ~ 7 ~ ~ 10 ~ ~ 5 ~ ~ ~').scale('F4:minor').s('square').lpf(perlin.range(600, 2200).slow(4)).decay(.07).sustain(0).delay(.375).delayfeedback(.6).room(.3).gain(.15)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ space:14>').speed(.75).delay(.5).delayfeedback(.6).room(.6).gain(.4)"
		}
	}
];
