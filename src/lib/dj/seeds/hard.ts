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
	}
];
