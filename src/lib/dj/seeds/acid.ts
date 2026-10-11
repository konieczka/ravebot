import type { Seed } from './types';

export const ACID: Seed[] = [
	{
		title: 'Squelch Protocol',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.2)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain(.25)).bank('RolandTR909').sometimesBy(arc.range(0, .3), x => x.speed(1.5))",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.25).lastOf(16, x => x.ply(4))",
			bass: "note('c2 c2 c3 c2 eb2 c2 g2 c3 c2 c2 bb2 c2 f2 c3 c2 g1').s('sawtooth').lpf(arc.range(300, 3200)).lpq(16).decay(.14).sustain(0).shape(.3).gain(.55).sometimesBy(.15, x => x.add(note(12)))",
			synth:
				"note('<[c4,eb4,g4] ~ ~ ~ [bb3,eb4,g4] ~ ~ ~>').s('sawtooth').lpf(arc.range(800, 3000)).decay(.25).sustain(0).room(.5).delay(.4).gain(.18)",
			vox: "s('<rave:0 ~ ~ ~ ~ ~ ~ ~>').gain(.6).room(.3).delay(.25)"
		}
	},
	{
		title: 'Lysergic Lunchbreak',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.25)",
			hats: "stack(s('hh*8').gain(.4), s('[~ oh]*4').gain(arc.range(0, .4))).bank('RolandTR909').sometimesBy(.15, x => x.speed(1.4))",
			perc: "s('~ ~ ~ rim, ~ cp, ~ ~ ~ ~ ~ ~ lt ~').bank('RolandTR909').gain(.45)",
			bass: "note('<[a1 a2 a1 a1 c2 a1 e2 a1] [a1 a2 g2 a1 a1 c3 a1 e2]>*2').s('sawtooth').lpf(arc.range(400, 3000)).lpq(perlin.range(12, 20)).decay(.12).sustain(0).gain(.5)",
			synth:
				"note('<[a4,c5,e5] ~ ~ ~>').s('sawtooth').lpf(2000).decay(.2).sustain(0).room(.5).delay(.3).gain(.18)",
			vox: "s('<~ ~ ~ ~ hoover:2 ~ ~ ~>').speed(.5).lpf(3000).room(.4).gain(.45)"
		}
	},
	{
		title: 'Acid Rain Dance',
		layers: {
			kick: "s('bd*4').bank('RolandTR909')",
			hats: "s('hh*16').bank('RolandTR909').gain('.5 .2 .3 .2').swingBy(1/6, 8)",
			perc: "s('~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim ~ ~ ~ rim ~').bank('RolandTR909').gain(.45).room(.3)",
			bass: "note('e1 [e1 e2] e1 g1 e1 [e2 e1] b1 d2').fast(2).s('sawtooth').lpf(arc.range(200, 900)).lpenv(4).lpa(.01).lpd(.12).lpq(14).decay(.15).sustain(0).gain(.5)",
			synth:
				"note('<e4 g4 b4 d5>*4').s('square').decay(.05).sustain(0).delay(.5).delayfeedback(.5).gain(arc.range(.05, .18)).pan(sine.slow(2))",
			vox: "s('<~ ~ ~ ~ ~ ~ rave:4 ~>').gain(.55).room(.3).delay(.25)"
		}
	},
	{
		title: 'Resonance Tax',
		layers: {
			kick: "s('bd*4').bank('RolandTR707').shape(.3).gain(.95)",
			hats: "stack(s('{hh hh oh}%16').gain(perlin.range(.2, .45)), s('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cr ~').gain(.2)).bank('RolandTR707').swingBy(1/6, 8)",
			perc: "s('~ cp ~ [cp ~ ~ cp], rim(5,16,3)').bank('RolandTR707').gain(.4).room(.25).lastOf(8, x => x.ply(2))",
			bass: "note('{d2 d3 f2 d2 a2}%16').s('sawtooth').lpf(sine.range(300, 2200).slow(16)).lpq(18).decay(.12).sustain(0).shape(.25).gain(.5).lastOf(4, x => x.add(note(12)))",
			synth:
				"note('{[d4,f4,a4] ~ ~}%4').s('square').lpf(arc.range(700, 2600)).decay(.15).sustain(0).delay(.375).delayfeedback(.45).room(.4).gain(arc.range(.08, .2))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ numbers:5 ~ ~ ~>').gain(.5).room(.4).delay(.3).delayfeedback(.4)"
		}
	},
	{
		title: 'Call Me Squelch',
		layers: {
			kick: "s('bd*4, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bd').bank('RolandTR909').shape(.2).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*8').gain('.35 .2')).bank('RolandTR909').sometimesBy(.1, x => x.speed(1.6))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rim rim ~ rim').bank('RolandTR909').gain(.45).room(arc.range(.1, .45))",
			bass: "note('<[f1 f2 ~ f1 ab1 ~ f1 c2] [f1 ~ f2 f1 ~ eb2 f1 f2]>').fast(2).s('sawtooth').lpf(arc.range(350, 2800)).lpq(15).decay(.13).sustain(0).gain('.55 .4 .4 .55').shape(.2)",
			synth:
				"note('<[f4,ab4,c5] ~ ~ ~ ~ ~ ~ ~ [eb4,ab4,c5] ~ ~ ~ ~ ~ ~ ~>*2').s('sawtooth').lpf(2400).decay(.18).sustain(0).room(.45).delay(.25).gain(.22)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ stab:4 ~ ~ ~ ~ ~ ~ ~ rave:7 ~ ~ ~>*4').speed(.95).gain(.5).room(.35).delay(.25)"
		}
	},
	{
		title: 'Cowbell Compliance',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').shape(.35).lpf(3000).gain(.95)",
			hats: "stack(s('hh*16').gain(perlin.range(.15, .4)), s('[~ oh]*4').gain(.35), s('sh*8').gain(.2)).bank('RolandTR808')",
			perc: "s('~ cp ~ cp, cb(3,8,1), ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ perc perc').bank('RolandTR808').gain(.4).room(.2)",
			bass: "note('g1 g1 ab1 g2 g1 ~ g1 db2 g1 g2 g1 f1 g1 ab1 g1 bb1').s('square').lpf(400).lpenv(arc.range(2, 6)).lpa(.005).lpd(.15).lpq(17).decay(.12).sustain(0).gain(.45).sometimesBy(.1, x => x.add(note(12)))",
			synth:
				"note('<g4 ab4>').s('sawtooth').struct('~ ~ x ~ ~ x ~ ~').lpf(sine.range(800, 2800).slow(32)).decay(.1).sustain(0).delay(.5).delayfeedback(.55).pan(sine.slow(4)).gain(.16)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ rave:2 ~ rave:2 ~>*4').gain(.55).room(.3).delay(.2)"
		}
	},
	{
		title: 'Smiley Face Audit',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.15)",
			hats: "s('hh*16').bank('RolandTR909').gain('.45 .2 .3 .2').degradeBy(arc.range(.4, 0)).swingBy(1/6, 8)",
			perc: "s('~ sd ~ sd:1, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ lt ~').bank('RolandTR909').gain(.38).room(.2).lastOf(16, x => x.ply(4))",
			bass: "n('0 7 12 3 0 10 5 0').fast(2).scale('Bb1:minor').s('sawtooth').iter(4).lpf(arc.range(400, 3000)).lpq(14).decay(.11).sustain(0).gain(.5)",
			synth:
				"n('0 2 4 6').fast(4).scale('Bb4:minor').s('triangle').iter(4).decay(.07).sustain(0).lpf(arc.range(1000, 4000)).delay(.25).delayfeedback(.35).gain(arc.range(.05, .15))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ ~ numbers:3 ~ ~ ~ ~ ~ ~ ~>').gain(.5).room(.5).delay(.375).delayfeedback(.45)"
		}
	},
	{
		title: 'Hoover Shaped Hole',
		layers: {
			kick: "s('bd*4').bank('RolandTR606').shape(.4).gain(.95)",
			hats: "stack(s('hh(11,16,2)').gain(perlin.range(.25, .5)), s('oh(3,8,2)').gain(.3)).bank('RolandTR606')",
			perc: "s('~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd ~ ~ ~, lt(3,16,5), ht(2,16,11)').bank('RolandTR606').gain(.4).room(.35).pan(perlin.range(.3, .7))",
			bass: "note('[~ f#1 f#2 ~] [f#1 a1 ~ f#1] [~ f#2 c#2 f#1] [e1 ~ f#1 f#2]').s('sawtooth').lpf(sine.range(250, 1800).slow(32)).lpq(19).decay(.14).sustain(0).distort(.6).gain(.4)",
			synth: "s('white*16').hpf(6000).decay(.04).sustain(0).gain(arc.range(.02, .1)).pan(rand)",
			vox: "s('<hoover:0 ~ ~ ~ ~ ~ ~ ~ hoover:3 ~ ~ ~ ~ ~ ~ ~>').speed(.75).lpf(arc.range(1200, 4000)).room(.4).gain(.45)"
		}
	},
	{
		title: 'Twin Reflux',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.25).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('{hh ~ hh hh ~}%16').gain(.3), s('rd*4').gain(arc.range(0, .25))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ rim ~ ~ ~ ~ rim ~ ~ rim ~ ~ ~ ~ ~').bank('RolandTR909').gain(.42).room(.3).lastOf(8, x => x.ply(2))",
			bass: "note('eb2 eb2 eb3 eb2 gb2 eb2 bb2 c3').fast(2).s('sawtooth').jux(x => x.rev().add(note(12))).lpf(arc.range(300, 2600)).lpq(16).decay(.1).sustain(0).gain(.4)",
			synth:
				"note('<[eb4,gb4,bb4] [db4,f4,ab4] [c4,f4,ab4] [db4,gb4,bb4]>').s('supersaw').struct('x ~ ~ x ~ ~ x ~').lpf(arc.range(600, 2200)).decay(.2).sustain(0).room(.5).gain(.14)",
			vox: "s('<~ ~ ~ ~ speakspell:3 ~ ~ ~ ~ ~ ~ ~ speakspell:7 ~ ~ ~>').speed(.9).delay(.5).delayfeedback(.55).room(.5).gain(.5)"
		}
	}
];
