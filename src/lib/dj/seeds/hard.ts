import type { Seed } from './types';

export const HARD: Seed[] = [
	{
		title: 'Concrete Cathedral',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).gain(.9)",
			hats: "s('hh*16').bank('RolandTR909').gain('.4 .25 .3 .25').hpf(7000).degradeBy(arc.range(.5, 0))",
			perc: "s('~ cp ~ cp').bank('RolandTR909').room(.5).shape(.3).gain(.45).lastOf(4, x => x.ply(2))",
			bass: "note('[~ c1 c1 c1]*4').s('sawtooth').lpf(arc.range(160, 420)).decay(.09).sustain(0).shape(.5).gain(.6)",
			synth:
				"note('<[c3,g3,c4] ~ ~ [c3,f3,c4]>').s('square').lpf(1200).decay(.15).sustain(0).room(.6).crush('<16 8>').gain(.2)",
			vox: "s('<industrial:0 ~ ~ ~ metal:3 ~ ~ ~>').speed(.7).room(.6).delay(.3).gain(.6)"
		}
	},
	{
		title: 'Rave Bunker 3AM',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.7)",
			hats: "s('[~ oh]*4, hh*8').bank('RolandTR909').gain(arc.range(.25, .45))",
			perc: "s('rim(5,16), ~ cp').bank('RolandTR909').gain(.4).room(.4)",
			bass: "note('[~ f1 f1 f1]*4').s('sawtooth').lpf(sine.range(160, 320).slow(8)).decay(.08).sustain(0).shape(.4).gain(.6)",
			synth:
				"note('[~ f3] [~ f3] [~ ab3] [~ f3]').s('supersaw').lpf(arc.range(600, 3000)).decay(.12).sustain(0).room(.4).gain(.16)",
			vox: "s('<rave:5 ~ ~ ~ ~ ~ ~ ~ rave:0 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.4)"
		}
	},
	{
		title: 'Steel Pressure',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.65).lastOf(8, x => x.struct('x x x [x x]'))",
			hats: "s('hh*16').bank('RolandTR909').gain(perlin.range(.2, .45)).hpf(6000).pan(sine.slow(2))",
			perc: "s('[~ cp]*2, mt(3,8,1)').bank('RolandTR909').gain(.4).room(.45).shape(.4)",
			bass: "note('[~ d1 d2 d1]*4').s('sawtooth').lpf(arc.range(180, 500)).lpq(4).decay(.08).sustain(0).shape(.5).gain(.55)",
			synth:
				"s('white*16').hpf(saw.range(3000, 9000).slow(8)).decay(.04).sustain(0).gain(arc.range(.02, .07))",
			vox: "s('<numbers:1 ~ numbers:2 ~ numbers:3 ~ numbers:4 ~>').speed(.9).room(.5).delay(.3).gain(.55)"
		}
	},
	{
		title: 'Forklift Ballet',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.7).gain(.95).lastOf(8, x => x.struct('x x x [x x x x]'))",
			hats: "s('[~ oh]*4, hh*16').bank('RolandTR909').gain('[.35 .2 .28 .2]*4').hpf(6500).swingBy(1/6, 8)",
			perc: "s('~ cp ~ [cp cp], ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim ~').bank('RolandTR909').gain(.4).room(.5).shape(.35)",
			bass: "note('[~ e1 e1 [e1 f1]]*4').s('sawtooth').lpf(arc.range(170, 480)).lpq(5).decay(.08).sustain(0).shape(.55).gain(.55)",
			synth:
				"note('<[e3,b3,e4] ~ [f3,c4,f4] ~>').struct('x ~ ~ x ~ ~ x ~ ~ ~ ~ ~ ~ ~ ~ ~').s('square').lpf(arc.range(700, 2600)).decay(.12).sustain(0).room(.5).crush(10).gain(.2)",
			vox: "s('<~ stab:7 ~ ~ ~ stab:7 ~ rave:2>').speed(.84).struct('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~').room(.5).delay(.35).gain(.5)"
		}
	},
	{
		title: 'Grinder Polymeter',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.65).distort(.4).gain(.9)",
			hats: "s('{hh hh oh hh ~}%16').bank('RolandTR909').gain(perlin.range(.22, .5)).hpf(6000).degradeBy(arc.range(.4, 0))",
			perc: "s('{~ cp ~ ~ rim ~ ~}%16, ~ cp').bank('RolandTR909').gain(.4).room(.4).shape(.3)",
			bass: "note('{~ g1 g1 bb1 ~ g1 g2}%16').s('sawtooth').lpf(sine.range(180, 520).slow(16)).lpq(6).decay(.07).sustain(0).shape(.5).gain(.55)",
			synth:
				"note('{g3 bb3 d4 f4 c4}%8').s('sawtooth').lpf(arc.range(500, 2800)).lpq(8).decay(.1).sustain(0).delay(.3).delayfeedback(.4).pan(sine.slow(4)).gain(.16)",
			vox: "s('<metal:5 ~ ~ ~ ~ ~ ~ ~ noise2:3 ~ ~ ~ ~ ~ ~ ~>').speed(.6).room(.6).delay(.4).gain(.5)"
		}
	},
	{
		title: 'Schranz Tax Return',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.8).lpf(3500).gain(.95)",
			hats: "s('rd*16, [~ oh]*4').bank('RolandTR909').gain('[.3 .18 .22 .18]*4').hpf(5000).sometimesBy(.08, x => x.speed(1.3))",
			perc: "s('lt(3,8), ht(3,8,2), ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~ ~ ~').bank('RolandTR909').gain(.36).shape(.4).room(.3).lastOf(4, x => x.ply(2))",
			bass: "note('[~ a0 a0 a0]*4').s('sine').room(.4).size(.6).lpf(arc.range(120, 260)).shape(.7).decay(.1).sustain(0).gain(.75)",
			synth:
				"note('[a2 a2 [a2 c3] a2]*4').s('sawtooth').hpf(400).lpf(arc.range(400, 1800)).distort(.5).decay(.05).sustain(0).gain(arc.range(.08, .2))",
			vox: "s('<numbers:4 ~ numbers:3 ~ numbers:2 ~ numbers:1 ~>').speed(.85).room(.5).delay(.3).hpf(300).gain(.5)"
		}
	},
	{
		title: 'Hoover Detention',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).gain(.9).lastOf(16, x => x.ply(2))",
			hats: "s('hh*8, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ hh').bank('RolandTR909').gain(arc.range(.25, .45)).hpf(7000)",
			perc: "s('~ cp ~ cp, sd(2,16,7)').bank('RolandTR909').gain(.42).room(arc.range(.2, .6)).shape(.3)",
			bass: "note('<bb0 bb0 gb0 ab0>').struct('[~ x x x]*4').s('sawtooth').lpf(arc.range(160, 400)).decay(.09).sustain(0).shape(.5).gain(.6)",
			synth:
				"note('<[bb2,db3,f3] [bb2,db3,f3] [gb2,bb2,db3] [ab2,c3,eb3]>').struct('x ~ ~ ~ x ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~').s('supersaw').lpf(sine.range(800, 2400).slow(32)).decay(.2).sustain(0).room(.6).gain(.18)",
			vox: "s('<hoover:1 ~ ~ ~ ~ ~ ~ ~ hoover:4 ~ ~ ~ ~ ~ ~ ~>').speed(.94).lpf(4000).room(.5).delay(.25).gain(.45)"
		}
	},
	{
		title: 'Angle Grinder Lullaby',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.7).gain(.95)",
			hats: "s('hh*16').bank('RolandTR909').gain('[.4 .2 .25 .2]*4').hpf(6500).pan(sine.slow(3)).lastOf(8, x => x.fast(2))",
			perc: "s('~ cp ~ cp, ~ ~ rim ~ ~ rim ~ ~').bank('RolandTR909').gain(.38).room(.45)",
			bass: "note('[~ f#1 f#1 f#1]*4').s('sawtooth').lpf(arc.range(180, 450)).decay(.08).sustain(0).shape(.45).gain(.55)",
			synth:
				"n('0 2 4 7 9 7 4 2 0 4 7 11 7 4 2 4').scale('F#3:minor').s('square').lpf(sine.range(600, 3000).slow(16)).lpq(6).decay(.08).sustain(0).delay(.3).delayfeedback(.35).degradeBy(arc.range(.5, 0)).gain(.14)",
			vox: "s('<~ ~ ~ ~ industrial:12 ~ ~ ~>').speed(.75).room(.6).delay(.35).gain(.5)"
		}
	},
	{
		title: 'Broken Euclid Machine',
		layers: {
			kick: "s('bd*4, bd(3,16,14)').bank('RolandTR909').shape(.6).gain('.95 .6').lpf(4000)",
			hats: "s('hh(11,16,3), oh(3,8,2)').bank('RolandTR909').gain(rand.range(.2, .45)).hpf(6000)",
			perc: "s('cp(3,8,4), rim(5,13), mt(2,7,1)').bank('RolandTR909').gain(.36).room(.4).shape(.3).lastOf(8, x => x.rev())",
			bass: "note('eb1(5,16,2)').s('sawtooth').lpf(arc.range(200, 550)).lpq(6).decay(.08).sustain(0).shape(.5).gain(.55)",
			synth:
				"note('[eb3,gb3,bb3](3,8,1)').s('sawtooth').lpf(arc.range(600, 2200)).decay(.1).sustain(0).room(.5).iter(4).gain(.16)",
			vox: "note('<eb4 ~ ~ ~ ~ ~ gb4 ~>').s('sawtooth').vowel('<a o>').lpf(2000).decay(.3).sustain(0).room(.5).delay(.3).gain(.4)"
		}
	},
	{
		title: 'Tin Roof Tantrum',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.65).lpf(3000).gain(.92).lastOf(8, x => x.struct('x x x [x ~ x x]'))",
			hats: "s('hh*16, [~ oh]*4').bank('RolandTR909').gain('[.42 .2 .3 .22]*4').hpf(6500).crush(arc.range(12, 7))",
			perc: "s('lt(5,16,2), mt(3,16,5), ht(3,8,1), ~ cp ~ cp').bank('RolandTR909').gain(.38).shape(.45).room(.25).lastOf(4, x => x.fast(2))",
			bass: "note('[~ g1 g1 g1]*4').s('sawtooth').ftype('ladder').lpf(arc.range(200, 600)).lpq(8).drive(.8).decay(.08).sustain(0).gain(1.085)",
			synth:
				"note('<[g2 ~ g2 g2] [~ g2 bb2 ~]>').fast(4).s('square').fm(3).fmh(1.41).fmdecay(.06).fmsustain(0).hpf(600).lpf(arc.range(1200, 4000)).distort(.4).decay(.07).sustain(0).gain(arc.range(.12, .2))",
			vox: "s('<industrial:7 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ metal:2 ~ ~ ~>').speed(.8).hpf(250).room(.5).delay(.3).delayfeedback(.45).gain(.5)"
		}
	},
	{
		title: 'Ear Plug Shortage',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').shape(.55).distort(.3).lpf(2500).gain(.9)",
			hats: "s('rd*8, hh*16').bank('RolandTR909').gain('[.32 .18 .26 .18]*4').hpf(6000).degradeBy(arc.range(.4, 0))",
			perc: "s('~ cp ~ cp, sd(3,16,9), cb(2,8,3)').bank('RolandTR808').crush(6).coarse('<1 1 4 8>').room(.5).roomsize(3).gain(.4)",
			bass: "note('[~ c#1 c#1 c#1]*4').s('sine').fm('<2 2 3 4>').fmh(2).fmwave('square').fmdecay(.05).fmsustain(.1).lpf(arc.range(300, 900)).decay(.09).sustain(0).shape(.4).gain(.406)",
			synth:
				"stack(s('white*8').hpf(sine.range(2000, 8000).slow(16)).crush(5).decay(.06).sustain(0).gain(arc.range(.013, .031)), note('c#3 ~ ~ ~ ~ ~ c#3 ~ ~ ~ ~ ~ <e3 d3> ~ ~ ~').s('triangle').fm(6).fmh(3.5).fmdecay(.2).decay(.3).sustain(0).hpf(300).room(.6).roomsize(4).roomlp(3000).gain(.07))",
			vox: "s('<~ ~ ~ ~ speech:3 ~ ~ ~>').speed(.7).hpf(200).delay(.5).delaytime(.3).delayfeedback(.65).room(.4).gain(.5)"
		}
	},
	{
		title: 'Euphoria Has a Dress Code',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).lpf(arc.range(2500, 5000)).gain(.92)",
			hats: "s('[~ oh]*4, hh*16').bank('RolandTR909').gain('[.3 .18 .24 .18]*4').hpf(7000).lastOf(4, x => x.ply(2))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~ sd sd').bank('RolandTR909').room(.5).roomsize(2).crush(10).gain(.4)",
			bass: "note('<d1 bb0 f1 c1>').struct('[~ x x x]*4').s('sawtooth').ftype('ladder').lpf(arc.range(180, 450)).lpq(6).drive(1).decay(.08).sustain(0).gain(.892)",
			synth:
				"stack(note('<[d3,f3,a3,d4] [bb2,d3,f3,bb3] [f3,a3,c4,f4] [c3,e3,g3,c4]>').struct('x ~ ~ x ~ ~ x ~ ~ ~ x ~ x ~ ~ ~').s('supersaw').unison(5).detune(.3).spread(.8).lpf(arc.range(900, 4000)).decay(.25).sustain(.1).release(.1).room(.5).roomsize(3).gain(.103), s('white*16').hpf(saw.range(2000, 10000).slow(8)).decay(.05).sustain(0).gain(arc.range(0, .032)))",
			vox: "s('<rave:3 ~ ~ ~ ~ ~ ~ ~ hoover:0 ~ ~ ~ ~ ~ ~ ~>').speed(.89).room(.5).delay(.3).delayfeedback(.4).gain(.5)"
		}
	},
	{
		title: 'Squelch Before Sentencing',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.55).distort(.25).gain(.9)",
			hats: "s('hh*16').bank('RolandTR909').gain('[.38 .2 .28 .2]*4').hpf(arc.range(8000, 5000)).pan(sine.slow(4))",
			perc: "s('~ cp ~ cp, rim(3,8,2)').bank('RolandTR909').room(.4).shape(.3).gain(.4).lastOf(8, x => x.ply(2))",
			bass: "note('[~ a1 a1 a1]*4').s('pulse').pw(.3).lpf(arc.range(160, 400)).decay(.07).sustain(0).shape(.45).gain(.55)",
			synth:
				"note('<[a2 a2 a3 a2 c3 a2 e3 a2 a2 g3 a2 a2 c3 a2 a3 e3] [a2 a2 a3 a2 c3 a2 e3 a2 a2 g3 a2 a2 g2 a2 a3 c3]>').s('sawtooth').ftype('ladder').lpf(sine.range(300, 1400).slow(16)).lpq(arc.range(10, 22)).lpenv(3).lpa(.005).lpd(.12).drive(1.2).decay(.12).sustain(0).delay(.2).delaytime(.3).gain(.16)",
			vox: "s('<~ ~ ~ ~ speakspell:4 ~ ~ ~>').speed(.85).hpf(300).delay(.4).delaytime(.3).delayfeedback(.55).room(.4).gain(.5)"
		}
	},
	{
		title: 'Sweatbox Sermon',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.6).lpf(3800).gain(.92).lastOf(8, x => x.struct('x x x [~ x x x]'))",
			hats: "s('hh*16, [~ oh]*4, sh(5,16,3)').bank('RolandTR808').gain(perlin.range(.22, .42)).hpf(5500)",
			perc: "s('cb(5,16,3), ~ cp ~ [cp ~ ~ cp], lt(3,16,2), ht(2,16,11)').bank('RolandTR808').gain(.4).room(.3).shape(.3).swingBy(1/12, 8).lastOf(4, x => x.rev())",
			bass: "note('[~ e1 e1 g1] [~ e1 e2 e1] [~ e1 e1 a1] [~ e1 d2 e1]').s('sawtooth').lpf(arc.range(200, 520)).lpq(5).decay(.08).sustain(0).shape(.5).gain(.55)",
			synth:
				"note('<[e3,g3,b3] [e3,g3,b3] [d3,g3,b3] [e3,a3,c4]>').struct('~ ~ x ~ ~ x ~ ~ ~ ~ x ~ ~ ~ ~ x').s('pulse').pw(sine.range(.2, .6).slow(8)).lpf(arc.range(800, 2800)).lpenv(2).lpd(.1).decay(.1).sustain(0).phaser(1).gain(.16)",
			vox: "s('<[rave:4 ~ rave:4 ~] ~ ~ ~ ~ ~ ~ ~ rave:5 ~ ~ ~ ~ ~ ~ ~>').room(.35).delay(.25).delaytime(.2).gain(.55)"
		}
	},
	{
		title: 'Arpeggiator Anger Management',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').shape(.7).decay(.25).sustain(0).gain(.9)",
			hats: "s('hh*16, [~ oh]*4').bank('RolandTR909').gain('[.35 .18 .25 .2]*4').hpf(6500).sometimesBy(.1, x => x.speed(1.5))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ [mt ht]').bank('RolandTR909').room(.45).roomsize(2).shape(.3).gain(.4)",
			bass: "stack(note('<b1 g1 d1 a1>').struct('[~ x]*4').s('sine').decay(.15).sustain(0), note('<b1 g1 d2 a1>').struct('[~ x]*4').s('sawtooth').hpf(200).lpf(arc.range(600, 1600)).decay(.1).sustain(0)).shape(.4).gain(.334)",
			synth:
				"note('<[b3 d4 f#4 b4 d5 b4 f#4 d4]*2 [g3 b3 d4 g4 b4 g4 d4 b3]*2 [d4 f#4 a4 d5 f#5 d5 a4 f#4]*2 [a3 c#4 e4 a4 c#5 a4 e4 c#4]*2>').s('supersaw').unison(7).detune(.2).spread(1).lpf(arc.range(800, 5000)).lpenv(2).lpd(.15).decay(.15).sustain(0).off(3/16, x => x.add(note(12)).gain(.035)).delay(.35).delaytime(.3).delayfeedback(.5).gain(.076)",
			vox: "note('<f#4 ~ ~ ~ d4 ~ ~ ~ e4 ~ ~ ~ c#4 ~ ~ ~>').s('pulse').pw(.4).vowel('<o a>').vib(5).vibmod(.2).attack(.05).decay(.6).sustain(0).room(.6).roomsize(5).delay(.3).delaytime(.3).delayfeedback(.5).gain(.4)"
		}
	}
];
