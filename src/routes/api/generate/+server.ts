import { copiedMotif, repairTrackLayers } from '#lib/dj/repair.js';
import { chooseTrackHarmony, parseHarmony } from '#lib/dj/harmony.js';
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
const SEED_TRACKS = GENRES.flatMap((g) => g.seeds.map((s) => s.layers));
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
			genre: GENRES.some((g) => g.id === prev.genre) ? prev.genre : undefined,
			harmony: parseHarmony(prev.harmony),
			layers: Object.fromEntries(LAYERS.map((l) => [l, layers[l] ?? 'silence'])) as Layers
		};
	}
	req.harmony = chooseTrackHarmony(req.genre, req.previous?.harmony);
	return req;
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
	// Musical variety is explicit in the plan; high weirdness must not reduce code reliability.
	const temperature = 0.45;
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
		if (layers.bass === 'silence')
			errors.bass = 'bass must be present and follow the supplied rhythm';
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
			const copied = copiedMotif(layers as Layers, [
				...SEED_TRACKS,
				...(req.previous ? [req.previous.layers] : [])
			]);
			if (copied || SEED_TITLES.has(String(parsed.title).toLowerCase())) {
				lastError = copied ? 'copied foreground motif' : 'copied title';
				console.warn(`[generate] attempt ${attempt + 1} ${lastError}`);
				messages.push(
					{ role: 'assistant', content: reply },
					{
						role: 'user',
						content: `This repeats ${copied ? 'the foreground motif' : 'an existing title'}. ${copied ? 'Write a new foreground motif or phrasing within the SAME harmonic and rhythm contracts. Standard drums and bass grooves may remain.' : 'Change only the title.'} Return the full JSON object.`
					}
				);
				continue;
			}
		}

		// Repair all pitched parts together; never import a single previous-track melody.
		const repaired = repairTrackLayers(req.genre, layers, failed, req.harmony);

		return json({
			ok: true,
			repaired: repaired.repaired,
			attempts: attempt + 1,
			track: {
				title: String(parsed.title || 'Untitled Banger').slice(0, 60),
				comment: String(parsed.comment || '').slice(0, 120),
				layers: repaired.layers,
				harmony: repaired.harmony
			}
		} satisfies GenerateResponse);
	}

	return json({ ok: false, error: lastError } satisfies GenerateResponse, { status: 502 });
};
