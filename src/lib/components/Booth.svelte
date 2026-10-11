<script lang="ts">
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import type { Deck } from '#lib/engine/mixer.js';
	import { LAYERS } from '#lib/dj/types.js';

	let { dj }: { dj: DjBrain } = $props();

	const LABELS = {
		kick: 'KICK',
		hats: 'HATS',
		perc: 'PERC',
		bass: 'BASS',
		synth: 'SYNTH',
		vox: 'VOX'
	} as const;
	const SEGMENTS = 6;

	const beatOn = $derived(dj.cycle * 4 - Math.floor(dj.cycle * 4) < 0.3);
	const xfade = $derived(dj.mixer.crossfade(dj.cycle));
	// A full platter turn every bar keeps the spin locked to the tempo.
	const spin = $derived((dj.cycle % 1) * 360);
	// Where the live track is in its arc (groove, breakdown, build, ...).
	const section = $derived(
		dj.status === 'live' ? (dj.mixer.position(dj.live, dj.cycle)?.kind ?? '') : ''
	);

	function level(deck: Deck, layer: (typeof LAYERS)[number]) {
		const track = dj.decks[deck];
		if (!track || track.layers[layer] === 'silence') return 0;
		return dj.mixer.gain(deck, layer, dj.cycle);
	}

	/** Number of lit segments: the level, pumping on every beat. */
	const lit = (gain: number) =>
		gain > 0.01 ? Math.max(1, Math.round(gain * (beatOn ? SEGMENTS : SEGMENTS - 2))) : 0;
</script>

{#snippet platter(deck: Deck)}
	{@const track = dj.decks[deck]}
	<div class="deck" class:active={dj.live === deck && track} class:loaded={track}>
		<div class="deck-label">DECK {deck === 0 ? 'A' : 'B'}</div>
		<div class="platter" style:transform="rotate({track ? spin : 0}deg)">
			<div class="label"></div>
		</div>
		<div class="title" title={track?.title}>{track ? track.title : '— empty —'}</div>
		<div class="source">
			{track ? (track.source === 'llm' ? 'AI-GENERATED' : 'BACKUP CRATE') : ''}
		</div>
	</div>
{/snippet}

<div class="booth">
	{@render platter(0)}

	<div class="mixer">
		{#each LAYERS as layer (layer)}
			{@const a = lit(level(0, layer))}
			{@const b = lit(level(1, layer))}
			<div class="strip">
				<div class="meter left" aria-hidden="true">
					{#each Array(SEGMENTS) as _, i}
						<span class:lit={SEGMENTS - 1 - i < a}></span>
					{/each}
				</div>
				<button
					class="lock"
					class:on={dj.locked[layer]}
					onclick={() => dj.toggleLock(layer)}
					title="Lock {LABELS[layer]}: keep this layer through the next transition"
					aria-pressed={dj.locked[layer]}
				>
					{dj.locked[layer] ? '🔒' : ''}{LABELS[layer]}
				</button>
				<div class="meter" aria-hidden="true">
					{#each Array(SEGMENTS) as _, i}
						<span class:lit={i < b}></span>
					{/each}
				</div>
			</div>
		{/each}
		<div class="xfader" aria-label="Crossfader">
			<span>A</span>
			<div class="track"><div class="knob" style:left="{xfade * 100}%"></div></div>
			<span>B</span>
		</div>
		<div class="section" class:hot={section === 'build' || section === 'peak'}>
			{section ? section.toUpperCase() : '\u00a0'}
		</div>
	</div>

	{@render platter(1)}
</div>

<style>
	.booth {
		display: grid;
		grid-template-columns: 1fr 1.5fr 1fr;
		gap: 12px;
		padding: 14px;
		background: linear-gradient(#2a2346, #17132b);
		border: 4px solid #0d0b1a;
		box-shadow:
			inset 0 4px 0 #3d3466,
			0 8px 0 #0d0b1a,
			0 0 40px color-mix(in srgb, var(--accent) 20%, transparent);
	}
	.deck {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-width: 0;
		opacity: 0.55;
		transition: opacity 0.4s;
	}
	.deck.loaded {
		opacity: 0.85;
	}
	.deck.active {
		opacity: 1;
	}
	.deck-label {
		font-family: var(--font-pixel);
		font-size: 9px;
		color: var(--muted);
	}
	.active .deck-label {
		color: var(--accent);
	}
	.platter {
		width: min(100%, 110px);
		aspect-ratio: 1;
		border-radius: 50%;
		border: 4px solid #0d0b1a;
		background: repeating-radial-gradient(circle, #1b1b22 0 3px, #26262f 3px 5px), #1b1b22;
		position: relative;
	}
	.platter .label {
		position: absolute;
		inset: 36%;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.35);
	}
	.platter .label::after {
		content: '';
		position: absolute;
		left: 45%;
		top: 4px;
		width: 10%;
		height: 30%;
		background: #0d0b1a;
	}
	.title {
		font-family: var(--font-mono);
		font-size: 18px;
		color: var(--text);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.source {
		font-family: var(--font-pixel);
		font-size: 7px;
		color: var(--muted);
		min-height: 8px;
	}
	.mixer {
		display: flex;
		flex-direction: column;
		gap: 6px;
		justify-content: center;
		background: #110e20;
		border: 3px solid #0d0b1a;
		padding: 10px 8px;
	}
	.strip {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 6px;
	}
	.meter {
		display: flex;
		gap: 2px;
	}
	.meter.left {
		justify-content: flex-end;
	}
	.meter span {
		width: 100%;
		max-width: 12px;
		height: 10px;
		background: #241f3d;
	}
	.meter span.lit {
		background: var(--accent);
		box-shadow: 0 0 6px var(--accent);
	}
	.lock {
		font-family: var(--font-pixel);
		font-size: 8px;
		width: 66px;
		padding: 5px 0;
		color: var(--text);
		background: #2a2346;
		border: 2px solid #0d0b1a;
		cursor: pointer;
	}
	.lock:hover {
		background: #3d3466;
	}
	.lock.on {
		background: #ffe14d;
		color: #0d0b1a;
	}
	.xfader {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 6px;
		font-family: var(--font-pixel);
		font-size: 8px;
		color: var(--muted);
	}
	.xfader .track {
		flex: 1;
		height: 6px;
		background: #0d0b1a;
		position: relative;
	}
	.xfader .knob {
		position: absolute;
		top: -6px;
		width: 14px;
		height: 18px;
		margin-left: -7px;
		background: #c3cae6;
		border: 2px solid #0d0b1a;
		transition: left 0.15s linear;
	}
	.section {
		text-align: center;
		font-family: var(--font-pixel);
		font-size: 8px;
		letter-spacing: 2px;
		color: var(--muted);
	}
	.section.hot {
		color: var(--accent);
	}
	@media (max-width: 640px) {
		.booth {
			grid-template-columns: 1fr 1fr;
		}
		.mixer {
			grid-column: 1 / -1;
			order: 3;
		}
	}
</style>
