import { genreById } from '#lib/dj/genres.js';
import { LAYERS, type GenerateRequest } from '#lib/dj/types.js';
import { RUS_VOICE } from '#lib/dj/voices.js';

const CHEAT_SHEET = `
STRUDEL CHEAT SHEET (the only features you may use)
One cycle = one bar of 4 beats. Tempo is set by the DJ booth, never by you.

Mini-notation (inside single-quoted strings):
  'bd sd'        sequence, evenly divided across the bar
  '~' or '-'     rest
  'hh*8'         repeat (8 per bar)        'bd!3 sd'  replicate a step
  '[~ hh]*4'     group / subdivide          'c2@3 eb2' weight (longer step)
  '<c2 eb2 g1>'  one per bar, alternating   'bd, hh*8' play in parallel
  'rim(3,8)'     euclidean rhythm           'mt(5,16,2)' euclid with rotation
  'hh?'          randomly drop              '[c3,eb3,g3]' chord
  '{hh ~ oh}%16' polymeter: a 3-step loop on a 16th grid that drifts against the 4/4 kick
  Bars count from the start of the track, so '<rave:0 ~ ~ ~ ~ ~ ~ ~>' plays on bar 1 of every 8-bar phrase.

Sound sources:
  Drums ALWAYS need a bank:  s('bd*4').bank('RolandTR909')
     banks (nothing else; each bank only has the drums listed):
       RolandTR909: bd sd hh oh cp rim lt mt ht cr rd
       RolandTR808: bd sd hh oh cp rim lt mt ht cr sh cb
       RolandTR707: bd sd hh oh cp rim lt mt ht cr cb
       RolandTR606: bd sd hh oh lt ht cr
     drum names: bd (kick) sd (snare) hh (closed hat) oh (open hat) cp (clap) rim lt mt ht (toms) cr rd
  Synths NEVER use a bank:   note('c2 eb2 g2').s('sawtooth')
     synth names: sawtooth square triangle sine supersaw pulse (nothing else)
  Scale degrees:             n('0 2 4 7').scale('C:minor').s('triangle')
  Noise (synth layer only):  s('white*16').hpf(5000)   noise names: white pink
  Vox one-shots (vox layer only, never a bank; pick a variant with ':n'):
     rave:0 "are you ready"  rave:1 "Babylon"  rave:4 "give it"  rave:5 "our crew"  rave:2 rave:3 shouts
     numbers:0-8 spoken digits   speech:0-6 short words   speakspell:0-11 robot voice
     hoover:0-5 rave hoover   stab:0-22 rave chord stabs   space:0-17 sci-fi FX
     metal:0-9 industrial:0-31 noise2:0-7 metallic hits   wind:0-9 bleep:0-12 mouth:0-14
     rus:0-${RUS_VOICE.length - 1} Russian shouts (hardbass): ${RUS_VOICE.map((v, i) => `rus:${i} ${v.word} (${v.meaning})`).join(', ')}
  Distorted "bochka" kick samples (kick layer only, NEVER a bank): s('hardkick:4*4').decay(.18).sustain(0)
     best: hardkick:3 hardkick:4 hardkick:5 gabba:0 (very loud: gain .6) clubkick:2 (add .shape(.4)); cut the tail with decay/sustain so it ends before the off-beat bass
  Robot "vocals" from a synth: note('<c4 ~ ~ ~>').s('sawtooth').vowel('<a o>')   vowels: a e i o u

Effects (chain as methods, numbers or patterns):
  .gain(.8) .lpf(800) .lpq(12) .hpf(300) .shape(.4) .distort(.5) .crush(6) .pan(.3)
  .decay(.1).sustain(0) (short plucks)  .attack(.05) .release(.3)
  .room(.4) .delay(.5) .delayfeedback(.5) .speed(2)
Modulation signals: sine saw tri perlin rand -> .range(lo,hi).slow(8), e.g. .lpf(sine.range(300,2000).slow(8))
  arc: the track's intensity, 0..1. Climbs through the track, dips in the breakdown, peaks after the drop.
    Use it so the track grows: .lpf(arc.range(300,3000)) .gain(arc.range(.1,.4)) .degradeBy(arc.range(.6,0))
Pattern transforms: .fast(2) .slow(2) .rev() .ply(2) .degradeBy(.3) .sometimesBy(.3, x => x.speed(2))
  .every(4, x => x.fast(2)) .off(1/8, x => x.add(note(12))) .jux(rev) .struct('x ~ x x') .mask('<1 [1 0]>')
  .lastOf(8, x => x.ply(2)) (a fill in the last bar of every 8)   .swingBy(1/6, 8) (16th swing)
  Filter envelope (acid plucks): .lpf(300).lpenv(4).lpa(.01).lpd(.12).lpq(14)
  FM and pitch envelope (zaps): .fm(4).fmh(1.5) .penv(12).pdecay(.05)
  Hollow FM "donk" bass: note('[~ a1]*4').s('sine').fm(3).fmh(2).fmwave('triangle').fmdecay(.12).fmsustain(.25).decay(.3).sustain(0)
  Warm analog sound (sounds far less like MIDI than a bare oscillator):
    .ftype('ladder') a 24 dB Moog/303-style low-pass for .lpf (lpq 0-20, 25+ screams), .drive(1) to push it
    supersaw: .unison(7).detune(.25).spread(.8) (voices, detune, stereo spread)
    pulse: note('a3').s('pulse').pw(.3) (pulse width .1-.9, hollow and nasal)
    .noise(.08) breath and grit on an oscillator
    Layered bass: stack(note('a1').s('sine'), note('a1').s('sawtooth').hpf(180).lpf(900)) clean sub + gritty top
    Long dark reverb: .room(.6).roomsize(4).roomlp(3000)
  .phaser(2) (swirling disco loop)  .vib(6).vibmod(.3) (vibrato, e.g. whistles)
  Short tight kick: s('bd*4').bank('RolandTR909').decay(.15).sustain(0)
Combine: stack(a, b)  cat(a, b)

RULES
- Each layer is ONE JavaScript expression. No variables, no semicolons, no comments, no setcpm/cpm/orbit/postgain.
- Use single quotes for strings. Never call methods directly on a string ('bd sd'.fast(2) is WRONG; use s('bd sd').fast(2)).
- Write 'silence' to leave a layer empty. The kick layer must never be silence.
- Brackets inside mini-notation must match: '<a b>' and '[a b]' (never '<a b]').
- '~' is a rest and stands alone: 'cp ~ cp' (never 'cp~').
- Signals are not functions: saw.range(300,900) (never saw(300,900)). Only use methods listed above.
- Keep levels sane: kick gain <= 1, hats .2-.6, synth .1-.35, vox .3-.7. Bass and kick must not fight (bass on off-beats or short notes).
- The engine mixes the track like a studio: it swings and humanizes the hats, drifts the synths, compresses, EQs, adds sub rumble and masters it. Do not fake those with long effect chains; spend your effort on good patterns and sound design.
- Write every layer as a full-energy loop. The DJ engine arranges the track for you: it brings layers in one by one, strips them for the breakdown, adds snare rolls, risers and the drop. Never try to arrange with long masks.
- Vox is sparse: one shot every 4-8 bars, with delay/room. Silence most of the time.
`.trim();

const LAYER_ROLES = `
Layers (the DJ mixer crossfades each one separately, so every sound must sit in its own layer):
- kick: ONLY bd (or the hardkick/gabba/clubkick samples). Never sd/hh/cp here.
- hats: ONLY hh, oh, rd, cr
- perc: sd, cp, rim, lt, mt, ht (no bd, no hats)
- bass: the bassline, synth sounds only
- synth: stabs, chords, leads, arps, pads (synth sounds), noise FX, or hoover/stab rave samples
- vox: vocal shots and FX one-shots (vox samples) or a vowel-filtered synth chant
`.trim();

/** Random constraints per request: small models otherwise keep re-emitting the example track. */
const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];
const TWISTS = [
	'hats: use a euclidean rhythm such as hh(5,8) or hh(7,16)',
	'hats: off-beat open hats with 16th closed hats underneath',
	'perc: add toms (lt/mt/ht) in euclidean rhythms',
	'perc: a clap on 2 and 4 with a rim shuffle',
	'bass: syncopated, notes mostly off the beat',
	'bass: rolling 16th notes with octave jumps',
	'bass: long notes alternating per bar with <...>',
	'synth: short chord stabs on the off-beats with delay',
	"synth: a 16th-note arpeggio using n('...').scale(...)",
	'synth: a slow filter sweep with sine.range(...).slow(16)',
	'synth: a call-and-response melody across two bars using <...>',
	'drums: add a fill with .lastOf(8, x => x.ply(2)) on one layer',
	'hats: a polymeter like {hh ~ oh}%16 against the kick',
	'vox: a rave shout (rave:0, rave:4 or rave:5) on bar 1 of every 8',
	'vox: a robot chant with .vowel() on a sawtooth note every 4 bars',
	'vox: spoken numbers counting across bars with <...>',
	'synth: open the filter with arc so it grows with the track',
	'synth: an FM lead with a pitch envelope that zaps on each note',
	'bass: answer every kick with off-beat notes only'
];
const pick = <T>(xs: readonly T[], n: number): T[] =>
	[...xs].sort(() => Math.random() - 0.5).slice(0, n);

/** JSON schema handed to the gateway, so constrained decoding guarantees the reply shape. */
export const TRACK_SCHEMA = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		comment: { type: 'string' },
		layers: {
			type: 'object',
			properties: Object.fromEntries(LAYERS.map((l) => [l, { type: 'string' }])),
			required: [...LAYERS]
		}
	},
	required: ['title', 'comment', 'layers']
};

export function buildMessages(req: GenerateRequest) {
	const genre = genreById(req.genre);
	const example = genre.seeds[Math.floor(Math.random() * genre.seeds.length)];
	const key = pick(KEYS, 1)[0];
	const mode = pick(genre.modes ?? ['minor'], 1)[0];

	const system = [
		'You are RaveBot, a robot DJ who live-codes techno and rave tracks in Strudel (a JavaScript port of TidalCycles).',
		'You answer with a single JSON object and nothing else.',
		CHEAT_SHEET,
		LAYER_ROLES,
		`Output JSON shape: {"title": string (2-5 words, a cheeky track name), "comment": string (one short hype line the robot shouts, max 12 words), "layers": {${LAYERS.map((l) => `"${l}": string`).join(', ')}}}`,
		`FORMAT REFERENCE ONLY (a ${genre.name} track that already exists; never reuse its title or copy its patterns):\n${JSON.stringify({ title: example.title, comment: 'Lock in, humans.', layers: example.layers })}`
	].join('\n\n');

	const lines = [
		`Subgenre: ${genre.name} — ${genre.brief}`,
		`Tempo: ${Math.round(req.bpm)} BPM (already set, do not set it).`,
		`Energy: ${req.energy}/10 (1 = deep and sparse, 10 = peak-time and dense).`,
		`Weirdness: ${req.weirdness}/10 (0 = classic genre template, 10 = experimental but still danceable).`
	];
	lines.push(
		`Key: ${key} ${mode} (bass in octave 1-2, synth in octave 3-5).`,
		`Ideas for this track: ${pick(TWISTS, 2).join('; ')}.`
	);
	if (req.previous) {
		lines.push(
			`The previous track was "${req.previous.title}":\n${JSON.stringify(req.previous.layers)}`,
			'Write the NEXT track of the set: keep it mixable with the previous one (similar groove family), but change the bassline, the melody/stabs and at least one drum pattern so it clearly feels like a new track.'
		);
	} else {
		lines.push('This is the opening track of the set. Write an original track.');
	}
	lines.push('Return only the JSON object.');

	return [
		{ role: 'system' as const, content: system },
		{ role: 'user' as const, content: lines.join('\n') }
	];
}

/** Pulls the first JSON object out of a model reply (tolerates code fences and <think> blocks). */
export function extractJson(text: string): unknown {
	const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
	const start = cleaned.indexOf('{');
	const end = cleaned.lastIndexOf('}');
	if (start === -1 || end <= start) throw new Error('no JSON object in reply');
	return JSON.parse(cleaned.slice(start, end + 1));
}
