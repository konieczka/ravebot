import type { Node } from 'acorn';

/** Conservative limits before Strudel expands notation. Runtime queries enforce actual density. */
const LIMITS: Record<string, [number, number]> = {
	fast: [0.125, 32],
	slow: [0.125, 128],
	hurry: [0.125, 16],
	ply: [1, 16],
	chop: [1, 32],
	segment: [1, 32],
	run: [1, 32],
	unison: [1, 8],
	release: [0, 4],
	attack: [0, 4],
	decay: [0, 4],
	legato: [0, 4],
	linger: [0.125, 4],
	roomsize: [0, 8],
	delayfeedback: [0, 0.85],
	iter: [1, 32],
	chunk: [1, 32],
	euclid: [0, 32],
	echo: [1, 8]
};

function numeric(node: any): number | undefined {
	if (node?.type === 'Literal' && typeof node.value === 'number') return node.value;
	if (node?.type === 'UnaryExpression') {
		const n = numeric(node.argument);
		return n === undefined ? undefined : node.operator === '-' ? -n : n;
	}
	if (node?.type === 'BinaryExpression') {
		const a = numeric(node.left),
			b = numeric(node.right);
		if (a === undefined || b === undefined) return undefined;
		switch (node.operator) {
			case '+':
				return a + b;
			case '-':
				return a - b;
			case '*':
				return a * b;
			case '/':
				return a / b;
			case '%':
				return a % b;
		}
	}
}

function numbers(node: any): number[] {
	if (node?.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
		const method = node.callee.property.name;
		if (method === 'range' || method === 'rangex') {
			const source = node.callee.object;
			if (
				source.type === 'Identifier' &&
				['arc', 'sine', 'cosine', 'saw', 'tri', 'square', 'rand', 'perlin'].includes(source.name)
			)
				return node.arguments.flatMap(numbers);
		}
		if (method === 'slow' || method === 'fast') return numbers(node.callee.object);
	}
	const value = numeric(node);
	if (value !== undefined) return [value];
	const str =
		node?.type === 'Literal'
			? node.value
			: node?.type === 'TemplateLiteral'
				? node.quasis[0]?.value.cooked
				: undefined;
	if (typeof str === 'string' && /^[\d\s.<>\[\],~+\-]+$/.test(str))
		return (str.match(/[+-]?(?:\d*\.)?\d+/g) ?? []).map(Number);
	throw new Error('Workload-sensitive controls require bounded numbers or numeric sequences');
}

export function checkWorkload(expr: Node): void {
	let expansion = 1;
	let miniExpansion = 1;
	const visit = (node: any): void => {
		if (!node || typeof node.type !== 'string') return;
		const str =
			node.type === 'Literal' && typeof node.value === 'string'
				? node.value
				: node.type === 'TemplateLiteral'
					? node.quasis[0]?.value.cooked
					: undefined;
		if (str) {
			// Reject dynamic factors and miniature divisors before Strudel can expand them.
			if (/[*!%/]\s*(?!\d)(?:[<\[{]|[a-z])/i.test(str))
				throw new Error('Dynamic mini-notation expansion is not supported');
			for (const m of str.matchAll(/\/\s*([+-]?(?:\d*\.)?\d+)/g))
				if (+m[1] < 1 || +m[1] > 128)
					throw new Error('Mini-notation divisor must be between 1 and 128');
			// Reject large, dynamic and chained mini-notation expansion before querying it.
			for (const match of str.matchAll(/[*!%]\s*([^\s\[\]<>(),{}?!*/]+)/g)) {
				const n = Number(match[1]);
				if (!Number.isFinite(n) || n <= 0 || n > 32)
					throw new Error('Mini-notation expansion exceeds 32');
			}
			for (const match of str.matchAll(/\(\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[+-]?\d+)?\s*\)/g))
				if (+match[1] > 32 || +match[2] > 32) throw new Error('Euclidean pattern exceeds 32 steps');
			// Track nested expansion per phrase; commas/spaces start independent siblings.
			const stack: { peak: number; last: number }[] = [{ peak: 1, last: 1 }];
			for (const token of str.matchAll(
				/[\[<{]|[\]}>]|[*!%]\s*\d+(?:\.\d+)?|[^\s\[\]<>(){},*!%]+|[\s,]+/g
			)) {
				const t = token[0];
				let frame = stack.at(-1)!;
				if (/^[\[<{]$/.test(t)) stack.push({ peak: 1, last: 1 });
				else if (/^[\]}>]$/.test(t)) {
					const child = stack.length > 1 ? stack.pop()! : frame;
					frame = stack.at(-1)!;
					frame.last = Math.max(child.peak, child.last);
				} else if (/^[*!%]/.test(t)) {
					frame.last *= Math.max(1, Number(t.slice(1)));
					miniExpansion = Math.max(miniExpansion, frame.last);
					if (frame.last > 256) throw new Error('Nested mini-notation expansion exceeds budget');
				} else {
					frame.peak = Math.max(frame.peak, frame.last);
					frame.last = 1;
				}
			}
		}
		if (node.type === 'CallExpression') {
			const name =
				node.callee.type === 'Identifier' ? node.callee.name : node.callee.property?.name;
			if (['superimpose', 'jux', 'off'].includes(name)) expansion *= 2;
			if (name === 'layer' || name === 'stack')
				expansion *= Math.max(1, node.arguments.length + (name === 'layer' ? 1 : 0));
			if (LIMITS[name]) {
				const args = name === 'euclid' ? node.arguments.slice(0, 2) : node.arguments.slice(0, 1);
				const values = args.flatMap(numbers);
				const [min, max] = LIMITS[name];
				if (!values.length || values.some((n: number) => !Number.isFinite(n) || n < min || n > max))
					throw new Error(`${name} must stay between ${min} and ${max}`);
				if (['fast', 'hurry', 'ply', 'chop', 'segment', 'run', 'echo'].includes(name))
					expansion *= Math.max(1, ...values);
				if (name === 'slow') expansion *= Math.max(1, 1 / Math.min(...values));
				if (expansion > 256) throw new Error('Combined pattern expansion exceeds budget');
			}
		}
		for (const child of Object.values(node)) {
			if (Array.isArray(child)) child.forEach(visit);
			else if (child && typeof child === 'object') visit(child);
		}
	};
	visit(expr);
	if (expansion * miniExpansion > 512) throw new Error('Combined pattern expansion exceeds budget');
}
