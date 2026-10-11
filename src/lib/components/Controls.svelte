<script lang="ts">
	import { CITIES, type City, type StageId } from '#lib/club/cities/index.js';
	import { WIN } from '#lib/club/cities/view.js';
	import { W, H } from '#lib/club/draw.js';
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS, GENRES } from '#lib/dj/genres.js';

	let { dj, stage, onstage }: { dj: DjBrain; stage: StageId; onstage: (id: StageId) => void } =
		$props();

	/** Paints a city's view (without the club around it) into a stage card. */
	const skyline = (town: City) => (cv: HTMLCanvasElement) => {
		const src = document.createElement('canvas');
		src.width = W;
		src.height = H;
		const g = src.getContext('2d')!;
		town.paint(g);
		town.live(g, 0, 0.1, true);
		const h = 116 - WIN.y;
		cv.width = WIN.w;
		cv.height = h;
		cv.getContext('2d')!.drawImage(src, WIN.x, WIN.y, WIN.w, h, 0, 0, WIN.w, h);
	};
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
				class:on={dj.source === 'local'}
				onclick={() => dj.setSource('local')}
				aria-pressed={dj.source === 'local'}
				title="Only remix the built-in hand-written tracks, no LLM calls">LOCAL CRATE</button
			>
			<button
				class:on={dj.source === 'combo'}
				onclick={() => dj.setSource('combo')}
				aria-pressed={dj.source === 'combo'}
				title="Alternate local crate and AI tracks: local, AI, local, AI...">COMBO</button
			>
			<button
				class:on={dj.source === 'ai'}
				onclick={() => dj.setSource('ai')}
				aria-pressed={dj.source === 'ai'}
				title="An LLM writes new Strudel tracks for the set">AI</button
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

	<section class="mod" aria-label="Stage">
		<h2>STAGE</h2>
		<div class="stages" role="radiogroup" aria-label="City">
			{#each CITIES as town (town.id)}
				<button
					class="stage"
					class:on={stage === town.id}
					role="radio"
					aria-checked={stage === town.id}
					onclick={() => onstage(town.id)}
				>
					<canvas {@attach skyline(town)} aria-hidden="true"></canvas>
					<span class="name">{town.name}</span>
					{#if stage === town.id}<span class="here">ON STAGE</span>{/if}
				</button>
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
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 0.9fr);
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
		grid-template-columns: 1fr 1fr 1fr;
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
		flex: 1;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-auto-rows: minmax(46px, 1fr);
		gap: 6px;
	}
	.pad {
		position: relative;
		min-width: 0;
		display: flex;
		align-items: flex-end;
		padding: 14px 8px 8px;
		font-size: 8px;
		letter-spacing: 0;
		line-height: 1.5;
		text-align: left;
		text-transform: uppercase;
		overflow-wrap: anywhere;
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
	.stages {
		flex: 1;
		display: grid;
		grid-auto-rows: minmax(44px, 1fr);
		gap: 6px;
	}
	.stage {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 5px;
		padding: 8px 10px;
		text-align: left;
		background: #0b0818;
	}
	.stage canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 80%;
		image-rendering: pixelated;
		filter: saturate(0.55) brightness(0.55);
		transition: filter 0.2s;
	}
	.stage::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, rgba(8, 6, 16, 0.85) 0%, rgba(8, 6, 16, 0.2) 75%);
	}
	.stage > span {
		position: relative;
		z-index: 1;
	}
	.name {
		font-size: 10px;
		letter-spacing: 1px;
	}
	.here {
		position: absolute !important;
		top: 6px;
		right: 6px;
		padding: 3px 5px;
		font-size: 7px;
		color: var(--edge);
		background: var(--accent);
	}
	.stage.on {
		border-color: var(--accent);
		color: var(--text);
		background: #0b0818;
	}
	.stage.on canvas {
		filter: none;
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
