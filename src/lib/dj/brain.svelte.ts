import { browser } from '$app/env';
import * as engine from '#lib/engine/strudel.js';
import { MIXER_GLOBAL, Mixer, buildProgram, type Deck } from '#lib/engine/mixer.js';
import { TRACK_BARS, TRANSITION_BARS } from './arrangement.js';
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

const SKIP_TRANSITION_BARS = 8;
/** How many tracks are written ahead of the one playing. */
export const QUEUE_DEPTH = 3;
const TICK_MS = 200;
/** Max BPM change per tick while gliding to a new tempo (~0.4 BPM/s). */
const BPM_STEP = 0.08;

export type Status = 'off' | 'booting' | 'live';
/**
 * Where new tracks come from: the LLM, only the built-in seed tracks remixed locally, or both
 * taking turns (local -> AI -> local -> ...).
 */
export type TrackSource = 'ai' | 'local' | 'combo';
/** Where one track is actually written: combo resolves to one of these per slot. */
export type WriteSource = Exclude<TrackSource, 'combo'>;

const SOURCE_REASONS: Record<TrackSource, string> = {
	ai: 'AI generation on',
	local: 'Local crate only',
	combo: 'Combo: crate and AI taking turns'
};
export type Mood = 'idle' | 'groove' | 'think' | 'mix' | 'glitch';

/** The track currently being written, and the settings it was asked for. */
export interface WriteJob {
	genre: GenreId;
	bpm: number;
	energy: number;
	weirdness: number;
	source: WriteSource;
}

/**
 * The DJ's brain: owns the decks, the queue of upcoming tracks and the timing of transitions.
 * Everything is scheduled in cycles (1 cycle = 1 bar) read from Strudel's clock.
 */
export class DjBrain {
	// Controls
	source = $state<TrackSource>('combo');
	genre = $state<GenreId>('minimal');
	targetBpm = $state(128);
	energy = $state(6);
	weirdness = $state(3);
	hold = $state(false);
	locked = $state<Record<LayerName, boolean>>({
		kick: false,
		hats: false,
		perc: false,
		bass: false,
		synth: false,
		vox: false
	});

	// Live state
	status = $state<Status>('off');
	bpm = $state(128);
	cycle = $state(0);
	decks = $state<[Track | null, Track | null]>([null, null]);
	live = $state<Deck>(0);
	/** Upcoming tracks, ready to mix, in play order. */
	queue = $state<Track[]>([]);
	writing = $state<WriteJob | null>(null);
	transitioning = $state(false);
	offline = $state(false);
	glitchUntil = $state(0);
	speech = $state('');
	/** Bumped on every message, so the same line said twice still pops up again. */
	speechId = $state(0);

	mixer = new Mixer();
	private trackStart = 0;
	private genStamp = 0;
	private skipRequested = false;
	private announced = false;
	private busy = false;
	private timer: ReturnType<typeof setInterval> | undefined;
	private raf = 0;

	mood: Mood = $derived.by(() => {
		if (this.status !== 'live') return this.status === 'booting' ? 'think' : 'idle';
		if (this.cycle < this.glitchUntil) return 'glitch';
		if (this.transitioning) return 'mix';
		if (this.writing) return 'think';
		return 'groove';
	});

	liveTrack = $derived(this.decks[this.live]);
	next = $derived(this.queue[0] ?? null);

	constructor() {
		if (browser) (globalThis as any)[MIXER_GLOBAL] = this.mixer;
	}

	// ── controls ────────────────────────────────────────────────────────────

	setGenre(id: GenreId) {
		if (id === this.genre) return;
		this.genre = id;
		this.targetBpm = genreById(id).bpm;
		this.invalidateQueue(`Switching to ${genreById(id).name}`);
	}

	/** Called when a control that shapes upcoming tracks changes: the queue is written again. */
	invalidateQueue(reason?: string) {
		this.genStamp++;
		this.queue = [];
		this.writing = null;
		if (reason && this.status === 'live') this.say(`${reason}. Rewriting the queue.`);
	}

	/** Removes one queued track; the writer fills the gap. */
	dropQueued(id: string) {
		const track = this.queue.find((t) => t.id === id);
		if (!track) return;
		this.queue = this.queue.filter((t) => t.id !== id);
		this.say(`Dropped "${track.title}".`);
	}

	setSource(source: TrackSource) {
		if (source === this.source) return;
		this.source = source;
		this.invalidateQueue(SOURCE_REASONS[source]);
	}

	toggleLock(layer: LayerName) {
		this.locked[layer] = !this.locked[layer];
		if (this.locked[layer]) this.mixer.pinned.add(layer);
		else this.mixer.pinned.delete(layer);
	}

	skip() {
		if (this.status !== 'live' || this.transitioning) return;
		this.skipRequested = true;
		this.hold = false;
		this.say(this.next ? 'Skip! Mixing now.' : 'Skip queued, still writing...');
	}

	// ── lifecycle ───────────────────────────────────────────────────────────

	async start() {
		if (this.status !== 'off') return;
		this.status = 'booting';
		this.say('Booting RaveBot...');
		try {
			await engine.initEngine();
		} catch (e) {
			this.status = 'off';
			this.say(`Audio engine failed: ${(e as Error).message}`);
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
		// Seeds are known-good; the dry run here just preloads the opener's samples.
		await engine.dryRun(opener.layers).catch(() => {});
		this.mixer.plan = null;
		this.mixer.timelines = [this.timeline(opener, 0), null];
		this.decks = [opener, null];
		try {
			await engine.play(buildProgram(this.decks, this.mixer));
		} catch (e) {
			this.status = 'off';
			this.say(`Could not start: ${(e as Error).message}`);
			return;
		}
		this.status = 'live';
		this.trackStart = 0;
		this.say(opener.comment);
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
			queue: [],
			writing: null,
			transitioning: false,
			cycle: 0
		});
		this.mixer.plan = null;
		this.mixer.timelines = [null, null];
		this.say('Set over. Thank you, carbon lifeforms.');
	}

	// ── main loop ───────────────────────────────────────────────────────────

	private async tick() {
		if (this.status !== 'live') return;
		const c = engine.now();
		// Bus processing follows each deck's genre; the master blends between them in a transition.
		engine.setMix([this.mixer.mix(0), this.mixer.mix(1)], this.mixer.masterMix(c));
		if (this.busy) return;

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
				if (incoming) this.say(incoming.comment || incoming.title);
			}
			if (c >= plan.start + plan.bars) await this.guard(() => this.finishTransition());
			return;
		}

		if (this.queue.length < QUEUE_DEPTH && !this.writing) void this.generateNext();

		const due =
			this.skipRequested || (!this.hold && c >= this.trackStart + TRACK_BARS - TRANSITION_BARS);
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
		const incoming = this.queue[0];
		const skip = this.skipRequested;
		this.skipRequested = false;
		this.queue = this.queue.slice(1);

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
		// The incoming track's bar 0 is the middle of the blend, where its kick and bass come in.
		this.mixer.timelines[to] = this.timeline(incoming, start + bars / 2);
		try {
			await engine.play(buildProgram(decks, this.mixer));
		} catch (e) {
			// The incoming track blew up inside Strudel: drop it and keep the current one playing.
			this.mixer.plan = null;
			this.mixer.timelines[to] = null;
			this.glitch(`"${incoming.title}" crashed the decks (${(e as Error).message}). Recovering.`);
			await engine.play(buildProgram(this.decks, this.mixer)).catch(() => {});
			return;
		}
		this.decks = decks;
		this.transitioning = true;
		this.announced = false;
	}

	private async finishTransition() {
		const plan = this.mixer.plan!;
		const decks: [Track | null, Track | null] = [...this.decks];
		decks[plan.from] = null;
		this.mixer.plan = null;
		this.mixer.timelines[plan.from] = null;
		this.mixer.live = plan.to;
		this.live = plan.to;
		this.decks = decks;
		this.transitioning = false;
		this.trackStart = plan.start + plan.bars / 2;
		await engine
			.play(buildProgram(decks, this.mixer))
			.catch((e) => this.glitch(`Re-patch failed: ${e.message}`));
	}

	// ── generation ──────────────────────────────────────────────────────────

	private async generateNext() {
		const stamp = this.genStamp;
		// Each new track follows the last one in the queue, so the whole chain mixes smoothly.
		const current = this.queue.at(-1) ?? this.decks[this.live];
		const genre = this.genre;
		const req: GenerateRequest = {
			genre,
			bpm: this.targetBpm,
			energy: this.energy,
			weirdness: this.weirdness,
			previous: current ? { title: current.title, layers: current.layers } : undefined
		};

		// Combo alternates off the track this one follows: after an AI track dig the crate, otherwise
		// ask the AI (a failed AI write lands as a crate track, so the next slot retries the AI).
		const source: WriteSource =
			this.source === 'combo' ? (current?.source === 'llm' ? 'local' : 'ai') : this.source;

		this.writing = {
			genre,
			bpm: req.bpm,
			energy: req.energy,
			weirdness: req.weirdness,
			source
		};
		let track: Track;
		if (source === 'local') {
			track = fallbackTrack(genre, current?.layers);
		} else {
			try {
				track = await this.requestTrack(req);
			} catch (e) {
				this.say(`Generation failed (${(e as Error).message}), using the backup crate.`);
				track = fallbackTrack(genre, current?.layers);
				track.flags = ['AI FAILED'];
			}
		}
		if (stamp !== this.genStamp || this.status !== 'live') {
			if (stamp === this.genStamp) this.writing = null;
			return; // controls changed (or set stopped) while we were waiting: the tick will ask again
		}

		const problems: Partial<Record<LayerName, string>> = await engine
			.dryRun(track.layers)
			.catch((e) => ({ kick: (e as Error).message }));
		const broken = Object.keys(problems) as LayerName[];
		if (broken.length) {
			this.glitch(`Dry run failed: ${broken.map((l) => `${l} (${problems[l]})`).join(', ')}`);
			if (broken.includes('kick')) {
				track = fallbackTrack(genre, current?.layers);
				track.flags = ['KICK BROKE'];
			} else {
				for (const l of broken) track.layers[l] = current?.layers[l] ?? 'silence';
				track.flags = [...(track.flags ?? []), `SWAPPED ${broken.join(' ').toUpperCase()}`];
			}
		}

		if (stamp !== this.genStamp) return;
		this.writing = null;
		this.queue = [...this.queue, track];
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
				if (!this.offline) this.say('No AI Gateway configured. Remixing the crate offline.');
				this.offline = true;
				return fallbackTrack(req.genre, req.previous?.layers);
			}
			throw new Error(data.error);
		}
		this.offline = false;

		// The server already validated, but the browser is where the code runs: check again.
		const { layers, errors } = validateLayers(data.track.layers);
		if (Object.keys(errors).length)
			throw new Error(`rejected unsafe layers: ${Object.keys(errors).join(', ')}`);
		return {
			...data.track,
			layers: layers as Track['layers'],
			id: crypto.randomUUID(),
			genre: req.genre,
			source: 'llm',
			flags: data.repaired.length ? [`PATCHED ${data.repaired.join(' ').toUpperCase()}`] : undefined
		};
	}

	// ── helpers ─────────────────────────────────────────────────────────────

	private timeline(track: Track, origin: number) {
		const { arc, mix } = genreById(track.genre);
		return { origin, style: arc, mix };
	}

	private glitch(text: string) {
		this.glitchUntil = engine.now() + 2;
		this.say(text);
	}

	/** Puts a line in RaveBot's speech bubble. */
	say(text: string) {
		this.speech = text;
		this.speechId++;
	}
}
