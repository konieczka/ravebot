import type { Seed } from './types';

export const ACID: Seed[] = [
	{
		title: 'Squelch Protocol',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.2)",
			hats: "stack(s('[~ oh]*4').gain(.45), s('hh*16').gain(.25)).bank('RolandTR909').sometimesBy(arc.range(0, .3), x => x.speed(1.5))",
			perc: "s('~ cp ~ cp').bank('RolandTR909').gain(.5).room(.25).lastOf(16, x => x.ply(4))",
			bass: "note('c2 c2 c3 c2 eb2 c2 g2 c3 c2 c2 bb2 c2 f2 c3 c2 g1').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(300, 3200)).lpq(16).decay(.14).sustain(0).shape(.3).gain(.55).sometimesBy(.15, x => x.add(note(12)))",
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
			bass: "note('<[a1 a2 a1 a1 c2 a1 e2 a1] [a1 a2 g2 a1 a1 c3 a1 e2]>*2').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(400, 3000)).lpq(perlin.range(12, 20)).decay(.12).sustain(0).gain(.5)",
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
			bass: "note('e1 [e1 e2] e1 g1 e1 [e2 e1] b1 d2').fast(2).s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(200, 900)).lpenv(4).lpa(.01).lpd(.12).lpq(14).decay(.15).sustain(0).gain(.5)",
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
			bass: "note('{d2 d3 f2 d2 a2}%16').s('sawtooth').ftype('ladder').drive(.6).lpf(sine.range(300, 2200).slow(16)).lpq(18).decay(.12).sustain(0).shape(.25).gain(.5).lastOf(4, x => x.add(note(12)))",
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
			bass: "note('<[f1 f2 ~ f1 ab1 ~ f1 c2] [f1 ~ f2 f1 ~ eb2 f1 f2]>').fast(2).s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(350, 2800)).lpq(15).decay(.13).sustain(0).gain('.55 .4 .4 .55').shape(.2)",
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
			bass: "note('g1 g1 ab1 g2 g1 ~ g1 db2 g1 g2 g1 f1 g1 ab1 g1 bb1').s('square').ftype('ladder').drive(.6).lpf(400).lpenv(arc.range(2, 6)).lpa(.005).lpd(.15).lpq(17).decay(.12).sustain(0).gain(.45).sometimesBy(.1, x => x.add(note(12)))",
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
			bass: "n('0 7 12 3 0 10 5 0').fast(2).scale('Bb1:minor').s('sawtooth').ftype('ladder').drive(.6).iter(4).lpf(arc.range(400, 3000)).lpq(14).decay(.11).sustain(0).gain(.5)",
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
			bass: "note('[~ f#1 f#2 ~] [f#1 a1 ~ f#1] [~ f#2 c#2 f#1] [e1 ~ f#1 f#2]').s('sawtooth').ftype('ladder').drive(.6).lpf(sine.range(250, 1800).slow(32)).lpq(19).decay(.14).sustain(0).distort(.6).gain(.4)",
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
			bass: "note('eb2 eb2 eb3 eb2 gb2 eb2 bb2 c3').fast(2).s('sawtooth').ftype('ladder').drive(.6).jux(x => x.rev().add(note(12))).lpf(arc.range(300, 2600)).lpq(16).decay(.1).sustain(0).gain(.4)",
			synth:
				"note('<[eb4,gb4,bb4] [db4,f4,ab4] [c4,f4,ab4] [db4,gb4,bb4]>').s('supersaw').struct('x ~ ~ x ~ ~ x ~').lpf(arc.range(600, 2200)).decay(.2).sustain(0).room(.5).gain(.14)",
			vox: "s('<~ ~ ~ ~ speakspell:3 ~ ~ ~ ~ ~ ~ ~ speakspell:7 ~ ~ ~>').speed(.9).delay(.5).delayfeedback(.55).room(.5).gain(.5)"
		}
	},
	{
		// Phuture lineage: raw Chicago jack, one hypnotic two-bar 303 riff, resonance wandering on its own.
		title: 'Jack Of All Squelches',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').decay(.35).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.42).decay(arc.range(.08, .25)), s('hh*8').gain('.3 .2')).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, rim(3,8,2)').bank('RolandTR909').gain(.42).room(.2).lastOf(8, x => x.ply(2))",
			bass: "note('<[b1 b1 b2 b1 ~ b1 d2 b1 b1 ~ a1 b1 f#2 b1 b2 ~] [b1 b1 b2 b1 ~ b1 d2 b1 c2 b1 ~ b1 e2 b1 d3 b2]>').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(250, 2200)).lpq(perlin.range(14, 21).slow(8)).lpenv(sine.range(1.5, 5).slow(32)).lpa(.005).lpd(.15).decay(.13).sustain(0).gain('.55 .4 .4 .5 .4 .4 .55 .4 .4 .5 .4 .4 .55 .4 .5 .4')",
			synth:
				"note('<[b3,d4,f#4] [b3,d4,f#4] [a3,d4,f#4] [g3,b3,e4]>').s('pulse').pw(sine.range(.25, .6).slow(16)).struct('~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ x').decay(.18).sustain(0).lpf(arc.range(900, 2600)).room(.4).gain(arc.range(.053, .106))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speech:3>').speed(.85).room(.4).delay(.375).delayfeedback(.5).gain(.5)"
		}
	},
	{
		// Hardfloor lineage: two interlocking 303s, a 16-step bass box and an 11-step phased box an octave up.
		title: 'Two Boxes, One Brain',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.2).gain(.95)",
			hats: "stack(s('[~ oh]*4').gain(.4), s('hh*16').gain('.3 .15 .22 .15'), s('rd*8').gain(arc.range(.05, .22))).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, [~ mt] ~ ~ [~ lt]').bank('RolandTR909').gain(.42).room(.25).lastOf(8, x => x.ply(2))",
			bass: "note('e1 e1 e2 e1 g1 e1 ~ e1 b1 e1 e2 ~ d2 e1 f#1 e2').s('sawtooth').ftype('ladder').drive(.6).lpf(sine.range(300, 1600).slow(16)).lpenv(arc.range(2, 5)).lpa(.005).lpd(.12).lpq(17).decay(.12).sustain(0).gain('.55 .4 .5 .4 .4 .55 .4 .4 .55 .4 .4 .5 .4 .4 .55 .4').lastOf(8, x => x.iter(4))",
			synth:
				"note('{e3 ~ e4 b3 g3 ~ d4 e3 ~ f#3 a3}%16').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(500, 2800)).lpenv(3).lpa(.005).lpd(.1).lpq(15).decay(.1).sustain(0).phaser(sine.range(.3, 2).slow(32)).pan(sine.range(.3, .7).slow(8)).gain(arc.range(.1, .18))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ [~ ~ rave:3 ~]>').phaser(.5).room(.3).gain(.5)"
		}
	},
	{
		// Josh Wink lineage: one relentless 16th line whose filter and resonance climb with the track until it screams.
		title: 'Higher State Of Paperwork',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.15)",
			hats: "stack(s('hh*16').gain(arc.range(.15, .35)), s('[~ oh]*4').gain(.35), s('<cr ~ ~ ~ ~ ~ ~ ~>').gain(.3)).bank('RolandTR909')",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ sd ~ sd sd sd').bank('RolandTR909').gain(.42).room(.3).lastOf(8, x => x.ply(2))",
			bass: "note('f1 f1 f2 f1 f1 f1 ab1 f1 f1 f2 f1 f1 c2 f1 f2 eb2').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(150, 4200)).lpq(arc.range(14, 23)).lpenv(arc.range(1, 4)).lpa(.005).lpd(.14).decay(.12).sustain(0).distort(.25).gain('[.55 .4 .45 .4]*4').lastOf(16, x => x.lpq(25))",
			synth:
				"note('<[f3,ab3,c4] [f3,ab3,db4] [f3,ab3,c4] [eb3,g3,c4]>').s('supersaw').unison(5).detune(.2).spread(.8).attack(.3).release(.8).hpf(arc.range(200, 900)).lpf(arc.range(1200, 3500)).room(.5).roomsize(4).gain(arc.range(.026, .06))",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ [mouth:6 ~ ~ mouth:6]>').room(.35).delay(.25).delayfeedback(.4).gain(.5)"
		}
	},
	{
		// London squat-party acid techno: distorted 303, pounding 909, crushed stabs, clap rolls.
		title: 'Squat Rent Arrears',
		layers: {
			kick: "s('bd*4').bank('RolandTR909').shape(.4).gain(.95)",
			hats: "stack(s('hh*16').gain('.35 .2 .3 .2'), s('[~ oh]*4').gain(.42)).bank('RolandTR909').sometimesBy(arc.range(.05, .3), x => x.speed(1.3))",
			perc: "s('~ cp ~ cp, ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~ cp').bank('RolandTR909').gain(.45).room(.3).lastOf(8, x => x.ply(4))",
			bass: "note('c#2 c#2 c#3 c#2 e2 c#2 ~ c#2 g#2 c#2 c#3 b1 c#2 d2 c#2 c#3').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(400, 3000)).lpenv(3).lpa(.005).lpd(.1).lpq(18).decay(.11).sustain(0).distort(arc.range(.3, .8)).gain('[.45 .4 .4 .42]*4').sometimesBy(.12, x => x.add(note(12)))",
			synth:
				"note('<[c#4,e4,g#4] [c#4,e4,g#4] [b3,e4,g#4] [a3,c#4,e4]>').s('square').struct('~ x ~ ~ ~ x ~ x').decay(.12).sustain(0).lpf(arc.range(1200, 4000)).crush(7).room(.35).delay(.1875).delayfeedback(.4).gain(arc.range(.053, .096))",
			vox: "s('<~ ~ ~ rave:5 ~ ~ ~ industrial:7>').room(.3).delay(.25).delayfeedback(.35).gain(.5)"
		}
	},
	{
		// Plastikman minimal acid: sparse dark 303 crawling under a closed filter, 808 rims dripping into a cave.
		title: 'Consumed By Spreadsheets',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').decay(.5).lpf(2500).gain(.95)",
			hats: "stack(s('hh(5,16,1)').gain(perlin.range(.15, .35)), s('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ oh ~ ~ ~ ~ ~').gain(.25)).bank('RolandTR808').degradeBy(arc.range(.4, 0))",
			perc: "s('rim(3,16,2), ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~ ~ ~, lt(2,16,7)').bank('RolandTR808').gain(.4).room(.6).roomsize(6).roomlp(2500).delay(.3).delaytime(.336).delayfeedback(.6)",
			bass: "note('g1 ~ ~ g1 ~ ~ bb1 ~ g1 ~ ~ ~ g2 ~ f1 ~').s('sawtooth').ftype('ladder').drive(.6).lpf(perlin.range(200, 650).slow(16)).lpenv(arc.range(1, 4.5)).lpa(.005).lpd(.18).lpq(20).decay(.2).sustain(0).gain('.5 .4 .4 .55 .4 .4 .45 .4 .5 .4 .4 .4 .55 .4 .45 .4')",
			synth:
				"stack(note('<[g3,bb3,d4] [g3,bb3,d4] [g3,c4,eb4] [f3,bb3,d4]>').s('triangle').attack(.6).release(1.5).lpf(1400).gain(arc.range(.012, .025)), note('~ ~ ~ ~ ~ ~ d5 ~ ~ ~ ~ ~ ~ ~ ~ ~').s('sine').decay(.15).sustain(0).delay(.6).delaytime(.336).delayfeedback(.7).gain(.025)).room(.7).roomsize(6).roomlp(2000)",
			vox: "s('<~ ~ ~ ~ ~ ~ ~ speakspell:9>').speed(.6).lpf(1800).room(.6).roomsize(6).delay(.336).delayfeedback(.6).gain(.45)"
		}
	},
	{
		// Luke Vibert / Ceephax melodic acid: a dorian 303 melody with pitch-zap hiccups, warm supersaw sevenths, a PWM arp.
		title: 'Teletext Picnic Hamper',
		layers: {
			kick: "s('bd*4').bank('RolandTR808').shape(.25).gain(.95)",
			hats: "stack(s('hh*8').gain('.35 .2'), s('sh*16').gain(perlin.range(.1, .3)), s('[~ oh]*4').gain(arc.range(.1, .35))).bank('RolandTR808')",
			perc: "s('~ cp ~ cp, cb(5,16,2), ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ht mt lt').bank('RolandTR808').gain(.4).room(.2).pan(perlin.range(.3, .7)).lastOf(8, x => x.iter(4))",
			bass: "n('<[0 7 9 7 12 10 7 5 0 ~ 7 9 14 12 7 5] [0 3 5 7 ~ 7 10 12 14 12 10 ~ 7 5 3 1]>').scale('D1:dorian').s('sawtooth').ftype('ladder').drive(.6).lpf(arc.range(400, 2600)).lpenv(sine.range(2, 5).slow(8)).lpa(.005).lpd(.12).lpq(16).decay(.12).sustain(0).gain('[.5 .4 .45 .4]*4').sometimesBy(.15, x => x.penv(12).pdecay(.04))",
			synth:
				"stack(note('<[d4,f4,a4,c5] [g3,b3,d4,f4] [c4,e4,g4,b4] [a3,c4,e4,g4]>').s('supersaw').unison(5).detune(.25).spread(.9).attack(.2).release(1).lpf(arc.range(900, 2600)).gain(arc.range(.012, .024)), n('0 2 4 7 9 7 4 2').fast(2).scale('D4:dorian').s('pulse').pw(sine.range(.2, .7).slow(8)).decay(.08).sustain(0).iter(4).gain(arc.range(0, .024))).room(.45).roomsize(3).delay(.25).delayfeedback(.4)",
			vox: "s('<~ ~ ~ speakspell:2 ~ ~ ~ bleep:5>').room(.3).delay(.25).delayfeedback(.45).gain(.5)"
		}
	}
];
