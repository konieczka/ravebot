<script lang="ts">
	import Club from '#lib/components/Club.svelte';
	import Controls from '#lib/components/Controls.svelte';
	import Queue from '#lib/components/Queue.svelte';
	import { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS } from '#lib/dj/genres.js';

	const dj = new DjBrain();

	$effect(() => () => dj.stopSet());
</script>

<svelte:head>
	<title>RaveBot — the AI DJ that never sleeps</title>
	<meta
		name="description"
		content="A pixel robot DJ in a Berlin warehouse that live-codes techno in Strudel with an LLM and mixes it seamlessly."
	/>
</svelte:head>

<main style:--accent={GENRE_COLORS[dj.genre]}>
	<div class="app">
		<header>
			<h1>RAVE<span>BOT</span></h1>
			<p>
				an AI DJ live-coding techno in <a href="https://strudel.cc" target="_blank" rel="noreferrer"
					>Strudel</a
				>
			</p>
		</header>
		<Club {dj} />
		<Controls {dj} />
		<Queue {dj} />
	</div>

	<footer>Built with Strudel (AGPL-3.0). Audio starts after you click — turn it up.</footer>
</main>

<style>
	main {
		max-width: 1280px;
		margin: 0 auto;
		padding: 20px 16px 32px;
	}
	.app {
		display: flex;
		flex-direction: column;
		background: var(--hull);
		border: 4px solid var(--edge);
		box-shadow:
			0 0 0 2px var(--panel-hi),
			0 24px 60px rgba(0, 0, 0, 0.6);
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		padding: 10px 14px;
		background: var(--edge);
	}
	h1 {
		margin: 0;
		font-family: var(--font-pixel);
		font-size: 15px;
		letter-spacing: 2px;
	}
	h1 span {
		color: var(--pink);
	}
	header p {
		margin: 0;
		font-size: 18px;
		color: var(--muted);
	}
	a {
		color: var(--accent);
	}
	footer {
		margin-top: 24px;
		font-size: 18px;
		text-align: center;
		color: var(--muted);
	}
</style>
