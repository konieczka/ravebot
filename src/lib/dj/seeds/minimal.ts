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
	},
	{
		title: 'Ladder to Nowhere',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.35).sustain(0).gain(.95)",
			hats: "stack(s('[~ hh]*4').gain(.4), s('hh*16').gain(sine.range(.06, .2).slow(16)).degradeBy(arc.range(.7, .2)).pan(sine.range(.35, .65).slow(8))).bank('RolandTR909').hpf(7000)",
			perc: "s('~ ~ ~ rim ~ ~ ~ ~ ~ ~ rim ~ ~ ~ ~ ~, <~ ~ ~ [~ ~ ~ cp]>').bank('RolandTR909').gain(.4).room(arc.range(.3, .6)).roomsize(6).roomlp(2500).pan(perlin.range(.3, .7).slow(4))",
			bass: "note('[c2 c2 c3 c2]*4').add(note('<0 0 0 0 0 0 3 -2>')).s('sawtooth').ftype('ladder').lpf(arc.range(180, 1400).add(perlin.range(0, 250).slow(8))).lpq(14).drive(.6).lpenv(arc.range(1, 3)).lpd(.1).decay(.14).sustain(0).degradeBy(.12).gain(.7)",
			synth:
				"note('<[~ ~ g4 ~] ~ [~ ~ eb4 ~] ~ [~ ~ g4 ~] ~ [~ ~ bb4 ~] [~ c5 ~ ~]>').s('sine').fm(arc.range(.5, 3)).fmh(2).fmdecay(.1).fmsustain(0).decay(.4).sustain(0).delay(.45).delaytime(.352).delayfeedback(.6).room(.6).roomsize(7).roomlp(2000).pan(sine.slow(16)).gain(.22)",
			vox: "note('<c3 ~ ~ ~ ~ ~ ~ ~ eb3 ~ ~ ~ ~ ~ ~ ~>').s('sawtooth').vowel('o').lpf(900).attack(.2).decay(1.2).sustain(0).room(.7).roomsize(6).delay(.5).delayfeedback(.55).gain(.26)"
		}
	},
	{
		title: 'Humidity Is a Rumour',
		layers: {
			kick: "s('bd*4, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ <~ ~ ~ bd> ~').bank('RolandTR808').lpf(2000).gain(.9)",
			hats: "stack(s('sh*16').gain(perlin.range(.15, .4)).pan(sine.range(.3, .7).slow(6)), s('{~ hh ~ ~ oh}%16').gain(.3).degradeBy(arc.range(.4, .1))).bank('RolandTR808')",
			perc: "stack(s('{rim ~ ~ rim ~ ~ rim ~ ~ ~}%16').speed('<1 1.12 .94 1.06>').gain(.4), s('lt(5,12,2), mt(3,11,4)').speed(perlin.range(.8, 1.3).slow(8)).gain(.36).pan(perlin.range(.2, .8)), s('cb(2,13,5)').speed(1.5).gain(.3)).bank('RolandTR808').room(.25).roomsize(2).sometimesBy(.08, x => x.ply(2))",
			bass: "n('{0 ~ ~ 0 ~ 4 ~ ~ 2 ~ 0 ~ ~ 6 ~}%16').scale('G1:dorian').s('triangle').lpf(250).lpenv(3).lpa(.005).lpd(.09).decay(.2).sustain(0).noise(.04).gain(.291)",
			synth:
				"n('<[~ 4 ~ ~ 2 ~ ~ ~] [~ ~ 6 ~ ~ 4 ~ 9] [~ 4 ~ ~ 2 ~ 5 ~] [~ ~ ~ 1 ~ ~ 4 ~]>').scale('G4:dorian').s('sine').fm(2.5).fmh(3.5).fmwave('triangle').fmdecay(.05).fmsustain(0).decay(.12).sustain(0).pan(perlin.range(.2, .8).slow(4)).room(.3).delay(.25).delaytime(.234).delayfeedback(.35).gain(.137).off(3/16, x => x.add(note(7)).gain(.075))",
			vox: "s('<~ ~ ~ mouth:4 ~ ~ ~ [~ ~ mouth:11 ~]>').speed('<.9 1.3>').hpf(400).delay(.6).delaytime(.234).delayfeedback(.65).room(.4).pan(perlin.range(.2, .8)).gain(.5)"
		}
	},
	{
		title: 'Nation of One Chord',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(4000).gain(.95)",
			hats: "stack(s('hh*16').gain('[.22 .14 .32 .14]*4'), s('[~ oh]*4').gain(arc.range(.15, .35)).decay(.12)).bank('RolandTR909').hpf(5000).lastOf(8, x => x.ply(2))",
			perc: "s('~ cp ~ cp, rim(3,8,3)').bank('RolandTR909').gain(.4).room(.15).lastOf(4, x => x.off(1/16, y => y.speed(1.3).gain(.2)))",
			bass: "note('[~ d2 d2 ~] [~ d2 ~ d3] [~ d2 d2 ~] [~ <d2 f2 c2 a1> ~ d2]').s('pulse').pw(sine.range(.3, .6).slow(16)).ftype('ladder').lpf(arc.range(300, 900)).lpq(6).decay(.1).sustain(0).gain(.6)",
			synth:
				"note('[d3,f3,a3,c4]').struct('[~ x]*4').s('sawtooth').hpf(250).lpf(arc.range(800, 2800)).lpenv(2).lpa(.005).lpd(.1).decay(.13).sustain(0).delay(.45).delaytime(.352).delayfeedback(.5).pan(sine.range(.4, .6).slow(8)).lastOf(8, x => x.ply(2)).gain(.18)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ numbers:1>').speed(.8).hpf(300).delay(.5).delaytime(.352).delayfeedback(.6).room(.5).gain(.55)"
		}
	},
	{
		title: 'Bagel Cut-Up Theory',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').gain(.92)",
			hats: "s('hh*16').bank('RolandTR707').gain(perlin.range(.15, .4)).hpf(8000).sometimesBy(.15, x => x.ply(3)).degradeBy(.2).pan(rand.range(.3, .7))",
			perc: "s('{rim ~ rim rim ~ ~ cp ~ rim}%16, ~ ~ ~ <~ ~ cb [~ cb]>').bank('RolandTR707').speed('<2 1.5 2.5 1.8>').crush(6).gain(.38).pan(perlin.range(.2, .8)).sometimesBy(.2, x => x.ply(2))",
			bass: "note('<[~ a1 ~ a1 ~ ~ a2 a1] [~ a1 ~ bb1 ~ ~ a1 ~] [~ a1 ~ a1 ~ e2 ~ ~] [~ a1 a1 ~ ~ g1 ~ a2]>').s('sine').penv(5).pdecay(.03).decay(.15).sustain(0).shape(.25).gain(.323)",
			synth:
				"stack(s('white(7,16,2)').decay(.015).sustain(0).hpf(perlin.range(3000, 9000)).coarse(8).pan(rand).gain(.18), n('<[0 ~ ~ 1] [~ 3 ~ ~] [~ ~ 0 ~] [4 ~ ~ 1]>*2').scale('A4:phrygian').s('pulse').pw(sine.range(.1, .5).slow(4)).decay(.05).sustain(0).ply('<1 1 2 1 1 3 1 2>').lpf(arc.range(900, 3500)).delay(.2).delaytime(.117).delayfeedback(.3).gain(.2))",
			vox: "s('<[speech:4 ~ ~ ~] ~ ~ ~ ~ ~ [~ ~ speakspell:7 ~] ~>').chop(6).degradeBy(.4).speed('<1 1.25 .8 1.5>').delay(.4).delaytime(.117).delayfeedback(.5).pan(rand).room(.3).gain(.55)"
		}
	},
	{
		title: 'Reverb Tax Return',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').lpf(1600).gain(.92)",
			hats: "stack(s('[~ hh]*4').gain(.3), s('{~ ~ hh}%16').gain(perlin.range(.1, .25)), s('rd*4').gain(arc.range(0, .15))).bank('RolandTR909').hpf(6000).delay(.15).delaytime(.352).delayfeedback(.4)",
			perc: "s('~ ~ ~ ~ rim ~ ~ ~ ~ ~ ~ ~ <rim [rim ~ ~ rim]> ~ ~ ~, ~ ~ ~ <~ ~ ~ [~ ~ ~ mt]>').bank('RolandTR909').gain(.4).room(arc.range(.2, .5)).roomsize(5).roomlp(1800).delay(.35).delaytime(.352).delayfeedback(.6)",
			bass: "note('[~ eb1 ~ ~] [~ eb1 ~ eb1] [~ ~ ~ eb2] [~ <gb1 db1 ab1 db1> ~ ~]').s('sine').noise(.03).lpf(300).decay(.35).sustain(0).shape(.2).gain(.263)",
			synth:
				"stack(n('<[~ 4 ~ ~] [~ ~ ~ 2] [~ 4 ~ ~] [~ ~ 6 ~] [~ 4 ~ ~] [~ ~ ~ 7] [~ 9 ~ ~] [~ ~ 6 ~]>').scale('Eb4:minor').s('pulse').pw(.25).decay(.09).sustain(0).lpf(perlin.range(900, 2400).slow(8)).pan(sine.slow(12)).gain(.2), note('<[eb3,gb3,bb3,db4] ~ [eb3,gb3,bb3,db4] [db3,f3,ab3,cb4]>').struct('[~ x ~ ~]').s('sawtooth').lpf(1200).decay(.15).sustain(0).gain(.14)).delay(arc.range(.35, .6)).delaytime(.352).delayfeedback(.72).room(.5).roomsize(7).roomlp(2200).roomfade(4)",
			vox: "s('<~ ~ ~ ~ bleep:3 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ space:6>').speed(.75).lpf(2500).delay(.7).delaytime(.528).delayfeedback(.7).room(.7).roomsize(7).gain(.297)"
		}
	},
	{
		title: 'Perlon Stockings',
		layers: {
			kick: "s('bd*4, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ <~ ~ ~ ~ ~ ~ ~ bd> ~ ~ ~ ~ ~').bank('RolandTR909').gain(.92)",
			hats: "stack(s('{hh hh ~ hh ~}%16').gain(perlin.range(.2, .42)), s('oh(3,8,2)').gain(.22).decay(.1)).bank('RolandTR808').pan(sine.range(.35, .65).slow(5))",
			perc: "s('{~ rim ~ ~ rim ~ cp}%16, {~ ~ cb ~ ~}%12').bank('RolandTR808').speed('<1 1 1.1 .95>').gain(.38).pan(perlin.range(.3, .7).slow(3)).sometimesBy(.1, x => x.late(1/32)).lastOf(4, x => x.iter(4))",
			bass: "n('{0 ~ 0 ~ ~ 7 ~ 0 ~ 3 ~ ~ 5}%16').scale('B1:dorian').s('sawtooth').ftype('ladder').lpf(220).lpenv(arc.range(2, 5)).lpa(.005).lpd(.11).lpq(10).drive(.4).decay(.16).sustain(0).gain(.72)",
			synth:
				"n('<[~ [2,4] ~ ~ ~ ~ [1,4] ~] [~ ~ ~ [2,6] ~ ~ ~ ~] [~ [2,4] ~ ~ ~ [4,6] ~ ~] [~ ~ [1,3] ~ ~ ~ [0,4] ~]>').scale('B3:dorian').s('pulse').pw(sine.range(.15, .5).slow(8)).lpf(arc.range(800, 3000)).lpenv(1.5).lpd(.07).decay(.1).sustain(0).delay(.3).delaytime(.234).delayfeedback(.4).pan(sine.range(.25, .75).slow(6)).gain(.2)",
			vox: "note('<~ ~ ~ [~ ~ ~ f#4] ~ ~ ~ [~ ~ d4 ~]>').s('square').vowel('e').lpf(2200).decay(.18).sustain(0).delay(.5).delaytime(.234).delayfeedback(.55).room(.4).pan(.7).gain(.25)"
		}
	}
];
