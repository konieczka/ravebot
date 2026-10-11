import { genreById } from '#lib/dj/genres.js';
import { LAYERS, type GenerateRequest } from '#lib/dj/types.js';

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

Sound sources:
  Drums ALWAYS need a bank:  s('bd*4').bank('RolandTR909')
     banks (nothing else; each bank only has the drums listed):
       RolandTR909: bd sd hh oh cp rim lt mt ht cr rd
       RolandTR808: bd sd hh oh cp rim lt mt ht cr sh cb
       RolandTR707: bd sd hh oh cp rim lt mt ht cr cb
       RolandTR606: bd sd hh oh lt ht cr
     drum names: bd (kick) sd (snare) hh (closed hat) oh (open hat) cp (clap) rim lt mt ht (toms) cr rd
  Synths NEVER use a bank:   note('c2 eb2 g2').s('sawtooth')
     synth names: sawtooth square triangle sine supersaw (nothing else)
  Scale degrees:             n('0 2 4 7').scale('C:minor').s('triangle')
  Noise (synth layer only):  s('white*16').hpf(5000)   noise names: white pink

Effects (chain as methods, numbers or patterns):
  .gain(.8) .lpf(800) .lpq(12) .hpf(300) .shape(.4) .distort(.5) .crush(6) .pan(.3)
  .decay(.1).sustain(0) (short plucks)  .attack(.05) .release(.3)
  .room(.4) .delay(.5) .delayfeedback(.5) .speed(2)
Modulation signals: sine saw tri perlin rand -> .range(lo,hi).slow(8), e.g. .lpf(sine.range(300,2000).slow(8))
Pattern transforms: .fast(2) .slow(2) .rev() .ply(2) .degradeBy(.3) .sometimesBy(.3, x => x.speed(2))
  .every(4, x => x.fast(2)) .off(1/8, x => x.add(note(12))) .jux(rev) .struct('x ~ x x') .mask('<1 [1 0]>')
Combine: stack(a, b)  cat(a, b)

RULES
- Each layer is ONE JavaScript expression. No variables, no semicolons, no comments, no setcpm/cpm/orbit/postgain.
- Use single quotes for strings. Never call methods directly on a string ('bd sd'.fast(2) is WRONG; use s('bd sd').fast(2)).
- Write 'silence' to leave a layer empty. The kick layer must never be silence.
- Brackets inside mini-notation must match: '<a b>' and '[a b]' (never '<a b]').
- '~' is a rest and stands alone: 'cp ~ cp' (never 'cp~').
- Signals are not functions: saw.range(300,900) (never saw(300,900)). Only use methods listed above.
- Keep levels sane: kick gain <= 1, hats .2-.6, synth .1-.35. Bass and kick must not fight (bass on off-beats or short notes).
`.trim();

const LAYER_ROLES = `
Layers (the DJ mixer crossfades each one separately, so every sound must sit in its own layer):
- kick: ONLY bd. Never sd/hh/cp here.
- hats: ONLY hh, oh, rd, cr
- perc: sd, cp, rim, lt, mt, ht (no bd, no hats)
- bass: the bassline, synth sounds only
- synth: stabs, chords, leads, arps, pads (synth sounds) or noise FX
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
	'drums: add a fill with .every(4, x => x.fast(2)) on one layer'
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

	const system = [
		'You are TechnoBot, a robot DJ who live-codes techno tracks in Strudel (a JavaScript port of TidalCycles).',
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
		`Key: ${key} minor (bass in octave 1-2, synth in octave 3-5).`,
		`Ideas for this track: ${pick(TWISTS, 2).join('; ')}.`
	);
	if (req.vibe) lines.push(`Crowd request / vibe: "${req.vibe}"`);
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
