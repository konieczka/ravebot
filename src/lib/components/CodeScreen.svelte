<script lang="ts">
	import type { DjBrain } from '#lib/dj/brain.svelte.js';
	import { LAYERS, type Track } from '#lib/dj/types.js';

	let { dj }: { dj: DjBrain } = $props();

	let tab = $state<'live' | 'next' | 'log'>('live');
	let logEl: HTMLElement | undefined = $state();

	const format = (t: Track) =>
		`// ${t.title}\n` + LAYERS.map((l) => `$${l}: ${t.layers[l]}`).join('\n\n');

	const fullNext = $derived(dj.next ? format(dj.next) : '');
	// "Typing" animation: reveal the queued track's code a few characters per frame.
	let typed = $state(0);
	$effect(() => {
		void fullNext;
		typed = 0;
	});
	$effect(() => {
		if (typed >= fullNext.length) return;
		const id = requestAnimationFrame(() => (typed = Math.min(fullNext.length, typed + 6)));
		return () => cancelAnimationFrame(id);
	});

	$effect(() => {
		void dj.log.length;
		if (logEl) logEl.scrollTop = logEl.scrollHeight;
	});
</script>

<section class="crt" aria-label="TechnoBot code screen">
	<div class="tabs" role="tablist">
		<button
			role="tab"
			aria-selected={tab === 'live'}
			class:on={tab === 'live'}
			onclick={() => (tab = 'live')}>NOW</button
		>
		<button
			role="tab"
			aria-selected={tab === 'next'}
			class:on={tab === 'next'}
			onclick={() => (tab = 'next')}
		>
			NEXT{#if dj.generating}<span class="blink">●</span>{/if}
		</button>
		<button
			role="tab"
			aria-selected={tab === 'log'}
			class:on={tab === 'log'}
			onclick={() => (tab = 'log')}>LOG</button
		>
	</div>
	<div class="screen">
		{#if tab === 'live'}
			<pre>{dj.liveTrack ? format(dj.liveTrack) : '// decks are cold. press WAKE UP.'}</pre>
		{:else if tab === 'next'}
			{#if dj.next}
				<pre>{fullNext.slice(0, typed)}<span class="cursor">█</span></pre>
			{:else}
				<pre>{dj.generating
						? '// TechnoBot is writing the next track'
						: '// nothing queued yet'}<span class="cursor">█</span></pre>
			{/if}
		{:else}
			<div class="log" bind:this={logEl}>
				{#each dj.log as line (line.id)}
					<div class={line.kind}>{line.text}</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.crt {
		background: #0d0b1a;
		border: 4px solid #0d0b1a;
		box-shadow: inset 0 0 0 3px #2a2346;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.tabs {
		display: flex;
		gap: 4px;
		padding: 6px 6px 0;
	}
	.tabs button {
		font-family: var(--font-pixel);
		font-size: 8px;
		padding: 6px 10px;
		color: var(--muted);
		background: #17132b;
		border: none;
		cursor: pointer;
	}
	.tabs button.on {
		color: #0d0b1a;
		background: var(--crt);
	}
	.screen {
		position: relative;
		height: 260px;
		overflow: hidden;
		background: radial-gradient(ellipse at center, #0f2318 0%, #07110c 100%);
		border-top: 3px solid var(--crt);
	}
	.screen::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(transparent 0 2px, rgba(0, 0, 0, 0.25) 2px 4px);
	}
	pre,
	.log {
		margin: 0;
		height: 100%;
		overflow: auto;
		padding: 10px 12px;
		font-family: var(--font-mono);
		font-size: 17px;
		line-height: 1.15;
		color: var(--crt);
		text-shadow: 0 0 6px color-mix(in srgb, var(--crt) 60%, transparent);
		white-space: pre-wrap;
		word-break: break-all;
	}
	.log .ok {
		color: #b6ff8a;
	}
	.log .warn {
		color: #ffe14d;
	}
	.log .err {
		color: #ff5c5c;
	}
	.cursor,
	.blink {
		animation: blink 0.8s steps(2) infinite;
	}
	.blink {
		margin-left: 4px;
		color: #ffe14d;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
