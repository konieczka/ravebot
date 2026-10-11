import { browser } from '$app/env';
import * as engine from '#lib/engine/strudel.js';
import { GAIN_FN, Mixer, buildProgram, type Deck } from '#lib/engine/mixer.js';
import { fallbackTrack } from './fallback.js';
import { genreById } from './genres.js';
import {
	LAYERS,
	type GenerateRequest,
	type GenerateResponse,
	type GenreId,
	type LayerName,
	type Track
} from './types.js';
import { validateLayers } from './validate.js';

const TRANSITION_BARS = 16;
const SKIP_TRANSITION_BARS = 8;
const OPENING_BARS = 32;
const TICK_MS = 200;
/** Max BPM change per tick while gliding to a new tempo (~0.4 BPM/s). */
const BPM_STEP = 0.08;

export type Status = 'off' | 'booting' | 'live';
export type Mood = 'idle' | 'groove' | 'think' | 'mix' | 'glitch';

export interface LogLine {
	id: number;
	text: string;
	kind: 'info' | 'ok' | 'warn' | 'err';
}

/**
 * The DJ's brain: owns the decks, the queue of upcoming tracks and the timing of transitions.
 * Everything is scheduled in cycles (1 cycle = 1 bar) read from Strudel's clock.
 */
export class DjBrain {
	// Controls
	genre = $state<GenreId>('minimal');
	targetBpm = $state(128);
	energy = $state(6);
	weirdness = $state(3);
	trackBars = $state(64);
	vibe = $state('');
	hold = $state(false);
	locked = $state<Record<LayerName, boolean>>({
		kick: false,
		hats: false,
		perc: false,
		bass: false,
		synth: false
	});

	// Live state
	status = $state<Status>('off');
	bpm = $state(128);
	cycle = $state(0);
	decks = $state<[Track | null, Track | null]>([null, null]);
	live = $state<Deck>(0);
	next = $state<Track | null>(null);
	generating = $state(false);
	transitioning = $state(false);
	offline = $state(false);
	glitchUntil = $state(0);
	speech = $state('');
	log = $state<LogLine[]>([]);

	mixer = new Mixer();
	private trackStart = 0;
	private trackLength = OPENING_BARS;
	private genStamp = 0;
	private skipRequested = false;
	private announced = false;
	private busy = false;
	private timer: ReturnType<typeof setInterval> | undefined;
	private raf = 0;
	private logId = 0;

	mood: Mood = $derived.by(() => {
		if (this.status !== 'live') return this.status === 'booting' ? 'think' : 'idle';
		if (this.cycle < this.glitchUntil) return 'glitch';
		if (this.transitioning) return 'mix';
		if (this.generating) return 'think';
		return 'groove';
	});

	liveTrack = $derived(this.decks[this.live]);

	constructor() {
		if (browser)
			(globalThis as any)[GAIN_FN] = (deck: Deck, layer: LayerName, t: number) =>
				this.mixer.gain(deck, layer, t);
	}

	// ── controls ────────────────────────────────────────────────────────────

	setGenre(id: GenreId) {
		if (id === this.genre) return;
		this.genre = id;
		this.targetBpm = genreById(id).bpm;
		this.invalidateNext(`Switching to ${genreById(id).name}`);
	}

	/** Called when a control that shapes the next track changes; the queued track gets re-generated. */
	invalidateNext(reason?: string) {
		this.genStamp++;
		if (this.next) this.next = null;
		if (reason && this.status === 'live') this.say(`> ${reason}. Rewriting next track...`);
	}

	toggleLock(layer: LayerName) {
		this.locked[layer] = !this.locked[layer];
	}

	skip() {
		if (this.status !== 'live' || this.transitioning) return;
		this.skipRequested = true;
		this.hold = false;
		this.say(this.next ? '> Skip! Mixing now.' : '> Skip queued, still writing...');
	}

	// ── lifecycle ───────────────────────────────────────────────────────────

	async start() {
		if (this.status !== 'off') return;
		this.status = 'booting';
		this.say('> booting TechnoBot v0.1 ...');
		try {
			await engine.initEngine();
		} catch (e) {
			this.status = 'off';
			this.say(`! audio engine failed: ${(e as Error).message}`, 'err');
			return;
		}
		this.bpm = this.targetBpm;
		engine.setBpm(this.bpm);

		const seeds = genreById(this.genre).seeds;
		const seed = seeds[Math.floor(Math.random() * seeds.length)];
		const opener: Track = {
			id: crypto.randomUUID(),
			title: seed.title,
			comment: 'Warming up the decks. Hello, humans.',
			genre: this.genre,
			layers: { ...seed.layers },
			source: 'fallback'
		};
		this.mixer.live = this.live = 0;
		this.mixer.plan = null;
		this.decks = [opener, null];
		try {
			await engine.play(buildProgram(this.decks));
		} catch (e) {
			this.status = 'off';
			this.say(`! could not start: ${(e as Error).message}`, 'err');
			return;
		}
		this.status = 'live';
		this.trackStart = 0;
		this.trackLength = Math.min(OPENING_BARS, this.trackBars);
		this.speech = opener.comment;
		this.say(`> now playing: ${opener.title}`, 'ok');
		this.timer = setInterval(() => this.tick(), TICK_MS);
		const frame = () => {
			this.cycle = engine.now();
			this.raf = requestAnimationFrame(frame);
		};
		this.raf = requestAnimationFrame(frame);
	}

	stopSet() {
		clearInterval(this.timer);
		cancelAnimationFrame(this.raf);
		engine.stop();
		this.genStamp++;
		Object.assign(this, {
			status: 'off',
			decks: [null, null],
			next: null,
			transitioning: false,
			generating: false,
			cycle: 0
		});
		this.mixer.plan = null;
		this.speech = 'Set over. Thank you, carbon lifeforms.';
		this.say('> set stopped');
	}

	// ── main loop ───────────────────────────────────────────────────────────

	private async tick() {
		if (this.status !== 'live' || this.busy) return;
		const c = engine.now();

		if (Math.abs(this.targetBpm - this.bpm) > 0.01) {
			const diff = this.targetBpm - this.bpm;
			this.bpm += Math.sign(diff) * Math.min(Math.abs(diff), BPM_STEP);
			engine.setBpm(this.bpm);
		}

		const plan = this.mixer.plan;
		if (plan) {
			if (!this.announced && c >= plan.start + plan.bars / 2) {
				this.announced = true;
				const incoming = this.decks[plan.to];
				if (incoming) {
					this.speech = incoming.comment || incoming.title;
					this.say(`> DROP: ${incoming.title}`, 'ok');
				}
			}
			if (c >= plan.start + plan.bars) await this.guard(() => this.finishTransition());
			return;
		}

		if (!this.next && !this.generating) void this.generateNext();

		const due =
			this.skipRequested ||
			(!this.hold && c >= this.trackStart + this.trackLength - TRANSITION_BARS);
		if (due && this.next) await this.guard(() => this.beginTransition(c));
	}

	private async guard(fn: () => Promise<void>) {
		this.busy = true;
		try {
			await fn();
		} finally {
			this.busy = false;
		}
	}

	private async beginTransition(c: number) {
		const incoming = this.next!;
		const skip = this.skipRequested;
		this.skipRequested = false;
		this.next = null;

		const from = this.live;
		const to: Deck = from === 0 ? 1 : 0;
		const current = this.decks[from]!;
		const locked = LAYERS.filter((l) => this.locked[l]);
		for (const l of locked) incoming.layers[l] = current.layers[l];

		const bars = skip ? SKIP_TRANSITION_BARS : TRANSITION_BARS;
		// Start on the next 4-bar phrase (next bar when skipping), with a little headroom for evaluation.
		const grid = skip ? 1 : 4;
		const start = Math.ceil((c + 0.5) / grid) * grid;

		const decks: [Track | null, Track | null] = [...this.decks];
		decks[to] = incoming;
		this.mixer.plan = { from, to, start, bars, locked };
		try {
			await engine.play(buildProgram(decks));
		} catch (e) {
			// The incoming track blew up inside Strudel: drop it and keep the current one playing.
			this.mixer.plan = null;
			this.glitch(`! "${incoming.title}" crashed the decks (${(e as Error).message}). Recovering.`);
			await engine.play(buildProgram(this.decks)).catch(() => {});
			return;
		}
		this.decks = decks;
		this.transitioning = true;
		this.announced = false;
		this.say(`> mixing in "${incoming.title}" over ${bars} bars`, 'info');
	}

	private async finishTransition() {
		const plan = this.mixer.plan!;
		const decks: [Track | null, Track | null] = [...this.decks];
		decks[plan.from] = null;
		this.mixer.plan = null;
		this.mixer.live = plan.to;
		this.live = plan.to;
		this.decks = decks;
		this.transitioning = false;
		this.trackStart = plan.start + plan.bars / 2;
		this.trackLength = this.trackBars;
		await engine
			.play(buildProgram(decks))
			.catch((e) => this.glitch(`! re-patch failed: ${e.message}`));
	}

	// ── generation ──────────────────────────────────────────────────────────

	private async generateNext() {
		const stamp = this.genStamp;
		const current = this.decks[this.live];
		const genre = this.genre;
		const req: GenerateRequest = {
			genre,
			bpm: this.targetBpm,
			energy: this.energy,
			weirdness: this.weirdness,
			vibe: this.vibe.trim() || undefined,
			previous: current ? { title: current.title, layers: current.layers } : undefined
		};

		this.generating = true;
		this.say(
			`> prompting LLM: ${genreById(genre).name}, energy ${req.energy}, weird ${req.weirdness}`
		);
		let track: Track;
		try {
			track = await this.requestTrack(req);
		} catch (e) {
			this.say(`! generation failed (${(e as Error).message}), using backup crate`, 'warn');
			track = fallbackTrack(genre, current?.layers);
		}
		if (stamp !== this.genStamp || this.status !== 'live') {
			this.generating = false;
			return; // controls changed (or set stopped) while we were waiting: the tick will ask again
		}

		const problems: Partial<Record<LayerName, string>> = await engine
			.dryRun(track.layers)
			.catch((e) => ({ kick: (e as Error).message }));
		const broken = Object.keys(problems) as LayerName[];
		if (broken.length) {
			this.glitch(`! dry run failed: ${broken.map((l) => `${l} (${problems[l]})`).join(', ')}`);
			if (broken.includes('kick')) track = fallbackTrack(genre, current?.layers);
			else for (const l of broken) track.layers[l] = current?.layers[l] ?? 'silence';
		}

		this.generating = false;
		if (stamp !== this.genStamp) return;
		this.next = track;
		this.say(`> next up: "${track.title}" [${track.source}]`, 'ok');
	}

	private async requestTrack(req: GenerateRequest): Promise<Track> {
		const res = await fetch('/api/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(req),
			signal: AbortSignal.timeout(90_000)
		});
		const data: GenerateResponse = await res.json();
		if (!data.ok) {
			if (data.offline) {
				if (!this.offline) this.say('> no AI Gateway configured: offline remix mode', 'warn');
				this.offline = true;
				return fallbackTrack(req.genre, req.previous?.layers);
			}
			throw new Error(data.error);
		}
		this.offline = false;
		if (data.repaired.length) this.say(`> patched layers: ${data.repaired.join(', ')}`, 'warn');

		// The server already validated, but the browser is where the code runs: check again.
		const { layers, errors } = validateLayers(data.track.layers);
		if (Object.keys(errors).length)
			throw new Error(`rejected unsafe layers: ${Object.keys(errors).join(', ')}`);
		return {
			...data.track,
			layers: layers as Track['layers'],
			id: crypto.randomUUID(),
			genre: req.genre,
			source: 'llm'
		};
	}

	// ── helpers ─────────────────────────────────────────────────────────────

	private glitch(text: string) {
		this.glitchUntil = engine.now() + 2;
		this.say(text, 'err');
	}

	say(text: string, kind: LogLine['kind'] = 'info') {
		this.log = [...this.log.slice(-40), { id: ++this.logId, text, kind }];
	}
}
