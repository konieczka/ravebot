import { describe, expect, it } from 'vitest';
import { GENRES } from './genres';
import { LAYERS } from './types';
import { repairBrackets, validateLayer, validateLayers } from './validate';

describe('validateLayer', () => {
	it('accepts every built-in seed layer', () => {
		for (const genre of GENRES)
			for (const seed of genre.seeds)
				for (const layer of LAYERS)
					expect(
						() => validateLayer(seed.layers[layer], layer),
						`${seed.title}/${layer}`
					).not.toThrow();
	});

	it('accepts arrow callbacks and arithmetic', () => {
		expect(validateLayer("s('hh*8').every(4, x => x.fast(2)).gain(1/2);")).toBe(
			"s('hh*8').every(4, x => x.fast(2)).gain(1/2)"
		);
	});

	it.each([
		["fetch('https://evil')", /unknown identifier/],
		["s('bd').constructor('alert(1)')", /constructor/],
		["s('bd')['constructor']", /must be a method call/],
		['window.location', /must be a method call/],
		["s('bd'); fetch('x')", /exactly one expression/],
		["s('bd').fast(`${1}`)", /template/],
		['setcpm(200)', /unknown identifier/],
		["s('bd').cpm(200)", /unknown method/],
		["s('bd').postgain(4)", /unknown method/],
		['s(x => { return 1 })', /simple arrows/],
		["'bd sd'.fast(2)", /raw strings/],
		["s('bd') && s('hh')", /LogicalExpression/],
		["(() => s('bd'))()", /only functions/]
	])('rejects %s', (code, msg) => {
		expect(() => validateLayer(code)).toThrow(msg);
	});

	it('maps empty layers to silence', () => {
		expect(validateLayer('  ')).toBe('silence');
	});
});

describe('validateLayers', () => {
	it('reports per-layer errors and requires a kick', () => {
		const r = validateLayers({
			kick: '',
			hats: "s('hh*8').bank('RolandTR909')",
			bass: 'eval("x")'
		});
		expect(r.errors.kick).toMatch(/kick/);
		expect(r.errors.bass).toMatch(/unknown identifier/);
		expect(r.layers.hats).toBe("s('hh*8').bank('RolandTR909')");
		expect(r.layers.synth).toBe('silence');
	});
});

describe('musical lint', () => {
	it.each([
		["s('bd sd hh*16').bank('RolandTR909')", 'kick', /"sd" does not belong in the kick layer/],
		["s('[~ hh]*4, cp').bank('RolandTR909')", 'hats', /"cp" does not belong/],
		["s('white*16').bank('sawtooth')", 'synth', /unknown bank/],
		["s('hh*8')", 'hats', /need .bank/],
		["note('c2').s('sawtooth').bank('RolandTR909')", 'bass', /only works with drum sounds/],
		["note('c2').s('sawtooh')", 'bass', /unknown sound "sawtooh"/],
		[
			"s('hh(7,16)').bank('RolandTR909').room(.6).reverb(.3)",
			'hats',
			/unknown method ".reverb\(\)"/
		],
		["note('c2 eb2').sawtooth.lpf(300)", 'bass', /".sawtooth" must be a method call/],
		['sine.range(300,2600).slow(16).gain(.35)', 'synth', /layer has no sound/],
		["s('cp~ cp cp ~').bank('RolandTR909')", 'perc', /needs spaces/],
		[
			"s('cp[2 4], rim(5,8)').bank('RolandTR909')",
			'perc',
			/space before '\['|numbers are not sounds/
		],
		["s('hh(7,16) oh(8)').bank('RolandTR909')", 'hats', /euclid needs two numbers/],
		["s('cp 2 cp 4, rim(7,16)').bank('RolandTR909')", 'perc', /numbers are not sounds/],
		["s('rim(3,8) ~').bank('RolandTR606')", 'perc', /RolandTR606 has no rim/],
		["note('g1').scale('Bdim7').s('square')", 'bass', /scale\(\) works with scale degrees/],
		["s('white*16').hpf(saw(3000,9000))", 'synth', /saw is a signal/]
	] as const)('rejects %s in %s', (code, role, msg) => {
		expect(() => validateLayer(code, role)).toThrow(msg);
	});

	it('allows euclid args, sample indices and noise in the synth layer', () => {
		expect(() =>
			validateLayer("s('rim(3,8), mt(5,16,2), cp:2').bank('RolandTR808')", 'perc')
		).not.toThrow();
		expect(() => validateLayer("s('white*16').hpf(4000)", 'synth')).not.toThrow();
	});
});

describe('repairBrackets', () => {
	it.each([
		['<[~ c1]*4 [~ g0]*4]', '<[~ c1]*4 [~ g0]*4>'],
		['<[c1 ~ c2]> [c1 ~ c1]>', '<[c1 ~ c2]> [c1 ~ c1]'],
		['<[~ [c3,eb3]] [~ ~ [c3,eb3] ~]', '<[~ [c3,eb3]] [~ ~ [c3,eb3] ~]>'],
		['rim(3,8), [~ hh]*4', 'rim(3,8), [~ hh]*4']
	])('%s -> %s', (input, expected) => {
		expect(repairBrackets(input)).toBe(expected);
	});

	it('repairs literals inside a layer', () => {
		expect(validateLayer("note('<[~ c1]*4 [~ g0]*4]').s('sine')", 'bass')).toBe(
			"note('<[~ c1]*4 [~ g0]*4>').s('sine')"
		);
	});
});
