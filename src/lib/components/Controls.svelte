<script lang="ts">
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRES } from '#lib/dj/genres.js';

	let { dj }: { dj: DjBrain } = $props();

	let vibeDraft = $state('');

	function sendVibe(e: SubmitEvent) {
		e.preventDefault();
		dj.vibe = vibeDraft.trim();
		dj.invalidateNext(dj.vibe ? `Crowd request: "${dj.vibe}"` : 'Crowd request cleared');
	}
</script>

<section class="panel" aria-label="TechnoBot controls">
	<div class="transport">
		{#if dj.status === 'off'}
			<button class="big go" onclick={() => dj.start()}>▶ WAKE UP TECHNOBOT</button>
		{:else}
			<button class="big stop" onclick={() => dj.stopSet()} disabled={dj.status === 'booting'}>
				{dj.status === 'booting' ? 'BOOTING…' : '■ STOP SET'}
			</button>
			<button onclick={() => dj.skip()} disabled={dj.status !== 'live' || dj.transitioning}
				>⏭ NEXT</button
			>
			<button class:on={dj.hold} onclick={() => (dj.hold = !dj.hold)} aria-pressed={dj.hold}>
				{dj.hold ? '⏸ HOLDING' : '⏸ HOLD'}
			</button>
		{/if}
	</div>

	<fieldset>
		<legend>TRACK SOURCE</legend>
		<div class="seg">
			<button
				class:on={dj.source === 'ai'}
				onclick={() => dj.setSource('ai')}
				aria-pressed={dj.source === 'ai'}
				title="An LLM writes new Strudel tracks for the set">AI GENERATED</button
			>
			<button
				class:on={dj.source === 'local'}
				onclick={() => dj.setSource('local')}
				aria-pressed={dj.source === 'local'}
				title="Only remix the built-in hand-written tracks, no LLM calls">LOCAL CRATE</button
			>
		</div>
	</fieldset>

	<fieldset>
		<legend>SUBGENRE</legend>
		<div class="genres">
			{#each GENRES as g (g.id)}
				<button
					class:on={dj.genre === g.id}
					onclick={() => dj.setGenre(g.id)}
					aria-pressed={dj.genre === g.id}
				>
					{g.name}
				</button>
			{/each}
		</div>
	</fieldset>

	<label class="slider">
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

	<fieldset class="ai-only" disabled={dj.source === 'local'}>
		<legend>
			AI SETTINGS
			{#if dj.source === 'local'}<small>OFF IN LOCAL MODE</small>{/if}
		</legend>
		<div class="stack">
			<label class="slider">
				<span class="head"><span>ENERGY</span><output>{dj.energy}</output></span>
				<input
					type="range"
					min="1"
					max="10"
					step="1"
					bind:value={dj.energy}
					onchange={() => dj.invalidateNext(`Energy → ${dj.energy}`)}
				/>
			</label>

			<label class="slider">
				<span class="head"><span>WEIRDNESS</span><output>{dj.weirdness}</output></span>
				<input
					type="range"
					min="0"
					max="10"
					step="1"
					bind:value={dj.weirdness}
					onchange={() => dj.invalidateNext(`Weirdness → ${dj.weirdness}`)}
				/>
			</label>

			<form class="vibe" onsubmit={sendVibe}>
				<label for="vibe">CROWD REQUEST</label>
				<div class="row">
					<input
						id="vibe"
						maxlength="140"
						placeholder="rainy warehouse at 4am…"
						bind:value={vibeDraft}
					/>
					<button type="submit">SEND</button>
				</div>
			</form>
		</div>
	</fieldset>
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		background: var(--panel);
		border: 4px solid #0d0b1a;
		box-shadow: inset 0 4px 0 #3d3466;
	}
	button {
		font-family: var(--font-pixel);
		font-size: 9px;
		line-height: 1.4;
		padding: 8px 10px;
		color: var(--text);
		background: #2a2346;
		border: 3px solid #0d0b1a;
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.35);
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		background: #3d3466;
	}
	button:active:not(:disabled) {
		box-shadow: none;
		transform: translateY(2px);
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	button.on {
		background: var(--accent);
		color: #0d0b1a;
	}
	.transport {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.big {
		flex: 1;
		font-size: 11px;
		padding: 14px;
	}
	.go {
		background: var(--accent);
		color: #0d0b1a;
		animation: pulse 1s steps(2) infinite;
	}
	.go:hover:not(:disabled) {
		background: var(--accent);
		filter: brightness(1.15);
	}
	@keyframes pulse {
		50% {
			box-shadow: 0 0 22px var(--accent);
		}
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	legend,
	.head,
	.vibe label {
		font-family: var(--font-pixel);
		font-size: 9px;
		color: var(--muted);
		margin-bottom: 8px;
		display: flex;
		justify-content: space-between;
	}
	legend small {
		font-size: 7px;
		color: var(--muted);
		opacity: 0.8;
	}
	.ai-only {
		border: 2px dashed #3d3466;
		padding: 10px 12px 14px;
	}
	.ai-only legend {
		padding: 0 6px;
		margin-bottom: 0;
		gap: 10px;
	}
	.ai-only .stack {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.ai-only:disabled .stack {
		opacity: 0.35;
	}
	.ai-only:disabled input {
		cursor: not-allowed;
	}
	.genres {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}
	.seg {
		display: flex;
		gap: 6px;
	}
	.seg button {
		flex: 1;
	}
	.slider {
		display: block;
	}
	output {
		color: var(--text);
	}
	output small {
		color: var(--muted);
		font-size: 8px;
	}
	input[type='range'] {
		width: 100%;
		appearance: none;
		height: 8px;
		background: #0d0b1a;
		outline-offset: 4px;
	}
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 22px;
		background: var(--accent);
		border: 3px solid #0d0b1a;
		cursor: pointer;
	}
	input[type='range']::-moz-range-thumb {
		width: 12px;
		height: 18px;
		border-radius: 0;
		background: var(--accent);
		border: 3px solid #0d0b1a;
		cursor: pointer;
	}
	.vibe .row {
		display: flex;
		gap: 6px;
	}
	.vibe input {
		flex: 1;
		min-width: 0;
		font-family: var(--font-mono);
		font-size: 18px;
		padding: 4px 8px;
		color: var(--text);
		background: #0d0b1a;
		border: 3px solid #3d3466;
	}
	.vibe input:focus {
		outline: none;
		border-color: var(--accent);
	}
</style>
