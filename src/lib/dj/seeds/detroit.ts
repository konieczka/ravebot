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
	},
	{
		title: 'Strings Of Overtime',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.3).gain(.95)",
			hats: "stack(s('hh*16').gain(arc.range(.12, .3)), s('[~ oh]*4').gain(.35), s('<cr ~ ~ ~ ~ ~ ~ ~>').gain(.3)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd').bank('RolandTR808').gain(.45).lastOf(4, x => x.ply(2))",
			bass: "note('<[[~ e1] [~ e2 ~ e1] [~ e1] [~ d2 e2 ~]] [[~ c2] [~ c1 ~ c2] [~ c2] [~ g1 b1 ~]] [[~ a1] [~ a2 ~ a1] [~ a1] [~ g2 a2 ~]] [[~ b1] [~ b2 ~ b1] [~ f#1] [~ a1 b1 ~]]>').s('sawtooth').lpf(arc.range(300, 900)).lpenv(3).lpa(.005).lpd(.15).decay(.18).sustain(0).gain(.6)",
			synth:
				"note('<[g3,b3,d4,f#4] [g3,b3,d4,e4] [g3,c4,e4,a4] [f#3,a3,b3,d#4]>').struct('<[x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~] [x ~ ~ x ~ ~ x ~ x ~ ~ x ~ x ~ ~]>').s('supersaw').unison(5).detune(.2).spread(.7).attack(.005).decay(.16).sustain(0).lpf(arc.range(1200, 4500)).room(.4).roomsize(2).gain(.17).lastOf(8, x => x.ply(2))",
			vox: "note('<~ ~ [b4 ~ a4 g4] ~ ~ ~ [e5 ~ d5 ~ b4 ~ ~ ~] ~>').s('pulse').pw(.4).vowel('<o a>').attack(.02).release(.5).lpf(2600).delay(.4).delaytime(.357).delayfeedback(.45).room(.5).gain(.16)"
		}
	},
	{
		title: 'Local 500 Electrofunk',
		layers: {
			kick: "s('<[bd ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ ~ ~ ~ ~] [bd ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ ~ ~ ~ ~] [bd ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ ~ ~ ~ ~] [bd ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ bd ~ bd bd]>').bank('RolandTR808').decay(.4).gain(.95)",
			hats: "stack(s('hh*16').gain('[.35 .15 .25 .15]*4'), s('~ ~ ~ ~ ~ ~ oh ~ ~ ~ ~ ~ ~ ~ oh ~').gain(.3)).bank('RolandTR808')",
			perc: "s('~ cp ~ cp, [~ cb] ~ [~ cb] [cb ~], ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ <~ sd>').bank('RolandTR808').gain(.42).room(.2)",
			bass: "note('<[d2 ~ d2 d3 ~ ~ d2 ~ ~ ~ f2 ~ d2 ~ c3 ~] [d2 ~ d2 d3 ~ ~ d2 ~ ~ ~ a1 ~ c2 ~ c3 ~]>').s('pulse').pw(sine.range(.25, .6).slow(8)).lpf(arc.range(400, 1400)).lpenv(2).lpd(.1).decay(.15).sustain(0).gain(.6)",
			synth:
				"n('<[0 4 7 9 11 9 7 4]*2 [-1 2 4 7 9 7 4 2]*2>').scale('D4:minor').s('square').lpf(arc.range(900, 3200)).decay(.1).sustain(0).off(3/16, x => x.add(note(12)).lpf(4000).gain(.052)).pan(sine.slow(4)).delay(.3).delaytime(.357).delayfeedback(.4).gain(.091)",
			vox: "s('<speakspell:3 ~ ~ ~ [~ speakspell:7] ~ ~ ~>').speed('<1 .9>').delay(.3).delaytime(.238).delayfeedback(.45).room(.3).gain(.353)"
		}
	},
	{
		title: 'Resistance Is Fertile',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').gain(.95)",
			hats: "stack(s('[rd ~ rd rd]*2').gain(arc.range(.15, .3)), s('[~ oh]*4').gain(.3), s('hh*16').gain(.1)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ rim ~ ~ ~ ~ rim ~ ~ ~ ~ rim ~ ~ ~, <~ ~ ~ [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd sd sd]>').bank('RolandTR808').gain(.42)",
			bass: "note('[~ 0 ~ 12] [~ 0 7 ~] [~ 0 ~ 12] [~ 7 12 ~]').add(note('<35 28 33 38 31 37 30 30>')).s('sawtooth').ftype('ladder').lpf(arc.range(300, 900)).lpq(6).lpenv(2).lpd(.12).decay(.2).sustain(0).gain(.6)",
			synth:
				"stack(note('<[d4,f#4,a4,c#5] [d4,f#4,g4,b4] [c#4,f#4,g4,b4] [c#4,e4,f#4,a4] [b3,d4,f#4,a4] [b3,c#4,e4,g4] [b3,c#4,e4,f#4] [a#3,c#4,e4,g4]>').struct('[x ~ ~ x] [~ ~ x ~] [~ x ~ ~] [x ~ ~ ~]').s('sawtooth').attack(.01).decay(.3).sustain(.4).lpf(2200).gain(.13), note('<[f#5@3 e5] [d5@2 b4 d5] [e5@3 c#5] a4 [b4@2 d5 f#5] [g5@3 f#5] [e5@2 c#5 e5] f#5>').s('sawtooth').vib(5).vibmod(.15).attack(.03).release(.3).lpf(arc.range(1500, 4000)).delay(.3).gain(arc.range(.06, .13))).room(.5)",
			vox: "s('<~ ~ ~ space:9 ~ ~ ~ ~ ~ ~ ~ space:14 ~ ~ ~ ~>').speed(.85).delay(.5).delaytime(.476).delayfeedback(.6).room(.6).roomsize(5).gain(.4)"
		}
	},
	{
		title: 'Planet Of The Pads',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(2500).decay(.4).gain(.95)",
			hats: "stack(s('sh*16').gain(perlin.range(.1, .25)), s('[~ oh]*4').gain(.3)).bank('RolandTR808')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim ~ ~ ~ ~ ~, mt(3,8,3)').bank('RolandTR808').room(.4).roomsize(3).gain(.4)",
			bass: "stack(note('<c#2 f#1 a1 b1>').slow(2).struct('[~ x] [~ x] [~ x x] [~ x]').s('sine').decay(.25).sustain(0).gain(.274), note('<c#3 f#2 a2 b2>').slow(2).struct('[~ ~ ~ x] ~ [~ x ~ ~] ~').s('sawtooth').hpf(200).lpf(arc.range(500, 1500)).decay(.12).sustain(0).gain(.16))",
			synth:
				"stack(note('<[e3,g#3,b3,d#4] [e3,g#3,a#3,c#4] [e3,g#3,a3,c#4] [d#3,f#3,b3,c#4]>').slow(2).s('supersaw').unison(7).detune(.15).spread(.9).attack(.5).release(2).lpf(sine.range(500, 3000).slow(32)).lpq(3).gain(arc.range(.061, .138)), n('[0 2 4 6]*4').scale('C#4:dorian').s('triangle').fm(1).decay(.12).sustain(0).lpf(arc.range(800, 3500)).delay(.4).delaytime(.357).gain(arc.range(0, .077))).room(.7).roomsize(6).roomfade(4)",
			vox: "note('<~ ~ [e5@2 d#5 c#5] ~ ~ ~ [b4@3 c#5] ~>').s('triangle').vowel('o').attack(.3).release(1.5).delay(.4).delayfeedback(.6).room(.8).roomsize(6).gain(.18)"
		}
	},
	{
		title: 'Aquabahn Commuter',
		layers: {
			kick: "s('<[bd ~ ~ ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ ~ ~] [bd ~ ~ ~ ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ ~]>').bank('RolandTR808').decay(.6).gain(.95)",
			hats: "stack(s('hh*16').gain(perlin.range(.12, .35)), s('[~ ~ oh ~]*2').gain(.25)).bank('RolandTR808').sometimesBy(.2, x => x.speed(1.4))",
			perc: "s('~ sd ~ sd, [~ lt] [~ ~ mt ~] ~ [ht ~ ~ lt]').bank('RolandTR808').gain(.42).room(.3)",
			bass: "n('<[0 ~ 0 7 ~ 0 ~ 3 ~ 0 ~ 10 ~ 7 ~ 5] [0 ~ 0 7 ~ 0 ~ 3 ~ ~ 0 ~ 12 ~ 10 7]>').scale('Ab1:minor').s('pulse').pw(.3).ftype('ladder').lpf(arc.range(250, 900)).lpq(14).lpenv(3).lpd(.1).drive(.8).decay(.14).sustain(0).gain(.6)",
			synth:
				"stack(n('<[0 ~ 2 ~ 3 ~ ~ 2] [~ 4 ~ 3 ~ 2 0 ~] [0 ~ 2 ~ 3 ~ 7 ~] [6 ~ 4 ~ 3 2 ~ ~]>').scale('Ab3:minor').s('triangle').vib(4).vibmod(.2).attack(.01).decay(.3).sustain(.3).release(.4).lpf(2200).delay(.4).delaytime(.357).delayfeedback(.55).gain(.074), n('{0 7 4 9 2}%16').scale('Ab4:minor').s('sine').fm(perlin.range(2, 8)).fmh(3.5).fmdecay(.06).penv(12).pdecay(.04).decay(.07).sustain(0).degradeBy(arc.range(.6, .2)).pan(rand).delay(.3).gain(.046)).room(.5).roomsize(4).roomlp(4000)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ numbers:7 ~ ~ ~ ~ ~ ~ ~ [numbers:4 ~ numbers:2 ~]>').speed(.7).lpf(1800).phaser(.5).delay(.45).delayfeedback(.55).room(.6).gain(.45)"
		}
	},
	{
		title: 'Rhodes Less Travelled',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.25).gain(.95).lastOf(8, x => x.mask('1 1 [1 0] 0'))",
			hats: "stack(s('hh*16').gain('[.3 .12 .22 .14]*4').sometimesBy(.1, x => x.ply(2)), s('<[~ oh]*2 [~ oh ~ [oh oh]]>').gain(.28)).bank('RolandTR909')",
			perc: "stack(s('~ cp ~ cp').gain(.45), s('[~ lt] [mt ~ lt ~] [~ ~ ht ~] [lt ~ mt mt]').speed(1.6).gain(.38)).bank('RolandTR808')",
			bass: "n('[~ 0 ~ 7] [~ ~ 0 4] [~ 7 ~ 0] [~ ~ 6 4]').add(n('<0 3 -1 2>')).scale('F1:dorian').s('sawtooth').lpf(arc.range(300, 1000)).lpenv(3).lpa(.005).lpd(.1).lpq(6).decay(.15).sustain(0).gain(.6)",
			synth:
				"note('<[ab3,c4,eb4,g4] [ab3,c4,d4,g4] [g3,bb3,d4,f4] [g3,c4,eb4,ab4]>').struct('<[x ~ ~ x ~ ~ x ~ ~ ~ x ~ ~ ~ ~ ~] [~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~ ~]>').s('sine').fm(1.5).fmh(1).fmdecay(.4).fmsustain(.1).decay(.6).sustain(.2).release(.4).pan(sine.range(.3, .7).slow(2)).room(.4).gain(.137)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speakspell:10 ~ ~ ~ ~ ~ ~ ~ [speakspell:1 ~ speakspell:5 ~]>').delay(.375).delaytime(.357).delayfeedback(.4).room(.4).gain(.4)"
		}
	}
];
