<script lang="ts">
	import Booth from '#lib/components/Booth.svelte';
	import CodeScreen from '#lib/components/CodeScreen.svelte';
	import Controls from '#lib/components/Controls.svelte';
	import Robot from '#lib/components/Robot.svelte';
	import { DjBrain } from '#lib/dj/brain.svelte.js';
	import type { GenreId } from '#lib/dj/types.js';

	const ACCENTS: Record<GenreId, string> = {
		minimal: '#4dd2ff',
		acid: '#c6ff3d',
		hard: '#ff3b5c',
		dub: '#5c8bff',
		detroit: '#ffb03b',
		hypnotic: '#c06bff'
	};

	const dj = new DjBrain();
	const accent = $derived(ACCENTS[dj.genre]);
	const downbeat = $derived(dj.status === 'live' && dj.cycle % 1 < 0.12);

	$effect(() => () => dj.stopSet());
</script>

<svelte:head>
	<title>TechnoBot — the AI DJ that never sleeps</title>
	<meta
		name="description"
		content="A pixel robot DJ that live-codes techno in Strudel with an LLM and mixes it seamlessly."
	/>
</svelte:head>

<main style:--accent={accent} class:live={dj.status === 'live'}>
	<header>
		<h1>TECHNO<span>BOT</span></h1>
		<p>
			an AI DJ live-coding techno in <a href="https://strudel.cc" target="_blank" rel="noreferrer"
				>Strudel</a
			>
		</p>
	</header>

	<div class="layout">
		<section class="stage" class:flash={downbeat}>
			<div class="lasers" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
			{#if dj.speech}
				<div class="bubble" role="status">{dj.speech}</div>
			{/if}
			<div class="robot-wrap"><Robot cycle={dj.cycle} mood={dj.mood} {accent} /></div>
			<Booth {dj} />
			<div class="status">
				<span class="dot" class:on={dj.status === 'live'}></span>
				{#if dj.status === 'live'}
					BAR {Math.floor(dj.cycle) + 1} · {dj.bpm.toFixed(1)} BPM · {dj.mood.toUpperCase()} · {dj.source ===
					'local'
						? 'LOCAL CRATE'
						: dj.offline
							? 'AI OFFLINE (NO GATEWAY)'
							: 'AI MODE'}
				{:else if dj.status === 'booting'}
					LOADING SAMPLES…
				{:else}
					STANDBY
				{/if}
			</div>
		</section>

		<aside>
			<Controls {dj} />
			<CodeScreen {dj} />
		</aside>
	</div>

	<footer>Built with Strudel (AGPL-3.0). Audio starts after you click — turn it up.</footer>
</main>

<style>
	main {
		max-width: 1240px;
		margin: 0 auto;
		padding: 20px 16px 32px;
		min-height: 100vh;
	}
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px 16px;
		margin-bottom: 18px;
	}
	h1 {
		font-family: var(--font-pixel);
		font-size: clamp(20px, 4vw, 32px);
		margin: 0;
		letter-spacing: 2px;
		text-shadow: 4px 4px 0 #0d0b1a;
	}
	h1 span {
		color: var(--accent);
	}
	header p {
		margin: 0;
		font-size: 20px;
		color: var(--muted);
	}
	a {
		color: var(--accent);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
		gap: 20px;
		align-items: start;
	}
	aside {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.stage {
		position: relative;
		overflow: hidden;
		padding: 64px 20px 16px;
		background:
			linear-gradient(transparent 70%, rgba(0, 0, 0, 0.5)),
			repeating-linear-gradient(90deg, transparent 0 31px, rgba(255, 255, 255, 0.03) 31px 32px),
			repeating-linear-gradient(0deg, transparent 0 31px, rgba(255, 255, 255, 0.03) 31px 32px),
			radial-gradient(
				ellipse at 50% 20%,
				color-mix(in srgb, var(--accent) 22%, #151030),
				#0b0918 70%
			);
		border: 4px solid #0d0b1a;
		transition: background-color 0.1s;
	}
	.stage::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--accent);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s;
	}
	.stage.flash::before {
		opacity: 0.06;
	}
	.lasers {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 1s;
	}
	.live .lasers {
		opacity: 1;
	}
	.lasers i {
		position: absolute;
		top: -10%;
		left: 50%;
		width: 3px;
		height: 140%;
		background: linear-gradient(var(--accent), transparent 80%);
		opacity: 0.35;
		transform-origin: top center;
		animation: sweep 6s ease-in-out infinite alternate;
	}
	.lasers i:nth-child(2) {
		animation-delay: -1.5s;
		animation-duration: 7s;
	}
	.lasers i:nth-child(3) {
		animation-delay: -3s;
		animation-duration: 5s;
	}
	.lasers i:nth-child(4) {
		animation-delay: -4.5s;
		animation-duration: 8s;
	}
	@keyframes sweep {
		from {
			transform: rotate(-38deg);
		}
		to {
			transform: rotate(38deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.lasers i {
			animation: none;
		}
	}
	.robot-wrap {
		position: relative;
		width: min(62%, 360px);
		margin: 0 auto -6px;
		z-index: 1;
	}
	.stage :global(.booth) {
		position: relative;
		z-index: 2;
	}
	.bubble {
		position: absolute;
		top: 14px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
		max-width: 80%;
		padding: 8px 12px;
		font-family: var(--font-pixel);
		font-size: 10px;
		line-height: 1.6;
		text-align: center;
		color: #0d0b1a;
		background: #fff;
		border: 3px solid #0d0b1a;
		box-shadow: 4px 4px 0 #0d0b1a;
	}
	.status {
		position: relative;
		z-index: 2;
		margin-top: 14px;
		font-family: var(--font-pixel);
		font-size: 9px;
		color: var(--muted);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dot {
		width: 8px;
		height: 8px;
		background: #3b4466;
	}
	.dot.on {
		background: #4dff9a;
		box-shadow: 0 0 8px #4dff9a;
	}
	footer {
		margin-top: 24px;
		font-size: 18px;
		color: var(--muted);
		text-align: center;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
		.stage {
			padding-top: 72px;
		}
		.robot-wrap {
			width: min(80%, 320px);
		}
	}
</style>
