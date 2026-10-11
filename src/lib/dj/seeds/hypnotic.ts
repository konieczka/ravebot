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
	},
	{
		title: 'Submerged Screensaver',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.3).sustain(0).lpf(arc.range(2000, 4500)).gain(.9)",
			hats: "stack(s('hh*16').gain(perlin.range(.12, .32).slow(4)), s('[~ oh]*4').hpf(6000).gain(arc.range(.15, .3))).bank('RolandTR909').pan(sine.range(.35, .65).slow(8))",
			perc: "s('{rim ~ ~}%16, ~ mt ~ ~ ~ ~ mt ~ ~ ~ ~ ~ lt ~ ~ ~').bank('RolandTR909').speed('{1 1.06 .94}%8').gain(.34).room(.35).roomsize(3).pan(sine.slow(7))",
			bass: "stack(note('<b0 b0 b0 b0 b0 b0 a0 d1>').struct('[~ x x ~]*4').s('sine').decay(.2).sustain(0).gain(.75), note('<b1 b1 b1 b1 b1 b1 a1 d2>').struct('[~ x x ~]*4').s('pulse').pw(sine.range(.15, .6).slow(24)).hpf(140).lpf(perlin.range(300, 900).slow(16)).decay(.12).sustain(0).gain(.28))",
			synth:
				"n('{0 4 7 9 11 7 4}%16').scale('B3:minor').s('sine').fm(sine.range(.5, 3).slow(32)).fmh(2.01).decay(.12).sustain(0).off(3/16, x => x.add(note(12))).lpf(perlin.range(900, 3200).slow(16)).delay(.5).delaytime(.346).delayfeedback(.7).room(.5).roomsize(6).roomlp(3000).pan(sine.range(.2, .8).slow(16)).gain(arc.range(.055, .099))",
			vox: "s('<~ ~ ~ ~ wind:6 ~ ~ ~>').speed(.6).hpf(400).delay(.6).delaytime(.69).delayfeedback(.65).room(.7).roomsize(7).roomlp(3000).pan(sine.slow(5)).gain(.4)"
		}
	},
	{
		title: 'Overtone Insomnia',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.22).sustain(0).gain(.92)",
			hats: "s('hh*16').bank('RolandTR909').gain(sine.range(.12, .38).slow(12)).hpf(perlin.range(4000, 9000).slow(8)).degradeBy(arc.range(.3, 0))",
			perc: "s('rim(5,16,3), {~ mt ~ ~ lt}%16, ht(2,16,11)').bank('RolandTR909').speed(perlin.range(.85, 1.1).slow(16)).gain(.34).room(.4).roomsize(5).roomlp(2500)",
			bass: "note('<c#1 c#1 c#1 c#1 c#1 c#1 c#1 d1>').struct('[~ x x x]*4').s('sawtooth').ftype('ladder').lpf(sine.range(110, 360).slow(32)).lpq(perlin.range(6, 18).slow(16)).drive(.8).decay(.13).sustain(0).gain(.65)",
			synth:
				"stack(note('<[c#3,g#3,d4] [c#3,g#3,e4]>').slow(4).s('supersaw').unison(5).detune(.12).spread(.7).attack(1.5).release(3).lpf(sine.range(300, 1400).slow(64)).lpq(10).gain(arc.range(.051, .094)), n('{7 ~ 8 ~ ~ 11 ~}%16').scale('C#4:phrygian').s('sine').fm(4).fmh(1.414).fmdecay(.1).decay(.08).sustain(0).pan(sine.slow(9)).gain(arc.range(.029, .065))).room(.6).roomsize(7).roomlp(3000)",
			vox: "note('<c#3 ~ ~ ~ d3 ~ ~ ~>').s('supersaw').unison(3).detune(.15).vowel('<o u>').lpf(900).attack(1.5).release(3).room(.8).roomsize(8).roomlp(2500).gain(.18)"
		}
	},
	{
		title: 'Basalt Bureaucracy',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.18).sustain(0).lpf(3000).gain(.93)",
			hats: "s('[~ hh hh hh]*4, rd(3,8,2)').bank('RolandTR909').gain(.26).hpf(7000).pan(perlin.range(.4, .6))",
			perc: "s('{lt ~ ~ lt ~ mt ~}%16, rim(3,16,14), ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~').bank('RolandTR909').speed('{.9 .95 1}%16').sometimesBy(.15, x => x.speed(.8)).gain(.36).room(.3).roomsize(2).roomlp(1800)",
			bass: "note('<g1 g1 g1 f1>').struct('[~ x x x]*4').s('sawtooth').ftype('ladder').lpf(arc.range(160, 520)).lpenv(2).lpa(.005).lpd(.09).lpq(perlin.range(4, 14).slow(32)).drive(1.2).decay(.12).sustain(0).gain(.62)",
			synth:
				"stack(s('white*16').bpf(sine.range(800, 5000).slow(32)).decay(.04).sustain(0).gain(sine.range(.02, .059).slow(8)), note('<[g3,bb3] [g3,d4] [g3,bb3] [f3,c4]>').struct('~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~').s('square').fm(3).fmh(3.53).fmwave('square').decay(.15).sustain(0).lpf(2400).delay(.5).delaytime(.46).delayfeedback(.62).gain(arc.range(.052, .098))).room(.35).roomsize(4).roomlp(2500)",
			vox: "s('<~ ~ ~ industrial:17 ~ ~ ~ ~>').speed(.5).hpf(300).delay(.55).delaytime(.69).delayfeedback(.7).room(.5).roomsize(5).roomlp(2500).gain(.4)"
		}
	},
	{
		title: 'Calibrated Tinnitus',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').decay(.2).sustain(0).gain(.9)",
			hats: "s('{hh hh oh hh hh hh hh}%16, ~ ~ rd ~').bank('RolandTR909').gain('{.18 .3 .24}%16').hpf(arc.range(9000, 6000)).pan('{.35 .65 .5}%16')",
			perc: "s('{rim ~ rim ~ ~ ~ ~}%16, {~ cb ~ ~ ~ ~ ~ ~ ~}%16, ht(3,16,7)').bank('RolandTR707').speed('{1.5 1.2 2}%16').gain(.33).room(.2).roomsize(1.5).lastOf(4, x => x.iter(4))",
			bass: "stack(note('<d1 d1 d1 c1>').struct('[~ x ~ ~]*4').s('sine').decay(.2).sustain(0).gain(.519), note('<d2 d2 d2 c2>').struct('{~ x ~ x x}%16').s('pulse').pw(sine.range(.1, .5).slow(16)).hpf(150).lpf(arc.range(400, 1200)).decay(.07).sustain(0).gain(.194))",
			synth:
				"n('{0 ~ 7 3 ~ 9 ~ ~ 4}%16').scale('D4:dorian').s('sine').fm(perlin.range(2, 6).slow(16)).fmh(3.17).fmdecay(.06).fmsustain(0).decay(.09).sustain(0).hpf(500).lastOf(8, x => x.add(note(12))).jux(rev).delay(.35).delaytime(.23).delayfeedback(.55).room(.25).roomsize(2).gain(arc.range(.067, .127))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ [speakspell:7 ~ ~ speakspell:7]>').speed(.9).hpf(600).delay(.5).delaytime(.23).delayfeedback(.6).room(.4).roomsize(3).gain(.4)"
		}
	},
	{
		title: 'Bonfire Firmware',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').decay(.35).sustain(0).gain(.93)",
			hats: "stack(s('sh*16').gain(perlin.range(.15, .35).slow(2)), s('{~ ~ oh}%8').gain(.22)).bank('RolandTR808').pan(sine.range(.3, .7).slow(3))",
			perc: "s('lt(5,16), mt(7,16,3), {ht ~ ~ ht ~}%16, {~ cb ~}%8, perc(3,8,5)').bank('RolandTR808').speed('{1 1.12 .94 1.25}%16').pan('{.25 .75 .5}%16').gain(.37).room(arc.range(.15, .4)).roomsize(3).roomlp(4000).lastOf(8, x => x.ply(2))",
			bass: "stack(note('<e1 e1 e1 e1 e1 e1 g1 d1>').struct('[~ x]*4').s('sine').decay(.3).sustain(0).gain(.269), note('<e2 e2 e2 e2 e2 e2 g2 d2>').struct('[~ x]*4').s('sawtooth').hpf(160).lpf(sine.range(300, 900).slow(16)).noise(.06).decay(.12).sustain(0).gain(.09))",
			synth:
				"stack(note('<[e3,b3,d4,g4] [e3,a3,d4,f#4] [e3,b3,d4,g4] [e3,a3,c#4,f#4]>').s('supersaw').unison(5).detune(.2).spread(.8).attack(1.2).release(2).lpf(sine.range(500, 1600).slow(48)).gain(arc.range(.029, .071)), n('<[0 ~ 4 ~] ~ [~ 7 ~ 4] ~>').scale('E4:dorian').s('triangle').decay(.1).sustain(0).delay(.6).delaytime(.46).delayfeedback(.72).gain(.059)).room(.6).roomsize(7).roomlp(3000)",
			vox: "s('<~ ~ ~ ~ ~ ~ mouth:11 ~>').speed(.7).delay(.6).delaytime(.69).delayfeedback(.6).room(.7).roomsize(6).roomlp(3000).gain(.42)"
		}
	},
	{
		title: "Clockmaker's Nervous Breakdown",
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.25).sustain(0).gain(.9)",
			hats: "s('{hh hh oh}%16, hh(5,7)').bank('RolandTR909').gain(.28).pan('{.3 .7}%5')",
			perc: "s('{lt ~ ~ ~ mt}%16, {rim ~ ~ ~ ~ ~ ~}%16, {~ ~ ht ~ ~ ~ ~ ~ ~ ~ ~}%16').bank('RolandTR909').speed('{1 .9 1.1}%9').gain(.36).room(.3).roomsize(3)",
			bass: "stack(note('{~ ab0 ab0 ~ ~ ab0 ~ eb1 ~}%16').s('sine').decay(.2).sustain(0).gain(.75), note('{~ ab1 ab1 ~ ~ ab1 ~ eb2 ~}%16').s('sawtooth').ftype('ladder').lpf(sine.range(250, 800).slow(27)).lpq(12).hpf(150).decay(.1).sustain(0).gain(.3))",
			synth:
				"stack(n('{0 2 4 7 4}%16').scale('Ab3:minor').s('pulse').pw(sine.range(.2, .7).slow(13)).lpf(perlin.range(700, 2600).slow(11)).decay(.1).sustain(0).gain(arc.range(.08, .14)), n('{9 ~ ~ 11 ~ ~ 8}%12').scale('Ab4:minor').s('sine').fm(2.5).fmh(1.83).fmdecay(.15).decay(.2).sustain(0).pan(sine.slow(17)).gain(arc.range(.04, .08))).delay(.45).delaytime(.35).delayfeedback(.68).room(.4).roomsize(6).roomlp(3000)",
			vox: "s('<~ ~ ~ ~ diphone:7 ~ ~>').speed(.8).delay(.6).delaytime(.52).delayfeedback(.65).room(.7).roomsize(7).roomlp(3000).pan(.3).gain(.45)"
		}
	}
];
