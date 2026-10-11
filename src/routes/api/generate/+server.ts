import { json } from '@sveltejs/kit';
import {
	CF_ACCOUNT_ID,
	CF_AI_GATEWAY_ID,
	CF_AIG_TOKEN,
	LLM_API_KEY,
	LLM_MODEL
} from '$app/env/private';
import { GENRES } from '#lib/dj/genres.js';
import {
	LAYERS,
	type GenerateRequest,
	type GenerateResponse,
	type LayerName,
	type Layers
} from '#lib/dj/types.js';
import { validateLayers } from '#lib/dj/validate.js';
import { TRACK_SCHEMA, buildMessages, extractJson } from '#lib/server/prompt.js';
import type { RequestHandler } from './$types';

const MAX_ATTEMPTS = 3;
/** A track counts as a copy when this many non-kick layers match the example or the previous track. */
const MAX_COPIED_LAYERS = 2;

const SEED_LAYERS = new Set(GENRES.flatMap((g) => g.seeds.flatMap((s) => Object.values(s.layers))));
const SEED_TITLES = new Set(GENRES.flatMap((g) => g.seeds.map((s) => s.title.toLowerCase())));

/** Optional request fields; a provider that rejects one gets it dropped for the rest of the session. */
const OPTIONAL_PARAMS = {
	// Constrained decoding guarantees the reply shape.
	response_format: { type: 'json_schema', json_schema: { name: 'track', schema: TRACK_SCHEMA } },
	// Reasoning models (e.g. GLM) otherwise spend thousands of tokens thinking before the JSON.
	// Non-reasoning models ignore it.
	reasoning_effort: 'low'
};
const unsupported = new Set<string>();

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function parseRequest(body: any): GenerateRequest | null {
	if (!body || !GENRES.some((g) => g.id === body.genre)) return null;
	const num = (v: unknown, lo: number, hi: number, fallback: number) =>
		typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
	const req: GenerateRequest = {
		genre: body.genre,
		bpm: num(body.bpm, 80, 200, 130),
		energy: Math.round(num(body.energy, 1, 10, 6)),
		weirdness: Math.round(num(body.weirdness, 0, 10, 3))
	};
	const prev = body.previous;
	if (prev && typeof prev.title === 'string' && prev.layers && typeof prev.layers === 'object') {
		// The previous track goes back into the prompt, so only accept layers that pass validation.
		const { layers } = validateLayers(prev.layers);
		req.previous = {
			title: prev.title.slice(0, 60),
			layers: Object.fromEntries(LAYERS.map((l) => [l, layers[l] ?? 'silence'])) as Layers
		};
	}
	return req;
}

const DEFAULT_LAYERS: Layers = {
	kick: "s('bd*4').bank('RolandTR909')",
	hats: 'silence',
	perc: 'silence',
	bass: 'silence',
	synth: 'silence',
	vox: 'silence'
};

/** Non-kick layers that are verbatim copies of a seed track or of the previous track. */
function copiedLayers(layers: Layers, previous?: Layers): LayerName[] {
	return LAYERS.filter(
		(l) =>
			l !== 'kick' &&
			layers[l] !== 'silence' &&
			(SEED_LAYERS.has(layers[l]) || layers[l] === previous?.[l])
	);
}

async function chat(messages: ChatMessage[], temperature: number): Promise<string> {
	const url = `https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_AI_GATEWAY_ID}/compat/chat/completions`;
	const headers: Record<string, string> = { 'content-type': 'application/json' };
	if (LLM_API_KEY) headers.authorization = `Bearer ${LLM_API_KEY}`;
	if (CF_AIG_TOKEN) headers['cf-aig-authorization'] = `Bearer ${CF_AIG_TOKEN}`;

	const body: Record<string, unknown> = {
		model: LLM_MODEL,
		messages,
		temperature,
		// A track is ~350 tokens; a low cap makes repetition loops fail fast instead of burning 2k tokens.
		max_tokens: 900
	};
	for (const [key, value] of Object.entries(OPTIONAL_PARAMS))
		if (!unsupported.has(key)) body[key] = value;

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(45_000)
	});
	if (!res.ok) {
		const text = (await res.text()).slice(0, 300);
		const rejected = Object.keys(OPTIONAL_PARAMS).find(
			(key) => !unsupported.has(key) && text.includes(key)
		);
		if (res.status === 400 && rejected) {
			unsupported.add(rejected);
			return chat(messages, temperature);
		}
		throw new Error(`gateway ${res.status}: ${text}`);
	}
	const data: any = await res.json();
	const choice = data?.choices?.[0];
	if (choice?.finish_reason === 'length') {
		const thinking = choice.message?.reasoning_content || choice.message?.reasoning;
		throw new Error(
			thinking && !choice.message?.content
				? 'reply cut off (reasoning model used its token budget thinking)'
				: 'reply cut off (model got stuck repeating itself)'
		);
	}
	let content = choice?.message?.content;
	// In JSON-schema mode some Workers AI models (e.g. Qwen) return the parsed object, not a string.
	if (content && typeof content === 'object') content = JSON.stringify(content);
	if (typeof content !== 'string') {
		console.error('[generate] unexpected gateway response:', JSON.stringify(data).slice(0, 800));
		throw new Error('gateway returned no message content');
	}
	return content;
}

export const POST: RequestHandler = async ({ request }) => {
	if (!CF_ACCOUNT_ID) {
		return json({
			ok: false,
			offline: true,
			error: 'CF_ACCOUNT_ID is not set — RaveBot is spinning offline.'
		} satisfies GenerateResponse);
	}
	const req = parseRequest(await request.json().catch(() => null));
	if (!req)
		return json({ ok: false, error: 'invalid request' } satisfies GenerateResponse, {
			status: 400
		});

	const messages: ChatMessage[] = buildMessages(req);
	const temperature = 0.5 + req.weirdness * 0.06;
	let lastError = 'unknown error';

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		let reply: string;
		try {
			reply = await chat(messages, temperature);
		} catch (e) {
			lastError = (e as Error).message;
			console.error('[generate] gateway call failed:', lastError);
			continue;
		}

		let parsed: any;
		try {
			parsed = extractJson(reply);
		} catch (e) {
			// Retry from a clean conversation: feeding broken output back only confuses small models.
			lastError = `bad JSON: ${(e as Error).message}`;
			console.warn(`[generate] attempt ${attempt + 1} ${lastError}`);
			continue;
		}

		const { layers, errors } = validateLayers(parsed?.layers);
		const failed = Object.keys(errors) as LayerName[];
		const isLastAttempt = attempt === MAX_ATTEMPTS - 1;

		if (failed.length && !isLastAttempt) {
			lastError = failed.map((l) => `${l}: ${errors[l]}`).join('; ');
			console.warn(`[generate] attempt ${attempt + 1} invalid: ${lastError}`);
			messages.push(
				{ role: 'assistant', content: reply },
				{
					role: 'user',
					content: `Some layers are invalid — ${lastError}. Fix them and return the full JSON object again.`
				}
			);
			continue;
		}

		if (!failed.length && !isLastAttempt) {
			const copied = copiedLayers(layers as Layers, req.previous?.layers);
			if (
				copied.length >= MAX_COPIED_LAYERS ||
				SEED_TITLES.has(String(parsed.title).toLowerCase())
			) {
				lastError = `copied ${copied.join(', ') || 'title'}`;
				console.warn(`[generate] attempt ${attempt + 1} ${lastError}`);
				messages.push(
					{ role: 'assistant', content: reply },
					{
						role: 'user',
						content: `This copies existing patterns (${copied.join(', ') || 'the title'}). Write NEW patterns for ${copied.join(', ') || 'the track'} with different notes and rhythms, a new title, and return the full JSON object again.`
					}
				);
				continue;
			}
		}

		// Last attempt: patch broken layers instead of throwing the whole track away.
		for (const l of failed) layers[l] = req.previous?.layers[l] ?? DEFAULT_LAYERS[l];

		return json({
			ok: true,
			repaired: failed,
			attempts: attempt + 1,
			track: {
				title: String(parsed.title || 'Untitled Banger').slice(0, 60),
				comment: String(parsed.comment || '').slice(0, 120),
				layers: layers as Layers
			}
		} satisfies GenerateResponse);
	}

	return json({ ok: false, error: lastError } satisfies GenerateResponse, { status: 502 });
};
