<script lang="ts">
	import { page } from '$app/state';
	import Club from '#lib/components/Club.svelte';
	import Controls from '#lib/components/Controls.svelte';
	import Queue from '#lib/components/Queue.svelte';
	import { isStage, type StageId } from '#lib/club/cities/index.js';
	import { DjBrain } from '#lib/dj/brain.svelte.js';
	import { GENRE_COLORS } from '#lib/dj/genres.js';

	const TITLE = 'RaveBot — the AI DJ that never sleeps';
	const DESCRIPTION =
		'A pixel robot DJ in a club in Berlin, Warsaw or Paris that live-codes techno in Strudel with an LLM and mixes it seamlessly.';

	const dj = new DjBrain();

	/** Which city the club is in; remembered in this browser only. */
	const STAGE_KEY = 'ravebot:stage';
	let stage = $state<StageId>('berlin');
	$effect.pre(() => {
		try {
			const saved = localStorage.getItem(STAGE_KEY);
			if (isStage(saved)) stage = saved;
		} catch {
			// Storage can be blocked; Berlin it is.
		}
	});
	function setStage(id: StageId) {
		stage = id;
		try {
			localStorage.setItem(STAGE_KEY, id);
		} catch {
			// Not remembered, still switched.
		}
	}

	$effect(() => () => dj.stopSet());
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="RaveBot" />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:url" content={page.url.origin} />
	<meta property="og:image" content="{page.url.origin}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="RaveBot, a pixel-art robot DJ, at the decks above a dancing crowd" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	<meta name="twitter:image" content="{page.url.origin}/og.png" />
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
		<Club {dj} {stage} />
		<Controls {dj} {stage} onstage={setStage} />
		<Queue {dj} />
	</div>

	<footer>
		Built with Strudel (AGPL-3.0) and SvelteKit.<br />
		Made by <a href="https://konieczka.dev">konieczka.dev</a>
	</footer>
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
