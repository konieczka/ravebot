<script lang="ts">
	import { onMount } from 'svelte';
	import type { StageId } from '#lib/club/cities/index.js';
	import { ClubScene, type SceneInput } from '#lib/club/scene.js';
	import { intensity } from '#lib/dj/arrangement.js';
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS } from '#lib/dj/genres.js';
	import { LAYERS, type LayerName } from '#lib/dj/types.js';
	import type { Deck } from '#lib/engine/mixer.js';

	let { dj, stage }: { dj: DjBrain; stage: StageId } = $props();

	let cv: HTMLCanvasElement;

	/** Builds one frame of scene input from the brain and the mixer (the same numbers the audio uses). */
	function input(reducedMotion: boolean): SceneInput {
		const live = dj.status === 'live';
		const cycle = dj.cycle;
		const levels = {} as Record<LayerName, number>;
		for (const layer of LAYERS) {
			let v = 0;
			for (const deck of [0, 1] as Deck[]) {
				const track = dj.decks[deck];
				if (live && track && track.layers[layer] !== 'silence')
					v = Math.max(v, dj.mixer.gain(deck, layer, cycle));
			}
			levels[layer] = v;
		}
		const pos = live ? dj.mixer.position(dj.live, cycle) : null;
		const style = dj.mixer.timelines[dj.live]?.style;
		return {
			live,
			cycle,
			levels,
			section: pos?.kind ?? null,
			x: pos?.x ?? 0,
			gap: !!(pos && style?.gap && pos.kind === 'build' && pos.left <= 0.25),
			intensity: pos ? intensity(pos) : 0.1,
			energy: dj.energy,
			weirdness: dj.weirdness,
			accent: GENRE_COLORS[dj.genre],
			thinking: live && dj.writing !== null,
			glitch: dj.mood === 'glitch',
			crossfade: dj.mixer.crossfade(cycle),
			loaded: [!!dj.decks[0], !!dj.decks[1]],
			liveDeck: dj.live,
			mixing: dj.transitioning,
			reducedMotion,
			stage
		};
	}

	onMount(() => {
		const scene = new ClubScene(cv);
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		let raf = 0;
		const frame = (now: number) => {
			scene.render(input(motion.matches), now);
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	});

	// The speech bubble pops up for every new line and fades after a few seconds.
	let bubble = $state(false);
	$effect(() => {
		if (!dj.speechId) return;
		bubble = true;
		const id = setTimeout(() => (bubble = false), 4500);
		return () => clearTimeout(id);
	});

	const section = $derived(
		dj.status === 'live' ? (dj.mixer.position(dj.live, dj.cycle)?.kind ?? '') : ''
	);
</script>

<section class="hero" aria-label="The club">
	<canvas
		bind:this={cv}
		width="480"
		height="270"
		aria-label="Pixel-art Berlin techno club with RaveBot at the decks, moving to the music"
	></canvas>

	<div class="hud tl">
		<span class="dot" class:on={dj.status === 'live'}></span>
		{#if dj.status === 'live'}
			<span>BAR {Math.floor(dj.cycle) + 1}</span><span>·</span><span>{dj.bpm.toFixed(1)} BPM</span>
		{:else if dj.status === 'booting'}
			<span>LOADING SAMPLES…</span>
		{:else}
			<span>STANDBY</span>
		{/if}
	</div>
	{#if dj.status === 'live'}
		<div class="hud tr">
			<span>{section.toUpperCase()}</span><span>·</span>
			<span>
				{dj.source === 'local'
					? 'LOCAL CRATE'
					: dj.offline
						? 'AI OFFLINE'
						: dj.source === 'combo'
							? 'COMBO MODE'
							: 'AI MODE'}
			</span>
		</div>
	{/if}
	{#if dj.speech}
		<div class="bubble" class:hide={!bubble} role="status">{dj.speech}</div>
	{/if}
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		background: #000;
		line-height: 0;
	}
	canvas {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		image-rendering: pixelated;
	}
	.hud {
		position: absolute;
		top: 10px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		font-family: var(--font-pixel);
		font-size: clamp(7px, 0.85vw, 10px);
		line-height: 1.4;
		letter-spacing: 1px;
		color: var(--text);
		text-shadow: 2px 2px 0 var(--edge);
		background: rgba(4, 3, 9, 0.55);
	}
	.tl {
		left: 10px;
	}
	.tr {
		right: 10px;
	}
	.dot {
		width: 8px;
		height: 8px;
		background: #3b4466;
	}
	.dot.on {
		background: var(--ok);
		box-shadow: 0 0 8px var(--ok);
	}
	.bubble {
		position: absolute;
		top: 9%;
		left: 50%;
		transform: translateX(-112%);
		max-width: min(42%, 320px);
		padding: 8px 10px;
		font-family: var(--font-pixel);
		font-size: clamp(7px, 0.8vw, 10px);
		line-height: 1.6;
		color: var(--edge);
		background: #fff;
		border: 3px solid var(--edge);
		box-shadow: 4px 4px 0 var(--edge);
		transition: opacity 0.3s;
	}
	.bubble::after {
		content: '';
		position: absolute;
		right: -12px;
		bottom: 8px;
		border: 6px solid transparent;
		border-left-color: #fff;
	}
	.bubble.hide {
		opacity: 0;
	}
	/* Phones: crop to the middle so the robot and the booth fill the width. */
	@media (max-width: 640px) {
		canvas {
			width: 160%;
			max-width: none;
			margin-left: -30%;
		}
		.bubble {
			top: 4%;
			transform: translateX(-104%);
			max-width: 55%;
		}
		.tr {
			display: none;
		}
	}
</style>
