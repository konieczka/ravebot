import { parse, type Node } from 'acorn';
import { LAYERS, type LayerName, type Layers } from './types';

/**
 * LLM output is evaluated as JavaScript by Strudel, so every layer has to pass a strict
 * allowlist check before it gets anywhere near `evaluate()`. A layer must be a single
 * expression built only from calls, method chains, literals and simple arrow callbacks.
 */

/** Free identifiers a layer may reference. Everything else is rejected. */
const GLOBALS = new Set([
	's',
	'sound',
	'note',
	'n',
	'stack',
	'cat',
	'seq',
	'fastcat',
	'slowcat',
	'silence',
	'sine',
	'cosine',
	'saw',
	'tri',
	'square',
	'perlin',
	'rand',
	'irand',
	'run',
	'rev'
]);

/**
 * Pattern methods a layer may call: the cheat-sheet vocabulary plus a few safe extras, all checked
 * against Strudel 1.3. Anything else (made-up methods, tempo/routing/output controls, prototype
 * tricks) is rejected, which also keeps the sandbox closed.
 */
const METHODS = new Set(
	(
		's sound note n bank scale gain velocity lpf lpq hpf hpq bpf shape distort crush coarse pan ' +
		'decay sustain attack release room size delay delaytime delayfeedback speed legato clip vowel phaser ' +
		'fast slow rev ply degradeBy sometimesBy sometimes rarely often every firstOf lastOf off jux struct ' +
		'mask range rangex segment add sub mul late early euclid swingBy chop iter palindrome hurry linger ' +
		'chunk superimpose layer'
	).split(' ')
);

const IDENT = /^[a-zA-Z][a-zA-Z0-9]*$/;
const MAX_LAYER_LENGTH = 700;
const ALLOWED_BINARY = new Set(['+', '-', '*', '/', '%']);

export class ValidationError extends Error {}

/** Validates `obj.method` in a call position. */
function checkMethod(callee: any, scope: Set<string>, depth: number): void {
	if (callee.computed) throw new ValidationError('computed member access is not allowed');
	const name: string = callee.property.name;
	if (!METHODS.has(name))
		throw new ValidationError(`unknown method ".${name}()"; use only methods from the cheat sheet`);
	// Single-quoted strings are plain JS strings, not patterns: 'a b'.fast(2) breaks at runtime.
	if (callee.object.type === 'Literal' || callee.object.type === 'TemplateLiteral')
		throw new ValidationError(
			'call methods on patterns like s(...) or note(...), not on raw strings'
		);
	check(callee.object, scope, depth + 1);
}

function check(node: Node, scope: Set<string>, depth: number): void {
	if (depth > 40) throw new ValidationError('expression nested too deeply');
	const n = node as any;
	switch (node.type) {
		case 'Literal':
			if (n.regex || typeof n.value === 'bigint')
				throw new ValidationError('regex/bigint literals are not allowed');
			return;
		case 'TemplateLiteral':
			if (n.expressions.length) throw new ValidationError('template literals must not contain ${}');
			return;
		case 'Identifier':
			if (!GLOBALS.has(n.name) && !scope.has(n.name))
				throw new ValidationError(`unknown identifier "${n.name}"`);
			return;
		case 'MemberExpression':
			// Reached only for property reads that are not method calls, e.g. note('c2').sawtooth
			throw new ValidationError(
				`".${n.property?.name ?? '[]'}" must be a method call; use only methods from the cheat sheet`
			);
		case 'CallExpression':
			if (n.optional) throw new ValidationError('optional calls are not allowed');
			if (n.callee.type === 'MemberExpression') checkMethod(n.callee, scope, depth);
			else if (n.callee.type === 'Identifier') check(n.callee, scope, depth + 1);
			else throw new ValidationError('only functions and methods can be called');
			for (const arg of n.arguments) {
				if (arg.type === 'SpreadElement') throw new ValidationError('spread is not allowed');
				check(arg, scope, depth + 1);
			}
			return;
		case 'ArrowFunctionExpression': {
			if (n.async || !n.expression)
				throw new ValidationError('callbacks must be simple arrows like x => x.fast(2)');
			const inner = new Set(scope);
			for (const p of n.params) {
				if (p.type !== 'Identifier' || !IDENT.test(p.name))
					throw new ValidationError('callback params must be plain names');
				inner.add(p.name);
			}
			check(n.body, inner, depth + 1);
			return;
		}
		case 'ArrayExpression':
			for (const el of n.elements) {
				if (!el || el.type === 'SpreadElement')
					throw new ValidationError('sparse/spread arrays are not allowed');
				check(el, scope, depth + 1);
			}
			return;
		case 'UnaryExpression':
			if (n.operator !== '-' && n.operator !== '+')
				throw new ValidationError(`operator ${n.operator} is not allowed`);
			check(n.argument, scope, depth + 1);
			return;
		case 'BinaryExpression':
			if (!ALLOWED_BINARY.has(n.operator))
				throw new ValidationError(`operator ${n.operator} is not allowed`);
			check(n.left, scope, depth + 1);
			check(n.right, scope, depth + 1);
			return;
		default:
			throw new ValidationError(`${node.type} is not allowed`);
	}
}

/** Drum sounds each bank actually ships in the tidal-drum-machines sample map. */
export const BANK_SOUNDS: Record<string, string[]> = {
	RolandTR909: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'lt', 'mt', 'ht', 'cr', 'rd'],
	RolandTR808: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'lt', 'mt', 'ht', 'cr', 'sh', 'cb', 'perc'],
	RolandTR707: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'lt', 'mt', 'ht', 'cr', 'cb'],
	RolandTR606: ['bd', 'sd', 'hh', 'oh', 'lt', 'ht', 'cr']
};
const BANKS = Object.keys(BANK_SOUNDS);
const DRUMS = new Set([
	'bd',
	'sd',
	'hh',
	'oh',
	'cp',
	'rim',
	'lt',
	'mt',
	'ht',
	'cr',
	'rd',
	'sh',
	'cb',
	'perc'
]);
const SYNTHS = new Set(['sawtooth', 'square', 'triangle', 'sine', 'supersaw']);
const NOISE = new Set(['white', 'pink', 'brown']);

/** Which sounds each layer may use, so the mixer's per-layer blends stay meaningful. */
const ROLE_SOUNDS: Record<LayerName, (name: string) => boolean> = {
	kick: (n) => n === 'bd',
	hats: (n) => ['hh', 'oh', 'rd', 'cr', 'sh'].includes(n),
	perc: (n) => DRUMS.has(n) && n !== 'bd',
	bass: (n) => SYNTHS.has(n),
	synth: (n) => SYNTHS.has(n) || NOISE.has(n)
};

/** Sound names referenced by a mini-notation string, e.g. "[~ hh]*4, rim(3,8)" -> hh, rim. */
const soundNames = (mini: string) =>
	(mini.replace(/\([^)]*\)/g, ' ').match(/[a-z][a-z0-9]*/gi) ?? []).filter((t) => !/^\d/.test(t));

const SIGNALS = new Set(['sine', 'cosine', 'saw', 'tri', 'square', 'perlin', 'rand']);

const CLOSER: Record<string, string> = { '[': ']', '<': '>', '(': ')', '{': '}' };

function balanced(str: string): boolean {
	return repairBrackets(str) === str;
}

/**
 * Fixes the bracket slips small models make in mini-notation: a wrong closer is swapped for the
 * right one ('<a b]' -> '<a b>'), stray closers are dropped and unclosed groups are closed.
 */
export function repairBrackets(str: string): string {
	const stack: string[] = [];
	let out = '';
	for (const ch of str) {
		if (ch in CLOSER) {
			stack.push(ch);
			out += ch;
		} else if (Object.values(CLOSER).includes(ch)) {
			const open = stack.pop();
			if (open) out += CLOSER[open];
		} else out += ch;
	}
	while (stack.length) out += CLOSER[stack.pop()!];
	return out;
}

/** Rewrites string literals whose brackets are unbalanced. Returns the source unchanged if all are fine. */
function repairLiterals(src: string, expr: Node): string {
	const fixes: { start: number; end: number; text: string }[] = [];
	const visit = (node: any): void => {
		if (!node || typeof node.type !== 'string') return;
		if (node.type === 'Literal' && typeof node.value === 'string') {
			const fixed = repairBrackets(node.value);
			// Strings with quotes or escapes would need re-escaping; leave those to the lint error.
			if (fixed !== node.value && !/['\\\n]/.test(fixed))
				fixes.push({ start: node.start, end: node.end, text: `'${fixed}'` });
		}
		for (const key of Object.keys(node)) {
			const child = node[key];
			if (Array.isArray(child)) child.forEach(visit);
			else if (child && typeof child === 'object') visit(child);
		}
	};
	visit(expr);
	for (const f of fixes.sort((a, b) => b.start - a.start))
		src = src.slice(0, f.start) + f.text + src.slice(f.end);
	return src;
}

/** Mini-notation slips that Strudel's parser rejects or silently mis-reads. */
function lintMini(mini: string): void {
	if (!balanced(mini)) throw new ValidationError(`unbalanced brackets in '${mini}'`);
	if (/[a-z0-9]~|~[a-z0-9]/i.test(mini))
		throw new ValidationError(`'~' is a rest and needs spaces around it: '${mini}'`);
	if (/[a-z0-9]\[/i.test(mini))
		throw new ValidationError(`put a space before '[' (e.g. 'cp [~ cp]'): '${mini}'`);
	if (/[a-z]\(\s*\d+\s*\)/i.test(mini))
		throw new ValidationError(`euclid needs two numbers, e.g. 'oh(3,8)': '${mini}'`);
}

/**
 * Musical lint on an already-safe AST: catches sounds and banks that do not exist, drums in the
 * wrong layer and broken mini-notation brackets. These are the mistakes small models make most.
 */
function lint(expr: Node, role: LayerName): void {
	const sounds: string[] = [];
	const banks: string[] = [];
	let hasNotes = false;
	let usesN = false;
	let usesScale = false;
	const visit = (node: any): void => {
		if (!node || typeof node.type !== 'string') return;
		if (node.type === 'Literal' && typeof node.value === 'string') lintMini(node.value);
		if (node.type === 'CallExpression') {
			const callee = node.callee;
			if (callee.type === 'Identifier' && SIGNALS.has(callee.name))
				throw new ValidationError(
					`${callee.name} is a signal, not a function: use ${callee.name}.range(lo,hi).slow(8)`
				);
			const name = callee.type === 'Identifier' ? callee.name : callee.property?.name;
			const arg = node.arguments[0];
			const str = arg?.type === 'Literal' && typeof arg.value === 'string' ? arg.value : null;
			if ((name === 's' || name === 'sound') && str !== null) {
				if (/(^|[\s,[<])\d+(?=[\s,\]>]|$)/.test(str.replace(/\([^)]*\)/g, '')))
					throw new ValidationError(
						`numbers are not sounds: '${str}' (use 'bd:2' for a sample variant)`
					);
				sounds.push(...soundNames(str));
			}
			if (name === 'note' || name === 'n') hasNotes = true;
			if (name === 'n') usesN = true;
			if (name === 'scale') usesScale = true;
			if (name === 'bank') {
				if (str === null || !BANKS.includes(str))
					throw new ValidationError(
						`unknown bank ${str ?? '(non-string)'}; use one of ${BANKS.join(', ')}`
					);
				banks.push(str);
			}
		}
		for (const key of Object.keys(node)) {
			const child = node[key];
			if (Array.isArray(child)) child.forEach(visit);
			else if (child && typeof child === 'object' && key !== 'loc') visit(child);
		}
	};
	visit(expr);

	if (usesScale && !usesN)
		throw new ValidationError(
			".scale() works with scale degrees: n('0 2 4').scale('C:minor'), not note()"
		);
	if (!sounds.length && !hasNotes)
		throw new ValidationError('layer has no sound: start from s(...), note(...) or n(...)');
	for (const name of new Set(sounds)) {
		if (!DRUMS.has(name) && !SYNTHS.has(name) && !NOISE.has(name))
			throw new ValidationError(`unknown sound "${name}"`);
		if (!ROLE_SOUNDS[role](name))
			throw new ValidationError(`"${name}" does not belong in the ${role} layer`);
	}
	for (const bank of new Set(banks)) {
		const missing = [...new Set(sounds)].filter(
			(n) => DRUMS.has(n) && !BANK_SOUNDS[bank].includes(n)
		);
		if (missing.length)
			throw new ValidationError(
				`${bank} has no ${missing.join('/')}; it only has ${BANK_SOUNDS[bank].join(' ')}`
			);
	}
	if (sounds.some((n) => DRUMS.has(n)) && !banks.length)
		throw new ValidationError(`drum sounds need .bank(...), e.g. .bank('RolandTR909')`);
	if (banks.length && !sounds.some((n) => DRUMS.has(n)))
		throw new ValidationError(
			".bank(...) only works with drum sounds; synths use .s('sawtooth') etc."
		);
}

/** Returns the normalized expression or throws ValidationError. */
export function validateLayer(code: string, role?: LayerName): string {
	let src = code.trim().replace(/;+\s*$/, '');
	if (!src || src === 'silence') return 'silence';
	if (src.length > MAX_LAYER_LENGTH)
		throw new ValidationError(`layer is longer than ${MAX_LAYER_LENGTH} chars`);
	let program: any;
	try {
		program = parse(src, { ecmaVersion: 2022, sourceType: 'script' });
	} catch (e) {
		throw new ValidationError(`syntax error: ${(e as Error).message}`);
	}
	if (program.body.length !== 1 || program.body[0].type !== 'ExpressionStatement')
		throw new ValidationError('layer must be exactly one expression');
	let expr = program.body[0].expression;
	check(expr, new Set(), 0);
	const repaired = repairLiterals(src, expr);
	if (repaired !== src) {
		// Literals only changed brackets inside strings, so the structure (and safety) is unchanged.
		src = repaired;
		expr = (parse(src, { ecmaVersion: 2022, sourceType: 'script' }) as any).body[0].expression;
	}
	if (role) lint(expr, role);
	return src;
}

export interface LayersResult {
	layers: Partial<Layers>;
	errors: Partial<Record<LayerName, string>>;
}

export function validateLayers(input: unknown): LayersResult {
	const result: LayersResult = { layers: {}, errors: {} };
	const obj = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
	for (const name of LAYERS) {
		const raw = obj[name];
		if (raw === undefined || raw === null) {
			result.layers[name] = 'silence';
			continue;
		}
		if (typeof raw !== 'string') {
			result.errors[name] = 'layer must be a string';
			continue;
		}
		try {
			result.layers[name] = validateLayer(raw, name);
		} catch (e) {
			result.errors[name] = (e as Error).message;
		}
	}
	if (result.layers.kick === 'silence' && !result.errors.kick)
		result.errors.kick = 'the kick layer must not be empty';
	return result;
}
