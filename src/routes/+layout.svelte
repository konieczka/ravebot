<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--bg: #08060f;
		--edge: #040309;
		--hull: #110d1d;
		--panel: #1a1530;
		--panel-hi: #2b2449;
		--text: #ece8ff;
		--muted: #8f88bb;
		--ok: #4dff9a;
		--pink: #ff3dc8;
		--font-pixel: 'Press Start 2P', ui-monospace, monospace;
		--font-mono: 'VT323', ui-monospace, monospace;
		color-scheme: dark;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-mono);
	}
</style>
