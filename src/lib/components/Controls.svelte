<script lang="ts">
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS, GENRES } from '#lib/dj/genres.js';
	import { LAYERS, type LayerName } from '#lib/dj/types.js';
	import type { Deck } from '#lib/engine/mixer.js';

	let { dj }: { dj: DjBrain } = $props();

	const SEGMENTS = 10;
	const beatOn = $derived(dj.cycle * 4 - Math.floor(dj.cycle * 4) < 0.3);

	/** Audible level of a layer across both decks. */
	function level(layer: LayerName) {
		if (dj.status !== 'live') return 0;
		let v = 0;
		for (const deck of [0, 1] as Deck[]) {
			const track = dj.decks[deck];
			if (track && track.layers[layer] !== 'silence')
				v = Math.max(v, dj.mixer.gain(deck, layer, dj.cycle));
		}
		return v;
	}

	/** Lit segments: the level, pumping on every beat. */
	const lit = (gain: number) =>
		gain > 0.01 ? Math.max(1, Math.round(gain * (beatOn ? SEGMENTS : SEGMENTS - 3))) : 0;
	const segClass = (i: number, n: number) =>
		i < n ? (i > 7 ? 'lit r' : i > 5 ? 'lit y' : 'lit') : '';
</script>

<div class="console">
	<section class="mod" aria-label="Deck">
		<h2>DECK</h2>
		{#if dj.status === 'off'}
			<button class="big go" onclick={() => dj.start()}>▶ WAKE UP RAVEBOT</button>
		{:else}
			<button class="big stop" onclick={() => dj.stopSet()} disabled={dj.status === 'booting'}>
				{dj.status === 'booting' ? 'BOOTING…' : '■ STOP SET'}
			</button>
		{/if}
		<div class="row">
			<button
				onclick={() => dj.skip()}
				disabled={dj.status !== 'live' || dj.transitioning}
				title="Start mixing in the next track now">⏭ MIX NEXT</button
			>
			<button
				class:on={dj.hold}
				onclick={() => (dj.hold = !dj.hold)}
				aria-pressed={dj.hold}
				disabled={dj.status !== 'live'}
				title="Keep the current track looping">{dj.hold ? '⏸ HOLDING' : '⏸ HOLD'}</button
			>
		</div>
		<label class="fader">
			<span class="head">
				<span>BPM</span>
				<output
					>{Math.round(
						dj.targetBpm
					)}{#if Math.abs(dj.bpm - dj.targetBpm) > 0.5 && dj.status === 'live'}<small>
							← {dj.bpm.toFixed(1)}</small
						>{/if}</output
				>
			</span>
			<input type="range" min="110" max="160" step="1" bind:value={dj.targetBpm} />
		</label>
		<div class="seg" role="group" aria-label="Track source">
			<button
				class:on={dj.source === 'ai'}
				onclick={() => dj.setSource('ai')}
				aria-pressed={dj.source === 'ai'}
				title="An LLM writes new Strudel tracks for the set">AI</button
			>
			<button
				class:on={dj.source === 'local'}
				onclick={() => dj.setSource('local')}
				aria-pressed={dj.source === 'local'}
				title="Only remix the built-in hand-written tracks, no LLM calls">LOCAL CRATE</button
			>
		</div>
	</section>

	<section class="mod" aria-label="Subgenre">
		<h2>SUBGENRE</h2>
		<div class="pads">
			{#each GENRES as g (g.id)}
				<button
					class="pad"
					class:on={dj.genre === g.id}
					style:--c={GENRE_COLORS[g.id]}
					onclick={() => dj.setGenre(g.id)}
					aria-pressed={dj.genre === g.id}
				>
					{g.name}
				</button>
			{/each}
		</div>
	</section>

	<section class="mod" aria-label="Layers">
		<h2>LAYERS <small>LOCK = KEEP THROUGH NEXT MIX</small></h2>
		<div class="strips">
			{#each LAYERS as layer (layer)}
				{@const n = lit(level(layer))}
				<div class="strip">
					<div class="meter" aria-hidden="true">
						{#each Array(SEGMENTS) as _, i}
							<i class={segClass(i, n)}></i>
						{/each}
					</div>
					<span class="lbl">{layer.toUpperCase()}</span>
					<button
						class="lock"
						class:on={dj.locked[layer]}
						onclick={() => dj.toggleLock(layer)}
						aria-pressed={dj.locked[layer]}
						title="Keep {layer} through the next transition (and through breakdowns)">LOCK</button
					>
				</div>
			{/each}
		</div>
	</section>

	<fieldset class="mod" disabled={dj.source === 'local'} aria-label="AI brain">
		<h2>
			AI BRAIN {#if dj.source === 'local'}<small>OFF IN LOCAL MODE</small>{/if}
		</h2>
		<label class="fader">
			<span class="head"><span>ENERGY</span><output>{dj.energy}</output></span>
			<input
				type="range"
				min="1"
				max="10"
				step="1"
				bind:value={dj.energy}
				onchange={() => dj.invalidateQueue(`Energy ${dj.energy}`)}
			/>
		</label>
		<label class="fader">
			<span class="head"><span>WEIRDNESS</span><output>{dj.weirdness}</output></span>
			<input
				type="range"
				min="0"
				max="10"
				step="1"
				bind:value={dj.weirdness}
				onchange={() => dj.invalidateQueue(`Weirdness ${dj.weirdness}`)}
			/>
		</label>
	</fieldset>
</div>

<style>
	.console {
		display: grid;
		grid-template-columns: 1.05fr 1fr 1.3fr 1fr;
		gap: 4px;
		background: var(--edge);
		border-top: 4px solid var(--edge);
	}
	.mod {
		min-width: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 14px;
		border: 0;
		background: linear-gradient(var(--panel), var(--hull));
		box-shadow: inset 0 3px 0 var(--panel-hi);
	}
	fieldset.mod:disabled {
		opacity: 0.45;
	}
	h2 {
		margin: 0;
		display: flex;
		justify-content: space-between;
		gap: 8px;
		font-family: var(--font-pixel);
		font-size: 9px;
		font-weight: normal;
		letter-spacing: 2px;
		color: var(--muted);
	}
	h2 small {
		font-size: 7px;
		letter-spacing: 1px;
		color: var(--accent);
	}
	button {
		font-family: var(--font-pixel);
		font-size: 9px;
		line-height: 1.4;
		padding: 9px 10px;
		color: var(--text);
		background: var(--panel-hi);
		border: 3px solid var(--edge);
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.4);
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		filter: brightness(1.2);
	}
	button:active:not(:disabled) {
		box-shadow: inset 0 3px 0 rgba(0, 0, 0, 0.4);
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	button.on {
		background: var(--accent);
		color: var(--edge);
	}
	.big {
		font-size: 10px;
		padding: 12px 10px;
	}
	.big.go {
		background: var(--ok);
		color: var(--edge);
	}
	.big.stop {
		background: #3a1530;
		color: var(--pink);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.row > button {
		flex: 1 1 0;
	}
	.seg {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.seg button + button {
		border-left: 0;
	}
	.fader {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.head {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-pixel);
		font-size: 8px;
		letter-spacing: 1px;
		color: var(--muted);
	}
	output {
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}
	output small {
		color: var(--muted);
	}
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 18px;
		background: transparent;
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 6px;
		background: var(--edge);
		box-shadow: inset 0 0 0 1px var(--panel-hi);
	}
	input[type='range']::-moz-range-track {
		height: 6px;
		background: var(--edge);
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 12px;
		height: 18px;
		margin-top: -6px;
		background: var(--text);
		border: 3px solid var(--edge);
		box-shadow: inset 0 -3px 0 var(--accent);
	}
	input[type='range']::-moz-range-thumb {
		width: 8px;
		height: 14px;
		border-radius: 0;
		background: var(--text);
		border: 3px solid var(--edge);
	}
	.pads {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
	}
	.pad {
		position: relative;
		padding: 16px 8px 10px;
		font-size: 8px;
		letter-spacing: 1px;
		text-align: left;
		text-transform: uppercase;
		background: #191427;
	}
	.pad::before {
		content: '';
		position: absolute;
		top: 5px;
		left: 8px;
		width: 14px;
		height: 3px;
		background: var(--c);
		opacity: 0.35;
	}
	.pad.on {
		color: var(--c);
		background: color-mix(in srgb, var(--c) 22%, #191427);
	}
	.pad.on::before {
		opacity: 1;
		box-shadow: 0 0 8px var(--c);
	}
	.strips {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 6px;
	}
	.strip {
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.meter {
		display: flex;
		flex-direction: column-reverse;
		gap: 2px;
		width: 100%;
		max-width: 30px;
		padding: 3px;
		background: var(--edge);
	}
	.meter i {
		display: block;
		height: 5px;
		background: #221c36;
	}
	.meter i.lit {
		background: var(--ok);
	}
	.meter i.lit.y {
		background: #ffb03b;
	}
	.meter i.lit.r {
		background: var(--pink);
	}
	.lbl {
		font-family: var(--font-pixel);
		font-size: 7px;
		color: var(--muted);
	}
	.lock {
		width: 100%;
		padding: 6px 0;
		font-size: 7px;
		color: var(--muted);
		background: #191427;
	}
	.lock.on {
		color: var(--edge);
		background: #ffb03b;
	}
	@media (max-width: 1080px) {
		.console {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 560px) {
		.console {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
